# Invoice Approval Thresholds

## Current Configuration

### Default Thresholds (in INR)

| Level | Threshold | Approx. USD | Approval Required |
|-------|-----------|-------------|-------------------|
| **Auto-Approve** | < ₹1,000 | < $12 | ❌ No - Automatically approved |
| **Manager** | ₹1,000 - ₹10,000 | $12 - $120 | ✅ Yes - Manager approval needed |
| **Director** | ₹10,000 - ₹50,000 | $120 - $600 | ✅ Yes - Director approval needed |
| **Director + Producer** | > ₹50,000 | > $600 | ✅ Yes - Both approvals needed |

## Currency Conversion

All invoice amounts are converted to INR before comparing with thresholds:

| Currency | Rate to INR |
|----------|-------------|
| INR | 1.0 |
| USD | 83.0 |
| EUR | 90.0 |
| GBP | 105.0 |
| AED | 22.6 |
| SGD | 62.0 |

### Example Conversions:

- **$220 USD** = ₹18,260 INR → **Requires Director Approval**
- **$100 USD** = ₹8,300 INR → **Requires Manager Approval**
- **$10 USD** = ₹830 INR → **Auto-Approved**
- **€50 EUR** = ₹4,500 INR → **Requires Manager Approval**

## Approval Workflow

### Auto-Approved Invoices
- Small daily expenses (< ₹1,000 / $12)
- Automatically processed
- No manual review required
- Status: `auto_approved`

### Manager Approval (₹1K - ₹10K)
- Mid-range expenses
- Single manager approval
- Typical use: Equipment rentals, supplies
- Status: `pending` → `approved`/`rejected`

### Director Approval (₹10K - ₹50K)
- Large expenses
- Department director review
- Typical use: Major equipment, vendor contracts
- Status: `pending` → `approved`/`rejected`

### Dual Approval (> ₹50K)
- Critical/high-value expenses
- Both director AND producer approval
- Typical use: Major purchases, long-term contracts
- Status: `pending` → `approved`/`rejected`

## Configuring Custom Thresholds

### Per-Project Settings

You can configure custom thresholds for each project using the settings endpoint:

```bash
POST /api/invoice/settings/{project_id}
{
  "auto_approve_threshold": 2000.0,
  "manager_approval_threshold": 15000.0,
  "director_approval_threshold": 75000.0
}
```

### Category-Specific Thresholds

Different categories can have different approval limits:

```json
{
  "category_thresholds": {
    "equipment": 5000.0,
    "travel": 10000.0,
    "catering": 2000.0,
    "props": 3000.0
  }
}
```

## Frontend Features

### Enhanced Invoice Cards

The frontend now shows:
- ✅ Invoice number and vendor details
- ✅ Category and department
- ✅ Total amount with currency
- ✅ Invoice date and submission date
- ✅ AI confidence score with visual indicator
- ✅ Approval status badge
- ✅ "Requires Approval" flag
- ✅ Warning for low AI confidence

### Upload Success Message

After uploading, users see detailed extraction results:
- Invoice number
- Total amount with currency
- Vendor name
- Invoice date
- Category
- AI confidence percentage
- Approval status (auto-approved or pending)

### AI Confidence Warnings

- **< 80% confidence**: Orange warning displayed
- Users are prompted to verify all details
- Helps catch AI extraction errors

## Best Practices

1. **Start Conservative**: Current thresholds are set low to ensure oversight
2. **Review AI Confidence**: Always verify invoices with < 80% confidence
3. **Currency Awareness**: System automatically converts currencies to INR
4. **Adjust as Needed**: Increase thresholds once the team is comfortable
5. **Category Rules**: Set category-specific thresholds for better control

## Security & Accountability

- All approvals/rejections are logged with:
  - User ID
  - Timestamp
  - Comments/reason
  - Previous status
- Complete audit trail maintained
- Cannot delete approval history
- System prevents duplicate approvals

## Troubleshooting

### Issue: $220 invoice is auto-approved
**Solution**: Updated thresholds to ₹1,000 (~$12) for auto-approval. Now $220 requires director approval.

### Issue: Wrong currency comparison
**Solution**: System now converts all amounts to INR before threshold comparison.

### Issue: Can't see invoice details
**Solution**: Enhanced frontend cards show all extracted information.

---

**Last Updated**: October 5, 2025
**Configuration File**: `Backend/app/services/invoice_processing_service.py`
