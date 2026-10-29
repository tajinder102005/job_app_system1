import uuid
import json
import os
from typing import Dict, Optional, List
from models.state import (
    HiringWorkflowState,
    HiringRequest,
    JobDescriptionDraft
)
from graph.workflow import (
    node_create_hiring_request,
    node_generate_jd,
    node_approve_jd,
    node_publish_jd,
    node_monitor_applications,
    node_evaluate_pipeline,
    node_improve_sourcing,
    node_wait_48_hours,
    node_screen_candidates,
    node_schedule_interviews,
    node_collect_feedback,
    node_decide_hiring,
    node_prepare_offer,
    node_manage_negotiation,
    node_onboard_candidate,
    log_action
)

class WorkflowEngine:
    """
    Durable in-memory & file-backed state checkpointer for LangGraph hiring workflows.
    Ensures workflows survive process restarts.
    """
    def __init__(self, persistence_file: str = "workflow_store.json"):
        self.persistence_file = persistence_file
        self.workflows: Dict[str, HiringWorkflowState] = {}
        self._load()

    def _save(self):
        try:
            serialized = {tid: state.model_dump() for tid, state in self.workflows.items()}
            with open(self.persistence_file, "w", encoding="utf-8") as f:
                json.dump(serialized, f, indent=2)
        except Exception as e:
            print(f"Error saving workflows: {e}")

    def _load(self):
        if os.path.exists(self.persistence_file):
            try:
                with open(self.persistence_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for tid, state_dict in data.items():
                        self.workflows[tid] = HiringWorkflowState(**state_dict)
            except Exception as e:
                print(f"Error loading workflow store: {e}")

    def get_workflow(self, thread_id: str) -> Optional[HiringWorkflowState]:
        return self.workflows.get(thread_id)

    def list_workflows(self) -> List[HiringWorkflowState]:
        return list(self.workflows.values())

    def start_hiring_request(self, req: HiringRequest) -> HiringWorkflowState:
        thread_id = f"hire-{uuid.uuid4().hex[:8]}"
        req.id = thread_id
        
        state = HiringWorkflowState(
            thread_id=thread_id,
            request=req
        )
        
        # 1. create_hiring_request
        state = node_create_hiring_request(state)
        # 2. generate_jd
        state = node_generate_jd(state)
        # 3. Pause for JD Approval Gate
        state = node_approve_jd(state)
        
        self.workflows[thread_id] = state
        self._save()
        return state

    def handle_jd_approval(self, thread_id: str, is_approved: bool, feedback: Optional[str] = None) -> HiringWorkflowState:
        state = self.get_workflow(thread_id)
        if not state:
            raise KeyError(f"Workflow {thread_id} not found.")
        
        if is_approved:
            state.is_jd_approved = True
            state = node_approve_jd(state)
            
            # Auto-advance to publish_jd and monitor_applications
            state = node_publish_jd(state)
            state = node_monitor_applications(state)
            
            # Check pipeline threshold
            next_action = node_evaluate_pipeline(state)
            if next_action == "screen_candidates":
                state = node_screen_candidates(state)
            else:
                state = node_improve_sourcing(state)
                state = node_wait_48_hours(state)
        else:
            # Rejection with feedback -> Regenerate replacement draft
            if feedback:
                state.jd_feedback_history.append(feedback)
            log_action(
                state,
                actor="HIRING_MANAGER",
                action="JD_REVISION_REQUESTED",
                details=f"Revision requested: {feedback or 'Changes needed.'}"
            )
            state = node_generate_jd(state)
            state = node_approve_jd(state)
            
        self._save()
        return state

    def handle_advance_sourcing(self, thread_id: str, new_applications_count: Optional[int] = None) -> HiringWorkflowState:
        state = self.get_workflow(thread_id)
        if not state:
            raise KeyError(f"Workflow {thread_id} not found.")
        
        if new_applications_count is not None:
            state.total_applications += new_applications_count
            state.eligible_applications = int(state.total_applications * 0.8)
        else:
            # Simulate natural influx after wait
            state.total_applications += 15
            state.eligible_applications += 12

        state.wait_48h_until = None
        log_action(
            state,
            actor="AI_AGENT",
            action="48H_WAIT_COMPLETED",
            details=f"Durable wait period finished. Resumed pipeline with {state.eligible_applications} eligible candidates."
        )

        next_action = node_evaluate_pipeline(state)
        if next_action == "screen_candidates" or state.sourcing_cycle >= state.max_sourcing_cycles:
            state = node_screen_candidates(state)
        else:
            state = node_improve_sourcing(state)
            state = node_wait_48_hours(state)

        self._save()
        return state

    def handle_shortlist_approval(self, thread_id: str, approved: bool) -> HiringWorkflowState:
        state = self.get_workflow(thread_id)
        if not state:
            raise KeyError(f"Workflow {thread_id} not found.")

        state.shortlist_approved = approved
        state.is_paused_for_approval = False
        state.pending_gate = None

        log_action(
            state,
            actor="RECRUITER",
            action="SHORTLIST_APPROVED",
            details="Recruiter reviewed candidate evidence dossier and authorized technical interview rounds."
        )

        # Proceed to scheduling and interview conduction
        state = node_schedule_interviews(state)
        state = node_collect_feedback(state)

        self._save()
        return state

    def handle_hiring_decision(self, thread_id: str, decision: str, reason: str) -> HiringWorkflowState:
        state = self.get_workflow(thread_id)
        if not state:
            raise KeyError(f"Workflow {thread_id} not found.")

        state.hiring_decision = decision # "SELECTED" or "REJECTED"
        state.hiring_decision_reason = reason
        state.is_paused_for_approval = False
        state.pending_gate = None

        if decision == "SELECTED":
            log_action(
                state,
                actor="HIRING_MANAGER",
                action="CANDIDATE_SELECTED",
                details=f"Candidate selected for offer generation. Reason: {reason}"
            )
            state = node_prepare_offer(state)
        else:
            log_action(
                state,
                actor="HIRING_MANAGER",
                action="CANDIDATE_REJECTED",
                details=f"Candidate not selected. Rejection feedback logged: {reason}. Dispatched constructive feedback email."
            )
            state.is_workflow_complete = True
            state.current_node = "rejected"

        self._save()
        return state

    def handle_offer_approval(self, thread_id: str, approved: bool, revised_salary: Optional[str] = None) -> HiringWorkflowState:
        state = self.get_workflow(thread_id)
        if not state or not state.offer:
            raise KeyError(f"Workflow {thread_id} with offer not found.")

        if approved:
            state.offer.status = "SENT"
            state.offer.approved_by = "Compensation Committee / Head of HR"
            state.is_paused_for_approval = False
            state.pending_gate = None
            log_action(
                state,
                actor="HR_DIRECTOR",
                action="OFFER_APPROVED_AND_SENT",
                details=f"Offer of {state.offer.base_salary} authorized and sent via DocuSign to {state.offer.candidate_name}."
            )
        else:
            if revised_salary:
                state.offer.base_salary = revised_salary
                state.offer.revision_count += 1
            log_action(
                state,
                actor="HR_DIRECTOR",
                action="OFFER_TERMS_REVISED",
                details=f"Offer terms adjusted: Base {state.offer.base_salary}."
            )

        self._save()
        return state

    def handle_candidate_response(self, thread_id: str, response: str, counter_offer: Optional[str] = None) -> HiringWorkflowState:
        state = self.get_workflow(thread_id)
        if not state or not state.offer:
            raise KeyError(f"Workflow {thread_id} not found.")

        if response == "ACCEPTED":
            state.offer.status = "ACCEPTED"
            log_action(
                state,
                actor="CANDIDATE",
                action="OFFER_ACCEPTED",
                details=f"{state.offer.candidate_name} signed and accepted the employment offer!"
            )
            state = node_onboard_candidate(state)
        elif response == "NEGOTIATION":
            state.offer.status = "NEGOTIATING"
            state.offer.negotiation_notes = counter_offer or "Candidate requested salary revision."
            state.is_paused_for_approval = True
            state.pending_gate = "APPROVE_OFFER"
            log_action(
                state,
                actor="CANDIDATE",
                action="NEGOTIATION_REQUESTED",
                details=f"Candidate requested negotiation: {state.offer.negotiation_notes}. Escalated to hiring manager."
            )
        else:
            state.offer.status = "DECLINED"
            state.is_workflow_complete = True
            log_action(
                state,
                actor="CANDIDATE",
                action="OFFER_DECLINED",
                details=f"Candidate declined offer. Workflow closed."
            )

        self._save()
        return state

    def handle_onboarding_task_update(self, thread_id: str, task_id: str, status: str) -> HiringWorkflowState:
        state = self.get_workflow(thread_id)
        if not state:
            raise KeyError(f"Workflow {thread_id} not found.")

        for t in state.onboarding_tasks:
            if t.id == task_id:
                t.status = status
                break

        # Check if all completed
        all_done = all(t.status == "COMPLETED" for t in state.onboarding_tasks)
        if all_done:
            state.is_onboarding_complete = True
            state.is_workflow_complete = True
            log_action(
                state,
                actor="HR_SYSTEM",
                action="ONBOARDING_COMPLETED",
                details="All IT, HR, and Document Verification tasks completed. Candidate successfully onboarded! Hiring lifecycle finished."
            )

        self._save()
        return state

# Global singleton engine
engine = WorkflowEngine()
