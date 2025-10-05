# 📊 Invoice Upload System - Visual Workflows

## 🔄 Complete System Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          INVOICE UPLOAD SYSTEM                                │
└──────────────────────────────────────────────────────────────────────────────┘

📱 User Actions                🤖 AI Processing              ⚙️ Approval Flow
─────────────                ──────────────────            ────────────────

    Upload Invoice
         │
         ▼
┌─────────────────┐
│  Select File    │          ┌──────────────────┐
│  (JPG/PNG/PDF)  │─────────▶│  Google Gemini   │
└─────────────────┘          │  AI Extraction   │
         │                   └──────────────────┘
         │                            │
         ▼                            ▼
┌─────────────────┐          ┌──────────────────┐
│  Add Metadata   │          │  Extract Details:│
│  • Category     │          │  • Vendor info   │
│  • Department   │          │  • Amounts       │
│  • Purpose      │          │  • Line items    │
│  • Notes        │          │  • Dates         │
└─────────────────┘          └──────────────────┘
         │                            │
         │                            ▼
         │                   ┌──────────────────┐
         │                   │ Calculate        │
         └──────────────────▶│ Confidence Score │
                             └──────────────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │ Check Amount vs  │
                             │ Threshold        │
                             └──────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
                    ▼                                   ▼
         ┌────────────────────┐              ┌────────────────────┐
         │  Amount < ₹5,000   │              │  Amount ≥ ₹5,000   │
         │  AUTO-APPROVE ✅   │              │  NEEDS APPROVAL ⚠️  │
         └────────────────────┘              └────────────────────┘
                    │                                   │
                    ▼                                   ▼
         ┌────────────────────┐              ┌────────────────────┐
         │  Ready for Payment │              │  Route to Approver │
         │  immediately       │              │  based on amount   │
         └────────────────────┘              └────────────────────┘
                                                        │
                                ┌───────────────────────┼───────────────────────┐
                                │                       │                       │
                                ▼                       ▼                       ▼
                    ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
                    │  ₹5K - ₹25K      │  │  ₹25K - ₹1L      │  │  > ₹1L           │
                    │  Manager         │  │  Director        │  │  Director +      │
                    │  Approval        │  │  Approval        │  │  Producer        │
                    └──────────────────┘  └──────────────────┘  └──────────────────┘
                                │                       │                       │
                                └───────────────────────┼───────────────────────┘
                                                        │
                                                        ▼
                                            ┌────────────────────┐
                                            │  Approver Reviews  │
                                            │  • Invoice details │
                                            │  • AI confidence   │
                                            │  • Line items      │
                                            └────────────────────┘
                                                        │
                                            ┌───────────┴───────────┐
                                            ▼                       ▼
                                ┌────────────────────┐  ┌────────────────────┐
                                │  APPROVE ✅        │  │  REJECT ❌         │
                                │  (with comments)   │  │  (with reason)     │
                                └────────────────────┘  └────────────────────┘
                                            │                       │
                                            ▼                       ▼
                                ┌────────────────────┐  ┌────────────────────┐
                                │  Ready for Payment │  │  Submitter         │
                                │                    │  │  Notified          │
                                └────────────────────┘  └────────────────────┘
```

---

## 📸 Upload Process Detail

```
┌─────────────────────────────────────────────────────────────────┐
│                     UPLOAD & PROCESSING                          │
└─────────────────────────────────────────────────────────────────┘

Step 1: File Selection
─────────────────────
    📄 User selects invoice file
         │
         ├─ Validate file type (JPG/PNG/PDF)
         ├─ Validate file size (< 10MB)
         └─ Validate file integrity
              ✅ Valid → Continue
              ❌ Invalid → Show error


Step 2: File Upload
─────────────────────
    📤 Upload to server
         │
         ├─ Generate unique filename
         ├─ Save to project folder
         │   uploaded_invoices/project_{id}/
         └─ Record file metadata
              • Original filename
              • MIME type
              • File size
              • Upload timestamp


