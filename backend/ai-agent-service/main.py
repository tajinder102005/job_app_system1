import os
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from models.state import HiringRequest, HiringWorkflowState
from graph.engine import engine

app = FastAPI(
    title="JobFlow Agentic AI Recruitment Automation Platform",
    description="LangGraph-powered Autonomous Recruitment Platform with Human-in-the-Loop Approval Gates",
    version="2.0.0"
)

# Enable CORS for frontend and API Gateway
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class JDApprovalPayload(BaseModel):
    is_approved: bool
    feedback: Optional[str] = None

class ShortlistApprovalPayload(BaseModel):
    approved: bool

class HiringDecisionPayload(BaseModel):
    decision: str # "SELECTED" or "REJECTED"
    reason: str

class OfferApprovalPayload(BaseModel):
    approved: bool
    revised_salary: Optional[str] = None

class CandidateResponsePayload(BaseModel):
    response: str # "ACCEPTED", "NEGOTIATION", "DECLINED"
    counter_offer: Optional[str] = None

class OnboardingTaskPayload(BaseModel):
    task_id: str
    status: str # "PENDING", "IN_PROGRESS", "COMPLETED"

class AdvanceSourcingPayload(BaseModel):
    new_applications_count: Optional[int] = None

@app.get("/health")
def health():
    return {"status": "UP", "service": "ai-agent-service", "engine": "LangGraph"}

@app.post("/agent/workflows", response_model=HiringWorkflowState)
def create_hiring_workflow(request: HiringRequest):
    return engine.start_hiring_request(request)

@app.get("/agent/workflows", response_model=List[HiringWorkflowState])
def list_hiring_workflows():
    return engine.list_workflows()

@app.get("/agent/workflows/{thread_id}", response_model=HiringWorkflowState)
def get_workflow(thread_id: str):
    state = engine.get_workflow(thread_id)
    if not state:
        raise HTTPException(status_code=404, detail=f"Workflow {thread_id} not found.")
    return state

@app.post("/agent/workflows/{thread_id}/approve-jd", response_model=HiringWorkflowState)
def approve_jd(thread_id: str, payload: JDApprovalPayload):
    try:
        return engine.handle_jd_approval(thread_id, payload.is_approved, payload.feedback)
    except KeyError:
        raise HTTPException(status_code=404, detail="Workflow not found.")

@app.post("/agent/workflows/{thread_id}/advance-sourcing", response_model=HiringWorkflowState)
def advance_sourcing(thread_id: str, payload: AdvanceSourcingPayload):
    try:
        return engine.handle_advance_sourcing(thread_id, payload.new_applications_count)
    except KeyError:
        raise HTTPException(status_code=404, detail="Workflow not found.")

@app.post("/agent/workflows/{thread_id}/approve-shortlist", response_model=HiringWorkflowState)
def approve_shortlist(thread_id: str, payload: ShortlistApprovalPayload):
    try:
        return engine.handle_shortlist_approval(thread_id, payload.approved)
    except KeyError:
        raise HTTPException(status_code=404, detail="Workflow not found.")

@app.post("/agent/workflows/{thread_id}/decide-hiring", response_model=HiringWorkflowState)
def decide_hiring(thread_id: str, payload: HiringDecisionPayload):
    try:
        return engine.handle_hiring_decision(thread_id, payload.decision, payload.reason)
    except KeyError:
        raise HTTPException(status_code=404, detail="Workflow not found.")

@app.post("/agent/workflows/{thread_id}/approve-offer", response_model=HiringWorkflowState)
def approve_offer(thread_id: str, payload: OfferApprovalPayload):
    try:
        return engine.handle_offer_approval(thread_id, payload.approved, payload.revised_salary)
    except KeyError:
        raise HTTPException(status_code=404, detail="Workflow not found.")

@app.post("/agent/workflows/{thread_id}/candidate-response", response_model=HiringWorkflowState)
def candidate_response(thread_id: str, payload: CandidateResponsePayload):
    try:
        return engine.handle_candidate_response(thread_id, payload.response, payload.counter_offer)
    except KeyError:
        raise HTTPException(status_code=404, detail="Workflow not found.")

@app.post("/agent/workflows/{thread_id}/onboarding-task", response_model=HiringWorkflowState)
def update_onboarding_task(thread_id: str, payload: OnboardingTaskPayload):
    try:
        return engine.handle_onboarding_task_update(thread_id, payload.task_id, payload.status)
    except KeyError:
        raise HTTPException(status_code=404, detail="Workflow not found.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
