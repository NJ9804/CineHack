"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Film, Upload, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { apiClient } from '@/services/api/client';

export default function NewProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
    estimatedBudget: '',
    script: ''
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Remove auth check for now since we haven't implemented authentication
  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     const token = localStorage.getItem('token');
  //     if (!token) {
  //       router.push('/login');
  //     }
  //   }
  // }, [router]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const processFile = (file: File) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size too large. Please upload a file smaller than 10MB.');
      return;
    }

    setUploadedFile(file);
    
    // Read file content if it's a text file
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        handleInputChange('script', content);
      };
      reader.readAsText(file);
    } else if (file.type === 'application/pdf') {
      // For PDF files
      handleInputChange('script', `📄 PDF Script uploaded: ${file.name}\n\nContent will be processed during project creation.`);
    } else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
      // For DOC files
      handleInputChange('script', `📝 Word Document uploaded: ${file.name}\n\nContent will be processed during project creation.`);
    } else {
      // For other file types
      handleInputChange('script', `📎 File uploaded: ${file.name}\n\nContent will be processed during project creation.`);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    handleInputChange('script', '');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      processFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.estimatedBudget) {
      alert('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create project via API
      const projectData = {
        title: formData.title,
        synopsis: formData.script || undefined,
        start_date: `${formData.year}-01-01`,
        end_date: `${formData.year}-12-31`,
        budget_total: parseFloat(formData.estimatedBudget) * 10000000, // Convert Crores to Rupees
        currency: 'INR',
        language: 'en',
        genre: 'Drama'
      };
      
      console.log('Creating project:', projectData);
      const project = await apiClient.createProject(projectData);
      console.log('Project created:', project);
      
      // Upload script file if exists
      if (uploadedFile) {
        console.log('Uploading script file:', uploadedFile.name);
        await apiClient.uploadScript(project.id, uploadedFile);
        console.log('Script uploaded successfully');
      }
      
      // Redirect to the new project
      router.push(`/projects/${project.id}`);
      
    } catch (error: any) {
      console.error('Error creating project:', error);
      alert(`Failed to create project: ${error.message || 'Please try again'}`);
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: string) => {
    if (!amount) return '';
    return `₹${parseInt(amount)}Cr`;
  };

  if (isProcessing) {
    return (
      <Layout title="Creating Project" subtitle="Processing script and setting up project structure">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="bg-gray-900/50 border-gray-700 max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <Loader2 className="w-16 h-16 text-amber-400 mx-auto animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Breaking Script...</h3>
              <p className="text-gray-400 mb-4">
                Analyzing script and creating project structure
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-amber-400 to-yellow-600 h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">This may take a few moments...</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Create New Project" subtitle="Start a new film production project">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Project Setup Form */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Film className="w-6 h-6 mr-2 text-amber-400" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Movie Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Movie Title *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter movie title..."
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  required
                />
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Release Year
                </label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  min="2020"
                  max="2030"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* Estimated Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estimated Budget (in Crores) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="number"
                    value={formData.estimatedBudget}
                    onChange={(e) => handleInputChange('estimatedBudget', e.target.value)}
                    placeholder="0"
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    step="0.1"
                    min="0.1"
                    required
                  />
                </div>
                {formData.estimatedBudget && (
                  <p className="text-sm text-amber-400 mt-1">
                    Budget: {formatCurrency(formData.estimatedBudget)}
                  </p>
                )}
              </div>

              {/* Script Upload/Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Script
                </label>
                <div className="space-y-3">
                  {/* File Upload */}
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragOver 
                        ? 'border-amber-500 bg-amber-500/10' 
                        : 'border-gray-600 hover:border-amber-500/50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {uploadedFile ? (
                      // File uploaded state
                      <div>
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <Upload className="w-6 h-6 text-green-400" />
                          <span className="text-green-400 font-medium">File Uploaded</span>
                        </div>
                        <p className="text-sm text-white mb-2">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-400 mb-3">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                        <div className="flex gap-2 justify-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            type="button"
                            onClick={() => document.getElementById('script-file')?.click()}
                          >
                            Replace File
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            type="button"
                            onClick={removeFile}
                            className="text-red-400 hover:text-red-300"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // No file uploaded state
                      <div>
                        <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? 'text-amber-400' : 'text-gray-400'}`} />
                        <p className={`text-sm mb-1 ${isDragOver ? 'text-amber-400' : 'text-gray-400'}`}>
                          {isDragOver ? 'Drop your script file here' : 'Upload script file'}
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          PDF, DOC, TXT files supported • Max 10MB
                        </p>
                        <p className="text-xs text-gray-400 mb-3">
                          Drag & drop or click to browse
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          type="button"
                          onClick={() => document.getElementById('script-file')?.click()}
                        >
                          Browse Files
                        </Button>
                      </div>
                    )}
                    
                    {/* Hidden file input */}
                    <input
                      id="script-file"
                      type="file"
                      accept=".txt,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  
                  {/* Or Text Input */}
                  <div className="text-center text-gray-400 text-sm">— OR —</div>
                  
                  <textarea
                    value={formData.script}
                    onChange={(e) => handleInputChange('script', e.target.value)}
                    placeholder="Paste your script here or provide a brief description..."
                    className="w-full h-32 p-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="cinematic" 
                  className="flex-1"
                  disabled={!formData.title || !formData.estimatedBudget}
                >
                  Create Project
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div>
                <h4 className="text-blue-400 font-medium mb-1">What happens next?</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Script will be analyzed for scenes, characters, and locations</li>
                  <li>• Initial budget breakdown will be created</li>
                  <li>• Character-to-actor mapping suggestions will be generated</li>
                  <li>• Preliminary shooting schedule will be drafted</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}