Step 3: AI Extraction
─────────────────────
    🤖 Send to Google Gemini AI
         │
         ├─ Read file bytes
         ├─ Create extraction prompt
         ├─ Call Gemini API
         └─ Parse JSON response
              │
              ▼
         Extract 15+ fields:
         ┌──────────────────────┐
         │ Vendor Information:   │
         │ • Name               │
         │ • Address            │
         │ • Contact            │
         │ • GST/Tax ID         │
         ├──────────────────────┤
         │ Invoice Details:     │
         │ • Invoice number     │
         │ • Date               │
         │ • Due date           │
         ├──────────────────────┤
         │ Financial Data:      │
         │ • Subtotal           │
         │ • Tax amount         │
         │ • Discount           │
         │ • Total amount       │
         ├──────────────────────┤
         │ Line Items:          │
         │ • Description        │
         │ • Quantity           │
         │ • Unit price         │
         │ • Amount             │
         ├──────────────────────┤
         │ Auto-detect:         │
         │ • Category           │
         │ • Confidence score   │
         └──────────────────────┘


Step 4: Data Validation
─────────────────────
    ✓ Check confidence score
         │
         ├─ High (>80%): Proceed ✅
         ├─ Medium (50-80%): Flag for review ⚠️
         └─ Low (<50%): Manual entry required ❌


Step 5: Create Database Record
─────────────────────
    💾 Save to database
         │
         ├─ Generate invoice number
         ├─ Store extracted data
         ├─ Link to project
         ├─ Record submitter
         └─ Set initial status
              │
              ▼
         Create audit entry:
         ┌──────────────────────┐
         │ Action: Submitted    │
         │ By: User #{id}       │
         │ At: {timestamp}      │
         │ Status: Uploaded     │
         └──────────────────────┘


Step 6: Approval Routing
─────────────────────
    🔀 Determine approval path
         │
         ├─ Get project settings
         ├─ Check amount vs thresholds
         ├─ Check category overrides
         └─ Route accordingly
              │
              ▼
         Create approval record:
         ┌──────────────────────┐
         │ Required: Yes/No     │
         │ Threshold: ₹{amount} │
         │ Level: {level}       │
         │ Status: Pending      │
         └──────────────────────┘


Step 7: Notification (Future)
─────────────────────
    📧 Notify stakeholders
         │
         ├─ If auto-approved: Finance team
         ├─ If needs approval: Approver(s)
         └─ If low confidence: Submitter
```

---

## ⚙️ Approval Workflow Detail

```
┌─────────────────────────────────────────────────────────────────┐
│                     APPROVAL WORKFLOW                            │
└─────────────────────────────────────────────────────────────────┘

Invoice Submitted
       │
       ▼
┌────────────────┐
│ Check Amount   │
└────────────────┘
       │
       │
       ├─────────────────────────────────────┐
       │                                     │
       ▼                                     ▼
┌────────────────┐                   ┌────────────────┐
│ < ₹5,000       │                   │ ≥ ₹5,000       │
│ AUTO-APPROVE   │                   │ MANUAL APPROVE │
└────────────────┘                   └────────────────┘
       │                                     │
       ▼                                     │
┌────────────────┐                          │
│ Set Status:    │                          │
│ • approved     │                          │
│ • auto_approved│                          │
└────────────────┘                          │
       │                                     │
       ▼                                     ▼
┌────────────────┐              ┌──────────────────────────┐
│ Create History │              │ Route Based on Amount:   │
│ Entry          │              │                          │
└────────────────┘              │ ₹5K-₹25K   → Manager    │
       │                        │ ₹25K-₹1L   → Director   │
       │                        │ >₹1L       → Dual        │
       │                        └──────────────────────────┘
       │                                     │
       │                                     ▼
       │                        ┌──────────────────────────┐
       │                        │ Notify Approver          │
       │                        │ • Email (future)         │
       │                        │ • In-app notification    │
       │                        └──────────────────────────┘
       │                                     │
       │                                     ▼
       │                        ┌──────────────────────────┐
       │                        │ Approver Reviews:        │
       │                        │ • Invoice details        │
       │                        │ • Vendor information     │
       │                        │ • Line items             │
       │                        │ • AI confidence          │
       │                        │ • Previous history       │
       │                        └──────────────────────────┘
       │                                     │
       │                        ┌────────────┴────────────┐
       │                        │                         │
       │                        ▼                         ▼
       │              ┌──────────────────┐   ┌──────────────────┐
       │              │ APPROVE ✅       │   │ REJECT ❌        │
       │              │                  │   │                  │
       │              │ • Add comments   │   │ • Must provide   │
       │              │ • Optional notes │   │   reason         │
       │              └──────────────────┘   │ • Can add        │
       │                        │            │   suggestions    │
       │                        │            └──────────────────┘
       │                        │                         │
       │                        ▼                         ▼
       │              ┌──────────────────┐   ┌──────────────────┐
       │              │ Update Status:   │   │ Update Status:   │
       │              │ • approved       │   │ • rejected       │
       │              │ • approved_by    │   │ • Save reason    │
       │              │ • approval_date  │   │ • Notify submit. │
       │              └──────────────────┘   └──────────────────┘
       │                        │                         │
       │                        ▼                         ▼
       │              ┌──────────────────┐   ┌──────────────────┐
       │              │ Create History:  │   │ Create History:  │
       │              │ • action=approved│   │ • action=rejected│
       │              │ • by={user_id}   │   │ • by={user_id}   │
       │              │ • timestamp      │   │ • reason         │
       │              │ • comments       │   │ • timestamp      │
       │              └──────────────────┘   └──────────────────┘
       │                        │                         │
       ▼                        ▼                         ▼
