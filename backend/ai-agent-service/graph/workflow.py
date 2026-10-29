import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from models.state import (
    HiringWorkflowState,
    HiringRequest,
    JobDescriptionDraft,
    PublishedChannel,
    CandidateEvidence,
    InterviewRound,
    OfferDetails,
    OnboardingTask,
    AuditLogEntry
)

def log_action(state: HiringWorkflowState, actor: str, action: str, details: str, gate_approved: bool = True):
    entry = AuditLogEntry(
        timestamp=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        actor=actor,
        action=action,
        details=details,
        gate_approved=gate_approved
    )
    state.audit_logs.append(entry)

# ── Node 1: Create Hiring Request ───────────────────────────────────────────────
def node_create_hiring_request(state: HiringWorkflowState) -> HiringWorkflowState:
    state.current_node = "create_hiring_request"
    if not state.request:
        raise ValueError("Cannot start hiring workflow without a HiringRequest.")
    
    log_action(
        state,
        actor="HIRING_MANAGER",
        action="REQUEST_SUBMITTED",
        details=f"Hiring Request created for {state.request.role} ({state.request.department}) with {state.request.openings} opening(s)."
    )
    return state

# ── Node 2: Generate Job Description (JD) ───────────────────────────────────────
def node_generate_jd(state: HiringWorkflowState) -> HiringWorkflowState:
    state.current_node = "generate_jd"
    req = state.request
    current_version = (state.jd_draft.version + 1) if state.jd_draft else 1
    
    # If feedback was provided, incorporate it into complete replacement draft
    feedback_notes = ""
    if state.jd_feedback_history:
        feedback_notes = f"\n- Revisions Applied: {state.jd_feedback_history[-1]}"
    
    title = f"{req.role} ({req.department})"
    summary = (
        f"We are seeking an exceptional {req.role} to join our high-impact {req.department} team. "
        f"In this role, you will design, scale, and optimize core platforms in a fast-paced environment."
    )
    responsibilities = [
        f"Architect and deliver resilient, high-throughput microservices using {', '.join(req.required_skills[:3])}.",
        "Collaborate closely with product management and platform architects to refine technical roadmaps.",
        "Mentor engineering peers, perform thorough code reviews, and champion clean architecture practices.",
        "Implement end-to-end observability, distributed tracing, and automated test coverage across services."
    ]
    qualifications = [
        f"Demonstrated experience in {req.experience_range} of production software engineering.",
        f"Strong core proficiency in {', '.join(req.required_skills)}.",
        "Deep familiarity with cloud-native architectures, containerization, and SQL/NoSQL databases.",
        "Bachelor's or Master's degree in Computer Science, Software Engineering, or equivalent practical experience."
    ]
    interview_stages = [
        "1. Technical Recruiter Screen (30 mins)",
        "2. Core Technical & Problem Solving (60 mins)",
        "3. System Architecture & Distributed Systems (60 mins)",
        "4. Culture Alignment & Engineering Leadership (45 mins)"
    ]
    
    full_markdown = f"""# {title}
**Location:** {req.location} | **Compensation:** {req.salary_range} | **Target Deadline:** {req.hiring_deadline}

## About The Role
{summary}

## Key Responsibilities
{chr(10).join(['- ' + r for r in responsibilities])}

## Required Qualifications
{chr(10).join(['- ' + q for q in qualifications])}

## Preferred Skills
{chr(10).join(['- ' + p for p in (req.preferred_skills or ['Experience with Kubernetes & Distributed Event Streaming', 'Modern React/TypeScript frontends'])])}

## Interview Process
{chr(10).join(['- ' + s for s in interview_stages])}
"""

    state.jd_draft = JobDescriptionDraft(
        version=current_version,
        title=title,
        summary=summary,
        responsibilities=responsibilities,
        required_skills=req.required_skills,
        preferred_skills=req.preferred_skills,
        qualifications=qualifications,
        compensation_range=req.salary_range,
        interview_stages=interview_stages,
        full_markdown=full_markdown
    )
    
    # Needs manager sign-off
    state.is_jd_approved = False
    state.is_paused_for_approval = True
    state.pending_gate = "APPROVE_JD"
    
    log_action(
        state,
        actor="AI_AGENT",
        action="JD_GENERATED",
        details=f"Generated Job Description Version {current_version} with full criteria and interview stages.{feedback_notes}"
    )
    return state

# ── Node 3: Approve JD Gate ─────────────────────────────────────────────────────
def node_approve_jd(state: HiringWorkflowState) -> HiringWorkflowState:
    state.current_node = "approve_jd"
    if not state.is_jd_approved:
        state.is_paused_for_approval = True
        state.pending_gate = "APPROVE_JD"
    else:
        state.is_paused_for_approval = False
        state.pending_gate = None
        log_action(
            state,
            actor="HIRING_MANAGER",
            action="JD_APPROVED",
            details=f"Job Description (v{state.jd_draft.version}) approved for external publishing."
        )
    return state

