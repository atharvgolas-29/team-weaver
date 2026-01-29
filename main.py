from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uvicorn

app = FastAPI(title="TeamForge API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---

class Skill(BaseModel):
    name: str
    level: int  # 0-100

class Student(BaseModel):
    id: Optional[int] = None
    name: str
    email: str
    year: str
    section: str
    skills: List[Skill]
    availability: dict  # {day-slot: bool}
    preferences: List[str]

class Project(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    required_skills: List[str]
    team_size: int
    deadline: str
    creator_id: int
    status: str = "open"

class Team(BaseModel):
    id: Optional[int] = None
    project_id: str
    members: List[int]
    compatibility_score: float
    created_at: Optional[datetime] = None

class MatchRequest(BaseModel):
    student_id: int
    project_id: str
    min_compatibility: int = 70

# --- In-memory storage (replace with database) ---

students_db = []
projects_db = []
teams_db = []

# --- Helper Functions ---

def calculate_compatibility(student: Student, required_skills: List[str]) -> float:
    """Calculate compatibility score between student and project"""
    if not required_skills:
        return 50.0
    
    student_skills = {s.name: s.level for s in student.skills}
    matches = 0
    total_level = 0
    
    for skill in required_skills:
        if skill in student_skills:
            matches += 1
            total_level += student_skills[skill]
    
    if matches == 0:
        return 0.0
    
    coverage = (matches / len(required_skills)) * 100
    avg_level = total_level / matches
    
    return (coverage * 0.6) + (avg_level * 0.4)

def generate_project_id(title: str) -> str:
    """Generate project ID from title"""
    import random
    prefix = ''.join([w[0].upper() for w in title.split()[:3]])
    suffix = ''.join(random.choices('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', k=4))
    return f"{prefix}-{suffix}"

# --- Routes ---

@app.get("/")
def read_root():
    return {"message": "TeamForge API", "version": "1.0.0"}

# Student endpoints
@app.post("/students", response_model=Student)
def create_student(student: Student):
    student.id = len(students_db) + 1
    students_db.append(student)
    return student

@app.get("/students", response_model=List[Student])
def get_students():
    return students_db

@app.get("/students/{student_id}", response_model=Student)
def get_student(student_id: int):
    for student in students_db:
        if student.id == student_id:
            return student
    raise HTTPException(status_code=404, detail="Student not found")

@app.put("/students/{student_id}", response_model=Student)
def update_student(student_id: int, updated_student: Student):
    for i, student in enumerate(students_db):
        if student.id == student_id:
            updated_student.id = student_id
            students_db[i] = updated_student
            return updated_student
    raise HTTPException(status_code=404, detail="Student not found")

# Project endpoints
@app.post("/projects", response_model=Project)
def create_project(project: Project):
    project.id = generate_project_id(project.title)
    projects_db.append(project)
    return project

@app.get("/projects", response_model=List[Project])
def get_projects(status: Optional[str] = None):
    if status:
        return [p for p in projects_db if p.status == status]
    return projects_db

@app.get("/projects/{project_id}", response_model=Project)
def get_project(project_id: str):
    for project in projects_db:
        if project.id == project_id:
            return project
    raise HTTPException(status_code=404, detail="Project not found")

# Matching endpoints
@app.post("/match")
def match_students(request: MatchRequest):
    """Find compatible students for a project"""
    project = None
    for p in projects_db:
        if p.id == request.project_id:
            project = p
            break
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    matches = []
    for student in students_db:
        if student.id == request.student_id:
            continue
        
        score = calculate_compatibility(student, project.required_skills)
        
        if score >= request.min_compatibility:
            matches.append({
                "student": student,
                "compatibility": round(score, 2)
            })
    
    # Sort by compatibility score
    matches.sort(key=lambda x: x["compatibility"], reverse=True)
    
    return {
        "project": project,
        "matches": matches[:10],  # Top 10 matches
        "total_matches": len(matches)
    }

@app.post("/match/team")
def create_team_match(project_id: str, student_ids: List[int]):
    """Create a team for a project"""
    project = None
    for p in projects_db:
        if p.id == project_id:
            project = p
            break
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Verify all students exist
    team_students = []
    for student_id in student_ids:
        student = None
        for s in students_db:
            if s.id == student_id:
                student = s
                break
        if not student:
            raise HTTPException(status_code=404, detail=f"Student {student_id} not found")
        team_students.append(student)
    
    # Calculate team compatibility
    total_score = 0
    for student in team_students:
        score = calculate_compatibility(student, project.required_skills)
        total_score += score
    
    avg_compatibility = total_score / len(team_students) if team_students else 0
    
    team = Team(
        id=len(teams_db) + 1,
        project_id=project_id,
        members=student_ids,
        compatibility_score=round(avg_compatibility, 2),
        created_at=datetime.now()
    )
    
    teams_db.append(team)
    return team

@app.get("/teams", response_model=List[Team])
def get_teams():
    return teams_db

@app.get("/teams/student/{student_id}")
def get_student_teams(student_id: int):
    """Get all teams for a student"""
    student_teams = []
    for team in teams_db:
        if student_id in team.members:
            # Find project details
            project = None
            for p in projects_db:
                if p.id == team.project_id:
                    project = p
                    break
            
            # Get member details
            members = []
            for member_id in team.members:
                for s in students_db:
                    if s.id == member_id:
                        members.append(s)
                        break
            
            student_teams.append({
                "team": team,
                "project": project,
                "members": members
            })
    
    return student_teams

# Stats endpoints
@app.get("/stats")
def get_stats():
    """Get platform statistics"""
    return {
        "total_students": len(students_db),
        "active_projects": len([p for p in projects_db if p.status == "open"]),
        "total_teams": len(teams_db),
        "total_matches": sum(len(t.members) for t in teams_db),
        "avg_team_compatibility": round(
            sum(t.compatibility_score for t in teams_db) / len(teams_db), 2
        ) if teams_db else 0
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
