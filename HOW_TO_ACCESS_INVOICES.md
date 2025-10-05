# 🎯 How to Access Invoice Upload in the UI

## Quick Navigation

### Step 1: Go to Your Project
1. Navigate to the **Projects** page
2. Click on any project (e.g., "Mukundan Unni Associates")

### Step 2: Access Invoice Management
On the project page, you'll see **4 quick access cards** at the top:

1. 🎯 **Production Stages** - Track production timeline
2. 🎬 **Operations** - Rentals, Hotels, Catering & More  
3. ⚡ **Smart Schedule** - AI-Powered Scheduling
4. 📄 **Invoices** - AI-Powered Invoice Processing ← **Click this one!**

### Step 3: Upload Your First Invoice
Once in the Invoices page, you'll see **3 tabs**:

#### Tab 1: 📋 All Invoices
- View all invoices for the project
- See status, amounts, and approval state
- Download original invoice images
- Approve or reject pending invoices

#### Tab 2: 📤 Upload New  
- **Main upload area** with drag & drop support
- Add invoice details:
  - Category (catering, equipment, props, etc.)
  - Department (production, camera, art, etc.)
  - Purpose (what the expense is for)
  - Notes (additional context)
- Click **"Upload Invoice"** button
- AI processes it in ~30 seconds

#### Tab 3: ⏳ Pending Approval
- See invoices waiting for your approval
- Quick approve/reject actions
- View AI extraction confidence scores

---

## 🚀 Quick Test

### Test the Feature (Once Backend is Running):

1. **Start the Backend:**
   ```bash
   cd Backend
   set GEMINI_API_KEY=your_api_key_here
   fastapi dev main.py
   ```

2. **Start the Frontend:**
   ```bash
   cd Frontend
   npm run dev
   ```

3. **Navigate to:**
   ```
   http://localhost:3000/projects/1/invoices
   ```

4. **Upload a test invoice:**
   - Click "Upload New" tab
   - Select an invoice image (JPG/PNG/PDF)
   - Fill in the category (e.g., "catering")
   - Click "Upload Invoice"
   - Watch AI extract the details!

---

## 📍 Direct URLs

For quick access during development:

- **Project 1 Invoices:** `http://localhost:3000/projects/1/invoices`
- **Project 2 Invoices:** `http://localhost:3000/projects/2/invoices`
- **Project 3 Invoices:** `http://localhost:3000/projects/3/invoices`

---

## 🎨 UI Features

### Invoice Cards Show:
- ✅ Invoice number
- ✅ Vendor name
- ✅ Total amount
- ✅ Category
- ✅ Approval status (pending/approved/rejected)
- ✅ AI confidence score
- ✅ Action buttons (Approve/Reject/View)

### Visual Indicators:
- 🟢 **Green badge** = Approved
- 🟡 **Yellow badge** = Pending approval
- 🔴 **Red badge** = Rejected
- 🔵 **Blue badge** = Auto-approved
- ⚠️ **Orange warning** = Low AI confidence (needs review)

### Approval Workflow Visual:
The upload page shows a helpful guide:
```
1️⃣ Upload Invoice → Select your invoice file
2️⃣ AI Extraction → Gemini AI extracts all details
3️⃣ Smart Routing → System checks approval requirements
4️⃣ Approval Workflow → Auto-approved or routed to approver
```

### Threshold Display:
```
✅ Auto (₹0 - ₹5,000) → Instant
🟡 Manager (₹5,000 - ₹25,000) → ~2-4 hrs
🟠 Director (₹25,000 - ₹1,00,000) → ~1 day
🔴 Dual (> ₹1,00,000) → ~2-3 days
```

---

## 🔍 Finding the Button

### Visual Guide:

When you're on a project page (e.g., `/projects/1`), scroll to the **Quick Access Banners** section.

You'll see **4 colored cards in a row**:

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  🎯 Production  │  🎬 Operations  │  ⚡ Smart       │  📄 Invoices    │
│     Stages      │                 │    Schedule     │                 │
│                 │                 │                 │                 │
│ [View Timeline] │ [Manage Ops]    │ [Auto-Schedule] │ [Manage Invoices]│
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

**Click the blue "Manage Invoices" button** on the rightmost card!

---

## 📊 Dashboard Stats

At the top of the invoices page, you'll see **4 stat cards**:

1. **Total Invoices** 📄 - Count of all invoices
2. **Pending Approval** ⏰ - Invoices needing attention
3. **Approved** ✅ - Ready for payment
4. **Total Amount** 💰 - Sum for the month

---

## 💡 Pro Tips

1. **Clear Photos:** Ensure invoice images are well-lit and readable
2. **Add Context:** Use the notes field to add context for approvers
3. **Check Confidence:** Low AI confidence (<80%)? Review extracted data
4. **Quick Actions:** Use the approve/reject buttons on invoice cards for speed
5. **Filter Views:** Switch tabs to see only what you need

---

## 🎬 Current Status

✅ **Backend:** Fully implemented with AI processing  
✅ **Database:** Tables created and ready  
✅ **API:** 10 endpoints available  
✅ **Frontend:** Invoice page created at `/projects/[id]/invoices`  
✅ **Navigation:** Button added to project page  
✅ **Components:** Upload form, list, details modal ready  

---

## 🚧 Next Steps to Use

1. **Set API Key:**
   ```bash
   set GEMINI_API_KEY=your_key_here
   ```

2. **Start Backend:**
   ```bash
   cd Backend
   fastapi dev main.py
   ```

3. **Start Frontend:**
   ```bash
   cd Frontend  
   npm run dev
   ```

4. **Access Invoice Page:**
   - Go to any project
   - Click **"Manage Invoices"** button
   - Start uploading!

---

## 📞 Need Help?

- **Can't find the button?** → It's on the main project page, in the quick access cards
- **Upload failing?** → Check that backend is running and API key is set
- **AI not extracting?** → Verify image quality and Gemini API key
- **Approval not working?** → Check user permissions and approval thresholds

---

**You're all set!** The invoice upload feature is now accessible from within each project. 🎉
