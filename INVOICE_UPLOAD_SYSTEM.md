# Invoice Upload & Processing System

## Overview

A comprehensive invoice management system with AI-powered data extraction, approval workflows, and accountability tracking for film production expenses.

## 🌟 Key Features

### 1. **AI-Powered Invoice Extraction**
- Upload invoice images (JPG, PNG, PDF) and automatically extract details using Google Gemini AI
- Extracts vendor information, line items, amounts, dates, and more
- Confidence scoring for extraction quality
- Support for multiple invoice formats and layouts

### 2. **Smart Approval Workflow**
- Configurable approval thresholds per project
- Auto-approval for amounts below threshold
- Multi-level approval chains (Manager → Director → Producer)
- Category-specific thresholds (e.g., catering vs. equipment)
- Dual approval requirements for high-value invoices

### 3. **Complete Audit Trail**
- Full approval history tracking
- Comments and discussions on invoices
- Status tracking from upload to payment
- User activity logging with timestamps

### 4. **Secure File Storage**
- Local file storage organized by project
- Original invoice images preserved
- Unique file naming with timestamps
- Support for multiple file formats

### 5. **Accountability & Transparency**
- Every invoice requires submitter identification
- Approval chain is fully documented
- Rejection reasons must be provided
- Internal notes for finance team

## 🚀 Getting Started

### Prerequisites

1. **Google Gemini API Key**
   ```bash
   # Set environment variable
   set GEMINI_API_KEY=your_api_key_here
   ```

2. **Install Dependencies** (already in requirements.txt)
   ```bash
   pip install google-genai
   ```

### Database Migration

Run the migration to create required tables:

```bash
cd Backend
python migrate_invoice_upload.py
```

This creates:
- `uploaded_invoices` - Main invoice records
- `invoice_approval_history` - Approval tracking
- `invoice_comments` - Discussion threads
- `invoice_approval_settings` - Project-specific thresholds

## 📋 API Endpoints

### 1. Upload Invoice

**POST** `/api/v1/invoice/upload`

Upload an invoice image and process it with AI.

**Form Data:**
```
file: [Invoice image/PDF file]
project_id: 1
user_id: 123
category: "catering" (optional)
department: "production" (optional)
purpose: "Lunch catering for shoot day 5" (optional)
notes: "Additional notes" (optional)
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice uploaded and processed successfully",
  "invoice_id": 45,
  "invoice_number": "INV-2024-001",
  "extraction_status": "completed",
  "approval_required": true,
  "approval_status": "pending",
  "extracted_data": {
    "vendor_name": "ABC Catering Services",
    "total_amount": 15000.00,
    "invoice_date": "2024-01-15",
    "line_items": [...],
    "confidence": 0.95
  }
}
```

### 2. Get Project Invoices

**GET** `/api/v1/invoice/invoices/{project_id}`

Query Parameters:
- `status`: Filter by status (uploaded, approved, paid, etc.)
- `approval_status`: Filter by approval status (pending, approved, rejected)

**Response:**
```json
{
  "invoices": [
    {
      "id": 45,
      "invoice_number": "INV-2024-001",
      "vendor_name": "ABC Catering",
      "total_amount": 15000.00,
      "approval_status": "pending",
      "created_at": "2024-01-15T10:30:00"
    }
  ],
  "total_count": 25,
  "pending_approval_count": 5
}
```

### 3. Get Invoice Details

**GET** `/api/v1/invoice/invoice/{invoice_id}`

Returns complete invoice information including:
- Full extracted data
- Approval history
- Comments
- File information

### 4. Approve Invoice

**POST** `/api/v1/invoice/invoice/{invoice_id}/approve`

**Body:**
```json
{
  "approver_id": 456,
  "comments": "Approved - valid expense"
}
```

### 5. Reject Invoice

**POST** `/api/v1/invoice/invoice/{invoice_id}/reject`

**Body:**
```json
{
  "rejector_id": 456,
  "reason": "Duplicate invoice - already paid in INV-2024-045"
}
```

### 6. Download Invoice Image

**GET** `/api/v1/invoice/invoice/{invoice_id}/download`

Returns the original uploaded invoice file.

### 7. Add Comment

**POST** `/api/v1/invoice/invoice/{invoice_id}/comment`

**Form Data:**
```
user_id: 123
content: "Please verify the vendor GST number"
comment_type: "query"
is_internal: false
```

### 8. Configure Approval Settings

**POST** `/api/v1/invoice/settings/{project_id}`

**Form Data:**
```
auto_approve_threshold: 5000.00
manager_approval_threshold: 25000.00
director_approval_threshold: 100000.00
```

## 🔧 Configuration

### Approval Thresholds

Default thresholds (can be customized per project):

| Threshold | Amount | Approval Level |
|-----------|--------|----------------|
| Auto-approve | < ₹5,000 | None (automatic) |
| Manager | ₹5,000 - ₹25,000 | Production Manager |
| Director | ₹25,000 - ₹1,00,000 | Director/Producer |
| Dual Approval | > ₹1,00,000 | Director + Producer |

### Category-Specific Thresholds

You can set different thresholds for different categories:

