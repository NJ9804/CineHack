/**
 * Invoice Upload System - Frontend Integration Examples
 * React/Next.js implementation examples for the invoice upload system
 */

import React from 'react';

// ============= Type Definitions =============

interface Invoice {
  id: number;
  invoice_number: string;
  vendor_name: string;
  total_amount: number;
  currency: string;
  invoice_date: string | null;
  category: string;
  department: string;
  approval_required: boolean;
  approval_status: string;
  status: string;
  submitted_by: number;
  created_at: string;
  ai_confidence_score: number;
  file_path: string;
}

interface UploadInvoiceResponse {
  success: boolean;
  message: string;
  invoice_id: number;
  invoice_number: string;
  extraction_status: string;
  approval_required: boolean;
  approval_status: string;
  extracted_data: any;
}

interface InvoiceDetails extends Invoice {
  vendor_address: string;
  vendor_contact: string;
  vendor_gstin: string;
  due_date: string | null;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  line_items: LineItem[];
  purpose: string;
  approval_threshold: number;
  approved_by: number;
  approval_date: string | null;
  rejection_reason: string;
  payment_status: string;
  notes: string;
  original_filename: string;
  ai_extraction_status: string;
  updated_at: string;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

// ============= API Service Functions =============

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Upload an invoice with file and metadata
 */
export async function uploadInvoice(
  file: File,
  projectId: number,
  userId: number,
  options?: {
    category?: string;
    department?: string;
    purpose?: string;
    notes?: string;
  }
): Promise<UploadInvoiceResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('project_id', projectId.toString());
  formData.append('user_id', userId.toString());
  
  if (options?.category) formData.append('category', options.category);
  if (options?.department) formData.append('department', options.department);
  if (options?.purpose) formData.append('purpose', options.purpose);
  if (options?.notes) formData.append('notes', options.notes);

