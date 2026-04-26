from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Preformatted
import io
import datetime

app = FastAPI(title="AcademiGen PDF Service")

class ExportRequest(BaseModel):
    title: str
    subject: Optional[str] = "Computer Science"
    language: Optional[str] = "Python"
    aim: str
    algorithm: str
    code: str
    output: str
    result: str
    author: Optional[str] = "Student"

@app.get("/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.datetime.now().isoformat()}

@app.post("/export/pdf")
async def export_pdf(req: ExportRequest):
    try:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        styles = getSampleStyleSheet()
        
        # Styles
        title_style = styles['Heading1']
        heading_style = styles['Heading2']
        normal_style = styles['Normal']
        code_style = styles['Code']
        
        elements = []
        
        # Header
        elements.append(Paragraph(f"<b>{req.title}</b>", title_style))
        elements.append(Paragraph(f"Subject: {req.subject} | Language: {req.language} | Author: {req.author}", normal_style))
        elements.append(Spacer(1, 20))
        
        # Aim
        elements.append(Paragraph("<b>Aim:</b>", heading_style))
        elements.append(Paragraph(req.aim, normal_style))
        elements.append(Spacer(1, 10))
        
        # Algorithm
        elements.append(Paragraph("<b>Algorithm:</b>", heading_style))
        # Handle algorithm newlines
        algo_lines = req.algorithm.split('\n')
        for line in algo_lines:
            if line.strip():
                elements.append(Paragraph(line, normal_style))
        elements.append(Spacer(1, 10))
        
        # Code
        elements.append(Paragraph("<b>Program:</b>", heading_style))
        elements.append(Preformatted(req.code, code_style))
        elements.append(Spacer(1, 10))
        
        # Output
        elements.append(Paragraph("<b>Output:</b>", heading_style))
        elements.append(Preformatted(req.output, code_style))
        elements.append(Spacer(1, 10))
        
        # Result
        elements.append(Paragraph("<b>Result:</b>", heading_style))
        elements.append(Paragraph(req.result, normal_style))
        
        doc.build(elements)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        return {"pdf_bytes": pdf_bytes.hex()}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
