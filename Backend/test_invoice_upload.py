"""
Example script to test the Invoice Upload & Processing System
Demonstrates how to use the invoice processing service
"""

import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.invoice_processing_service import InvoiceProcessingService
from app.config.database import SessionLocal
from app.models import User, Project

def create_sample_invoice_image():
    """
    Create a sample invoice for testing
    Note: In production, you would upload a real invoice image
    """
    print("📄 Sample Invoice Creator")
    print("=" * 80)
    print("\nFor testing, you need to provide an actual invoice image.")
    print("Supported formats: JPG, PNG, PDF")
    print("\nExample invoice path: C:\\path\\to\\invoice.jpg")
    print("\nOr create a test invoice using any online invoice generator:")
    print("  - https://invoice-generator.com")
    print("  - https://www.zoho.com/invoice/free-invoice-generator.html")
    print("=" * 80)
    
    invoice_path = input("\nEnter path to invoice image: ").strip().strip('"')
    
    if not os.path.exists(invoice_path):
        print(f"❌ File not found: {invoice_path}")
        return None
    
    return invoice_path


def test_invoice_processing():
    """Test the invoice processing workflow"""
    
    print("\n🧪 Invoice Processing System - Test Suite")
    print("=" * 80)
    
    # Check for API key
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("\n❌ GEMINI_API_KEY environment variable not set!")
        print("\nPlease set your Gemini API key:")
        print("  Windows: set GEMINI_API_KEY=your_api_key_here")
        print("  Linux/Mac: export GEMINI_API_KEY=your_api_key_here")
        print("\nGet your API key from: https://aistudio.google.com/app/apikey")
        return
    
    print("✓ Gemini API key found")
    
    # Get invoice image
    invoice_path = create_sample_invoice_image()
    if not invoice_path:
        return
    
    try:
        # Initialize service
        print("\n1️⃣ Initializing Invoice Processing Service...")
        service = InvoiceProcessingService()
        print("   ✓ Service initialized")
        
        # Read file
        print("\n2️⃣ Reading invoice file...")
        with open(invoice_path, 'rb') as f:
            file_bytes = f.read()
        
        file_size = len(file_bytes)
        filename = os.path.basename(invoice_path)
        print(f"   ✓ File read successfully: {filename} ({file_size} bytes)")
        
        # Determine MIME type
        ext = Path(invoice_path).suffix.lower()
        mime_map = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.pdf': 'application/pdf'
        }
        mime_type = mime_map.get(ext, 'image/jpeg')
        
        # Save file
        print("\n3️⃣ Saving invoice to storage...")
        project_id = 1  # Test project ID
        saved_path, detected_mime = service.save_invoice_file(
            file_bytes,
            filename,
            project_id
        )
        print(f"   ✓ File saved: {saved_path}")
        print(f"   ✓ MIME type: {detected_mime}")
        
        # Extract details using AI
        print("\n4️⃣ Extracting invoice details using Gemini AI...")
        print("   ⏳ Processing... (this may take a few seconds)")
        extracted_data = service.extract_invoice_details(saved_path, detected_mime)
        
        if extracted_data.get('error'):
            print(f"\n   ❌ Extraction failed: {extracted_data['error']}")
            if extracted_data.get('raw_response'):
                print(f"\n   Raw response: {extracted_data['raw_response'][:500]}...")
            return
        
        print("\n   ✓ Extraction completed!")
        print("\n" + "=" * 80)
        print("📊 EXTRACTED INVOICE DETAILS")
        print("=" * 80)
        
        # Display vendor info
        print("\n🏢 Vendor Information:")
        print(f"   Name: {extracted_data.get('vendor_name', 'N/A')}")
        print(f"   Address: {extracted_data.get('vendor_address', 'N/A')}")
        print(f"   Contact: {extracted_data.get('vendor_contact', 'N/A')}")
        print(f"   GST/Tax ID: {extracted_data.get('vendor_gstin', 'N/A')}")
        
        # Display invoice details
        print("\n📋 Invoice Details:")
        print(f"   Invoice Number: {extracted_data.get('invoice_number', 'N/A')}")
        print(f"   Invoice Date: {extracted_data.get('invoice_date', 'N/A')}")
        print(f"   Due Date: {extracted_data.get('due_date', 'N/A')}")
        print(f"   Category: {extracted_data.get('category', 'N/A')}")
        
        # Display financial info
        print("\n💰 Financial Information:")
        print(f"   Subtotal: {extracted_data.get('currency', 'INR')} {extracted_data.get('subtotal', 0.0):,.2f}")
        print(f"   Tax Amount: {extracted_data.get('currency', 'INR')} {extracted_data.get('tax_amount', 0.0):,.2f}")
        print(f"   Discount: {extracted_data.get('currency', 'INR')} {extracted_data.get('discount_amount', 0.0):,.2f}")
        print(f"   Total Amount: {extracted_data.get('currency', 'INR')} {extracted_data.get('total_amount', 0.0):,.2f}")
        
        # Display line items
        line_items = extracted_data.get('line_items', [])
        if line_items:
            print(f"\n📦 Line Items ({len(line_items)}):")
            for i, item in enumerate(line_items, 1):
                print(f"\n   Item {i}:")
                print(f"     Description: {item.get('description', 'N/A')}")
                print(f"     Quantity: {item.get('quantity', 'N/A')}")
                print(f"     Unit Price: {item.get('unit_price', 0.0):,.2f}")
                print(f"     Amount: {item.get('amount', 0.0):,.2f}")
        
        # Display confidence score
        confidence = extracted_data.get('confidence', 0.0)
        print(f"\n🎯 AI Confidence Score: {confidence:.2%}")
        
        if confidence < 0.5:
            print("   ⚠️ Low confidence - manual review recommended")
        elif confidence < 0.8:
            print("   ⚠️ Medium confidence - verification recommended")
        else:
            print("   ✓ High confidence - extraction reliable")
        
        # Check approval requirement
        print("\n5️⃣ Checking approval requirements...")
        db = SessionLocal()
        try:
            total_amount = extracted_data.get('total_amount', 0.0)
            category = extracted_data.get('category')
            
            requires_approval, threshold, approval_level = service.check_approval_required(
                total_amount,
                category,
                project_id,
                db
            )
            
            print(f"   Amount: {total_amount:,.2f}")
            print(f"   Threshold: {threshold:,.2f}")
            print(f"   Approval Required: {'Yes' if requires_approval else 'No'}")
            print(f"   Approval Level: {approval_level}")
            
            if requires_approval:
                print("\n   ⚠️ This invoice requires approval before payment")
            else:
                print("\n   ✓ Invoice auto-approved (below threshold)")
            
        finally:
            db.close()
        
        print("\n" + "=" * 80)
        print("✅ TEST COMPLETED SUCCESSFULLY")
        print("=" * 80)
        print("\nNext steps:")
        print("  1. Review the extracted data for accuracy")
        print("  2. Use the /api/v1/invoice/upload endpoint to upload via API")
        print("  3. Configure approval thresholds for your project")
        print("  4. Set up approval workflow with your team")
        
    except Exception as e:
        print(f"\n❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()


def test_approval_workflow():
    """Test the approval workflow"""
    
    print("\n🔄 Approval Workflow Test")
    print("=" * 80)
    
    db = SessionLocal()
    try:
        # Create test scenarios
        scenarios = [
            {"amount": 3000, "category": "catering", "description": "Small catering expense"},
            {"amount": 15000, "category": "equipment", "description": "Equipment rental"},
            {"amount": 50000, "category": "accommodation", "description": "Hotel booking"},
            {"amount": 150000, "category": "equipment", "description": "High-value equipment"}
        ]
        
        service = InvoiceProcessingService()
        project_id = 1
        
        print("\nTesting different invoice amounts:\n")
        
        for i, scenario in enumerate(scenarios, 1):
            print(f"{i}. {scenario['description']}")
            print(f"   Amount: ₹{scenario['amount']:,.2f}")
            print(f"   Category: {scenario['category']}")
            
            requires_approval, threshold, approval_level = service.check_approval_required(
                scenario['amount'],
                scenario['category'],
                project_id,
                db
            )
            
            print(f"   Threshold: ₹{threshold:,.2f}")
            print(f"   Approval: {'Required' if requires_approval else 'Auto-approved'}")
            print(f"   Level: {approval_level}")
            print()
        
    finally:
        db.close()
    
    print("=" * 80)


if __name__ == "__main__":
    print("\n" + "="*80)
    print("INVOICE UPLOAD & PROCESSING SYSTEM - TEST SUITE")
    print("="*80)
    
    print("\nSelect test to run:")
    print("1. Test Invoice Processing (AI Extraction)")
    print("2. Test Approval Workflow")
    print("3. Run All Tests")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    if choice == "1":
        test_invoice_processing()
    elif choice == "2":
        test_approval_workflow()
    elif choice == "3":
        test_invoice_processing()
        print("\n")
        test_approval_workflow()
    else:
        print("Invalid choice!")