  const response = await fetch(`${API_BASE}/api/invoice/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get all invoices for a project
 */
export async function getProjectInvoices(
  projectId: number,
  filters?: {
    status?: string;
    approval_status?: string;
  }
): Promise<{ invoices: Invoice[]; total_count: number; pending_approval_count: number }> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.approval_status) params.append('approval_status', filters.approval_status);

    const url = `${API_BASE}/api/invoice/invoices/${projectId}${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      // If endpoint doesn't exist or returns error, return empty data
      console.warn(`Invoice fetch failed: ${response.statusText}`);
      return { invoices: [], total_count: 0, pending_approval_count: 0 };
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching invoices:', error);
    // Return empty data instead of throwing
    return { invoices: [], total_count: 0, pending_approval_count: 0 };
  }
}

/**
 * Get detailed invoice information
 */
export async function getInvoiceDetails(invoiceId: number): Promise<{
  invoice: InvoiceDetails;
  approval_history: any[];
  comments: any[];
}> {
  const response = await fetch(`${API_BASE}/api/invoice/invoice/${invoiceId}`);

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Approve an invoice
 */
export async function approveInvoice(
  invoiceId: number,
  approverId: number,
  comments?: string
): Promise<any> {
  const response = await fetch(`${API_BASE}/api/invoice/invoice/${invoiceId}/approve?approver_id=${approverId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comments }),
  });

  if (!response.ok) {
    throw new Error(`Approval failed: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Reject an invoice
 */
export async function rejectInvoice(
  invoiceId: number,
  rejectorId: number,
  reason: string
): Promise<any> {
  const response = await fetch(`${API_BASE}/api/invoice/invoice/${invoiceId}/reject?rejector_id=${rejectorId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    throw new Error(`Rejection failed: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Add a comment to an invoice
 */
export async function addInvoiceComment(
  invoiceId: number,
  userId: number,
  content: string,
  options?: {
    comment_type?: string;
    is_internal?: boolean;
  }
): Promise<any> {
  const formData = new FormData();
  formData.append('user_id', userId.toString());
  formData.append('content', content);
  if (options?.comment_type) formData.append('comment_type', options.comment_type);
  if (options?.is_internal !== undefined) formData.append('is_internal', options.is_internal.toString());

  const response = await fetch(`${API_BASE}/api/invoice/invoice/${invoiceId}/comment`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Comment failed: ${response.statusText}`);
  }

  return await response.json();
}

// ============= React Components =============

/**
 * Invoice Upload Component
 */
export function InvoiceUploadForm({ projectId, userId, onSuccess }: {
  projectId: number;
  userId: number;
  onSuccess?: (response: UploadInvoiceResponse) => void;
}) {
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [category, setCategory] = React.useState('');
  const [department, setDepartment] = React.useState('');
  const [purpose, setPurpose] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadInvoice(file, projectId, userId, {
        category: category || undefined,
        department: department || undefined,
        purpose: purpose || undefined,
        notes: notes || undefined,
      });

      // Show detailed extraction results
      const extracted = response.extracted_data || {};
      const details = `
✅ Invoice Uploaded Successfully!

📄 Invoice Number: ${response.invoice_number}
💰 Amount: ${extracted.currency || ''} ${extracted.total_amount?.toLocaleString() || 'N/A'}
🏢 Vendor: ${extracted.vendor_name || 'N/A'}
📅 Date: ${extracted.invoice_date || 'N/A'}
📂 Category: ${extracted.category || 'Uncategorized'}
🤖 AI Confidence: ${extracted.confidence_score ? (extracted.confidence_score * 100).toFixed(0) + '%' : 'N/A'}

${response.approval_required ? 
  '⚠️ APPROVAL REQUIRED\nThis invoice needs manager approval before processing.' : 
  '✓ AUTO-APPROVED\nInvoice is below the approval threshold.'
}

Status: ${response.approval_status.toUpperCase()}
      `.trim();
      
      alert(details);
      
      // Reset form
      setFile(null);
      setCategory('');
      setDepartment('');
      setPurpose('');
      setNotes('');

      if (onSuccess) onSuccess(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Invoice Image/PDF *</label>
        <input
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
          className="block w-full border border-gray-300 rounded-md p-2"
        />
        <p className="text-xs text-gray-500 mt-1">Supported: JPG, PNG, PDF (max 10MB)</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="block w-full border border-gray-300 rounded-md p-2"
        >
          <option value="">Select category...</option>
          <option value="catering">Catering</option>
          <option value="equipment">Equipment</option>
          <option value="props">Props</option>
          <option value="accommodation">Accommodation</option>
          <option value="transport">Transport</option>
          <option value="services">Services</option>
          <option value="utilities">Utilities</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Department</label>
        <input
          type="text"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="e.g., Production, Camera, Art"
          className="block w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Purpose</label>
        <input
          type="text"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="e.g., Lunch catering for shoot day 5"
          className="block w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Additional notes..."
          className="block w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      <button
        type="submit"
        disabled={!file || uploading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {uploading ? 'Uploading...' : 'Upload Invoice'}
      </button>
    </form>
  );
}

/**
 * Invoice List Component
 */
export function InvoiceList({ projectId }: { projectId: number }) {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<string>('all');

  React.useEffect(() => {
    loadInvoices();
  }, [projectId, filter]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const filterParams = filter === 'pending' ? { approval_status: 'pending' } : undefined;
      const data = await getProjectInvoices(projectId, filterParams);
      setInvoices(data.invoices);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading invoices...</div>;

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          All Invoices
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Pending Approval
        </button>
      </div>

      <div className="space-y-4">
        {invoices.map((invoice) => (
          <InvoiceCard key={invoice.id} invoice={invoice} onUpdate={loadInvoices} />
        ))}
      </div>
    </div>
  );
}

/**
 * Invoice Card Component - Enhanced with more details
 */
function InvoiceCard({ invoice, onUpdate }: { invoice: Invoice; onUpdate: () => void }) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    auto_approved: 'bg-blue-100 text-blue-800',
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="border rounded-lg p-5 hover:shadow-lg transition-shadow bg-white">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-gray-900">{invoice.invoice_number}</h3>
            {invoice.approval_required && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                Requires Approval
              </span>
            )}
          </div>
          <p className="text-gray-700 font-medium">{invoice.vendor_name}</p>
          <div className="flex gap-3 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              📂 {invoice.category || 'Uncategorized'}
            </span>
            <span className="flex items-center gap-1">
              🏢 {invoice.department || 'General'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-900">
            {invoice.currency} {invoice.total_amount.toLocaleString()}
          </p>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[invoice.approval_status] || 'bg-gray-100'}`}>
            {invoice.approval_status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Invoice Date:</span>
          <span className="ml-2 text-gray-900 font-medium">{formatDate(invoice.invoice_date)}</span>
        </div>
        <div>
          <span className="text-gray-500">Submitted:</span>
          <span className="ml-2 text-gray-900 font-medium">{formatDate(invoice.created_at)}</span>
        </div>
        <div>
          <span className="text-gray-500">AI Confidence:</span>
          <span className={`ml-2 font-medium ${invoice.ai_confidence_score >= 0.8 ? 'text-green-600' : 'text-orange-600'}`}>
            {(invoice.ai_confidence_score * 100).toFixed(0)}%
          </span>
        </div>
        <div>
          <span className="text-gray-500">Status:</span>
          <span className="ml-2 text-gray-900 font-medium">{invoice.status}</span>
        </div>
      </div>

      {/* Warnings */}
      {invoice.ai_confidence_score < 0.8 && (
        <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
          ⚠️ <strong>Low AI Confidence:</strong> Please verify all extracted details manually
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 border-t">
        <button
          onClick={() => window.open(`${API_BASE}/invoice/invoice/${invoice.id}/download`, '_blank')}
          className="flex-1 px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 font-medium"
        >
          📄 View Invoice
        </button>
        {invoice.approval_status === 'pending' && (
          <>
            <button
              onClick={async () => {
                const userId = 1; // Get from auth context
                await approveInvoice(invoice.id, userId, 'Approved via review');
                onUpdate();
              }}
              className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 font-medium"
            >
              ✓ Approve
            </button>
            <button
              onClick={async () => {
                const userId = 1; // Get from auth context
                const reason = prompt('Please provide rejection reason:');
                if (reason) {
                  await rejectInvoice(invoice.id, userId, reason);
                  onUpdate();
                }
              }}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 font-medium"
            >
              ✗ Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Invoice Details Modal Component
 */
export function InvoiceDetailsModal({ invoiceId, onClose }: {
  invoiceId: number;
  onClose: () => void;
}) {
  const [details, setDetails] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadDetails();
  }, [invoiceId]);

  const loadDetails = async () => {
    try {
      const data = await getInvoiceDetails(invoiceId);
      setDetails(data);
    } catch (error) {
      console.error('Failed to load details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!details) return <div>Failed to load invoice details</div>;

  const { invoice, approval_history, comments } = details;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{invoice.invoice_number}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Vendor Details</h3>
            <p><strong>Name:</strong> {invoice.vendor_name}</p>
            <p><strong>Address:</strong> {invoice.vendor_address}</p>
            <p><strong>Contact:</strong> {invoice.vendor_contact}</p>
            <p><strong>GST:</strong> {invoice.vendor_gstin}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Financial Summary</h3>
            <p><strong>Subtotal:</strong> {invoice.currency} {invoice.subtotal?.toLocaleString()}</p>
            <p><strong>Tax:</strong> {invoice.currency} {invoice.tax_amount?.toLocaleString()}</p>
            <p><strong>Discount:</strong> {invoice.currency} {invoice.discount_amount?.toLocaleString()}</p>
            <p className="text-xl"><strong>Total:</strong> {invoice.currency} {invoice.total_amount.toLocaleString()}</p>
          </div>
        </div>

        {invoice.line_items && invoice.line_items.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Line Items</h3>
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-right">Qty</th>
                  <th className="p-2 text-right">Unit Price</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.line_items.map((item: LineItem, i: number) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{item.description}</td>
                    <td className="p-2 text-right">{item.quantity}</td>
                    <td className="p-2 text-right">{item.unit_price.toLocaleString()}</td>
                    <td className="p-2 text-right">{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {approval_history.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Approval History</h3>
            <div className="space-y-2">
              {approval_history.map((h: any, i: number) => (
                <div key={i} className="border-l-4 border-blue-500 pl-3 py-1">
                  <p><strong>{h.action}</strong> by User #{h.action_by}</p>
                  <p className="text-sm text-gray-600">{new Date(h.action_date).toLocaleString()}</p>
                  {h.comments && <p className="text-sm">{h.comments}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default {
  uploadInvoice,
  getProjectInvoices,
  getInvoiceDetails,
  approveInvoice,
  rejectInvoice,
  addInvoiceComment,
  InvoiceUploadForm,
  InvoiceList,
  InvoiceDetailsModal,
};
