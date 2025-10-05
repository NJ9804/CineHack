# 🚀 Invoice Upload System - Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Obtain Google Gemini API key from https://aistudio.google.com/app/apikey
- [ ] Set `GEMINI_API_KEY` environment variable
  ```bash
  # Windows
  set GEMINI_API_KEY=your_api_key_here
  
  # Linux/Mac
  export GEMINI_API_KEY=your_api_key_here
  
  # .env file (recommended for production)
  echo "GEMINI_API_KEY=your_api_key_here" >> .env
  ```
- [ ] Verify API key is working (run test script)

### 2. Database Migration
- [ ] Backup existing database
  ```bash
  pg_dump -h your-host -U your-user -d your-db > backup_before_invoice_migration.sql
  ```
- [ ] Run migration script
  ```bash
  cd Backend
  python migrate_invoice_upload.py
  ```
- [ ] Verify tables created:
  - uploaded_invoices
  - invoice_approval_history
  - invoice_comments
  - invoice_approval_settings

### 3. File Storage Setup
- [ ] Verify `uploaded_invoices` directory exists
- [ ] Check write permissions for the directory
- [ ] Set up backup strategy for uploaded files
- [ ] Configure file retention policy (e.g., keep for 7 years for tax compliance)

### 4. API Testing
- [ ] Test invoice upload endpoint
  ```bash
  python test_invoice_upload.py
  ```
- [ ] Verify AI extraction is working
- [ ] Test approval workflow
- [ ] Test file download
- [ ] Check all CRUD operations

### 5. Configuration
- [ ] Set approval thresholds for each project
- [ ] Configure category-specific thresholds
- [ ] Set up notification recipients
- [ ] Define user roles and permissions
- [ ] Configure payment terms defaults

## 📋 Deployment Steps

### Backend Deployment

#### Step 1: Update Backend Code
```bash
cd Backend
git pull origin main
```

#### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
# Verify google-genai is installed
pip show google-genai
```

#### Step 3: Run Migration
```bash
python migrate_invoice_upload.py
```

#### Step 4: Restart Backend Server
```bash
# Development
fastapi dev main.py

# Production (with gunicorn)
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

#### Step 5: Verify API
```bash
curl http://localhost:8000/api/v1/invoice/health
# Should return: {"status": "healthy", "service": "invoice-api", "version": "1.0.0"}
```

### Frontend Deployment

#### Step 1: Copy Frontend Service
```bash
# The invoiceUploadService.tsx is already in Frontend/src/services/
# Verify it's there
ls Frontend/src/services/invoiceUploadService.tsx
```

#### Step 2: Configure API URL
```typescript
// In Frontend/.env or .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

#### Step 3: Import and Use Components
```typescript
// In your page/component
import {
  InvoiceUploadForm,
  InvoiceList,
  InvoiceDetailsModal
} from '@/services/invoiceUploadService';

// Use components
<InvoiceUploadForm projectId={1} userId={currentUser.id} />
<InvoiceList projectId={1} />
```

#### Step 4: Build and Deploy
```bash
cd Frontend
npm run build
npm start
```

## 🔧 Configuration Tasks

### 1. Set Default Approval Thresholds

For each project, configure thresholds:

```bash
curl -X POST "http://localhost:8000/api/v1/invoice/settings/1" \
  -F "auto_approve_threshold=5000" \
  -F "manager_approval_threshold=25000" \
  -F "director_approval_threshold=100000"
