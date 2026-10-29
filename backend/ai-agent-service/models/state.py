from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class HiringRequest(BaseModel):
    id: Optional[str] = None
    role: str
    department: str
    openings: int = 1
    experience_range: str
    required_skills: List[str]
    preferred_skills: List[str] = []
    location: str
    salary_range: str
    hiring_deadline: str

class JobDescriptionDraft(BaseModel):
    version: int = 1
    title: str = ""
    summary: str = ""
    responsibilities: List[str] = []
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    qualifications: List[str] = []
    compensation_range: str = ""
    interview_stages: List[str] = []
    full_markdown: str = ""

class PublishedChannel(BaseModel):
    channel: str # e.g. "LinkedIn", "Naukri", "Internal Careers Portal"
    external_job_id: str
    posting_url: str
    status: str = "PUBLISHED"
    timestamp: str

class CandidateEvidence(BaseModel):
    id: str
    name: str
    email: str
    resume_summary: str
    extracted_skills: List[str]
    years_experience: float
    match_score: int # 0-100
    match_explanation: str
    missing_qualifications: List[str]
    status: str = "PENDING_REVIEW" # PENDING_REVIEW, SHORTLISTED, REJECTED
    recruiter_notes: Optional[str] = None

class InterviewRound(BaseModel):
    round_number: int
    title: str
    interviewer: str
    scheduled_time: Optional[str] = None
    status: str = "PENDING" # PENDING, SCHEDULED, COMPLETED
    calendar_invite_sent: bool = False
    feedback: Optional[str] = None
    rating: Optional[int] = None # 1-5
    recommendation: Optional[str] = None # HIRE, NO_HIRE, STRONG_HIRE

class OfferDetails(BaseModel):
    candidate_id: str
    candidate_name: str
    candidate_email: str
    base_salary: str
    equity: Optional[str] = None
    start_date: str
    status: str = "DRAFT" # DRAFT, APPROVED, SENT, NEGOTIATING, ACCEPTED, DECLINED
    negotiation_notes: Optional[str] = None
    revision_count: int = 0
    approved_by: Optional[str] = None

class OnboardingTask(BaseModel):
    id: str
    title: str
    category: str # "HR", "IT", "DOCUMENT_VERIFICATION"
    status: str = "PENDING" # PENDING, IN_PROGRESS, COMPLETED
    assignee: str
    due_date: str

class AuditLogEntry(BaseModel):
    timestamp: str
    actor: str # "AI_AGENT" or User Email/Role
    action: str
    details: str
    gate_approved: bool = True

class HiringWorkflowState(BaseModel):
    thread_id: str
    current_node: str = "create_hiring_request"
    is_paused_for_approval: bool = False
    pending_gate: Optional[str] = None # "APPROVE_JD", "APPROVE_SHORTLIST", "DECIDE_HIRING", "APPROVE_OFFER"
    
    # Hiring Request Data
    request: Optional[HiringRequest] = None
    
    # JD Generation & Approval
    jd_draft: Optional[JobDescriptionDraft] = None
    jd_feedback_history: List[str] = []
    is_jd_approved: bool = False
    
    # Job Board Publishing
    published_channels: List[PublishedChannel] = []
    
    # Application Monitoring & Sourcing Threshold
    total_applications: int = 0
    eligible_applications: int = 0
    target_eligible_threshold: int = 15 # Configurable target (e.g. 15 or 30)
    sourcing_cycle: int = 1
    max_sourcing_cycles: int = 3
    sourcing_recommendations: List[str] = []
    wait_48h_until: Optional[str] = None
    
    # Screening & Shortlisting
    candidates: List[CandidateEvidence] = []
    shortlist_approved: bool = False
    
    # Interview Management
    interviews: List[InterviewRound] = []
    
    # Hiring Decision Gate
    hiring_decision: Optional[str] = None # "SELECTED", "REJECTED", "PENDING_ROUND"
    hiring_decision_reason: Optional[str] = None
    
    # Offer Generation & Negotiation
    offer: Optional[OfferDetails] = None
    
    # Onboarding
    onboarding_tasks: List[OnboardingTask] = []
    is_onboarding_complete: bool = False
    is_workflow_complete: bool = False
    
    # System Audit Log
    audit_logs: List[AuditLogEntry] = []
