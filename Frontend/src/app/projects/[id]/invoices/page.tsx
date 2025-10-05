'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { InvoiceUploadForm, InvoiceList } from '@/services/invoiceUploadService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';

export default function ProjectInvoicesPage() {
  const params = useParams();
  const projectId = parseInt(params.id as string);
  
  const [activeTab, setActiveTab] = useState('list');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // TODO: Get from auth context
  const userId = 1;

  const handleUploadSuccess = () => {
    // Refresh the invoice list
    setRefreshKey(prev => prev + 1);
    // Switch to list tab
    setActiveTab('list');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Invoice Management</h1>
        <p className="text-gray-600">
          Upload and manage invoices for this project with AI-powered extraction
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">0</div>
            <p className="text-xs text-gray-500">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0</div>
            <p className="text-xs text-gray-500">Ready for payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹0</div>
            <p className="text-xs text-gray-500">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="list">
            📋 All Invoices
          </TabsTrigger>
          <TabsTrigger value="upload">
            📤 Upload New
          </TabsTrigger>
          <TabsTrigger value="pending">
            ⏳ Pending Approval
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>
                View and manage all uploaded invoices for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceList key={refreshKey} projectId={projectId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Invoice</CardTitle>
              <CardDescription>
                Upload an invoice image (JPG, PNG, or PDF) and our AI will automatically extract all the details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <InvoiceUploadForm 
                    projectId={projectId}
                    userId={userId}
                    onSuccess={handleUploadSuccess}
                  />
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4 text-lg">🤖 How AI Processing Works</h3>
                  <ol className="space-y-3 text-sm">
                    <li className="flex items-start">
                      <span className="bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 flex-shrink-0 font-semibold">1</span>
                      <div>
                        <div className="font-medium">Upload Invoice</div>
                        <div className="text-gray-600">Select your invoice image or PDF file</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 flex-shrink-0 font-semibold">2</span>
                      <div>
                        <div className="font-medium">AI Extraction</div>
                        <div className="text-gray-600">Google Gemini AI extracts vendor, amounts, dates, and line items</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 flex-shrink-0 font-semibold">3</span>
                      <div>
                        <div className="font-medium">Smart Routing</div>
                        <div className="text-gray-600">System checks approval requirements based on amount</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 flex-shrink-0 font-semibold">4</span>
                      <div>
                        <div className="font-medium">Approval Workflow</div>
                        <div className="text-gray-600">Auto-approved or routed to appropriate approver</div>
                      </div>
                    </li>
                  </ol>
                  
                  <div className="mt-6 pt-4 border-t border-blue-200">
                    <h4 className="font-semibold text-sm mb-3">💰 Approval Thresholds:</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between bg-white/50 p-2 rounded">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2 bg-green-100">Auto</Badge>
                          <span className="font-medium">₹0 - ₹5,000</span>
                        </div>
                        <span className="text-gray-500">Instant</span>
                      </div>
                      <div className="flex items-center justify-between bg-white/50 p-2 rounded">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2 bg-yellow-100">Manager</Badge>
                          <span className="font-medium">₹5,000 - ₹25,000</span>
                        </div>
                        <span className="text-gray-500">~2-4 hrs</span>
                      </div>
                      <div className="flex items-center justify-between bg-white/50 p-2 rounded">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2 bg-orange-100">Director</Badge>
                          <span className="font-medium">₹25,000 - ₹1,00,000</span>
                        </div>
                        <span className="text-gray-500">~1 day</span>
                      </div>
                      <div className="flex items-center justify-between bg-white/50 p-2 rounded">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2 bg-red-100">Dual</Badge>
                          <span className="font-medium">&gt; ₹1,00,000</span>
                        </div>
                        <span className="text-gray-500">~2-3 days</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-100 rounded-lg text-xs">
                    <div className="font-semibold mb-1">💡 Pro Tips:</div>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Ensure invoice image is clear and well-lit</li>
                      <li>• All text should be readable</li>
                      <li>• Supported formats: JPG, PNG, PDF (max 10MB)</li>
                      <li>• Add notes for better tracking</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                Invoices waiting for approval in this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceList key={refreshKey} projectId={projectId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
