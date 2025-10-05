from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import Dict, Any, List, Optional
import logging

from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models import (
    InvoiceInput, InvoiceResponse, ErrorResponse,
    UploadedInvoice, InvoiceApprovalSettings,
    InvoiceComment, InvoiceApprovalHistory
)
from app.services.invoice_service import InvoiceService
from app.services.invoice_processing_service import InvoiceProcessingService
from pydantic import BaseModel

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    tags=["invoice"],
    responses={404: {"description": "Not found"}},
)


@router.post("/generate", response_model=InvoiceResponse)
async def generate_invoice(data: InvoiceInput) -> InvoiceResponse:
    """
    Generate an invoice PDF based on the provided data
    
    - **company_name**: Name of the production company
    - **company_address**: Company address
    - **company_gstin**: Company GST identification number
    - **bank_name**: Bank name for payment
    - **bank_ac**: Bank account number
    - **bank_ifsc**: Bank IFSC code
    - **invoice_date**: Date of the invoice
    - **actor_name**: Name of the actor
    - **actor_pan**: Actor's PAN number
    - **actor_address**: Actor's address
    - **acting_fee**: Acting fee amount
    - **tds_percent**: TDS percentage to be deducted
    """
    try:
        logger.info(f"Generating invoice for actor: {data.actor_name}")
        
        # Calculate invoice amounts
        calculation = InvoiceService.calculate_invoice_amounts(data)
        
        # Generate PDF
        filename = InvoiceService.generate_pdf_invoice(data, calculation)
        
        logger.info(f"Invoice generated successfully: {calculation.invoice_id}")
        
        return InvoiceResponse(
            success=True,
            message="Invoice generated successfully",
            invoice_id=calculation.invoice_id,
            filename=filename,
            download_url=f"/api/v1/invoice/download/{filename}"
        )
        
    except Exception as e:
        logger.error(f"Error generating invoice: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate invoice: {str(e)}"
        )


@router.get("/download/{filename}")
async def download_invoice(filename: str):
    """
    Download the generated invoice PDF file
    
    - **filename**: Name of the PDF file to download
    """
    try:
        return FileResponse(
            filename,
            headers={"Content-Disposition": f"attachment; filename={filename}"},
            media_type="application/pdf"
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Invoice file not found"
        )
    except Exception as e:
        logger.error(f"Error downloading file {filename}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to download invoice: {str(e)}"
        )


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint for the invoice service"""
    return {
        "status": "healthy",
        "service": "invoice-api",
        "version": "1.0.0"
    }


# ============= Invoice Upload & Processing Endpoints =============

class UploadInvoiceResponse(BaseModel):
    """Response model for invoice upload"""
    success: bool
    message: str
    invoice_id: int
    invoice_number: str
    extraction_status: str
    approval_required: bool
    approval_status: str
    extracted_data: Optional[Dict[str, Any]] = None


class ApprovalActionRequest(BaseModel):
    """Request model for approval actions"""
    comments: Optional[str] = None
    reason: Optional[str] = None  # For rejection


class InvoiceListResponse(BaseModel):
    """Response model for invoice list"""
    invoices: List[Dict[str, Any]]
    total_count: int
    pending_approval_count: int


@router.post("/upload", response_model=UploadInvoiceResponse)
async def upload_invoice(
    file: UploadFile = File(...),
    project_id: int = Form(...),
    user_id: int = Form(...),
    category: Optional[str] = Form(None),
    department: Optional[str] = Form(None),
    purpose: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload an invoice image/PDF and process it with AI extraction
    
    - **file**: Invoice image (JPG, PNG, PDF)
    - **project_id**: Associated project ID
    - **user_id**: User uploading the invoice
    - **category**: Optional category (catering, equipment, etc.)
    - **department**: Optional department
    - **purpose**: Optional purpose/notes
    - **notes**: Additional notes
    """
    try:
        logger.info(f"Uploading invoice for project {project_id} by user {user_id}")
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
            )
        
        # Read file content
        file_bytes = await file.read()
        file_size = len(file_bytes)
        
        # Validate file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if file_size > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum allowed size of {max_size / (1024*1024)}MB"
            )
        
        # Initialize processing service
        service = InvoiceProcessingService()
        
        # Save file
        file_path, mime_type = service.save_invoice_file(
            file_bytes,
            file.filename,
            project_id
        )
        
        # Extract invoice details using AI
        logger.info("Extracting invoice details using Gemini AI...")
        extracted_data = service.extract_invoice_details(file_path, mime_type)
        
        # Override category if provided
        if category:
            extracted_data['category'] = category
        
        # Create invoice record
        invoice = service.create_invoice_record(
            db=db,
            project_id=project_id,
            user_id=user_id,
            file_path=file_path,
            original_filename=file.filename,
            mime_type=mime_type,
            file_size=file_size,
            extracted_data=extracted_data
        )
        
        # Update additional fields if provided
        if department:
            invoice.department = department
        if purpose:
            invoice.purpose = purpose
        if notes:
            invoice.notes = notes
        
        db.commit()
        db.refresh(invoice)
        
        logger.info(f"Invoice uploaded successfully: {invoice.invoice_number}")
        
        return UploadInvoiceResponse(
            success=True,
            message="Invoice uploaded and processed successfully",
            invoice_id=invoice.id,
            invoice_number=invoice.invoice_number,
            extraction_status=invoice.ai_extraction_status,
            approval_required=invoice.approval_required,
            approval_status=invoice.approval_status,
            extracted_data=extracted_data
        )
        
    except Exception as e:
        logger.error(f"Error uploading invoice: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload and process invoice: {str(e)}"
        )