┌────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ Ready for      │   │ Ready for        │   │ End Process      │
│ Payment        │   │ Payment          │   │ (Await new       │
│                │   │                  │   │  submission)     │
└────────────────┘   └──────────────────┘   └──────────────────┘
```

---

## 📊 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            DATA FLOW                                      │
└──────────────────────────────────────────────────────────────────────────┘

Frontend                Backend Service           Database          File Storage
────────                ───────────────            ────────          ────────────

Upload Form
    │
    │ POST /upload
    │ FormData {file, metadata}
    ├────────────────▶ Invoice Controller
                           │
                           │ Save file
                           ├──────────────────────────────────────▶ Local FS
                           │                                        uploaded_invoices/
                           │                                        project_X/
                           │                                        invoice_XXX.jpg
                           │
                           │ Extract data
                           ▼
                      Gemini AI Service
                           │
                           │ Call Gemini API
                           ├──────────────▶ Google Cloud
                           │ with image
                           │
                           │ ◀──────────── JSON response
                           │ {extracted fields}
                           │
                           │ Create record
                           ├──────────────────────────▶ Database
                           │                            ↓
                           │                       uploaded_invoices
                           │                       • invoice_number
                           │                       • vendor_name
                           │                       • total_amount
                           │                       • extracted_data
                           │                       • file_path
                           │                       • status
                           │
                           │ Check approval
                           ▼
                      Approval Service
                           │
                           │ Get settings
                           ├──────────────────────────▶ Database
                           │                            ↓
                           │                       invoice_approval_settings
                           │ ◀──────────────────────── • thresholds
                           │                            • workflow rules
                           │
                           │ Determine route
                           │
                           │ Create history
                           ├──────────────────────────▶ Database
                           │                            ↓
                           │                       invoice_approval_history
                           │                       • action=submitted
                           │                       • user_id
                           │                       • timestamp
                           │
    ◀────────────────── Response
    │ {invoice_id, status,
    │  approval_required,
    │  extracted_data}
    │
    ▼
Display Result
"Invoice uploaded
 successfully"


─────────────────────────────────────────────────────────────────

View Invoice List
    │
    │ GET /invoices/{project_id}
    ├────────────────▶ Invoice Controller
                           │
                           │ Query database
                           ├──────────────────────────▶ Database
                           │                            ↓
                           │                       SELECT * FROM
                           │                       uploaded_invoices
                           │ ◀──────────────────────── WHERE project_id=X
                           │ [invoice records]
                           │
    ◀────────────────── Response
    │ {invoices: [...],
    │  total_count: N,
    │  pending: M}
    │
    ▼
Display List
with filters


─────────────────────────────────────────────────────────────────

Approve Invoice
    │
    │ POST /approve
    │ {invoice_id, approver_id, comments}
    ├────────────────▶ Invoice Controller
                           │
                           │ Update record
                           ├──────────────────────────▶ Database
                           │                            ↓
                           │                       UPDATE uploaded_invoices
                           │                       SET approval_status='approved'
                           │                           approved_by=user_id
                           │                           approval_date=NOW()
                           │
                           │ Create history
                           ├──────────────────────────▶ Database
                           │                            ↓
                           │                       INSERT invoice_approval_history
                           │                       (action='approved', ...)
                           │
    ◀────────────────── Response
    │ {success: true,
    │  invoice_number,
    │  approval_status}
    │
    ▼
Update UI
Show success
```

