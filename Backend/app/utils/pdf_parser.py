import PyPDF2
import io
from typing import List

def extract_text_from_pdf(pdf_content: bytes) -> str:
    """Extract text content from PDF bytes."""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
        extracted_text = ""
        
        # Extract from first 25 pages (or all if less)
        max_pages = min(25, len(pdf_reader.pages))
        
        for page_num in range(max_pages):
            page = pdf_reader.pages[page_num]
            page_text = page.extract_text()
            if page_text:
                extracted_text += page_text + "\n"
                
        return extracted_text
        
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")

def split_text_into_chunks(text: str, max_words: int = 2000) -> List[str]:
    """Split text into chunks for LLM processing."""
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), max_words):
        chunk = ' '.join(words[i:i + max_words])
        chunks.append(chunk)
    
    return chunks