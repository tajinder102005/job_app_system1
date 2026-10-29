import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  SmartToy,
  VerifiedUser,
  Publish,
  People,
  Schedule,
  CheckCircle,
  HourglassEmpty,
  Autorenew,
  AssignmentTurnedIn,
  Send,
  ThumbUp,
  ThumbDown,
  Close,
  Add,
  ArrowForward,
  Info,
} from '@mui/icons-material';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import { agentApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';

export default function AgenticHiringPage() {
  const toast = useToast();
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Request Dialog
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [newRequest, setNewRequest] = useState({
    role: 'Senior Distributed Systems Engineer',
    department: 'Platform Infrastructure',
    openings: 2,
    experience_range: '4-7 years',
    required_skills: 'Java, Spring Boot, Microservices, PostgreSQL, RabbitMQ',
    preferred_skills: 'Kubernetes, Redis, LangGraph, Distributed Tracing',
    location: 'Remote (US / India)',
    salary_range: '$140,000 - $185,000',
    hiring_deadline: '2026-12-15',
  });

  // Action states
  const [feedbackText, setFeedbackText] = useState('');
  const [hiringReason, setHiringReason] = useState('');
  const [counterSalary, setCounterSalary] = useState('');

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const res = await agentApi.getAllWorkflows();
      const list = res.data || [];
      setWorkflows(list);
      if (list.length > 0) {
        if (!selectedWorkflow) {
          setSelectedWorkflow(list[0]);
        } else {
          const updated = list.find((w) => w.thread_id === selectedWorkflow.thread_id);
          setSelectedWorkflow(updated || list[0]);
        }
      }
    } catch (err) {
      console.warn('API fetch error, falling back or waiting for service:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleStartWorkflow = async () => {
    try {
      const payload = {
        ...newRequest,
        required_skills: newRequest.required_skills.split(',').map((s) => s.trim()),
        preferred_skills: newRequest.preferred_skills.split(',').map((s) => s.trim()),
      };
      const res = await agentApi.startWorkflow(payload);
      toast.success('Agentic Hiring Request launched! LangGraph generated initial JD.');
      setOpenNewDialog(false);
      loadWorkflows();
      setSelectedWorkflow(res.data);
    } catch (err) {
      toast.error('Failed to start workflow: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleApproveJD = async (isApproved) => {
    if (!selectedWorkflow) return;
    try {
      const res = await agentApi.approveJd(selectedWorkflow.thread_id, {
        is_approved: isApproved,
        feedback: isApproved ? null : feedbackText,
      });
      toast.success(isApproved ? 'JD Approved! Published to authorized boards.' : 'Revision requested! AI regenerated JD.');
      setFeedbackText('');
      setSelectedWorkflow(res.data);
      loadWorkflows();
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message);
    }
  };

  const handleAdvanceSourcing = async () => {
    if (!selectedWorkflow) return;
    try {
      const res = await agentApi.advanceSourcing(selectedWorkflow.thread_id, { new_applications_count: 15 });
      toast.success('Pipeline refreshed! Checked incoming applications and moved forward.');
      setSelectedWorkflow(res.data);
      loadWorkflows();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleApproveShortlist = async () => {
    if (!selectedWorkflow) return;
    try {
      const res = await agentApi.approveShortlist(selectedWorkflow.thread_id, { approved: true });
      toast.success('Candidate shortlist authorized! Technical interviews scheduled.');
      setSelectedWorkflow(res.data);
      loadWorkflows();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDecideHiring = async (decision) => {
    if (!selectedWorkflow) return;
    try {
      const res = await agentApi.decideHiring(selectedWorkflow.thread_id, {
        decision,
        reason: hiringReason || (decision === 'SELECTED' ? 'Strong technical coding & culture match' : 'Lacks distributed systems depth'),
      });
      toast.success(decision === 'SELECTED' ? 'Candidate selected! Generating formal offer.' : 'Candidate rejected. Notification sent.');
      setHiringReason('');
      setSelectedWorkflow(res.data);
      loadWorkflows();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleApproveOffer = async (approved) => {
    if (!selectedWorkflow) return;
    try {
      const res = await agentApi.approveOffer(selectedWorkflow.thread_id, {
        approved,
        revised_salary: counterSalary || null,
      });
      toast.success(approved ? 'Offer authorized and sent via DocuSign!' : 'Offer revised.');
      setSelectedWorkflow(res.data);
      loadWorkflows();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCandidateResponse = async (response) => {
    if (!selectedWorkflow) return;
    try {
      const res = await agentApi.candidateResponse(selectedWorkflow.thread_id, {
        response,
        counter_offer: response === 'NEGOTIATION' ? '$180,000 base + 20k bonus' : null,
      });
      toast.info(`Candidate response recorded: ${response}!`);
      setSelectedWorkflow(res.data);
      loadWorkflows();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    if (!selectedWorkflow) return;
    try {
      const newStatus = currentStatus === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
      const res = await agentApi.updateOnboardingTask(selectedWorkflow.thread_id, {
        task_id: taskId,
        status: newStatus,
      });
      setSelectedWorkflow(res.data);
      loadWorkflows();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const stages = [
    { id: 'create_hiring_request', label: '1. Request', gate: false },
    { id: 'generate_jd', label: '2. JD Draft', gate: false },
    { id: 'approve_jd', label: '3. JD Gate 🛡️', gate: true },
    { id: 'publish_jd', label: '4. Publish', gate: false },
    { id: 'monitor_applications', label: '5. Influx', gate: false },
    { id: 'improve_sourcing', label: '6. Sourcing ⏳', gate: false },
    { id: 'screen_candidates', label: '7. Shortlist 🛡️', gate: true },
    { id: 'schedule_interviews', label: '8. Interviews', gate: false },
    { id: 'collect_feedback', label: '9. Feedback', gate: false },
    { id: 'decide_hiring', label: '10. Decision 🛡️', gate: true },
    { id: 'prepare_offer', label: '11. Offer', gate: false },
    { id: 'manage_negotiation', label: '12. Negotiate 🛡️', gate: true },
    { id: 'onboard_candidate', label: '13. Onboard 🚀', gate: false },
  ];

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SmartToy sx={{ fontSize: 32, color: '#38bdf8' }} />
            <Typography variant="h4" fontWeight={800} sx={{ background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Agentic AI Recruitment Hub
            </Typography>
            <Chip label="LangGraph Engine" color="primary" size="small" sx={{ fontWeight: 700, borderRadius: '6px' }} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Autonomous recruitment lifecycle with strict Human-in-the-Loop authorization gates.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenNewDialog(true)}
          sx={{ background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)', fontWeight: 700, px: 3, py: 1.2, borderRadius: '10px' }}
        >
          New Hiring Request
        </Button>
      </Box>

      {/* Active Workflows Selector */}
      {workflows.length > 0 && (
        <Box sx={{ mb: 3, display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
          {workflows.map((wf) => (
            <Chip
              key={wf.thread_id}
              label={`${wf.request?.role} (${wf.current_node})`}
              onClick={() => setSelectedWorkflow(wf)}
              color={selectedWorkflow?.thread_id === wf.thread_id ? 'primary' : 'default'}
              variant={selectedWorkflow?.thread_id === wf.thread_id ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600, py: 2.2, px: 1, borderRadius: '8px', cursor: 'pointer' }}
            />
          ))}
        </Box>
      )}

      {selectedWorkflow ? (
        <Grid container spacing={3}>
          {/* Top: LangGraph Visual Pipeline Flow */}
          <Grid item xs={12}>
            <GlassCard sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                LangGraph Workflow State Machine • Thread ID: {selectedWorkflow.thread_id}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 1, alignItems: 'center' }}>
                {stages.map((stage, idx) => {
                  const isActive = selectedWorkflow.current_node === stage.id;
                  return (
                    <React.Fragment key={stage.id}>
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: isActive ? '#38bdf8' : 'rgba(255,255,255,0.1)',
                          backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.02)',
                          boxShadow: isActive ? '0 0 15px rgba(56, 189, 248, 0.4)' : 'none',
                          minWidth: 'fit-content',
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: isActive ? 800 : 500, color: isActive ? '#38bdf8' : 'text.secondary' }}>
                          {stage.label}
                        </Typography>
                      </Box>
                      {idx < stages.length - 1 && <ArrowForward sx={{ fontSize: 14, color: 'text.secondary', opacity: 0.5 }} />}
                    </React.Fragment>
                  );
                })}
              </Box>
            </GlassCard>
          </Grid>

          {/* Left: Active Human Approval Gate / Current Action */}
          <Grid item xs={12} md={7}>
            {/* Gate 1: JD Approval */}
            {selectedWorkflow.pending_gate === 'APPROVE_JD' && (
              <GlassCard sx={{ p: 3, border: '1px solid rgba(56, 189, 248, 0.4)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <VerifiedUser sx={{ color: '#38bdf8' }} />
                  <Typography variant="h6" fontWeight={700}>
                    Human Approval Gate: Review Job Description (v{selectedWorkflow.jd_draft?.version})
                  </Typography>
                </Box>
                <Alert severity="info" sx={{ mb: 2, bgcolor: 'rgba(56, 189, 248, 0.08)' }}>
                  AI generated a complete replacement draft. Review responsibilities, criteria, and compensation before publishing to LinkedIn/Naukri.
                </Alert>

                <Paper sx={{ p: 2, maxHeight: 320, overflowY: 'auto', bgcolor: 'rgba(0,0,0,0.3)', mb: 3 }}>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {selectedWorkflow.jd_draft?.full_markdown}
                  </Typography>
                </Paper>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Need changes? e.g. 'Make Kafka mandatory and lower experience to 3 years'..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => handleApproveJD(true)}
                    sx={{ fontWeight: 700, flex: 1 }}
                  >
                    Approve & Distribute to Job Boards
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<Autorenew />}
                    onClick={() => handleApproveJD(false)}
                    disabled={!feedbackText.trim()}
                    sx={{ fontWeight: 700 }}
                  >
                    Request AI Revision
                  </Button>
                </Box>
              </GlassCard>
            )}

            {/* Sourcing / 48h Wait Node */}
            {(selectedWorkflow.current_node === 'monitor_applications' || selectedWorkflow.current_node === 'improve_sourcing' || selectedWorkflow.current_node === 'wait_48_hours') && (
              <GlassCard sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <HourglassEmpty sx={{ color: '#f59e0b' }} />
                  <Typography variant="h6" fontWeight={700}>
                    Pipeline Influx & Sourcing Monitor (Cycle {selectedWorkflow.sourcing_cycle})
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Target: {selectedWorkflow.target_eligible_threshold} eligible applicants before automatic screening begins.
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" fontWeight={700}>
                      Eligible Candidates: {selectedWorkflow.eligible_applications} / {selectedWorkflow.target_eligible_threshold}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Submissions: {selectedWorkflow.total_applications}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, (selectedWorkflow.eligible_applications / selectedWorkflow.target_eligible_threshold) * 100)}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>

                {selectedWorkflow.sourcing_recommendations?.length > 0 && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}>
                    <Typography variant="caption" fontWeight={700} color="#38bdf8" sx={{ textTransform: 'uppercase' }}>
                      AI Sourcing Optimization Recommendations:
                    </Typography>
                    {selectedWorkflow.sourcing_recommendations.map((rec, i) => (
                      <Typography key={i} variant="body2" sx={{ mt: 0.5, fontSize: 13 }}>
                        • {rec}
                      </Typography>
                    ))}
                  </Box>
                )}

                <Button variant="contained" startIcon={<Autorenew />} onClick={handleAdvanceSourcing} sx={{ fontWeight: 700 }}>
                  Advance 48h Wait / Ingest Next Batch
                </Button>
              </GlassCard>
            )}

            {/* Gate 3: Candidate Shortlist Approval */}
            {selectedWorkflow.pending_gate === 'APPROVE_SHORTLIST' && (
              <GlassCard sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <People sx={{ color: '#10b981' }} />
                  <Typography variant="h6" fontWeight={700}>
                    Human Approval Gate: Recruiter Candidate Shortlist
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  AI extracted structured qualifications from uploaded resumes. Review evidence before authorizing interview rounds.
                </Typography>

                <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0,0,0,0.2)', mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Candidate</TableCell>
                        <TableCell>Experience</TableCell>
                        <TableCell>Match Score</TableCell>
                        <TableCell>Evidence / Missing</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedWorkflow.candidates?.map((cand) => (
                        <TableRow key={cand.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={700}>
                              {cand.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {cand.email}
                            </Typography>
                          </TableCell>
                          <TableCell>{cand.years_experience} yrs</TableCell>
                          <TableCell>
                            <Chip
                              label={`${cand.match_score}%`}
                              size="small"
                              color={cand.match_score >= 85 ? 'success' : cand.match_score >= 70 ? 'warning' : 'default'}
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 220 }}>
                            <Typography variant="caption" sx={{ display: 'block' }}>
                              {cand.match_explanation}
                            </Typography>
                            {cand.missing_qualifications?.length > 0 && (
                              <Typography variant="caption" color="error.main">
                                Missing: {cand.missing_qualifications.join(', ')}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip label={cand.status} size="small" variant="outlined" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={handleApproveShortlist} sx={{ fontWeight: 700 }}>
                  Authorize Shortlist & Schedule Interviews
                </Button>
              </GlassCard>
            )}

            {/* Gate 4: Hiring Decision Gate */}
            {selectedWorkflow.pending_gate === 'DECIDE_HIRING' && (
              <GlassCard sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <VerifiedUser sx={{ color: '#6366f1' }} />
                  <Typography variant="h6" fontWeight={700}>
                    Human Approval Gate: Final Hiring Decision
                  </Typography>
                </Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Interview rounds completed. AI summarized feedback panel below. An explicit manager decision is mandatory.
                </Alert>

                <Box sx={{ mb: 3 }}>
                  {selectedWorkflow.interviews?.map((round) => (
                    <Box key={round.round_number} sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Round {round.round_number}: {round.title}
                        </Typography>
                        <Chip label={round.recommendation} size="small" color="success" />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Interviewer: {round.interviewer} • Rating: {round.rating}/5
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        "{round.feedback}"
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Record formal hiring decision justification..."
                  value={hiringReason}
                  onChange={(e) => setHiringReason(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ThumbUp />}
                    onClick={() => handleDecideHiring('SELECTED')}
                    sx={{ fontWeight: 700, flex: 1 }}
                  >
                    Authorize Selection & Prepare Offer
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<ThumbDown />}
                    onClick={() => handleDecideHiring('REJECTED')}
                    sx={{ fontWeight: 700 }}
                  >
                    Reject Candidate
                  </Button>
                </Box>
              </GlassCard>
            )}

            {/* Gate 5: Offer & Negotiation */}
            {(selectedWorkflow.pending_gate === 'APPROVE_OFFER' || selectedWorkflow.offer) && selectedWorkflow.current_node !== 'onboard_candidate' && (
              <GlassCard sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <AssignmentTurnedIn sx={{ color: '#ec4899' }} />
                  <Typography variant="h6" fontWeight={700}>
                    Offer Drafting & Negotiation Management
                  </Typography>
                </Box>

                {selectedWorkflow.offer && (
                  <Box sx={{ p: 2.5, bgcolor: 'rgba(0,0,0,0.25)', borderRadius: 2, mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Candidate: {selectedWorkflow.offer.candidate_name} ({selectedWorkflow.offer.candidate_email})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Base Salary: <strong>{selectedWorkflow.offer.base_salary}</strong> • Equity: <strong>{selectedWorkflow.offer.equity}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start Date: {selectedWorkflow.offer.start_date} • Status: <Chip label={selectedWorkflow.offer.status} size="small" />
                    </Typography>
                    {selectedWorkflow.offer.negotiation_notes && (
                      <Alert severity="warning" sx={{ mt: 1.5 }}>
                        Negotiation Request: {selectedWorkflow.offer.negotiation_notes}
                      </Alert>
                    )}
                  </Box>
                )}

                {selectedWorkflow.offer?.status === 'DRAFT' && (
                  <Button variant="contained" color="success" onClick={() => handleApproveOffer(true)} sx={{ fontWeight: 700 }}>
                    Authorize & Dispatch Offer via DocuSign
                  </Button>
                )}

                {selectedWorkflow.offer?.status === 'SENT' && (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="contained" color="success" onClick={() => handleCandidateResponse('ACCEPTED')} sx={{ fontWeight: 700 }}>
                      Record: Candidate Accepted
                    </Button>
                    <Button variant="outlined" color="warning" onClick={() => handleCandidateResponse('NEGOTIATION')} sx={{ fontWeight: 700 }}>
                      Record: Candidate Counter-Offered
                    </Button>
                  </Box>
                )}

                {selectedWorkflow.offer?.status === 'NEGOTIATING' && (
                  <Box>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Revised base salary, e.g. $175,000..."
                      value={counterSalary}
                      onChange={(e) => setCounterSalary(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Button variant="contained" color="primary" onClick={() => handleApproveOffer(true)} sx={{ fontWeight: 700 }}>
                      Approve Revised Terms & Resend
                    </Button>
                  </Box>
                )}
              </GlassCard>
            )}

            {/* Stage 13: Onboarding Checklist */}
            {selectedWorkflow.current_node === 'onboard_candidate' && (
              <GlassCard sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <CheckCircle sx={{ color: '#10b981' }} />
                  <Typography variant="h6" fontWeight={700}>
                    Onboarding Lifecycle Tracker
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Automated tasks initiated for IT provisioning, HR verification, and team setup.
                </Typography>

                <Box sx={{ mb: 2 }}>
                  {selectedWorkflow.onboarding_tasks?.map((task) => (
                    <Box
                      key={task.id}
                      onClick={() => handleToggleTask(task.id, task.status)}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        borderRadius: 2,
                        bgcolor: task.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)',
                        border: '1px solid',
                        borderColor: task.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={700}>
                          {task.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Assignee: {task.assignee} • Due: {task.due_date}
                        </Typography>
                      </Box>
                      <Chip
                        label={task.status}
                        size="small"
                        color={task.status === 'COMPLETED' ? 'success' : 'default'}
                      />
                    </Box>
                  ))}
                </Box>

                {selectedWorkflow.is_onboarding_complete && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    🎉 Onboarding complete! The entire hiring lifecycle is finished.
                  </Alert>
                )}
              </GlassCard>
            )}
          </Grid>

          {/* Right: Job Boards & Audit Logs */}
          <Grid item xs={12} md={5}>
            {/* Published Job Boards */}
            {selectedWorkflow.published_channels?.length > 0 && (
              <GlassCard sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', color: '#38bdf8', mb: 1.5 }}>
                  Active Job Board Distribution
                </Typography>
                {selectedWorkflow.published_channels.map((ch, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {ch.channel}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {ch.external_job_id}
                      </Typography>
                    </Box>
                    <Chip label={ch.status} size="small" color="success" />
                  </Box>
                ))}
              </GlassCard>
            )}

            {/* Audit Logs */}
            <GlassCard sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', color: 'text.secondary', mb: 2 }}>
                Audit Log & Compliance Trail
              </Typography>
              <Box sx={{ maxHeight: 420, overflowY: 'auto' }}>
                {selectedWorkflow.audit_logs?.map((log, i) => (
                  <Box key={i} sx={{ mb: 2, pb: 1.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip label={log.actor} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                      <Typography variant="caption" color="text.secondary">
                        {log.timestamp}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>
                      {log.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
                      {log.details}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </GlassCard>
          </Grid>
        </Grid>
      ) : (
        <GlassCard sx={{ p: 6, textAlign: 'center' }}>
          <SmartToy sx={{ fontSize: 48, color: '#38bdf8', mb: 2 }} />
          <Typography variant="h6" fontWeight={700}>
            No Active Hiring Request
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Submit a new hiring request to initialize the autonomous LangGraph recruitment pipeline.
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenNewDialog(true)}>
            Start First Hiring Request
          </Button>
        </GlassCard>
      )}

      {/* New Hiring Request Dialog */}
      <Dialog open={openNewDialog} onClose={() => setOpenNewDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Submit New Role Hiring Request</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={8}>
              <TextField fullWidth size="small" label="Role Title" value={newRequest.role} onChange={(e) => setNewRequest({ ...newRequest, role: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" type="number" label="Openings" value={newRequest.openings} onChange={(e) => setNewRequest({ ...newRequest, openings: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Department" value={newRequest.department} onChange={(e) => setNewRequest({ ...newRequest, department: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Experience Range" value={newRequest.experience_range} onChange={(e) => setNewRequest({ ...newRequest, experience_range: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Required Skills (comma-separated)" value={newRequest.required_skills} onChange={(e) => setNewRequest({ ...newRequest, required_skills: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Preferred Skills" value={newRequest.preferred_skills} onChange={(e) => setNewRequest({ ...newRequest, preferred_skills: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Location" value={newRequest.location} onChange={(e) => setNewRequest({ ...newRequest, location: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Salary Range" value={newRequest.salary_range} onChange={(e) => setNewRequest({ ...newRequest, salary_range: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenNewDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleStartWorkflow} sx={{ fontWeight: 700 }}>
            Launch Agentic Workflow
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
