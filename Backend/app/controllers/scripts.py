from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.services.llm_service import llm_service
from app.services.database_service import ScriptAnalysisService, SceneService
from app.utils.pdf_parser import extract_text_from_pdf, split_text_into_chunks
import json

router = APIRouter(prefix="/scripts", tags=["scripts"])

@router.post("/analyze")
async def analyze_script(
    file: UploadFile = File(...),
    project_id: int = None,
    db: Session = Depends(get_db)
):
    """Analyze a script file and extract scene information."""
    
    # Check supported file types
    supported_extensions = ['.pdf', '.txt', '.doc', '.docx']
    file_extension = None
    for ext in supported_extensions:
        if file.filename.lower().endswith(ext):
            file_extension = ext
            break
    
    if not file_extension:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not supported. Please upload one of: {', '.join(supported_extensions)}"
        )
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Extract text based on file type
        if file_extension == '.pdf':
            extracted_text = extract_text_from_pdf(file_content)
        elif file_extension == '.txt':
            extracted_text = file_content.decode('utf-8')
        elif file_extension in ['.doc', '.docx']:
            # For now, treat as text. In production, you'd use python-docx or similar
            try:
                extracted_text = file_content.decode('utf-8')
            except UnicodeDecodeError:
                raise HTTPException(status_code=400, detail="Could not read Word document. Please convert to PDF or TXT.")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="No text content found in the file")
        
        # Split into chunks for processing
        text_chunks = split_text_into_chunks(extracted_text, max_words=2000)
        
        all_scenes = []
        chunk_responses = []
        
        # Process each chunk with LLM
        for i, chunk in enumerate(text_chunks):
            print(f"Processing chunk {i+1}/{len(text_chunks)}")
            
            parsed_response = llm_service.parse_script_to_scenes(chunk)
            
            chunk_responses.append({
                "chunk_number": i + 1,
                "response": parsed_response
            })
            
            # Extract scenes if valid
            if "scenes" in parsed_response and isinstance(parsed_response["scenes"], list):
                all_scenes.extend(parsed_response["scenes"])
        
        # Save analysis to database
        analysis_service = ScriptAnalysisService(db)
        analysis = analysis_service.save_analysis(
            filename=file.filename,
            scenes_data=all_scenes,
            processing_info={
                "total_chunks_processed": len(text_chunks),
                "total_words_in_script": len(extracted_text.split()),
                "chunk_responses": chunk_responses
            },
            project_id=project_id
        )
        
        # If project_id provided, create scenes in that project
        if project_id:
            scene_service = SceneService(db)
            scenes = scene_service.create_scenes_from_analysis(project_id, all_scenes)
        
        return {
            "analysis_id": analysis.id,
            "filename": file.filename,
            "total_scenes": len(all_scenes),
            "scenes": all_scenes,
            "summary": analysis.summary,
            "project_id": project_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing script: {str(e)}")

@router.get("/analyses")
async def get_all_analyses(db: Session = Depends(get_db)):
    """Get all script analyses."""
    service = ScriptAnalysisService(db)
    analyses = service.get_all_analyses()
    return {"analyses": analyses}

@router.get("/analyses/{analysis_id}")
async def get_analysis(analysis_id: int, db: Session = Depends(get_db)):
    """Get script analysis by ID."""
    service = ScriptAnalysisService(db)
    analysis = service.get_analysis(analysis_id)
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return {
        "id": analysis.id,
        "filename": analysis.filename,
        "total_scenes": analysis.total_scenes,
        "scenes": analysis.scenes_data,
        "processing_info": analysis.processing_info,
        "summary": analysis.summary,
        "project_id": analysis.project_id,
        "created_at": analysis.created_at.isoformat()
    }

@router.get("/projects/{project_id}/analyses")
async def get_project_analyses(project_id: int, db: Session = Depends(get_db)):
    """Get all script analyses for a specific project."""
    service = ScriptAnalysisService(db)
    analyses = service.get_analyses_by_project(project_id)
    
    return {
        "project_id": project_id,
        "analyses": [
            {
                "id": analysis.id,
                "filename": analysis.filename,
                "total_scenes": analysis.total_scenes,
                "summary": analysis.summary,
                "created_at": analysis.created_at.isoformat()
            }
            for analysis in analyses
        ]
    }

@router.post("/projects/{project_id}/scenes/from-analysis/{analysis_id}")
async def create_scenes_from_analysis(
    project_id: int, 
    analysis_id: int, 
    db: Session = Depends(get_db)
):
    """Create scenes in a project from an existing script analysis."""
    analysis_service = ScriptAnalysisService(db)
    analysis = analysis_service.get_analysis(analysis_id)
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    scene_service = SceneService(db)
    scenes = scene_service.create_scenes_from_analysis(project_id, analysis.scenes_data)
    
    return {
        "project_id": project_id,
        "analysis_id": analysis_id,
        "scenes_created": len(scenes),
        "scenes": [
            {
                "id": scene.id,
                "scene_number": scene.scene_number,
                "scene_heading": scene.scene_heading,
                "location_name": scene.location_name
            }
            for scene in scenes
        ]
    }