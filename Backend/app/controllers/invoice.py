from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from typing import Dict, Any
import logging

from app.models import InvoiceInput, InvoiceResponse, ErrorResponse
from app.services.invoice_service import InvoiceService

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/invoice",
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