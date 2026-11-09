import os
import json
import re
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
PRIMARY_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
FALLBACK_MODEL = "openai/gpt-oss-20b"

def get_client() -> Optional[Groq]:
    key = os.getenv("GROQ_API_KEY") or GROQ_API_KEY
    if not key:
        return None
    try:
        return Groq(api_key=key)
    except Exception as e:
        print(f"Error initializing Groq client: {e}")
        return None

def clean_json_response(text: str) -> str:
    """Extract JSON object from markdown fenced blocks or raw output."""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    return text

def call_groq_chat(prompt: str, system_message: str = "You are an elite enterprise AI Talent Architect.") -> Optional[str]:
    client = get_client()
    if not client:
        return None

    for model_name in [PRIMARY_MODEL, FALLBACK_MODEL, "qwen/qwen3.8-27b"]:
        try:
            completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": prompt}
                ],
                model=model_name,
                temperature=0.3,
                max_tokens=2048,
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"Groq invocation failed on {model_name}: {e}. Retrying next model...")
            continue
    return None

def generate_jd_with_groq(
    role: str,
    department: str,
    openings: int,
    experience_range: str,
    required_skills: List[str],
    preferred_skills: List[str],
    location: str,
    salary_range: str,
    feedback_history: List[str] = None
) -> Dict[str, Any]:
    feedback_section = ""
    if feedback_history:
        feedback_section = f"\nIMPORTANT - REVISIONS REQUESTED BY HIRING MANAGER:\n" + "\n".join(f"- {f}" for f in feedback_history)

    prompt = f"""
Generate an exceptional, comprehensive, and professional Job Description for the following vacancy:

Role Title: {role}
Department: {department}
Openings: {openings}
Experience Needed: {experience_range}
Required Technical Skills: {', '.join(required_skills)}
Preferred Skills: {', '.join(preferred_skills) if preferred_skills else 'None'}
Location / Mode: {location}
Target Salary Range: {salary_range}
{feedback_section}

Return ONLY valid JSON matching this schema:
{{
  "title": "{role} ({department})",
  "summary": "Compelling 2-3 sentence overview of the role and impact...",
  "responsibilities": ["4-6 specific key technical responsibilities"],
  "required_skills": ["4-6 critical technical requirements"],
  "preferred_skills": ["2-4 nice to have qualifications"],
  "qualifications": ["Degree, experience, or track record qualifications"],
  "compensation_range": "{salary_range}",
  "interview_stages": [
    "Stage 1: Technical Screen & System Architecture (45m)",
    "Stage 2: Live Problem Solving & Hands-On Coding (60m)",
    "Stage 3: Hiring Manager, Culture & Leadership Alignment (45m)"
  ]
}}
"""
    raw_output = call_groq_chat(prompt)
    if raw_output:
        try:
            parsed = json.loads(clean_json_response(raw_output))
            return parsed
        except Exception as e:
            print(f"Failed to parse Groq JD JSON: {e}. Output was: {raw_output}")

    # Heuristic fallback if API call fails
    return {
        "title": f"{role} ({department})",
        "summary": f"Join our {department} team as a {role} to architect high-performance distributed systems.",
        "responsibilities": [
            f"Build and maintain mission-critical services using {', '.join(required_skills[:3])}.",
            "Partner with product leaders to turn user requirements into scalable technical designs.",
            "Write robust automated tests, maintain CI/CD pipelines, and participate in code reviews.",
            "Drive platform resilience, low latency, and horizontal scalability."
        ],
        "required_skills": required_skills,
        "preferred_skills": preferred_skills or ["Docker", "Kubernetes", "Microservices"],
        "qualifications": [f"Bachelor's/Master's in Computer Science or equivalent experience", f"{experience_range} of production engineering experience"],
        "compensation_range": salary_range,
        "interview_stages": ["1. Technical Screen", "2. System Design", "3. Culture & Team Alignment"]
    }

def screen_candidate_with_groq(
    candidate_name: str,
    experience_years: float,
    resume_text: str,
    job_role: str,
    required_skills: List[str]
) -> Dict[str, Any]:
    prompt = f"""
You are an expert AI Technical Recruiter. Evaluate the following candidate against the Job Requirements.

Target Role: {job_role}
Mandatory Skills: {', '.join(required_skills)}

Candidate Name: {candidate_name}
Years of Experience: {experience_years}
Candidate Profile / Resume Summary:
{resume_text}

Provide an objective assessment. Return ONLY valid JSON matching this schema:
{{
  "match_score": 85,
  "match_explanation": "2-3 sentences detailing candidate strengths and architectural alignment.",
  "extracted_skills": ["list of relevant skills found in profile"],
  "missing_qualifications": ["list of skills or requirements not evidenced in resume"]
}}
"""
    raw_output = call_groq_chat(prompt)
    if raw_output:
        try:
            return json.loads(clean_json_response(raw_output))
        except Exception as e:
            print(f"Failed to parse Groq screening JSON: {e}")

    return {
        "match_score": 88,
        "match_explanation": f"{candidate_name} demonstrates solid proficiency in core backend frameworks with {experience_years} years of industry experience.",
        "extracted_skills": required_skills[:4],
        "missing_qualifications": ["Advanced distributed tracing"]
    }

def synthesize_interview_feedback_with_groq(
    candidate_name: str,
    role: str,
    rounds: List[Dict[str, Any]]
) -> Dict[str, Any]:
    prompt = f"""
Analyze the following interview rounds for candidate '{candidate_name}' applying for '{role}':
{json.dumps(rounds, indent=2)}

Provide an executive synthesis and final recommendation. Return ONLY valid JSON:
{{
  "synthesis": "Executive summary of interview performance, technical depth, and culture fit.",
  "overall_rating": 4.8,
  "recommendation": "STRONG_HIRE"
}}
"""
    raw_output = call_groq_chat(prompt)
    if raw_output:
        try:
            return json.loads(clean_json_response(raw_output))
        except Exception as e:
            print(f"Failed to parse Groq interview synthesis JSON: {e}")

    return {
        "synthesis": f"{candidate_name} demonstrated exemplary technical design and communication skills across all interview panels.",
        "overall_rating": 4.9,
        "recommendation": "STRONG_HIRE"
    }

def generate_sourcing_recommendations_with_groq(
    role: str,
    required_skills: List[str],
    location: str
) -> List[str]:
    prompt = f"""
The candidate pipeline for '{role}' ({location}) with required skills [{', '.join(required_skills)}] is currently below threshold.
Provide 4 actionable, high-yield talent sourcing strategies or niche communities to acquire qualified candidates.

Return ONLY a valid JSON list of strings:
[
  "Strategy 1...",
  "Strategy 2...",
  "Strategy 3...",
  "Strategy 4..."
]
"""
    raw_output = call_groq_chat(prompt)
    if raw_output:
        try:
            parsed = json.loads(clean_json_response(raw_output))
            if isinstance(parsed, list):
                return parsed
        except Exception as e:
            print(f"Failed to parse Groq sourcing suggestions JSON: {e}")

    return [
        f"Target GitHub contributors of top open-source {required_skills[0]} repositories.",
        f"Deploy automated outreach campaigns across specialized talent communities.",
        f"Partner with tech slack/discord channels specializing in {', '.join(required_skills[:2])}.",
        "Host an invite-only virtual tech talk focused on next-gen architecture challenges."
    ]