# ── Node 4: Publish JD ──────────────────────────────────────────────────────────
def node_publish_jd(state: HiringWorkflowState) -> HiringWorkflowState:
    state.current_node = "publish_jd"
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    
    # Authorized Mock Integrations with external job boards
    channels = [
        PublishedChannel(
            channel="LinkedIn Recruiter",
            external_job_id=f"LI-{uuid.uuid4().hex[:8].upper()}",
            posting_url=f"https://linkedin.com/jobs/view/{uuid.uuid4().hex[:10]}",
            status="ACTIVE",
            timestamp=timestamp
        ),
        PublishedChannel(
            channel="Naukri Enterprise",
            external_job_id=f"NK-{uuid.uuid4().hex[:8].upper()}",
            posting_url=f"https://naukri.com/job-listings/{uuid.uuid4().hex[:10]}",
            status="ACTIVE",
            timestamp=timestamp
        ),
        PublishedChannel(
            channel="Direct Careers Portal",
            external_job_id=f"DIR-{uuid.uuid4().hex[:8].upper()}",
            posting_url=f"https://careers.jobflow.internal/jobs/{state.request.id or 'active'}",
            status="ACTIVE",
            timestamp=timestamp
        )
    ]
    state.published_channels = channels
    log_action(
        state,
        actor="AI_AGENT",
        action="JD_PUBLISHED",
        details=f"Published JD to {len(channels)} authorized job boards (LinkedIn, Naukri, Careers Portal)."
    )
    return state

# ── Node 5: Monitor Applications ────────────────────────────────────────────────
def node_monitor_applications(state: HiringWorkflowState) -> HiringWorkflowState:
    state.current_node = "monitor_applications"
    
    # In initial cycle, simulate initial application influx; subsequent cycles bring more
    base_apps = 12 * state.sourcing_cycle
    state.total_applications = base_apps
    # Filter for eligible applications meeting required skills
    state.eligible_applications = int(base_apps * 0.75)
    
    log_action(
        state,
        actor="AI_AGENT",
        action="APPLICATIONS_MONITORED",
        details=f"Checked candidate pool: {state.total_applications} total submissions, {state.eligible_applications} eligible candidates against target {state.target_eligible_threshold}."
    )
    return state

# ── Node 6: Evaluate Pipeline ───────────────────────────────────────────────────
def node_evaluate_pipeline(state: HiringWorkflowState) -> str:
    """Conditional Edge decision router."""
    if state.eligible_applications >= state.target_eligible_threshold:
        return "screen_candidates"
    elif state.sourcing_cycle >= state.max_sourcing_cycles:
        # Avoid infinite loops; proceed with available candidates after max cycles
        log_action(
            state,
            actor="AI_AGENT",
            action="PIPELINE_ESCALATED",
            details=f"Max sourcing cycles ({state.max_sourcing_cycles}) reached with {state.eligible_applications} candidates. Proceeding to screening with human escalation."
        )
        return "screen_candidates"
    else:
        return "improve_sourcing"

# ── Node 7: Improve Sourcing Strategy ───────────────────────────────────────────
def node_improve_sourcing(state: HiringWorkflowState) -> HiringWorkflowState:
    state.current_node = "improve_sourcing"
    state.sourcing_cycle += 1
    
    req = state.request
    suggestions = [
        f"Relax optional requirements while keeping mandatory core ({', '.join(req.required_skills[:2])}).",
        f"Broaden geographic filter to 'Hybrid / Remote-friendly' for {req.location}.",
        "Distribute job link to Wellfound (AngelList), GitHub Talent, and alumni networks.",
        "Trigger targeted Employee Referral Campaign offering bonus for fast candidate referral."
    ]
    state.sourcing_recommendations = suggestions
    log_action(
        state,
        actor="AI_AGENT",
        action="SOURCING_ADJUSTED",
        details=f"Identified applicant volume gap. Generated {len(suggestions)} strategic sourcing optimizations for Cycle {state.sourcing_cycle}."
    )
    return state

# ── Node 8: Wait 48 Hours (Durable Pause) ───────────────────────────────────────
def node_wait_48_hours(state: HiringWorkflowState) -> HiringWorkflowState:
    state.current_node = "wait_48_hours"
    # Durable workflow pause timestamp (48h in future)
    wait_time = datetime.utcnow() + timedelta(hours=48)
    state.wait_48h_until = wait_time.strftime("%Y-%m-%d %H:%M:%S UTC")
    
    log_action(
        state,
        actor="AI_AGENT",
        action="DURABLE_WAIT_SCHEDULED",
        details=f"Workflow paused for 48 hours until {state.wait_48h_until}. Checkpointed in persistent database; ready to resume upon timer/webhook."
    )
    return state

