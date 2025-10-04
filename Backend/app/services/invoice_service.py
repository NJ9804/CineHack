try:
    from fpdf import FPDF
    FPDF_AVAILABLE = True
except ImportError:
    FPDF_AVAILABLE = False
    FPDF = None

import uuid
import os
from typing import Tuple, Optional
import logging

from app.models import InvoiceInput, InvoiceCalculation

logger = logging.getLogger(__name__)


class InvoiceService:
    """Service class for handling invoice business logic"""
    
    @staticmethod
    def calculate_invoice_amounts(data: InvoiceInput) -> InvoiceCalculation:
        """Calculate TDS and net amount for the invoice"""
        tds_amount = round(data.acting_fee * data.tds_percent / 100, 2)
        net_amount = round(data.acting_fee - tds_amount, 2)
        invoice_id = f"FILMINV-{str(uuid.uuid4())[:8]}"
        
        return InvoiceCalculation(
            acting_fee=data.acting_fee,
            tds_percent=data.tds_percent,
            tds_amount=tds_amount,
            net_amount=net_amount,
            invoice_id=invoice_id
        )
    
    @staticmethod
    def generate_pdf_invoice(data: InvoiceInput, calculation: InvoiceCalculation) -> str:
        """Generate PDF invoice and return filename"""
        filename = f"invoice_{calculation.invoice_id}.pdf"
        
        if not FPDF_AVAILABLE:
            # Fallback: Create a text file instead of PDF
            logger.warning("fpdf2 not available, creating text file instead of PDF")
            filename = f"invoice_{calculation.invoice_id}.txt"
            
            invoice_content = f"""
INVOICE: {calculation.invoice_id}
Date: {data.invoice_date}

Company: {data.company_name}
Address: {data.company_address}
GSTIN: {data.company_gstin}

Bank Details:
{data.bank_name}
Account: {data.bank_ac}
IFSC: {data.bank_ifsc}

Actor: {data.actor_name}
PAN: {data.actor_pan}
Address: {data.actor_address}

Acting Fee: Rs. {calculation.acting_fee:,.2f}
TDS ({calculation.tds_percent}%): Rs. {calculation.tds_amount:,.2f}
Net Amount: Rs. {calculation.net_amount:,.2f}
"""
            
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(invoice_content)
            
            logger.info(f"Invoice text file generated: {filename}")
            return filename
        
        # Original PDF generation code (when fpdf2 is available)
        try:
            pdf = FPDF('P', 'mm', 'A4')
            pdf.add_page()

            # Company Header
            pdf.set_font("Arial", "B", 16)
            pdf.cell(0, 10, data.company_name, ln=1, align='C')
            pdf.set_font("Arial", "", 10)
            pdf.cell(0, 8, f"{data.company_address} | GSTIN: {data.company_gstin}", ln=1, align='C')
            pdf.cell(0, 8, "", ln=1)  # blank line

            # Invoice Info
            pdf.set_font("Arial", "B", 12)
            pdf.cell(90, 8, f"Invoice No: {calculation.invoice_id}", ln=0)
            pdf.cell(0, 8, f"Date: {data.invoice_date}", ln=1)
            pdf.set_font("Arial", "", 12)
            pdf.cell(0, 8, "Billing To:", ln=1)
            pdf.cell(0, 7, data.actor_name, ln=1)
            pdf.cell(0, 7, f"PAN: {data.actor_pan}", ln=1)
            pdf.cell(0, 7, f"Address: {data.actor_address}", ln=1)
            pdf.cell(0, 8, "", ln=1)  # blank line

            # Table header
            pdf.set_font("Arial", "B", 12)
            pdf.cell(10, 8, "Sl", border=1)
            pdf.cell(120, 8, "Description", border=1)
            pdf.cell(35, 8, "Amount (Rs.)", border=1, ln=1)

            # Table rows
            pdf.set_font("Arial", "", 12)
            pdf.cell(10, 8, "1", border=1)
            pdf.cell(120, 8, "Acting Fee for Feature Film", border=1)
            pdf.cell(35, 8, f"{calculation.acting_fee:.2f}", border=1, ln=1)

            pdf.cell(130, 8, f"(-) TDS @ {calculation.tds_percent:.2f}%", border=1)
            pdf.cell(35, 8, f"{calculation.tds_amount:.2f}", border=1, ln=1)

            pdf.cell(130, 8, "Net Amount Payable", border=1)
            pdf.cell(35, 8, f"{calculation.net_amount:.2f}", border=1, ln=1)

            # Payment info and terms
            pdf.ln(12)
            pdf.set_font("Arial", "", 11)
            pdf.cell(0, 7, "Payment Terms: Net 15 days", ln=1)
            pdf.cell(0, 7, f"Bank Details: {data.bank_name}, A/c No: {data.bank_ac}, IFSC: {data.bank_ifsc}", ln=1)

            pdf.ln(15)
            pdf.set_font("Arial", "", 12)
            pdf.cell(0, 10, f"For {data.company_name}", ln=1)
            pdf.cell(0, 5, "(Authorized Signatory)", ln=1)

            pdf.output(filename)
            logger.info(f"Invoice PDF generated successfully: {filename}")
            return filename
            
        except Exception as e:
            # Fallback to text file if PDF generation fails
            logger.error(f"PDF generation failed: {str(e)}, falling back to text file")
            filename = f"invoice_{calculation.invoice_id}.txt"
            
            invoice_content = f"""
INVOICE: {calculation.invoice_id}
Date: {data.invoice_date}

Company: {data.company_name}
Address: {data.company_address}
GSTIN: {data.company_gstin}

Bank Details:
{data.bank_name}
Account: {data.bank_ac}
IFSC: {data.bank_ifsc}

Actor: {data.actor_name}
PAN: {data.actor_pan}
Address: {data.actor_address}

Acting Fee: Rs. {calculation.acting_fee:,.2f}
TDS ({calculation.tds_percent}%): Rs. {calculation.tds_amount:,.2f}
Net Amount: Rs. {calculation.net_amount:,.2f}
"""
            
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(invoice_content)
            
            logger.info(f"Invoice text file generated as fallback: {filename}")
            return filename
    
    @staticmethod
    def cleanup_file(filename: str) -> None:
        """Clean up generated files if needed"""
        try:
            if os.path.exists(filename):
                os.remove(filename)
        except Exception as e:
            logger.error(f"Error cleaning up file {filename}: {e}")
    
    @staticmethod
    def get_invoice_file_path(filename: str) -> Optional[str]:
        """
        Get the full path of an invoice file
        """
        if os.path.exists(filename):
            return filename
        return None