```

Or via database:
```sql
INSERT INTO invoice_approval_settings (
  project_id,
  auto_approve_threshold,
  manager_approval_threshold,
  director_approval_threshold
) VALUES (
  1,  -- project_id
  5000.0,
  25000.0,
  100000.0
);
```

### 2. Create Initial Test Invoice

```bash
# Run test script
python test_invoice_upload.py
```

### 3. Set Up User Roles

Ensure users have appropriate roles in the system:
- **Production Manager**: Can approve up to ₹25,000
- **Director**: Can approve up to ₹1,00,000
- **Producer**: Can approve any amount

## 📊 Monitoring Setup

### 1. Log Files
- [ ] Set up log rotation for invoice uploads
- [ ] Monitor AI extraction success rate
- [ ] Track approval times
- [ ] Log failed uploads

### 2. Metrics to Track
- [ ] Daily upload volume
- [ ] AI confidence scores (average)
- [ ] Approval workflow times
- [ ] Auto-approval percentage
- [ ] Rejection rate and reasons

### 3. Alerts
- [ ] Set up alert for low disk space (uploaded files)
- [ ] Alert for API key quota issues
- [ ] Alert for database connection failures
- [ ] Alert for pending approvals > 48 hours

## 🔒 Security Checklist

- [ ] API key stored in environment variables (not in code)
- [ ] File upload size limits enforced (10MB)
- [ ] File type validation active
- [ ] User authentication required for all endpoints
- [ ] HTTPS enabled for production
- [ ] CORS configured properly
- [ ] Database backups automated
- [ ] File storage backups automated

## 🧪 Testing Checklist

### Functional Testing
- [ ] Upload JPG invoice → AI extracts correctly
- [ ] Upload PNG invoice → AI extracts correctly
- [ ] Upload PDF invoice → AI extracts correctly
- [ ] Upload invoice < threshold → Auto-approved
- [ ] Upload invoice > threshold → Requires approval
- [ ] Approve invoice → Status changes correctly
- [ ] Reject invoice → Reason captured
- [ ] Add comment → Comment saved
- [ ] Download invoice → File downloads
- [ ] List invoices → All filters work

### Edge Cases
- [ ] Upload very large file (>10MB) → Rejected
- [ ] Upload wrong file type → Rejected
- [ ] Upload corrupted image → Handled gracefully
- [ ] Upload invoice with no text → Low confidence flagged
- [ ] Upload duplicate invoice → Detected
- [ ] Approve already approved invoice → Error handled
- [ ] Network timeout during upload → Error handled

### Performance Testing
- [ ] Upload 10 invoices simultaneously → All process correctly
- [ ] AI extraction time < 30 seconds
- [ ] List 1000 invoices → Loads quickly
- [ ] Download large PDF → No timeout

## 📚 Documentation Checklist

- [x] System documentation (INVOICE_UPLOAD_SYSTEM.md)
- [x] Quick start guide (INVOICE_QUICK_START.md)
- [x] Implementation summary (INVOICE_IMPLEMENTATION_SUMMARY.md)
- [x] Frontend integration examples
- [x] API endpoint documentation
- [x] Migration script
- [x] Test script
- [ ] User training materials
- [ ] Video tutorial (optional)
- [ ] FAQ document

## 👥 Team Onboarding

### For Production Team
- [ ] Training on upload process
- [ ] Guidelines for photo quality
- [ ] Category selection guide
- [ ] Best practices document

### For Approvers
- [ ] Training on approval workflow
- [ ] How to review invoices
- [ ] When to reject (guidelines)
- [ ] Comment usage best practices

### For Finance Team
- [ ] Dashboard training
- [ ] Report generation
- [ ] Threshold configuration
- [ ] Audit trail review

## 🚦 Go-Live Checklist

### Day Before
- [ ] Database backup completed
- [ ] All tests passing
- [ ] Team trained
- [ ] Documentation shared
- [ ] Support plan in place

### Go-Live Day
- [ ] Deploy backend updates
- [ ] Run migration
- [ ] Deploy frontend updates
- [ ] Verify API connectivity
- [ ] Test with sample invoice
- [ ] Monitor for first few hours
- [ ] Team on standby for support

### Day After
- [ ] Review upload logs
- [ ] Check AI extraction accuracy
- [ ] Verify approval workflows
- [ ] Collect user feedback
- [ ] Address any issues

## 📈 Post-Deployment

### Week 1
- [ ] Monitor daily usage
- [ ] Track AI accuracy
- [ ] Collect user feedback
- [ ] Fix any bugs
- [ ] Optimize thresholds if needed

### Month 1
- [ ] Review approval patterns
- [ ] Analyze cost savings
- [ ] User satisfaction survey
- [ ] Performance optimization
- [ ] Documentation updates

### Ongoing
- [ ] Monthly performance review
- [ ] Quarterly threshold adjustment
- [ ] Annual security audit
- [ ] Feature enhancement planning
- [ ] Team training refreshers

## 🆘 Rollback Plan

If issues occur:

1. **Immediate Rollback**
   ```bash
   # Stop the server
   # Restore database backup
   psql -h host -U user -d db < backup_before_invoice_migration.sql
   # Restart server
   ```

2. **Partial Rollback** (Keep data, disable feature)
   - Comment out invoice upload routes in main.py
   - Restart server
   - Data preserved for later

3. **Data Recovery**
   - All files are in `uploaded_invoices/` directory
   - Database tables can be dropped without affecting other features
   - No foreign key dependencies to core tables

## 📞 Support Contacts

- **Technical Issues**: [Your Tech Lead]
- **API Key Issues**: [Admin/DevOps]
- **User Training**: [Training Lead]
- **Business Questions**: [Project Manager]

## 📝 Sign-Off

- [ ] Technical Lead approval
- [ ] Finance Head approval
- [ ] Production Manager approval
- [ ] Security review completed
- [ ] Backup plan verified
- [ ] Team trained
- [ ] Documentation complete

---

## ✨ You're Ready to Deploy!

Once all items are checked, you have:
- ✅ A fully functional invoice upload system
- ✅ AI-powered data extraction
- ✅ Smart approval workflows
- ✅ Complete audit trails
- ✅ Comprehensive documentation
- ✅ Frontend integration ready

**Deploy with confidence!** 🚀

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Verified By**: _______________