@router.get("/invoices/{project_id}", response_model=InvoiceListResponse)
async def get_project_invoices(
    project_id: int,
    status: Optional[str] = None,
    approval_status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all invoices for a project with optional filters
    
    - **project_id**: Project ID
    - **status**: Filter by status (uploaded, approved, paid, etc.)
    - **approval_status**: Filter by approval status (pending, approved, rejected)
    """
    try:
        query = db.query(UploadedInvoice).filter(
            UploadedInvoice.project_id == project_id
        )
        
        # Apply filters
        if status:
            query = query.filter(UploadedInvoice.status == status)
        if approval_status:
            query = query.filter(UploadedInvoice.approval_status == approval_status)
        
        invoices = query.order_by(UploadedInvoice.created_at.desc()).all()
        
        # Count pending approvals
        pending_count = db.query(UploadedInvoice).filter(
            UploadedInvoice.project_id == project_id,
            UploadedInvoice.approval_status == "pending"
        ).count()
        
        # Format response
        invoice_list = [
            {
                "id": inv.id,
                "invoice_number": inv.invoice_number,
                "vendor_name": inv.vendor_name,
                "total_amount": inv.total_amount,
                "currency": inv.currency,
                "invoice_date": inv.invoice_date.isoformat() if inv.invoice_date else None,
                "category": inv.category,
                "department": inv.department,
                "approval_required": inv.approval_required,
                "approval_status": inv.approval_status,
                "status": inv.status,
                "submitted_by": inv.submitted_by,
                "created_at": inv.created_at.isoformat(),
                "ai_confidence_score": inv.ai_confidence_score,
                "file_path": inv.file_path
            }
            for inv in invoices
        ]
        
        return InvoiceListResponse(
            invoices=invoice_list,
            total_count=len(invoice_list),
            pending_approval_count=pending_count
        )
        
    except Exception as e:
        logger.error(f"Error fetching invoices: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch invoices: {str(e)}"
        )


@router.get("/invoice/{invoice_id}")
async def get_invoice_details(
    invoice_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific invoice
    
    - **invoice_id**: Invoice ID
    """
    try:
        invoice = db.query(UploadedInvoice).filter(
            UploadedInvoice.id == invoice_id
        ).first()
        
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Get approval history
        approval_history = db.query(InvoiceApprovalHistory).filter(
            InvoiceApprovalHistory.invoice_id == invoice_id
        ).order_by(InvoiceApprovalHistory.action_date.desc()).all()
        
        # Get comments
        comments = db.query(InvoiceComment).filter(
            InvoiceComment.invoice_id == invoice_id
        ).order_by(InvoiceComment.created_at.desc()).all()
        
        return {
            "invoice": {
                "id": invoice.id,
                "invoice_number": invoice.invoice_number,
                "invoice_type": invoice.invoice_type,
                "vendor_name": invoice.vendor_name,
                "vendor_address": invoice.vendor_address,
                "vendor_contact": invoice.vendor_contact,
                "vendor_gstin": invoice.vendor_gstin,
                "invoice_date": invoice.invoice_date.isoformat() if invoice.invoice_date else None,
                "due_date": invoice.due_date.isoformat() if invoice.due_date else None,
                "subtotal": invoice.subtotal,
                "tax_amount": invoice.tax_amount,
                "discount_amount": invoice.discount_amount,
                "total_amount": invoice.total_amount,
                "currency": invoice.currency,
                "line_items": invoice.line_items,
                "category": invoice.category,
                "department": invoice.department,
                "purpose": invoice.purpose,
                "approval_required": invoice.approval_required,
                "approval_status": invoice.approval_status,
                "approval_threshold": invoice.approval_threshold,
                "status": invoice.status,
                "submitted_by": invoice.submitted_by,
                "approved_by": invoice.approved_by,
                "approval_date": invoice.approval_date.isoformat() if invoice.approval_date else None,
                "rejection_reason": invoice.rejection_reason,
                "payment_status": invoice.payment_status,
                "notes": invoice.notes,
                "file_path": invoice.file_path,
                "original_filename": invoice.original_filename,
                "ai_confidence_score": invoice.ai_confidence_score,
                "ai_extraction_status": invoice.ai_extraction_status,
                "created_at": invoice.created_at.isoformat(),
                "updated_at": invoice.updated_at.isoformat()
            },
            "approval_history": [
                {
                    "action": h.action,
                    "action_by": h.action_by,
                    "action_date": h.action_date.isoformat(),
                    "approver_role": h.approver_role,
                    "comments": h.comments,
                    "previous_status": h.previous_status,
                    "new_status": h.new_status
                }
                for h in approval_history
            ],
            "comments": [
                {
                    "id": c.id,
                    "user_id": c.user_id,
                    "content": c.content,
                    "comment_type": c.comment_type,
                    "created_at": c.created_at.isoformat()
                }
                for c in comments
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching invoice details: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch invoice details: {str(e)}"
        )


@router.post("/invoice/{invoice_id}/approve")
async def approve_invoice(
    invoice_id: int,
    approver_id: int,
    request: ApprovalActionRequest,
    db: Session = Depends(get_db)
):
    """
    Approve an invoice
    
    - **invoice_id**: Invoice ID to approve
    - **approver_id**: User ID of the approver
    - **request**: Approval comments (optional)
    """
    try:
        service = InvoiceProcessingService()
        invoice = service.approve_invoice(
            db=db,
            invoice_id=invoice_id,
            approver_id=approver_id,
            comments=request.comments
        )
        
        return {
            "success": True,
            "message": "Invoice approved successfully",
            "invoice_id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "approval_status": invoice.approval_status,
            "approved_by": invoice.approved_by,
            "approval_date": invoice.approval_date.isoformat()
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error approving invoice: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to approve invoice: {str(e)}"
        )


@router.post("/invoice/{invoice_id}/reject")
async def reject_invoice(
    invoice_id: int,
    rejector_id: int,
    request: ApprovalActionRequest,
    db: Session = Depends(get_db)
):
    """
    Reject an invoice
    
    - **invoice_id**: Invoice ID to reject
    - **rejector_id**: User ID of the person rejecting
    - **request**: Rejection reason (required)
    """
    try:
        if not request.reason:
            raise HTTPException(
                status_code=400,
                detail="Rejection reason is required"
            )
        
        service = InvoiceProcessingService()
        invoice = service.reject_invoice(
            db=db,
            invoice_id=invoice_id,
            rejector_id=rejector_id,
            reason=request.reason
        )
        
        return {
            "success": True,
            "message": "Invoice rejected",
            "invoice_id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "approval_status": invoice.approval_status,
            "rejection_reason": invoice.rejection_reason
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error rejecting invoice: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to reject invoice: {str(e)}"
        )


@router.get("/invoice/{invoice_id}/download")
async def download_invoice_image(invoice_id: int, db: Session = Depends(get_db)):
    """
    Download the original invoice image/PDF
    
    - **invoice_id**: Invoice ID
    """
    try:
        invoice = db.query(UploadedInvoice).filter(
            UploadedInvoice.id == invoice_id
        ).first()
        
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        return FileResponse(
            invoice.file_path,
            headers={
                "Content-Disposition": f"attachment; filename={invoice.original_filename}"
            },
            media_type=invoice.mime_type
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading invoice: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to download invoice: {str(e)}"
        )


@router.post("/invoice/{invoice_id}/comment")
async def add_invoice_comment(
    invoice_id: int,
    user_id: int,
    content: str = Form(...),
    comment_type: str = Form("general"),
    is_internal: bool = Form(False),
    db: Session = Depends(get_db)
):
    """
    Add a comment to an invoice
    
    - **invoice_id**: Invoice ID
    - **user_id**: User adding the comment
    - **content**: Comment content
    - **comment_type**: Type of comment (general, query, clarification)
    - **is_internal**: Whether comment is internal only
    """
    try:
        # Verify invoice exists
        invoice = db.query(UploadedInvoice).filter(
            UploadedInvoice.id == invoice_id
        ).first()
        
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Create comment
        comment = InvoiceComment(
            invoice_id=invoice_id,
            user_id=user_id,
            content=content,
            comment_type=comment_type,
            is_internal=is_internal
        )
        
        db.add(comment)
        db.commit()
        db.refresh(comment)
        
        return {
            "success": True,
            "message": "Comment added successfully",
            "comment_id": comment.id,
            "created_at": comment.created_at.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding comment: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add comment: {str(e)}"
        )


@router.post("/settings/{project_id}")
async def update_approval_settings(
    project_id: int,
    auto_approve_threshold: float = Form(...),
    manager_approval_threshold: float = Form(...),
    director_approval_threshold: float = Form(...),
    db: Session = Depends(get_db)
):
    """
    Update approval settings for a project
    
    - **project_id**: Project ID
    - **auto_approve_threshold**: Amount below which invoices are auto-approved
    - **manager_approval_threshold**: Amount requiring manager approval
    - **director_approval_threshold**: Amount requiring director approval
    """
    try:
        # Check if settings exist
        settings = db.query(InvoiceApprovalSettings).filter(
            InvoiceApprovalSettings.project_id == project_id
        ).first()
        
        if settings:
            # Update existing
            settings.auto_approve_threshold = auto_approve_threshold
            settings.manager_approval_threshold = manager_approval_threshold
            settings.director_approval_threshold = director_approval_threshold
        else:
            # Create new
            settings = InvoiceApprovalSettings(
                project_id=project_id,
                auto_approve_threshold=auto_approve_threshold,
                manager_approval_threshold=manager_approval_threshold,
                director_approval_threshold=director_approval_threshold
            )
            db.add(settings)
        
        db.commit()
        db.refresh(settings)
        
        return {
            "success": True,
            "message": "Approval settings updated successfully",
            "settings": {
                "auto_approve_threshold": settings.auto_approve_threshold,
                "manager_approval_threshold": settings.manager_approval_threshold,
                "director_approval_threshold": settings.director_approval_threshold
            }
        }
        
    except Exception as e:
        logger.error(f"Error updating settings: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update settings: {str(e)}"
        )