```json
{
  "catering": 10000,
  "equipment": 50000,
  "accommodation": 30000,
  "transport": 15000
}
```

## 📁 File Storage Structure

```
uploaded_invoices/
├── project_1/
│   ├── invoice_20240115_103000_catering_bill.jpg
│   ├── invoice_20240115_140000_equipment_rental.pdf
│   └── invoice_20240116_090000_hotel_booking.jpg
├── project_2/
│   └── ...
└── project_3/
    └── ...
```

## 🤖 AI Extraction Details

The system uses **Google Gemini 2.0 Flash** to extract:

### Vendor Information
- Vendor name
- Address
- Contact details
- GST/Tax ID

### Invoice Details
- Invoice number
- Invoice date
- Due date
- Payment terms

### Financial Information
- Subtotal
- Tax/GST amount
- Discounts
- Total amount
- Currency

### Line Items
For each item:
- Description
- Quantity
- Unit price
- Total amount

### Smart Categorization
- Automatic category detection (catering, equipment, props, etc.)
- Confidence scoring
- Fallback to manual categorization

## 🔐 Security & Accountability

### Approval Workflow
1. **Submission**: User uploads invoice, becomes "submitter"
2. **AI Processing**: Automatic data extraction
3. **Threshold Check**: Determines if approval needed
4. **Approval Chain**: Routes to appropriate approver(s)
5. **History Tracking**: Every action logged with user ID and timestamp

### Audit Trail
Every invoice tracks:
- Who uploaded it
- When it was uploaded
- Who approved/rejected it
- Why it was rejected (if applicable)
- All comments and discussions
- Payment status and payer

### Data Integrity
- Unique invoice numbers
- Duplicate detection
- File integrity checks
- Extraction confidence scoring
- Manual verification flag

## 📊 Use Cases

### 1. Daily Expenses
```
User: Production Assistant
Action: Upload lunch catering invoice (₹3,500)
Result: Auto-approved (below threshold)
Status: Ready for payment
```

### 2. Equipment Rental
```
User: Camera Department Head
Action: Upload camera rental invoice (₹45,000)
Result: Requires Director approval
Workflow: Pending → Approved → Paid
```

### 3. High-Value Purchase
```
User: Production Manager
Action: Upload lighting equipment invoice (₹1,50,000)
Result: Requires dual approval (Director + Producer)
Workflow: Pending → Director Approval → Producer Approval → Paid
```

### 4. Disputed Invoice
```
User: Production Manager
Action: Upload vendor invoice (₹25,000)
Reviewer: Finance Head
Action: Rejects with reason "Pricing doesn't match quote"
Status: Rejected → Vendor contacted → New invoice uploaded
```

## 🎯 Best Practices

### For Production Team
1. Upload invoices immediately after receiving
2. Add clear purpose/notes for each invoice
3. Link invoices to relevant scenes when applicable
4. Review AI-extracted data for accuracy
5. Flag low-confidence extractions for manual review

### For Approvers
1. Review invoices promptly (escalation after 48 hours)
2. Provide detailed rejection reasons
3. Use comments for clarifications
4. Verify vendor details for new vendors
5. Check for duplicates before approving

### For Finance Team
1. Configure appropriate thresholds per project
2. Set up category-specific limits
3. Enable dual approval for high amounts
4. Use internal notes for sensitive information
5. Regularly review approval patterns

## 🔍 Monitoring & Reports

### Dashboard Metrics
- Total invoices uploaded
- Pending approvals count
- Average approval time
- Total expenses by category
- AI extraction accuracy

### Export Options
- Export invoice data to CSV
- Generate expense reports by category
- Approval delay reports
- Vendor-wise expense summary

## 🛠️ Troubleshooting

### Low AI Confidence
If extraction confidence is < 0.5:
1. Check image quality
2. Ensure text is clearly visible
3. Manual verification required
4. Consider re-uploading higher quality image

### Approval Not Required When Expected
Check:
1. Approval threshold settings
2. Invoice amount vs. threshold
3. Category-specific thresholds
4. Auto-approve settings

### File Upload Errors
Verify:
1. File size < 10MB
2. File type is JPG, PNG, or PDF
3. File is not corrupted
4. Upload directory has write permissions

## 📞 Support

For issues or questions:
1. Check the API documentation
2. Review error logs in `backend/logs`
3. Verify Gemini API key is set
4. Check database connectivity

## 🚧 Future Enhancements

- [ ] Integration with accounting software
- [ ] Bulk invoice upload
- [ ] Email notifications for approval requests
- [ ] OCR for printed invoices
- [ ] Mobile app for on-location uploads
- [ ] Recurring invoice handling
- [ ] Multi-currency support
- [ ] Vendor blacklist/whitelist
- [ ] Budget integration and alerts
- [ ] ML-based fraud detection

## 📝 Notes

- All amounts are stored in the project's default currency
- File retention policy: Keep all invoices for tax compliance
- Backup uploaded files regularly
- Review and update approval thresholds quarterly
- Train team on proper invoice submission process

---

**Version:** 1.0.0  
**Last Updated:** January 2024  
**Maintainer:** CineHack Team
