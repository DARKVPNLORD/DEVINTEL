import { query, queryOne } from '../../config/database';
import { ResumeAnalysis } from './resume.types';

export class ResumeRepository {
  async create(data: {
    user_id: string;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    target_role?: string;
  }): Promise<ResumeAnalysis> {
    const result = await queryOne<ResumeAnalysis>(
      `INSERT INTO resume_analyses (user_id, file_name, file_path, file_size, mime_type, target_role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.user_id, data.file_name, data.file_path, data.file_size, data.mime_type, data.target_role ?? null]
    );
    return result!;
  }

  async findById(id: string): Promise<ResumeAnalysis | null> {
    return queryOne<ResumeAnalysis>('SELECT * FROM resume_analyses WHERE id = $1', [id]);
  }

  async findByUser(userId: string): Promise<ResumeAnalysis[]> {
    return query<ResumeAnalysis>(
      'SELECT * FROM resume_analyses WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
  }

  async getLatestByUser(userId: string): Promise<ResumeAnalysis | null> {
    return queryOne<ResumeAnalysis>(
      'SELECT * FROM resume_analyses WHERE user_id = $1 AND processing_status = $2 ORDER BY created_at DESC LIMIT 1',
      [userId, 'completed']
    );
  }

  async updateStatus(id: string, status: string, errorMessage?: string): Promise<void> {
    await query(
      'UPDATE resume_analyses SET processing_status = $1, error_message = $2, updated_at = NOW() WHERE id = $3',
      [status, errorMessage ?? null, id]
    );
  }

  async updateResults(id: string, data: {
    extracted_text: string;
    parsed_skills: string[];
    parsed_experience: any[];
    parsed_education: any[];
    skill_match_score: number;
    experience_score: number;
    education_score: number;
    overall_score: number;
    recommendations: string[];
  }): Promise<ResumeAnalysis | null> {
    return queryOne<ResumeAnalysis>(
      `UPDATE resume_analyses SET
        extracted_text = $1,
        parsed_skills = $2,
        parsed_experience = $3,
        parsed_education = $4,
        skill_match_score = $5,
        experience_score = $6,
        education_score = $7,
        overall_score = $8,
        recommendations = $9,
        processing_status = 'completed',
        processed_at = NOW(),
        updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        data.extracted_text,
        data.parsed_skills,
        JSON.stringify(data.parsed_experience),
        JSON.stringify(data.parsed_education),
        data.skill_match_score,
        data.experience_score,
        data.education_score,
        data.overall_score,
        JSON.stringify(data.recommendations),
        id,
      ]
    );
  }

  async deleteById(id: string): Promise<void> {
    await query('DELETE FROM resume_analyses WHERE id = $1', [id]);
  }
}