---

## 🔄 State Transitions

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        INVOICE STATUS FLOW                                │
└──────────────────────────────────────────────────────────────────────────┘

                              ┌─────────┐
                              │  NEW    │
                              └────┬────┘
                                   │ Upload
                                   ▼
                              ┌─────────┐
                         ┌────┤UPLOADED │────┐
                         │    └─────────┘    │
                         │                   │
              Auto-approve│                  │Manual review
                         │                   │
                         ▼                   ▼
                   ┌───────────┐      ┌───────────┐
                   │AUTO_      │      │ PENDING   │
                   │APPROVED   │      │ APPROVAL  │
                   └─────┬─────┘      └─────┬─────┘
                         │                   │
                         │           ┌───────┴────────┐
                         │           │                │
                         │           ▼                ▼
                         │     ┌───────────┐    ┌─────────┐
                         │     │ APPROVED  │    │REJECTED │
                         │     └─────┬─────┘    └────┬────┘
                         │           │               │
                         ▼           ▼               ▼
                    ┌────────────────────┐      ┌────────┐
                    │   READY FOR        │      │ARCHIVED│
                    │   PAYMENT          │      └────────┘
                    └─────────┬──────────┘
                              │
                              ▼
                         ┌─────────┐
                         │  PAID   │
                         └────┬────┘
                              │
                              ▼
                         ┌─────────┐
                         │ARCHIVED │
                         └─────────┘


Approval Status Transitions:
────────────────────────────

  pending → approved → ready_for_payment
     │
     └──→ rejected → end


Payment Status Transitions:
───────────────────────────

  pending → processing → paid
     │
     └──→ failed → pending (retry)
```

---

## 🎯 Decision Tree: Approval Routing

```
                    Invoice Amount?
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    < ₹5,000        ₹5K-₹25K        ₹25K-₹1L        > ₹1L
         │               │               │               │
         ▼               ▼               ▼               ▼
   AUTO-APPROVE      Manager         Director      Director +
                    Approval         Approval       Producer
         │               │               │               │
         ▼               │               │               │
    Status:             │               │               │
    approved            │               │               │
                        │               │               │
         │              │               │               │
         └──────────────┴───────────────┴───────────────┘
                              │
                              ▼
                    Category Override?
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    YES                 NO
                    │                   │
                    ▼                   ▼
            Use Category         Use Default
            Threshold            Threshold
                    │                   │
                    └─────────┬─────────┘
                              │
                              ▼
                        Route Invoice
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
              Single Approver     Dual Approvers
                    │                   │
                    ▼                   ▼
               Notify One          Notify Both
```

---

## 📈 Success Metrics Dashboard

```
┌──────────────────────────────────────────────────────────────────────┐
│                      INVOICE METRICS                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Total Invoices: 247                  This Month: 45                 │
│  ────────────────────────────────────────────────────────────────    │
│                                                                       │
│  📊 By Status                         💰 By Amount                   │
│  ──────────                           ──────────                      │
│  ✅ Approved:     156 (63%)           Auto-approved:    ₹1.2L        │
│  ⏳ Pending:       34 (14%)           Manager level:    ₹4.5L        │
│  ❌ Rejected:      15 (6%)            Director level:   ₹12.8L       │
│  💳 Paid:         142 (57%)           Total:            ₹18.5L       │
│                                                                       │
│  🤖 AI Performance                    ⏱️ Approval Time               │
│  ───────────────                      ──────────────                 │
│  Avg Confidence:   92%                Auto:             <1 min       │
│  High (>80%):      218 (88%)          Manager:          2.3 hrs      │
│  Medium (50-80%):   24 (10%)          Director:         6.8 hrs      │
│  Low (<50%):         5 (2%)           Dual:            14.5 hrs      │
│                                                                       │
│  📂 By Category                       🔔 Alerts                      │
│  ────────────                         ───────                        │
│  Catering:         89 (36%)           • 5 pending >48hrs             │
│  Equipment:        67 (27%)           • 2 low confidence             │
│  Accommodation:    43 (17%)           • 1 near budget limit          │
│  Transport:        32 (13%)                                          │
│  Other:            16 (6%)                                           │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

**This visual documentation helps understand the complete invoice upload system at a glance!** 📊

