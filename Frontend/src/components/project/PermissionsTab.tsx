"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Bot, 
  User, 
  FileText, 
  Download, 
  Eye,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';

interface PermissionData {
  letter_type: string;
  details: string;
  location: string;
  duration: string;
  contact_person: string;
  additional_notes: string;
  project_name: string;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  message: string;
  timestamp: Date;
  isQuestion?: boolean;
  field?: keyof PermissionData;
  isConfirmation?: boolean;
}

interface PermissionRequest {
  id: string;
  data: PermissionData;
  status: 'draft' | 'generating' | 'completed';
  created_at: Date;
  letter_content?: string;
}

interface PermissionsTabProps {
  projectId: string;
}

const PERMISSION_TYPES = [
  'Location Filming Permission',
  'Road Closure Permission',
  'Drone Filming Permission',
  'Public Property Usage',
  'Private Property Access',
  'Equipment Transport Permission',
  'Parking Permission',
  'Noise Permit',
  'Fire Safety Permission',
  'Police Coordination Letter'
];

const CHAT_FLOW = [
  {
    field: 'letter_type' as keyof PermissionData,
    question: "Hi! I'm here to help you generate permission letters for your film project. What type of permission letter do you need?",
    type: 'select',
    options: PERMISSION_TYPES
  },
  {
    field: 'details' as keyof PermissionData,
    question: "Great! Can you provide details about what you'll be filming? (e.g., outdoor scenes, action sequences, etc.)",
    type: 'text'
  },
  {
    field: 'location' as keyof PermissionData,
    question: "Where will the filming take place? Please provide the specific location or address.",
    type: 'text'
  },
  {
    field: 'duration' as keyof PermissionData,
    question: "How long will you need the permission for? (e.g., '3 days - Oct 15-17, 2025')",
    type: 'text'
  },
  {
    field: 'contact_person' as keyof PermissionData,
    question: "Who should be listed as the main contact person for this request?",
    type: 'text'
  },
  {
    field: 'additional_notes' as keyof PermissionData,
    question: "Any additional requirements or notes? (e.g., parking space, equipment details, special needs)",
    type: 'text'
  }
];