# ── Node 9: Screen & Shortlist Candidates ───────────────────────────────────────
def node_screen_candidates(state: HiringWorkflowState) -> HiringWorkflowState:
    state.current_node = "screen_candidates"
    req = state.request
    
    # Generate structured evidence for top candidates
    candidates = [
        CandidateEvidence(
            id="cand-001",
            name="Aarav Sharma",
            email="aarav.sharma@example.com",
            resume_summary="Senior Engineer with 5+ years building scalable Java/Spring Boot microservices, Kafka event-driven architectures, and PostgreSQL schemas.",
            extracted_skills=["Java", "Spring Boot", "Microservices", "PostgreSQL", "Docker", "RabbitMQ", "Kafka"],
            years_experience=5.5,
            match_score=94,
            match_explanation="Exceeds experience requirement, full tech-stack match, demonstrated microservices design patterns in high-traffic enterprise apps.",
            missing_qualifications=[],
            status="SHORTLISTED"
        ),
        CandidateEvidence(
            id="cand-002",
            name="Priya Patel",
            email="priya.patel@example.com",
            resume_summary="Backend Developer with 4 years experience in Java Spring Cloud, REST APIs, Redis caching, and CI/CD pipelines.",
            extracted_skills=["Java", "Spring Boot", "Spring Cloud", "PostgreSQL", "Redis", "Git"],
            years_experience=4.0,
            match_score=88,
            match_explanation="Solid hands-on Spring Cloud & API Gateway expertise; meets all mandatory criteria with high academic record.",
            missing_qualifications=["Limited production Kubernetes experience"],
            status="SHORTLISTED"
        ),
        CandidateEvidence(
            id="cand-003",
            name="Rohan Verma",
            email="rohan.verma@example.com",
            resume_summary="Full Stack Developer focused on Node.js and React with 2 years of Java backend experience.",
            extracted_skills=["React", "JavaScript", "Java", "MySQL", "AWS"],
            years_experience=3.0,
            match_score=62,
            match_explanation="Strong frontend skills, but below required depth in enterprise Spring Boot and multi-threading requirements.",
            missing_qualifications=["Insufficient Spring Boot depth", "No message broker experience"],
            status="PENDING_REVIEW"
        )
    ]
    state.candidates = candidates
    state.is_paused_for_approval = True
    state.pending_gate = "APPROVE_SHORTLIST"
    
    log_action(
        state,
        actor="AI_AGENT",
        action="CANDIDATES_SCREENED",
        details=f"Extracted structured resume evidence for {len(candidates)} candidates. Shortlisted {len([c for c in candidates if c.status == 'SHORTLISTED'])} for recruiter human-in-the-loop review."
    )
    return state

# ── Node 10: Schedule Interviews ────────────────────────────────────────────────
def node_schedule_interviews(state: HiringWorkflowState) -> HiringWorkflowState:
    state.current_node = "schedule_interviews"
    
    now = datetime.utcnow()
    interviews = [
        InterviewRound(
            round_number=1,
            title="Technical Core & System Design",
            interviewer="Lead Architect (Vikram Sen)",
            scheduled_time=(now + timedelta(days=2, hours=10)).strftime("%Y-%m-%d 10:00 UTC"),
            status="SCHEDULED",
            calendar_invite_sent=True
        ),
        InterviewRound(
            round_number=2,
            title="Hiring Manager & Culture Alignment",
            interviewer="Engineering Director (Neha Gupta)",
            scheduled_time=(now + timedelta(days=4, hours=15)).strftime("%Y-%m-%d 15:00 UTC"),
            status="SCHEDULED",
            calendar_invite_sent=True
        )
    ]
    state.interviews = interviews
    log_action(
        state,
        actor="AI_AGENT",
        action="INTERVIEWS_SCHEDULED",
        details="Generated interview calendar invites and dispatched coordination emails to candidates and interview panel."
    )
    return state

