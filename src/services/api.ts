// API Service for FastAPI backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Types matching FastAPI models
export interface Skill {
  name: string;
  level: number; // 0-100
}

export interface Student {
  id?: number;
  name: string;
  email: string;
  year: string;
  section: string;
  skills: Skill[];
  availability: Record<string, boolean>;
  preferences: string[];
}

export interface Project {
  id?: string;
  title: string;
  description: string;
  required_skills: string[];
  team_size: number;
  deadline: string;
  creator_id: number;
  status: string;
}

export interface Team {
  id?: number;
  project_id: string;
  members: number[];
  compatibility_score: number;
  created_at?: string;
}

export interface MatchResult {
  student: Student;
  compatibility: number;
}

export interface MatchResponse {
  project: Project;
  matches: MatchResult[];
  total_matches: number;
}

export interface Stats {
  total_students: number;
  active_projects: number;
  total_teams: number;
  total_matches: number;
  avg_team_compatibility: number;
}

export interface StudentTeam {
  team: Team;
  project: Project;
  members: Student[];
}

// API Error handling
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(response.status, error.detail || 'Request failed');
  }
  return response.json();
}

// Student endpoints
export async function createStudent(student: Omit<Student, 'id'>): Promise<Student> {
  const response = await fetch(`${API_BASE_URL}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  });
  return handleResponse<Student>(response);
}

export async function getStudents(): Promise<Student[]> {
  const response = await fetch(`${API_BASE_URL}/students`);
  return handleResponse<Student[]>(response);
}

export async function getStudent(studentId: number): Promise<Student> {
  const response = await fetch(`${API_BASE_URL}/students/${studentId}`);
  return handleResponse<Student>(response);
}

export async function updateStudent(studentId: number, student: Omit<Student, 'id'>): Promise<Student> {
  const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  });
  return handleResponse<Student>(response);
}

// Project endpoints
export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  return handleResponse<Project>(response);
}

export async function getProjects(status?: string): Promise<Project[]> {
  const url = status 
    ? `${API_BASE_URL}/projects?status=${encodeURIComponent(status)}`
    : `${API_BASE_URL}/projects`;
  const response = await fetch(url);
  return handleResponse<Project[]>(response);
}

export async function getProject(projectId: string): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`);
  return handleResponse<Project>(response);
}

// Matching endpoints
export async function findMatches(
  studentId: number, 
  projectId: string, 
  minCompatibility: number = 70
): Promise<MatchResponse> {
  const response = await fetch(`${API_BASE_URL}/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_id: studentId,
      project_id: projectId,
      min_compatibility: minCompatibility,
    }),
  });
  return handleResponse<MatchResponse>(response);
}

export async function createTeam(projectId: string, studentIds: number[]): Promise<Team> {
  const params = new URLSearchParams({ project_id: projectId });
  studentIds.forEach((id) => params.append('student_ids', id.toString()));
  
  const response = await fetch(`${API_BASE_URL}/match/team?${params.toString()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentIds),
  });
  return handleResponse<Team>(response);
}

// Team endpoints
export async function getTeams(): Promise<Team[]> {
  const response = await fetch(`${API_BASE_URL}/teams`);
  return handleResponse<Team[]>(response);
}

export async function getStudentTeams(studentId: number): Promise<StudentTeam[]> {
  const response = await fetch(`${API_BASE_URL}/teams/student/${studentId}`);
  return handleResponse<StudentTeam[]>(response);
}

// Stats endpoints
export async function getStats(): Promise<Stats> {
  const response = await fetch(`${API_BASE_URL}/stats`);
  return handleResponse<Stats>(response);
}
