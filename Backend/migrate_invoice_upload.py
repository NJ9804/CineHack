"""
Migration script to add Invoice Upload & Processing tables
Adds: uploaded_invoices, invoice_approval_history, invoice_comments, invoice_approval_settings
"""

import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.config.database import DATABASE_URL, Base
from app.models import (
    UploadedInvoice,
    InvoiceApprovalHistory,
    InvoiceComment,
    InvoiceApprovalSettings
)

def run_migration():
    """Run the migration to create invoice upload tables"""
    
    print("Starting Invoice Upload System Migration...")
    print(f"Timestamp: {datetime.now()}")
    print(f"Database: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'local'}")
    print("-" * 80)
    
    try:
        # Create engine
        engine = create_engine(DATABASE_URL)
        
        # Create tables
        print("\n1. Creating invoice upload tables...")
        Base.metadata.create_all(
            bind=engine,
            tables=[
                UploadedInvoice.__table__,
                InvoiceApprovalHistory.__table__,
                InvoiceComment.__table__,
                InvoiceApprovalSettings.__table__
            ]
        )
        print("   ✓ Tables created successfully")
        
        # Create upload directory
        print("\n2. Creating upload directory...")
        upload_dir = "uploaded_invoices"
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)
            print(f"   ✓ Created directory: {upload_dir}")
        else:
            print(f"   ✓ Directory already exists: {upload_dir}")
        
        print("\n" + "=" * 80)
        print("Migration completed successfully!")
        print("=" * 80)
        print("\nNew tables created:")
        print("  - uploaded_invoices")
        print("  - invoice_approval_history")
        print("  - invoice_comments")
        print("  - invoice_approval_settings")
        print("\nNext steps:")
        print("  1. Set GEMINI_API_KEY environment variable")
        print("  2. Configure approval thresholds for your projects")
        print("  3. Start uploading invoices via /api/v1/invoice/upload endpoint")
        print("\nFeatures available:")
        print("  ✓ AI-powered invoice data extraction (Google Gemini)")
        print("  ✓ Automatic approval workflow based on thresholds")
        print("  ✓ Multi-level approval chains")
        print("  ✓ Invoice comments and discussions")
        print("  ✓ Approval history tracking")
        print("  ✓ Local file storage with project organization")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    run_migration()