export default function PermissionsTab({ projectId }: PermissionsTabProps) {
  const [activeView, setActiveView] = useState<'list' | 'chat'>('list');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [permissionData, setPermissionData] = useState<Partial<PermissionData>>({});
  const [userInput, setUserInput] = useState('');
  const [permissionRequests, setPermissionRequests] = useState<PermissionRequest[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PermissionRequest | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [generatedPdf, setGeneratedPdf] = useState<Blob | null>(null);

  // Initialize chat when starting new request
  const startNewRequest = () => {
    setActiveView('chat');
    setCurrentStep(0);
    setShowConfirmation(false);
    setIsGenerating(false);
    setGeneratedPdf(null);
    setPermissionData({ project_name: `Project ${projectId}` });
    setChatMessages([{
      id: Date.now().toString(),
      sender: 'bot',
      message: CHAT_FLOW[0].question,
      timestamp: new Date(),
      isQuestion: true,
      field: CHAT_FLOW[0].field
    }]);
  };

  // Handle user response
  const handleUserResponse = () => {
    if (!userInput.trim()) return;

    const currentQuestion = CHAT_FLOW[currentStep];
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: userInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);

    // Update permission data
    const updatedData = {
      ...permissionData,
      [currentQuestion.field]: userInput
    };
    setPermissionData(updatedData);

    setUserInput('');

    // Move to next step or show confirmation
    if (currentStep < CHAT_FLOW.length - 1) {
      const nextStep = currentStep + 1;
      const nextQuestion = CHAT_FLOW[nextStep];
      
      setTimeout(() => {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          message: nextQuestion.question,
          timestamp: new Date(),
          isQuestion: true,
          field: nextQuestion.field
        };
        setChatMessages(prev => [...prev, botMessage]);
        setCurrentStep(nextStep);
      }, 500);
    } else {
      // Show final confirmation
      setTimeout(() => {
        const completionMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          message: "Perfect! I have all the information needed. Would you like me to generate the permission letter now?",
          timestamp: new Date(),
          isConfirmation: true
        };
        setChatMessages(prev => [...prev, completionMessage]);
        setShowConfirmation(true);
      }, 500);
    }
  };

  // Handle confirmation response
  const handleConfirmationResponse = (confirmed: boolean) => {
    // Add user response
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: confirmed ? 'Yes' : 'No',
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);

    if (confirmed) {
      // Start generating
      setTimeout(() => {
        const generatingMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          message: "Generating your permission letter... This will take a few seconds.",
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, generatingMessage]);
        generatePermissionLetter();
      }, 500);
    } else {
      // User declined
      setTimeout(() => {
        const declineMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          message: "No problem! You can generate the letter anytime. Click 'New Request' to start over.",
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, declineMessage]);
      }, 500);
    }
  };

  // Generate permission letter
  const generatePermissionLetter = async () => {
    setIsGenerating(true);
    
    try {
      // Show generating message
      const generatingProgressMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        sender: 'bot',
        message: "🔄 Creating PDF document...",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, generatingProgressMessage]);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate PDF
      const pdfBlob = generatePDF(permissionData as PermissionData);
      setGeneratedPdf(pdfBlob);
      
      const letterContent = generateLetterContent(permissionData as PermissionData);
      
      const newRequest: PermissionRequest = {
        id: Date.now().toString(),
        data: permissionData as PermissionData,
        status: 'completed',
        created_at: new Date(),
        letter_content: letterContent
      };

      setPermissionRequests(prev => [...prev, newRequest]);
      
      // Show completion message with download button
      const completionMessage: ChatMessage = {
        id: (Date.now() + 3).toString(),
        sender: 'bot',
        message: "✅ Your permission letter has been generated successfully! You can download it as a PDF.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, completionMessage]);
      
    } catch (error) {
      console.error('Error generating letter:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 3).toString(),
        sender: 'bot',
        message: "❌ Sorry, there was an error generating your letter. Please try again.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate PDF using jsPDF
  const generatePDF = (data: PermissionData): Blob => {
    const doc = new jsPDF();
    
    // Set font
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text('PERMISSION REQUEST LETTER', 105, 30, { align: 'center' });
    
    // Line under header
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    // Date
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 45);
    
    // To section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('To: The Concerned Authority', 20, 60);
    
    // Subject
    doc.setFont('helvetica', 'bold');
    doc.text(`Subject: ${data.letter_type} for Film Production`, 20, 75);
    
    // Salutation
    doc.setFont('helvetica', 'normal');
    doc.text('Dear Sir/Madam,', 20, 90);
    
    // Body content
    const bodyText = `We are writing to request permission for filming activities as part of our film production project "${data.project_name}".`;
    doc.text(bodyText, 20, 105, { maxWidth: 170 });
    
    // Details section
    doc.setFont('helvetica', 'bold');
    doc.text('Details of Request:', 20, 125);
    
    doc.setFont('helvetica', 'normal');
    const details = [
      `Type of Permission: ${data.letter_type}`,
      `Filming Details: ${data.details}`,
      `Location: ${data.location}`,
      `Duration: ${data.duration}`,
      `Contact Person: ${data.contact_person}`
    ];
    
    let yPosition = 135;
    details.forEach(detail => {
      doc.text(`• ${detail}`, 25, yPosition);
      yPosition += 10;
    });
    
    // Additional requirements
    if (data.additional_notes) {
      doc.setFont('helvetica', 'bold');
      doc.text('Additional Requirements:', 20, yPosition + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(data.additional_notes, 20, yPosition + 20, { maxWidth: 170 });
      yPosition += 40;
    }
    
    // Closing paragraph
    const closingText = `We assure you that all filming activities will be conducted in accordance with local regulations and safety guidelines. Our production team will ensure minimal disruption to normal activities and will maintain the cleanliness and integrity of the location.

We kindly request your approval for the above-mentioned filming activities. Please feel free to contact us for any additional information or clarification.

Thank you for your consideration.`;
    
    doc.text(closingText, 20, yPosition + 20, { maxWidth: 170 });
    
    // Signature section
    doc.setFont('helvetica', 'normal');
    doc.text('Sincerely,', 20, 250);
    doc.text(data.contact_person, 20, 260);
    doc.text('Production Team', 20, 270);
    doc.text(data.project_name, 20, 280);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated by CineHack ERP System on ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' });
    
    // Return as blob
    return doc.output('blob');
  };

  // Download PDF
  const downloadPDF = () => {
    if (generatedPdf) {
      const url = URL.createObjectURL(generatedPdf);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${permissionData.letter_type?.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Generate letter content (this would typically call your backend)
  const generateLetterContent = (data: PermissionData): string => {
    return `PERMISSION REQUEST LETTER

To: The Concerned Authority

Subject: ${data.letter_type} for Film Production

Dear Sir/Madam,

We are writing to request permission for filming activities as part of our film production project "${data.project_name}".

Details of Request:
- Type of Permission: ${data.letter_type}
- Filming Details: ${data.details}
- Location: ${data.location}
- Duration: ${data.duration}
- Contact Person: ${data.contact_person}

Additional Requirements:
${data.additional_notes}

We assure you that all filming activities will be conducted in accordance with local regulations and safety guidelines. Our production team will ensure minimal disruption to normal activities and will maintain the cleanliness and integrity of the location.

We kindly request your approval for the above-mentioned filming activities. Please feel free to contact us for any additional information or clarification.

Thank you for your consideration.

Sincerely,
${data.contact_person}
Production Team
${data.project_name}

Generated on: ${new Date().toLocaleDateString()}`;
  };

  // Handle select option for bot questions
  const handleSelectOption = (value: string) => {
    setUserInput(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-accent-primary flex items-center gap-2">
            <span className="text-2xl">🔐</span>
            Permission Letters
          </h2>
          <p className="text-text-secondary mt-1">
            Generate official permission letters for your film production needs
          </p>
        </div>
        <Button 
          onClick={startNewRequest}
          className="bg-accent-primary hover:bg-accent-primary/80"
          disabled={activeView === 'chat'}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {activeView === 'list' && (
        <div className="grid gap-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary-bg/95 border border-accent-brown/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">Total Requests</p>
                    <p className="text-2xl font-bold text-accent-primary">{permissionRequests.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-accent-primary/60" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-bg/95 border border-accent-brown/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">Completed</p>
                    <p className="text-2xl font-bold text-green-500">
                      {permissionRequests.filter(r => r.status === 'completed').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500/60" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-bg/95 border border-accent-brown/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">In Progress</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {permissionRequests.filter(r => r.status === 'generating').length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Permission Requests List */}
          <Card className="bg-primary-bg/95 border border-accent-brown/30">
            <CardHeader>
              <CardTitle className="text-accent-secondary">Permission Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {permissionRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 mx-auto text-accent-primary/60 mb-4" />
                  <h3 className="text-xl font-medium mb-2 text-text-primary">No Permission Letters Yet</h3>
                  <p className="text-text-secondary mb-6 max-w-md mx-auto">
                    Start by creating your first permission letter. Our AI assistant will guide you through the process.
                  </p>
                  <Button onClick={startNewRequest} className="bg-accent-primary hover:bg-accent-primary/80">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Letter
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {permissionRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-secondary-bg/50 rounded-lg border border-accent-brown/20">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-text-primary">{request.data.letter_type}</h4>
                          <Badge 
                            variant={request.status === 'completed' ? 'default' : 'secondary'}
                            className={
                              request.status === 'completed' 
                                ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            }
                          >
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-secondary mb-1">
                          <strong>Location:</strong> {request.data.location}
                        </p>
                        <p className="text-sm text-text-secondary mb-1">
                          <strong>Duration:</strong> {request.data.duration}
                        </p>
                        <p className="text-xs text-text-muted">
                          Created: {request.created_at.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                          disabled={!request.letter_content}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!request.letter_content}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeView === 'chat' && (
        <div className="grid gap-6">
          {/* Chat Interface */}
          <Card className="bg-primary-bg/95 border border-accent-brown/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent-secondary">
                <Bot className="w-5 h-5" />
                Permission Assistant
              </CardTitle>
              <div className="text-sm text-text-secondary">
                Step {currentStep + 1} of {CHAT_FLOW.length}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${
                      message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === 'bot' 
                          ? 'bg-accent-primary/20 text-accent-primary' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {message.sender === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div className={`p-3 rounded-lg ${
                        message.sender === 'bot'
                          ? 'bg-secondary-bg/80 text-text-primary'
                          : 'bg-accent-primary/20 text-text-primary'
                      }`}>
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs text-text-muted mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              {currentStep < CHAT_FLOW.length && !showConfirmation && (
                <div className="border-t border-accent-brown/20 pt-4">
                  {CHAT_FLOW[currentStep]?.type === 'select' ? (
                    <div className="space-y-3">
                      <Select onValueChange={handleSelectOption} value={userInput}>
                        <SelectTrigger className="bg-secondary-bg border-accent-brown/30">
                          <SelectValue placeholder="Select permission type..." />
                        </SelectTrigger>
                        <SelectContent>
                          {PERMISSION_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={handleUserResponse}
                        disabled={!userInput}
                        className="w-full bg-accent-primary hover:bg-accent-primary/80"
                      >
                        Continue
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type your response..."
                        className="bg-secondary-bg border-accent-brown/30"
                        onKeyPress={(e) => e.key === 'Enter' && handleUserResponse()}
                      />
                      <Button 
                        onClick={handleUserResponse}
                        disabled={!userInput.trim()}
                        size="sm"
                        className="bg-accent-primary hover:bg-accent-primary/80"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Confirmation Buttons */}
              {showConfirmation && !isGenerating && !generatedPdf && (
                <div className="border-t border-accent-brown/20 pt-4">
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleConfirmationResponse(true)}
                      className="flex-1 bg-accent-primary hover:bg-accent-primary/80"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Yes, Generate Letter
                    </Button>
                    <Button 
                      onClick={() => handleConfirmationResponse(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isGenerating && (
                <div className="border-t border-accent-brown/20 pt-4">
                  <div className="flex items-center justify-center py-4">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-accent-primary" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-text-primary">Generating Permission Letter</p>
                        <p className="text-xs text-text-secondary">Creating PDF document...</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Download Button */}
              {generatedPdf && !isGenerating && (
                <div className="border-t border-accent-brown/20 pt-4">
                  <div className="space-y-3">
                    <Button 
                      onClick={downloadPDF}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Permission Letter (PDF)
                    </Button>
                    <Button 
                      onClick={() => {
                        setActiveView('list');
                        setCurrentStep(0);
                        setChatMessages([]);
                        setPermissionData({});
                        setShowConfirmation(false);
                        setGeneratedPdf(null);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Create Another Letter
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Letter Preview Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-primary-bg border border-accent-brown/30 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Letter Preview</span>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedRequest(null)}
                  size="sm"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm text-text-primary bg-secondary-bg/50 p-4 rounded border border-accent-brown/20">
                {selectedRequest.letter_content}
              </pre>
              <div className="flex gap-2 mt-4">
                <Button className="bg-accent-primary hover:bg-accent-primary/80">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Edit Letter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}