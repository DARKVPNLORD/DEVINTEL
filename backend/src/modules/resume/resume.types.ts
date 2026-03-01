export interface ResumeAnalysis {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  extracted_text: string | null;
  parsed_skills: string[];
  parsed_experience: ExperienceEntry[];
  parsed_education: EducationEntry[];
  target_role: string | null;
  skill_match_score: number;
  experience_score: number;
  education_score: number;
  overall_score: number;
  recommendations: string[];
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  processed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
  field: string;
}

export interface ResumeUploadDTO {
  targetRole?: string;
}

export interface ResumeScoreResult {
  skillMatchScore: number;
  experienceScore: number;
  educationScore: number;
  overallScore: number;
  extractedSkills: string[];
  recommendations: string[];
  matchedSkills: string[];
  missingSkills: string[];
}
