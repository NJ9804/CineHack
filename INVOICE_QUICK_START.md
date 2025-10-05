# 🚀 Invoice Upload System - Quick Start Guide

## Step 1: Set Up API Key

Get your Google Gemini API key from: https://aistudio.google.com/app/apikey

```bash
# Windows
set GEMINI_API_KEY=your_api_key_here

# Linux/Mac
export GEMINI_API_KEY=your_api_key_here
```

## Step 2: Run Database Migration

```bash
cd Backend
python migrate_invoice_upload.py
```

Expected output:
```
✓ Tables created successfully
✓ Created directory: uploaded_invoices
Migration completed successfully!
```

## Step 3: Test the System

```bash
python test_invoice_upload.py
```

Choose option 1 to test AI extraction with a sample invoice.

## Step 4: Upload Your First Invoice

### Via API (Using curl or Postman)

```bash
curl -X POST "http://localhost:8000/api/v1/invoice/upload" \
  -F "file=@invoice.jpg" \
  -F "project_id=1" \
  -F "user_id=1" \
  -F "category=catering" \
  -F "notes=Lunch for shoot day 5"
```

### Via Python Script

```python
import requests

url = "http://localhost:8000/api/v1/invoice/upload"

files = {"file": open("invoice.jpg", "rb")}
data = {
    "project_id": 1,
    "user_id": 1,
    "category": "catering",
    "notes": "Daily catering expense"
}

response = requests.post(url, files=files, data=data)
print(response.json())
```

## Step 5: Configure Approval Thresholds

```bash
curl -X POST "http://localhost:8000/api/v1/invoice/settings/1" \
  -F "auto_approve_threshold=5000" \
  -F "manager_approval_threshold=25000" \
  -F "director_approval_threshold=100000"
```

## Step 6: View Invoices

```bash
# Get all invoices for project
curl "http://localhost:8000/api/v1/invoice/invoices/1"

# Get pending approvals only
curl "http://localhost:8000/api/v1/invoice/invoices/1?approval_status=pending"

# Get specific invoice details
curl "http://localhost:8000/api/v1/invoice/invoice/1"
```

## Step 7: Approve/Reject Invoices

### Approve
```bash
curl -X POST "http://localhost:8000/api/v1/invoice/invoice/1/approve" \
  -H "Content-Type: application/json" \
  -d '{
    "approver_id": 2,
    "comments": "Approved - valid expense"
  }'
```

### Reject
```bash
curl -X POST "http://localhost:8000/api/v1/invoice/invoice/1/reject" \
  -H "Content-Type: application/json" \
  -d '{
    "rejector_id": 2,
    "reason": "Invoice amount doesn't match quote"
  }'
```

## 📊 Understanding the Workflow

### Auto-Approved (< ₹5,000)
```
Upload → AI Extract → Auto-Approve → Ready for Payment
```

### Manager Approval (₹5,000 - ₹25,000)
```
Upload → AI Extract → Manager Review → Approve/Reject → Payment
```

### Director Approval (> ₹25,000)
```
Upload → AI Extract → Director Review → Approve/Reject → Payment
```

## 🎯 Common Use Cases

### Case 1: Daily Catering Bill
```
Amount: ₹3,500
Category: catering
Result: Auto-approved
Action: None required
```

### Case 2: Equipment Rental
```
Amount: ₹45,000
Category: equipment
Result: Requires Director approval
Action: Director must review and approve
```

### Case 3: High-Value Purchase
```
Amount: ₹1,50,000
Category: equipment
Result: Requires dual approval
Action: Both Director and Producer must approve
```

## 🔧 Troubleshooting

### Issue: "GEMINI_API_KEY not set"
**Solution:** Set the environment variable before starting the server

### Issue: Low AI confidence score
**Solution:** 
- Ensure invoice image is clear and well-lit
- Check that text is readable
- Try uploading a higher resolution image

### Issue: Invoice not requiring approval when expected
**Solution:**
- Check approval threshold settings
- Verify invoice amount
- Review category-specific thresholds

## 📱 Integration with Frontend

### Upload Form Example (React)
```jsx
const uploadInvoice = async (file, projectId, userId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('project_id', projectId);
  formData.append('user_id', userId);
  
  const response = await fetch('/api/v1/invoice/upload', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
};
```

### Display Invoice List Example
```jsx
const InvoiceList = ({ projectId }) => {
  const [invoices, setInvoices] = useState([]);
  
  useEffect(() => {
    fetch(`/api/v1/invoice/invoices/${projectId}`)
      .then(res => res.json())
      .then(data => setInvoices(data.invoices));
  }, [projectId]);
  
  return (
    <div>
      {invoices.map(inv => (
        <InvoiceCard 
          key={inv.id}
          invoice={inv}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ))}
    </div>
  );
};
```

## 📈 Next Steps

1. **Set up notification system** - Alert approvers when invoices need review
2. **Create dashboard** - Show pending approvals, total expenses, etc.
3. **Add budget integration** - Link invoices to budget lines
4. **Generate reports** - Export expense reports by category/department
5. **Mobile app** - Enable on-location invoice uploads

## 💡 Tips for Best Results

### For Quality AI Extraction:
- ✓ Take clear, well-lit photos
- ✓ Ensure all text is readable
- ✓ Capture the entire invoice
- ✓ Avoid shadows and glare
- ✓ Use landscape orientation for wide invoices

### For Efficient Approval:
- ✓ Upload invoices promptly
- ✓ Add detailed notes and purpose
- ✓ Link to relevant scenes
- ✓ Respond to clarifications quickly
- ✓ Review low-confidence extractions

### For Better Accountability:
- ✓ Always provide rejection reasons
- ✓ Use comments for discussions
- ✓ Verify vendor details
- ✓ Check for duplicates
- ✓ Keep approval records

## 📚 Additional Resources

- Full Documentation: `INVOICE_UPLOAD_SYSTEM.md`
- API Reference: http://localhost:8000/docs
- Test Suite: `test_invoice_upload.py`
- Migration Script: `migrate_invoice_upload.py`

## 🆘 Need Help?

1. Check the main documentation
2. Review API docs at /docs endpoint
3. Run test suite to verify setup
4. Check server logs for errors

---

**Ready to go!** Start uploading invoices and experience automated expense management with AI-powered accountability! 🎬💰
