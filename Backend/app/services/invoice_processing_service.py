"""
Invoice Processing Service using Google Gemini AI
Extracts details from invoice images and manages approval workflow
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional, Tuple
from pathlib import Path
from google import genai
from google.genai import types

from sqlalchemy.orm import Session
from app.models import (
    UploadedInvoice, 
    InvoiceApprovalSettings, 
    InvoiceApprovalHistory,
    User
)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Storage configuration
UPLOAD_DIRECTORY = Path("uploaded_invoices")
UPLOAD_DIRECTORY.mkdir(exist_ok=True)


class InvoiceProcessingService:
    """Service for processing invoices with AI extraction and approval workflow"""
    
    def __init__(self):
        """Initialize the Gemini AI client"""
        # Get API key from environment variable
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        self.client = genai.Client(api_key=api_key)
        self.model = "gemini-2.5-flash"
    
    def save_invoice_file(
        self, 
        file_bytes: bytes, 
        filename: str,
        project_id: int
    ) -> Tuple[str, str]:
        """
        Save uploaded invoice file to local storage
        
        Args:
            file_bytes: File content as bytes
            filename: Original filename
            project_id: Associated project ID
            
        Returns:
            Tuple of (file_path, mime_type)
        """
        # Create project-specific directory
        project_dir = UPLOAD_DIRECTORY / f"project_{project_id}"
        project_dir.mkdir(exist_ok=True)
        
        # Generate unique filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = Path(filename).suffix.lower()
        unique_filename = f"invoice_{timestamp}_{filename}"
        
        file_path = project_dir / unique_filename
        
        # Save file
        with open(file_path, 'wb') as f:
            f.write(file_bytes)
        
        # Determine MIME type
        mime_type_map = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.pdf': 'application/pdf',
            '.webp': 'image/webp'
        }
        mime_type = mime_type_map.get(file_extension, 'application/octet-stream')
        
        logger.info(f"Saved invoice file: {file_path}")
        return str(file_path), mime_type
    
    def extract_invoice_details(
        self, 
        file_path: str, 
        mime_type: str
    ) -> Dict[str, Any]:
        """
        Extract invoice details using Google Gemini AI
        
        Args:
            file_path: Path to the invoice image/PDF
            mime_type: MIME type of the file
            
        Returns:
            Dictionary containing extracted invoice details
        """
        try:
            # Read the file
            with open(file_path, 'rb') as f:
                file_bytes = f.read()
            
            # Create detailed prompt for invoice extraction
            prompt = """
            You are an expert invoice data extraction AI. Analyze this invoice image and extract ALL relevant information in a structured JSON format.
            
            Extract the following details:
            1. Vendor Information:
               - vendor_name (company/business name)
               - vendor_address (full address)
               - vendor_contact (phone/email)
               - vendor_gstin (GST/Tax ID if available)
            
            2. Invoice Details:
               - invoice_number (invoice/bill number)
               - invoice_date (in YYYY-MM-DD format)
               - due_date (if mentioned, in YYYY-MM-DD format)
            
            3. Financial Information:
               - subtotal (amount before tax)
               - tax_amount (GST/VAT/tax amount)
               - discount_amount (if any discount applied)
               - total_amount (final payable amount)
               - currency (INR, USD, etc.)
            
            4. Line Items (array of items):
               - For each item extract:
                 * description (item/service name)
                 * quantity (number of items)
                 * unit_price (price per unit)
                 * amount (total for this line)
            
            5. Additional Information:
               - category (best guess: catering, equipment, props, transport, accommodation, services, utilities, etc.)
               - payment_terms (if mentioned)
               - notes (any special notes or terms)
            
            6. Confidence Score:
               - confidence (your confidence in the extraction, 0.0 to 1.0)
            
            Return ONLY a valid JSON object with these fields. If a field is not found, use null.
            Ensure all numbers are properly formatted as numbers, not strings.
            For dates, use YYYY-MM-DD format or null if not found.
            
            Example format:
            {
                "vendor_name": "ABC Catering Services",
                "vendor_address": "123 Main St, Mumbai, MH 400001",
                "vendor_contact": "+91-9876543210",
                "vendor_gstin": "27AAAAA0000A1Z5",
                "invoice_number": "INV-2024-001",
                "invoice_date": "2024-01-15",
                "due_date": "2024-02-15",
                "subtotal": 10000.00,
                "tax_amount": 1800.00,
                "discount_amount": 0.00,
                "total_amount": 11800.00,
                "currency": "INR",
                "line_items": [
                    {
                        "description": "Lunch for 50 people",
                        "quantity": 50,
                        "unit_price": 200.00,
                        "amount": 10000.00
                    }
                ],
                "category": "catering",
                "payment_terms": "Net 30 days",
                "notes": "18% GST included",
                "confidence": 0.95
            }
            """
            
            # Call Gemini API
            response = self.client.models.generate_content(
                model=self.model,
                contents=[
                    types.Part.from_bytes(
                        data=file_bytes,
                        mime_type=mime_type
                    ),
                    prompt
                ]
            )
            
            # Extract JSON from response
            response_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            # Parse JSON
            extracted_data = json.loads(response_text)
            
            # Add extraction metadata
            extracted_data['extraction_timestamp'] = datetime.now().isoformat()
            extracted_data['ai_model'] = self.model
            
            logger.info(f"Successfully extracted invoice details with confidence: {extracted_data.get('confidence', 'N/A')}")
            return extracted_data
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {e}")
            logger.error(f"Response text: {response_text}")
            return {
                'error': 'Failed to parse AI response',
                'raw_response': response_text,
                'confidence': 0.0
            }
        except Exception as e:
            logger.error(f"Error extracting invoice details: {e}")
            return {
                'error': str(e),
                'confidence': 0.0
            }
    
    def check_approval_required(
        self,
        total_amount: float,
        category: Optional[str],
        project_id: int,
        db: Session
    ) -> Tuple[bool, Optional[float], str]:
        """
        Check if invoice requires approval based on amount and category
        
        Args:
            total_amount: Invoice total amount
            category: Invoice category
            project_id: Project ID
            db: Database session
            
        Returns:
            Tuple of (requires_approval, threshold_amount, approval_level)
        """
        # Get approval settings for project
        settings = db.query(InvoiceApprovalSettings).filter(
            InvoiceApprovalSettings.project_id == project_id
        ).first()
        
        # Use default settings if not configured
        if not settings:
            settings = InvoiceApprovalSettings(
                project_id=project_id,
                auto_approve_threshold=5000.0,
                manager_approval_threshold=25000.0,
                director_approval_threshold=100000.0
            )
        
        # Check category-specific threshold first
        if category and settings.category_thresholds:
            category_threshold = settings.category_thresholds.get(category)
            if category_threshold and total_amount >= category_threshold:
                return True, category_threshold, "category_manager"
        
        # Check general thresholds
        if total_amount < settings.auto_approve_threshold:
            return False, settings.auto_approve_threshold, "auto_approved"
        elif total_amount < settings.manager_approval_threshold:
            return True, settings.manager_approval_threshold, "manager"
        elif total_amount < settings.director_approval_threshold:
            return True, settings.director_approval_threshold, "director"
        else:
            return True, settings.director_approval_threshold, "director_and_producer"
    
    def create_invoice_record(
        self,
        db: Session,
        project_id: int,
        user_id: int,
        file_path: str,
        original_filename: str,
        mime_type: str,
        file_size: int,
        extracted_data: Dict[str, Any]
    ) -> UploadedInvoice:
        """
        Create invoice record in database with extracted data
        
        Args:
            db: Database session
            project_id: Project ID
            user_id: User who uploaded the invoice
            file_path: Path to saved file
            original_filename: Original filename
            mime_type: File MIME type
            file_size: File size in bytes
            extracted_data: Data extracted by AI
            
        Returns:
            Created UploadedInvoice instance
        """
        # Generate unique invoice number if not extracted
        invoice_number = extracted_data.get('invoice_number')
        if not invoice_number:
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            invoice_number = f"INV-{project_id}-{timestamp}"
        
        # Parse dates
        invoice_date = None
        if extracted_data.get('invoice_date'):
            try:
                invoice_date = datetime.strptime(extracted_data['invoice_date'], '%Y-%m-%d')
            except:
                pass
        
        due_date = None
        if extracted_data.get('due_date'):
            try:
                due_date = datetime.strptime(extracted_data['due_date'], '%Y-%m-%d')
            except:
                pass
        
        # Get confidence score
        confidence = extracted_data.get('confidence', 0.0)
        
        # Determine if extraction was successful
        extraction_status = "completed" if confidence > 0.5 else "failed"
        if extracted_data.get('error'):
            extraction_status = "failed"
        
        # Check if approval is required
        total_amount = extracted_data.get('total_amount', 0.0)
        category = extracted_data.get('category')
        requires_approval, threshold, approval_level = self.check_approval_required(
            total_amount, category, project_id, db
        )
        
        # Create invoice record
        invoice = UploadedInvoice(
            project_id=project_id,
            invoice_number=invoice_number,
            original_filename=original_filename,
            file_path=file_path,
            file_size=file_size,
            mime_type=mime_type,
            
            # Extracted vendor details
            vendor_name=extracted_data.get('vendor_name'),
            vendor_address=extracted_data.get('vendor_address'),
            vendor_contact=extracted_data.get('vendor_contact'),
            vendor_gstin=extracted_data.get('vendor_gstin'),
            
            # Extracted invoice details
            invoice_date=invoice_date,
            due_date=due_date,
            
            # Financial details
            subtotal=extracted_data.get('subtotal'),
            tax_amount=extracted_data.get('tax_amount'),
            discount_amount=extracted_data.get('discount_amount', 0.0),
            total_amount=total_amount,
            currency=extracted_data.get('currency', 'INR'),
            
            # Line items
            line_items=extracted_data.get('line_items', []),
            
            # AI processing
            ai_extraction_status=extraction_status,
            ai_confidence_score=confidence,
            ai_raw_response=extracted_data,
            extraction_timestamp=datetime.now(),
            
            # Categorization
            category=category,
            
            # Approval workflow
            approval_required=requires_approval,
            approval_threshold=threshold if requires_approval else None,
            approval_status="pending" if requires_approval else "auto_approved",
            
            # Tracking
            submitted_by=user_id,
            status="uploaded"
        )
        
        db.add(invoice)
        db.commit()
        db.refresh(invoice)
        
        # Create approval history entry
        history = InvoiceApprovalHistory(
            invoice_id=invoice.id,
            action="submitted",
            action_by=user_id,
            approver_role="submitter",
            comments=f"Invoice uploaded and processed. Approval required: {requires_approval}",
            previous_status="new",
            new_status="uploaded"
        )
        db.add(history)
        db.commit()
        
        logger.info(f"Created invoice record: {invoice.invoice_number} (Approval required: {requires_approval})")
        return invoice
    
    def approve_invoice(
        self,
        db: Session,
        invoice_id: int,
        approver_id: int,
        comments: Optional[str] = None
    ) -> UploadedInvoice:
        """
        Approve an invoice
        
        Args:
            db: Database session
            invoice_id: Invoice ID
            approver_id: User ID of approver
            comments: Optional approval comments
            
        Returns:
            Updated invoice
        """
        invoice = db.query(UploadedInvoice).filter(UploadedInvoice.id == invoice_id).first()
        if not invoice:
            raise ValueError("Invoice not found")
        
        # Get approver details
        approver = db.query(User).filter(User.id == approver_id).first()
        if not approver:
            raise ValueError("Approver not found")
        
        # Update invoice
        previous_status = invoice.approval_status
        invoice.approval_status = "approved"
        invoice.approved_by = approver_id
        invoice.approval_date = datetime.now()
        invoice.status = "approved"
        
        # Create approval history
        history = InvoiceApprovalHistory(
            invoice_id=invoice_id,
            action="approved",
            action_by=approver_id,
            approver_role="manager",  # This should be determined based on user role
            comments=comments or "Invoice approved",
            previous_status=previous_status,
            new_status="approved"
        )
        
        db.add(history)
        db.commit()
        db.refresh(invoice)
        
        logger.info(f"Invoice {invoice.invoice_number} approved by user {approver_id}")
        return invoice
    
    def reject_invoice(
        self,
        db: Session,
        invoice_id: int,
        rejector_id: int,
        reason: str
    ) -> UploadedInvoice:
        """
        Reject an invoice
        
        Args:
            db: Database session
            invoice_id: Invoice ID
            rejector_id: User ID of person rejecting
            reason: Rejection reason
            
        Returns:
            Updated invoice
        """
        invoice = db.query(UploadedInvoice).filter(UploadedInvoice.id == invoice_id).first()
        if not invoice:
            raise ValueError("Invoice not found")
        
        # Update invoice
        previous_status = invoice.approval_status
        invoice.approval_status = "rejected"
        invoice.rejection_reason = reason
        invoice.status = "rejected"
        
        # Create approval history
        history = InvoiceApprovalHistory(
            invoice_id=invoice_id,
            action="rejected",
            action_by=rejector_id,
            comments=reason,
            previous_status=previous_status,
            new_status="rejected"
        )
        
        db.add(history)
        db.commit()
        db.refresh(invoice)
        
        logger.info(f"Invoice {invoice.invoice_number} rejected by user {rejector_id}")
        return invoice
