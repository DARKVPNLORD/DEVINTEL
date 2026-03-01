import fs from 'fs';
import pdf from 'pdf-parse';
import { ResumeRepository } from './resume.repository';
import { ResumeScoreResult } from './resume.types';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { logger } from '../../config/logger';
import { query, queryOne } from '../../config/database';

// Common skill taxonomy for matching
const SKILL_PATTERNS: Record<string, string[]> = {
  'Languages': ['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'dart', 'elixir'],
  'Frontend': ['react', 'angular', 'vue', 'svelte', 'next.js', 'nextjs', 'nuxt', 'gatsby', 'html', 'css', 'sass', 'tailwind', 'bootstrap', 'webpack', 'vite'],
  'Backend': ['node.js', 'nodejs', 'express', 'nestjs', 'django', 'flask', 'spring', 'rails', 'laravel', 'fastapi', 'gin', 'fiber'],
  'Database': ['postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'sqlite', 'cassandra', 'neo4j'],
  'Cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'ci/cd', 'github actions'],
  'Tools': ['git', 'linux', 'bash', 'vim', 'jira', 'figma', 'postman', 'graphql', 'rest', 'grpc', 'websocket'],
  'AI/ML': ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'nlp', 'computer vision', 'openai', 'llm'],
  'Mobile': ['react native', 'flutter', 'ios', 'android', 'swiftui', 'jetpack compose'],
};

const ROLE_REQUIREMENTS: Record<string, string[]> = {
  'Senior Full-Stack Engineer': ['javascript', 'typescript', 'react', 'node.js', 'postgresql', 'git', 'docker', 'aws'],
  'Frontend Engineer': ['javascript', 'typescript', 'react', 'html', 'css', 'webpack', 'git', 'tailwind'],
  'Backend Engineer': ['node.js', 'python', 'postgresql', 'redis', 'docker', 'aws', 'git', 'rest'],
  'DevOps Engineer': ['docker', 'kubernetes', 'terraform', 'aws', 'linux', 'ci/cd', 'git', 'bash'],
  'Data Engineer': ['python', 'postgresql', 'aws', 'docker', 'elasticsearch', 'redis', 'git'],
  'Machine Learning Engineer': ['python', 'tensorflow', 'pytorch', 'machine learning', 'deep learning', 'docker', 'git'],
};

export class ResumeService {
  constructor(private readonly resumeRepo: ResumeRepository) {}

  async uploadResume(userId: string, file: Express.Multer.File, targetRole?: string): Promise<{ id: string }> {
    if (!file.mimetype.includes('pdf')) {
      throw new BadRequestError('Only PDF files are supported');
    }

    const analysis = await this.resumeRepo.create({
      user_id: userId,
      file_name: file.originalname,
      file_path: file.path,
      file_size: file.size,
      mime_type: file.mimetype,
      target_role: targetRole,
    });

    return { id: analysis.id };
  }

  async processResume(resumeId: string): Promise<ResumeScoreResult> {
    const analysis = await this.resumeRepo.findById(resumeId);
    if (!analysis) throw new NotFoundError('Resume analysis');

    try {
      await this.resumeRepo.updateStatus(resumeId, 'processing');

      // Extract text from PDF
      const fileBuffer = fs.readFileSync(analysis.file_path);
      const pdfData = await pdf(fileBuffer);
      const extractedText = pdfData.text;

      // Parse skills from text
      const parsedSkills = this.extractSkills(extractedText);

      // Parse experience
      const parsedExperience = this.extractExperience(extractedText);

      // Parse education
      const parsedEducation = this.extractEducation(extractedText);

      // Get target role skills
      const targetRole = analysis.target_role ?? 'Senior Full-Stack Engineer';
      const targetSkills = await this.getTargetRoleSkills(analysis.user_id, targetRole);

      // Compute scores
      const skillMatchResult = this.computeSkillMatch(parsedSkills, targetSkills);
      const experienceScore = this.computeExperienceScore(parsedExperience);
      const educationScore = this.computeEducationScore(parsedEducation);
      const overallScore = Math.round(
        (skillMatchResult.score * 0.45 + experienceScore * 0.35 + educationScore * 0.20) * 100
      ) / 100;

      const recommendations = this.generateRecommendations(
        skillMatchResult.missing,
        parsedExperience,
        targetRole
      );

      // Store results
      await this.resumeRepo.updateResults(resumeId, {
        extracted_text: extractedText.substring(0, 50000),
        parsed_skills: parsedSkills,
        parsed_experience: parsedExperience,
        parsed_education: parsedEducation,
        skill_match_score: skillMatchResult.score,
        experience_score: experienceScore,
        education_score: educationScore,
        overall_score: overallScore,
        recommendations,
      });

      // Store extracted skills in the skills table
      for (const skill of parsedSkills) {
        const category = this.getSkillCategory(skill);
        await query(
          `INSERT INTO skills (user_id, name, category, source, proficiency_level)
           VALUES ($1, $2, $3, 'resume', 50)
           ON CONFLICT (user_id, name, source) DO UPDATE SET updated_at = NOW()`,
          [analysis.user_id, skill, category]
        );
      }

      return {
        skillMatchScore: skillMatchResult.score,
        experienceScore,
        educationScore,
        overallScore,
        extractedSkills: parsedSkills,
        recommendations,
        matchedSkills: skillMatchResult.matched,
        missingSkills: skillMatchResult.missing,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await this.resumeRepo.updateStatus(resumeId, 'failed', message);
      logger.error(`Resume processing failed for ${resumeId}:`, error);
      throw error;
    }
  }

  async getAnalyses(userId: string) {
    return this.resumeRepo.findByUser(userId);
  }

  async getAnalysis(id: string) {
    const analysis = await this.resumeRepo.findById(id);
    if (!analysis) throw new NotFoundError('Resume analysis');
    return analysis;
  }

  // Text extraction helpers
  private extractSkills(text: string): string[] {
    const lowerText = text.toLowerCase();
    const foundSkills: Set<string> = new Set();

    for (const [, skills] of Object.entries(SKILL_PATTERNS)) {
      for (const skill of skills) {
        const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
        if (regex.test(lowerText)) {
          foundSkills.add(skill);
        }
      }
    }

    return Array.from(foundSkills);
  }

  private extractExperience(text: string): Array<{ title: string; company: string; duration: string; description: string }> {
    const experiences: Array<{ title: string; company: string; duration: string; description: string }> = [];

    // Pattern matching for common resume formats
    const experienceSection = text.match(/(?:experience|employment|work history)([\s\S]*?)(?:education|skills|projects|certifications|$)/i);
    if (!experienceSection) return experiences;

    const section = experienceSection[1];
    const entries = section.split(/\n{2,}/);

    for (const entry of entries.slice(0, 5)) {
      const lines = entry.trim().split('\n').filter(Boolean);
      if (lines.length >= 2) {
        const durationMatch = entry.match(/(\d{4}\s*[-–]\s*(?:\d{4}|present|current))/i);
        experiences.push({
          title: lines[0]?.trim() || 'Unknown Role',
          company: lines[1]?.trim() || 'Unknown Company',
          duration: durationMatch?.[1] || 'N/A',
          description: lines.slice(2).join(' ').trim().substring(0, 500),
        });
      }
    }

    return experiences;
  }

  private extractEducation(text: string): Array<{ degree: string; institution: string; year: string; field: string }> {
    const education: Array<{ degree: string; institution: string; year: string; field: string }> = [];

    const educationSection = text.match(/(?:education|academic)([\s\S]*?)(?:experience|skills|projects|$)/i);
    if (!educationSection) return education;

    const section = educationSection[1];
    const entries = section.split(/\n{2,}/);

    for (const entry of entries.slice(0, 3)) {
      const lines = entry.trim().split('\n').filter(Boolean);
      if (lines.length >= 1) {
        const yearMatch = entry.match(/(\d{4})/);
        const degreeMatch = entry.match(/(bachelor|master|phd|doctorate|b\.s\.|m\.s\.|b\.a\.|m\.a\.|b\.tech|m\.tech|mba)/i);
        education.push({
          degree: degreeMatch?.[1] || lines[0]?.trim() || 'Unknown',
          institution: lines[1]?.trim() || lines[0]?.trim() || 'Unknown',
          year: yearMatch?.[1] || 'N/A',
          field: lines[2]?.trim() || 'N/A',
        });
      }
    }

    return education;
  }

  private async getTargetRoleSkills(userId: string, targetRole: string): Promise<string[]> {
    // Check user's career targets first
    const target = await queryOne<{ required_skills: string[]; preferred_skills: string[] }>(
      'SELECT required_skills, preferred_skills FROM career_targets WHERE user_id = $1 AND is_active = true LIMIT 1',
      [userId]
    );

    if (target && target.required_skills.length > 0) {
      return [...target.required_skills, ...(target.preferred_skills || [])];
    }

    // Fall back to predefined role requirements
    const normalizedRole = Object.keys(ROLE_REQUIREMENTS).find(
      (key) => key.toLowerCase().includes(targetRole.toLowerCase()) || targetRole.toLowerCase().includes(key.toLowerCase())
    );

    return ROLE_REQUIREMENTS[normalizedRole ?? 'Senior Full-Stack Engineer'] || ROLE_REQUIREMENTS['Senior Full-Stack Engineer'];
  }

  private computeSkillMatch(resumeSkills: string[], targetSkills: string[]): { score: number; matched: string[]; missing: string[] } {
    const normalizedResume = resumeSkills.map((s) => s.toLowerCase());
    const normalizedTarget = targetSkills.map((s) => s.toLowerCase());

    const matched = normalizedTarget.filter((skill) =>
      normalizedResume.some((rs) => rs.includes(skill) || skill.includes(rs))
    );
    const missing = normalizedTarget.filter((skill) =>
      !normalizedResume.some((rs) => rs.includes(skill) || skill.includes(rs))
    );

    const score = normalizedTarget.length > 0
      ? Math.round((matched.length / normalizedTarget.length) * 10000) / 100
      : 0;

    return { score, matched, missing };
  }

  private computeExperienceScore(experience: Array<{ title: string; company: string; duration: string; description: string }>): number {
    if (experience.length === 0) return 0;

    let totalYears = 0;
    for (const exp of experience) {
      const match = exp.duration.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current)/i);
      if (match) {
        const start = parseInt(match[1]);
        const end = match[2].toLowerCase() === 'present' || match[2].toLowerCase() === 'current'
          ? new Date().getFullYear()
          : parseInt(match[2]);
        totalYears += end - start;
      }
    }

    // Score based on years of experience (max at 10 years)
    const yearsScore = Math.min(totalYears / 10, 1) * 70;
    // Bonus for number of positions (max 5)
    const positionBonus = Math.min(experience.length / 5, 1) * 30;

    return Math.round(Math.min(yearsScore + positionBonus, 100) * 100) / 100;
  }

  private computeEducationScore(education: Array<{ degree: string; institution: string; year: string; field: string }>): number {
    if (education.length === 0) return 30; // Base score without formal education

    let maxDegreeScore = 0;

    for (const edu of education) {
      const degree = edu.degree.toLowerCase();
      if (degree.includes('phd') || degree.includes('doctorate')) {
        maxDegreeScore = Math.max(maxDegreeScore, 100);
      } else if (degree.includes('master') || degree.includes('m.s') || degree.includes('m.a') || degree.includes('mba') || degree.includes('m.tech')) {
        maxDegreeScore = Math.max(maxDegreeScore, 85);
      } else if (degree.includes('bachelor') || degree.includes('b.s') || degree.includes('b.a') || degree.includes('b.tech')) {
        maxDegreeScore = Math.max(maxDegreeScore, 70);
      } else {
        maxDegreeScore = Math.max(maxDegreeScore, 50);
      }
    }

    return maxDegreeScore;
  }

  private generateRecommendations(missingSkills: string[], experience: any[], targetRole: string): string[] {
    const recommendations: string[] = [];

    if (missingSkills.length > 0) {
      recommendations.push(`Learn or strengthen these skills for ${targetRole}: ${missingSkills.slice(0, 5).join(', ')}`);
    }

    if (missingSkills.length > 3) {
      recommendations.push('Consider taking online courses or certifications to fill skill gaps');
    }

    if (experience.length < 2) {
      recommendations.push('Build more professional experience through internships, freelancing, or open-source contributions');
    }

    if (experience.length === 0) {
      recommendations.push('Add work experience or relevant projects to strengthen your resume');
    }

    recommendations.push('Ensure your resume highlights measurable achievements and impact');
    recommendations.push('Tailor your resume to specifically mention technologies required for your target role');

    return recommendations.slice(0, 6);
  }

  private getSkillCategory(skill: string): string {
    const lowerSkill = skill.toLowerCase();
    for (const [category, skills] of Object.entries(SKILL_PATTERNS)) {
      if (skills.includes(lowerSkill)) return category;
    }
    return 'Other';
  }
}