# ── Node 11: Collect Feedback & Synthesize ──────────────────────────────────────
def node_collect_feedback(state: HiringWorkflowState) -> HiringWorkflowState:
    state.current_node = "collect_feedback"
    
    # Record verified feedback assessments
    if state.interviews:
        state.interviews[0].status = "COMPLETED"
        state.interviews[0].feedback = (
            "Candidate demonstrated exceptional grasp of distributed systems, Eureka load balancing, "
            "and outbox patterns for transactional consistency. Solved coding challenge cleanly."
        )
        state.interviews[0].rating = 5
        state.interviews[0].recommendation = "STRONG_HIRE"
        
        if len(state.interviews) > 1:
            state.interviews[1].status = "COMPLETED"
            state.interviews[1].feedback = (
                "Excellent communication, strong ownership mindset, articulated past architectural tradeoffs with clarity."
            )
            state.interviews[1].rating = 5
            state.interviews[1].recommendation = "HIRE"
            
    state.is_paused_for_approval = True
    state.pending_gate = "DECIDE_HIRING"
    
    log_action(
        state,
        actor="AI_AGENT",
        action="FEEDBACK_COLLECTED",
        details="Interview feedback recorded from all interviewers. Synthesis prepared for human hiring manager decision gate."
    )
    return state

# ── Node 12: Decide Hiring Gate ─────────────────────────────────────────────────
def node_decide_hiring(state: HiringWorkflowState) -> HiringWorkflowState:
    state.current_node = "decide_hiring"
    # Gate handled via API when manager selects decision
    return state

# ── Node 13: Prepare Offer ──────────────────────────────────────────────────────
def node_prepare_offer(state: HiringWorkflowState) -> HiringWorkflowState:
    state.current_node = "prepare_offer"
    top_cand = state.candidates[0] if state.candidates else None
    cand_name = top_cand.name if top_cand else "Candidate"
    cand_email = top_cand.email if top_cand else "candidate@example.com"
    cand_id = top_cand.id if top_cand else "cand-001"
    
    start_date = (datetime.utcnow() + timedelta(days=21)).strftime("%Y-%m-%d")
    state.offer = OfferDetails(
        candidate_id=cand_id,
        candidate_name=cand_name,
        candidate_email=cand_email,
        base_salary=state.request.salary_range.split("-")[1].strip() if "-" in state.request.salary_range else state.request.salary_range,
        equity="15,000 ESOP Units (4-year vesting, 1-year cliff)",
        start_date=start_date,
        status="DRAFT",
        revision_count=1
    )
    
    state.is_paused_for_approval = True
    state.pending_gate = "APPROVE_OFFER"
    
    log_action(
        state,
        actor="AI_AGENT",
        action="OFFER_DRAFTED",
        details=f"Generated formal offer letter draft for {cand_name}: Base {state.offer.base_salary}, Equity {state.offer.equity}. Awaiting compensation committee approval."
    )
    return state

# ── Node 14: Manage Negotiation ────────────────────────────────────────────────
def node_manage_negotiation(state: HiringWorkflowState) -> HiringWorkflowState:
    state.current_node = "manage_negotiation"
    # Handled via API: updates terms if counter-offered, sets status to ACCEPTED/DECLINED
    return state

# ── Node 15: Onboard Candidate ──────────────────────────────────────────────────
def node_onboard_candidate(state: HiringWorkflowState) -> HiringWorkflowState:
    state.current_node = "onboard_candidate"
    cand = state.candidates[0] if state.candidates else None
    cand_name = cand.name if cand else "Candidate"
    
    start_date = state.offer.start_date if state.offer else "Upcoming"
    
    tasks = [
        OnboardingTask(
            id="task-01",
            title=f"Background Check & Identity Verification ({cand_name})",
            category="DOCUMENT_VERIFICATION",
            status="COMPLETED",
            assignee="People Ops (Ritu Verma)",
            due_date=start_date
        ),
        OnboardingTask(
            id="task-02",
            title="MacBook Pro M3 & Security YubiKey Provisioning",
            category="IT",
            status="IN_PROGRESS",
            assignee="IT Service Desk",
            due_date=start_date
        ),
        OnboardingTask(
            id="task-03",
            title="GitHub Organization & AWS Developer Environment Access",
            category="IT",
            status="IN_PROGRESS",
            assignee="DevOps Team",
            due_date=start_date
        ),
        OnboardingTask(
            id="task-04",
            title="Benefits, Healthcare & Provident Fund Enrollment",
            category="HR",
            status="PENDING",
            assignee="HR Operations",
            due_date=start_date
        ),
        OnboardingTask(
            id="task-05",
            title="Team Buddy Assignment & 30-60-90 Day Plan Handoff",
            category="HR",
            status="PENDING",
            assignee=state.request.department,
            due_date=start_date
        )
    ]
    state.onboarding_tasks = tasks
    state.is_onboarding_complete = False
    
    log_action(
        state,
        actor="AI_AGENT",
        action="ONBOARDING_INITIATED",
        details=f"Created automated 360-degree onboarding plan ({len(tasks)} tasks) across HR, IT, and Document verification."
    )
    return state
