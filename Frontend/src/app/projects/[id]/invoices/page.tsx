'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { InvoiceUploadForm, InvoiceList } from '@/services/invoiceUploadService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, FileText, DollarSign, Upload, Zap } from 'lucide-react';
import Layout from '@/components/layout/Layout';

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
    <Layout title="📄 Invoice Management" subtitle="AI-powered invoice processing for your film production">
      <div className="container mx-auto px-4 space-y-6 max-w-7xl">
        <div className="text-center py-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-accent-secondary mb-2 break-words">
            📄 Invoice Management
          </h1>
          <p className="text-text-secondary text-base md:text-lg px-4">
            Upload and manage invoices for this project with AI-powered extraction
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="bg-gradient-to-br from-secondary-bg to-accent-brown/10 border-accent-brown shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-medium text-accent-secondary truncate">📄 Total Invoices</CardTitle>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">All time</p>
              </div>
              <div className="p-2 bg-accent-primary/20 rounded-full group-hover:bg-accent-primary/30 transition-colors flex-shrink-0 ml-2">
                <FileText className="h-5 w-5 text-accent-primary" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl md:text-3xl font-bold text-accent-primary mb-1">0</div>
              <div className="flex items-center text-xs md:text-sm text-text-secondary">
                <span className="mr-1 flex-shrink-0">📊</span>
                <span className="truncate">Uploaded documents</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary-bg to-accent-secondary/10 border-accent-brown shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-medium text-accent-secondary truncate">⏳ Pending Approval</CardTitle>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">Needs attention</p>
              </div>
              <div className="p-2 bg-yellow-500/20 rounded-full group-hover:bg-yellow-500/30 transition-colors flex-shrink-0 ml-2">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl md:text-3xl font-bold text-yellow-500 mb-1">0</div>
              <div className="flex items-center text-xs md:text-sm text-text-secondary">
                <span className="mr-1 flex-shrink-0">🔍</span>
                <span className="truncate">Awaiting review</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary-bg to-green-500/10 border-accent-brown shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-medium text-accent-secondary truncate">✅ Approved</CardTitle>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">Ready for payment</p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-full group-hover:bg-green-500/30 transition-colors flex-shrink-0 ml-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl md:text-3xl font-bold text-green-500 mb-1">0</div>
              <div className="flex items-center text-xs md:text-sm text-text-secondary">
                <span className="mr-1 flex-shrink-0">💳</span>
                <span className="truncate">Payment ready</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary-bg to-accent-primary/10 border-accent-brown shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-medium text-accent-secondary truncate">💰 Total Amount</CardTitle>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">This month</p>
              </div>
              <div className="p-2 bg-accent-primary/20 rounded-full group-hover:bg-accent-primary/30 transition-colors flex-shrink-0 ml-2">
                <DollarSign className="h-5 w-5 text-accent-primary" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl md:text-3xl font-bold text-accent-primary mb-1">₹0</div>
              <div className="flex items-center text-xs md:text-sm text-text-secondary">
                <span className="mr-1 flex-shrink-0">📈</span>
                <span className="truncate">Invoice value</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full min-w-[600px] grid-cols-3 bg-secondary-bg border border-accent-brown/30">
              <TabsTrigger 
                value="list" 
                className="data-[state=active]:bg-accent-primary/30 data-[state=active]:text-accent-primary text-text-secondary font-medium text-xs md:text-sm px-4 py-2"
              >
                <span className="hidden sm:inline">📋 All Invoices</span>
                <span className="sm:hidden">📋</span>
              </TabsTrigger>
              <TabsTrigger 
                value="upload" 
                className="data-[state=active]:bg-accent-primary/30 data-[state=active]:text-accent-primary text-text-secondary font-medium text-xs md:text-sm px-4 py-2"
              >
                <span className="hidden sm:inline">📤 Upload New</span>
                <span className="sm:hidden">📤</span>
              </TabsTrigger>
              <TabsTrigger 
                value="pending" 
                className="data-[state=active]:bg-accent-primary/30 data-[state=active]:text-accent-primary text-text-secondary font-medium text-xs md:text-sm px-4 py-2"
              >
                <span className="hidden sm:inline">⏳ Pending Approval</span>
                <span className="sm:hidden">⏳</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="list" className="mt-4 md:mt-6">
            <Card className="bg-gradient-to-br from-secondary-bg/80 to-primary-bg/60 border-accent-brown shadow-lg">
              <CardHeader>
                <CardTitle className="text-accent-secondary flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-accent-primary" />
                  📋 All Invoices
                </CardTitle>
                <CardDescription className="text-text-secondary">
                  View and manage all uploaded invoices for this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InvoiceList key={refreshKey} projectId={projectId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="mt-4 md:mt-6">
            <Card className="bg-gradient-to-br from-secondary-bg/80 to-primary-bg/60 border-accent-brown shadow-lg">
              <CardHeader>
                <CardTitle className="text-accent-secondary flex items-center">
                  <Upload className="w-6 h-6 mr-3 text-accent-primary" />
                  📤 Upload New Invoice
                </CardTitle>
                <CardDescription className="text-text-secondary">
                  Upload an invoice image (JPG, PNG, or PDF) and our AI will automatically extract all the details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <InvoiceUploadForm 
                      projectId={projectId}
                      userId={userId}
                      onSuccess={handleUploadSuccess}
                    />
                  </div>
                  <div className="bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 p-4 md:p-6 rounded-lg border border-accent-brown/20">
                    <h3 className="font-semibold mb-4 text-lg text-accent-secondary flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-accent-primary" />
                      🤖 How AI Processing Works
                    </h3>
                    <ol className="space-y-3 text-sm">
                      <li className="flex items-start">
                        <span className="bg-accent-primary text-primary-bg rounded-full w-7 h-7 flex items-center justify-center mr-3 flex-shrink-0 font-semibold">1</span>
                        <div>
                          <div className="font-medium text-accent-secondary">Upload Invoice</div>
                          <div className="text-text-secondary">Select your invoice image or PDF file</div>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-accent-primary text-primary-bg rounded-full w-7 h-7 flex items-center justify-center mr-3 flex-shrink-0 font-semibold">2</span>
                        <div>
                          <div className="font-medium text-accent-secondary">AI Extraction</div>
                          <div className="text-text-secondary">Google Gemini AI extracts vendor, amounts, dates, and line items</div>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-accent-primary text-primary-bg rounded-full w-7 h-7 flex items-center justify-center mr-3 flex-shrink-0 font-semibold">3</span>
                        <div>
                          <div className="font-medium text-accent-secondary">Smart Routing</div>
                          <div className="text-text-secondary">System checks approval requirements based on amount</div>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-accent-primary text-primary-bg rounded-full w-7 h-7 flex items-center justify-center mr-3 flex-shrink-0 font-semibold">4</span>
                        <div>
                          <div className="font-medium text-accent-secondary">Approval Workflow</div>
                          <div className="text-text-secondary">Auto-approved or routed to appropriate approver</div>
                        </div>
                      </li>
                    </ol>
                    
                    <div className="mt-6 pt-4 border-t border-accent-brown/20">
                      <h4 className="font-semibold text-sm mb-3 text-accent-secondary">💰 Approval Thresholds:</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between bg-primary-bg/50 p-2 rounded border border-accent-brown/10">
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2 bg-green-500/20 text-green-500 border-green-500/30">Auto</Badge>
                            <span className="font-medium text-accent-secondary">₹0 - ₹5,000</span>
                          </div>
                          <span className="text-text-secondary">Instant</span>
                        </div>
                        <div className="flex items-center justify-between bg-primary-bg/50 p-2 rounded border border-accent-brown/10">
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2 bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Manager</Badge>
                            <span className="font-medium text-accent-secondary">₹5,000 - ₹25,000</span>
                          </div>
                          <span className="text-text-secondary">~2-4 hrs</span>
                        </div>
                        <div className="flex items-center justify-between bg-primary-bg/50 p-2 rounded border border-accent-brown/10">
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2 bg-orange-500/20 text-orange-500 border-orange-500/30">Director</Badge>
                            <span className="font-medium text-accent-secondary">₹25,000 - ₹1,00,000</span>
                          </div>
                          <span className="text-text-secondary">~1 day</span>
                        </div>
                        <div className="flex items-center justify-between bg-primary-bg/50 p-2 rounded border border-accent-brown/10">
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2 bg-red-500/20 text-red-500 border-red-500/30">Dual</Badge>
                            <span className="font-medium text-accent-secondary">&gt; ₹1,00,000</span>
                          </div>
                          <span className="text-text-secondary">~2-3 days</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-accent-primary/10 rounded-lg text-xs border border-accent-primary/20">
                      <div className="font-semibold mb-1 text-accent-primary">💡 Pro Tips:</div>
                      <ul className="space-y-1 text-text-secondary">
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

          <TabsContent value="pending" className="mt-4 md:mt-6">
            <Card className="bg-gradient-to-br from-secondary-bg/80 to-primary-bg/60 border-accent-brown shadow-lg">
              <CardHeader>
                <CardTitle className="text-accent-secondary flex items-center">
                  <Clock className="w-6 h-6 mr-3 text-yellow-500" />
                  ⏳ Pending Approvals
                </CardTitle>
                <CardDescription className="text-text-secondary">
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
    </Layout>
  );
}
