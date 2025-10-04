"use client"

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/services/api/client';

interface ScriptUploadModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ScriptUploadModal({ projectId, isOpen, onClose, onSuccess }: ScriptUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [scriptId, setScriptId] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setStatus('uploading');
    setError(null);
    setProgress(10);

    try {
      // Upload the script
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`http://localhost:8000/api/scripts/upload?project_id=${projectId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setScriptId(data.script_id);
      setProgress(30);
      setStatus('parsing');
      setParsing(true);
      
      // Poll for parsing progress
      pollParsingStatus(data.script_id);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setStatus('error');
      setUploading(false);
    }
  };

  const pollParsingStatus = async (id: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/scripts/${id}/status`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const data = await response.json();
        
        if (data.status === 'completed') {
          setProgress(100);
          setStatus('success');
          setParsing(false);
          clearInterval(pollInterval);
          setTimeout(() => {
            onSuccess();
            handleClose();
          }, 1500);
        } else if (data.status === 'failed') {
          setError(data.error_message || 'Parsing failed');
          setStatus('error');
          setParsing(false);
          clearInterval(pollInterval);
        } else {
          // Update progress (30-95%)
          const parseProgress = Math.min(95, 30 + (data.progress || 0) * 0.65);
          setProgress(parseProgress);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (status !== 'success') {
        setError('Parsing timeout - please check status later');
        setStatus('error');
        setParsing(false);
      }
    }, 300000);
  };

  const handleClose = () => {
    setFile(null);
    setUploading(false);
    setParsing(false);
    setProgress(0);
    setStatus('idle');
    setError(null);
    setScriptId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Upload Script
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Upload your script PDF for AI-powered scene extraction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload */}
          {status === 'idle' && (
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-blue-500/50 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="script-upload"
              />
              <label htmlFor="script-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-400 mb-2">
                  {file ? file.name : 'Click to select PDF or drag and drop'}
                </p>
                <p className="text-xs text-gray-500">
                  Maximum file size: 50MB
                </p>
              </label>
            </div>
          )}

          {/* Progress */}
          {(status === 'uploading' || status === 'parsing') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {status === 'uploading' ? 'Uploading script...' : 'AI is parsing scenes...'}
                </span>
                <span className="text-blue-400">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                {status === 'parsing' && (
                  <span>Extracting scenes, characters, props, and locations...</span>
                )}
              </div>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
              <p className="text-green-400 font-medium">Script parsed successfully!</p>
              <p className="text-sm text-gray-400 mt-1">Scenes have been extracted and saved</p>
            </div>
          )}

          {/* Error */}
          {status === 'error' && error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">Upload failed</p>
                  <p className="text-sm text-gray-400 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={uploading || parsing}
              className="flex-1"
            >
              {status === 'success' ? 'Close' : 'Cancel'}
            </Button>
            {status === 'idle' && (
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload & Parse
              </Button>
            )}
            {status === 'error' && (
              <Button
                onClick={() => setStatus('idle')}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
