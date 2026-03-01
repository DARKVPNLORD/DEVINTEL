import { useState, useRef, useEffect } from 'react';
import { Card, Button, Badge, Skeleton } from '../components/primitives';
import { useToast } from '../components/primitives';
import { resumeService } from '../services/data.service';
import type { ResumeAnalysis } from '../types';
import { clsx } from 'clsx';

export function ResumePage() {
  const [analyses, setAnalyses] = useState<ResumeAnalysis[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<ResumeAnalysis | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resumeService.getAll()
      .then(setAnalyses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      addToast('Please select a PDF file', 'warning');
      return;
    }

    setUploading(true);
    try {
      const result = await resumeService.uploadAndAnalyze(selectedFile, targetRole || undefined);
      setAnalyses((prev) => [result, ...prev]);
      setSelectedAnalysis(result);
      setSelectedFile(null);
      setTargetRole('');
      if (fileRef.current) fileRef.current.value = '';
      addToast('Resume analyzed successfully!', 'success');
    } catch {
      addToast('Failed to analyze resume', 'error');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'info';
      case 'failed': return 'danger';
      default: return 'warning';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Resume Analyzer</h1>
        <p className="text-sm text-surface-500 mt-1">Upload your resume for AI-powered analysis and scoring</p>
      </div>

      {/* Upload section */}
      <Card>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Upload Resume</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div
            className={clsx(
              'flex-1 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
              selectedFile
                ? 'border-brand-300 bg-brand-50/50 dark:border-brand-700 dark:bg-brand-900/10'
                : 'border-surface-300 dark:border-surface-600 hover:border-brand-400 dark:hover:border-brand-600'
            )}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            {selectedFile ? (
              <div>
                <svg className="w-10 h-10 text-brand-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-medium text-surface-900 dark:text-white">{selectedFile.name}</p>
                <p className="text-xs text-surface-500 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <svg className="w-10 h-10 text-surface-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-surface-600 dark:text-surface-400">Click to upload a PDF resume</p>
                <p className="text-xs text-surface-400 mt-1">Max 10 MB</p>
              </div>
            )}
          </div>

          <div className="sm:w-64 space-y-3">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Target Role (optional)
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Senior Frontend Engineer"
                className="input-base w-full"
              />
            </div>
            <Button variant="primary" className="w-full" onClick={handleUpload} isLoading={uploading} disabled={!selectedFile}>
              Analyze Resume
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analysis list */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">History</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}><Skeleton height="60px" /></Card>
              ))}
            </div>
          ) : analyses.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-sm text-surface-500">No analyses yet</p>
            </Card>
          ) : (
            analyses.map((a) => (
              <Card
                key={a.id}
                hoverable
                className={clsx(
                  'cursor-pointer',
                  selectedAnalysis?.id === a.id && 'ring-2 ring-brand-500'
                )}
                padding="sm"
              >
                <div onClick={() => setSelectedAnalysis(a)}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                      {a.file_name}
                    </p>
                    <Badge variant={getStatusColor(a.processing_status) as any} size="sm">
                      {a.processing_status}
                    </Badge>
                  </div>
                  {a.target_role && (
                    <p className="text-xs text-surface-500 truncate">{a.target_role}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className={clsx('text-lg font-bold', getScoreColor(a.overall_score))}>
                      {a.overall_score.toFixed(0)}
                    </span>
                    <span className="text-xs text-surface-400">
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Analysis detail */}
        <div className="lg:col-span-2">
          {selectedAnalysis ? (
            <div className="space-y-4">
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                      {selectedAnalysis.file_name}
                    </h3>
                    {selectedAnalysis.target_role && (
                      <p className="text-sm text-surface-500 mt-1">
                        Target: {selectedAnalysis.target_role}
                      </p>
                    )}
                  </div>
                  <div
                    className={clsx(
                      'text-3xl font-bold',
                      getScoreColor(selectedAnalysis.overall_score)
                    )}
                  >
                    {selectedAnalysis.overall_score.toFixed(0)}
                  </div>
                </div>

                {/* Score breakdown */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Skill Match', score: selectedAnalysis.skill_match_score },
                    { label: 'Experience', score: selectedAnalysis.experience_score },
                    { label: 'Education', score: selectedAnalysis.education_score },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
                      <p className={clsx('text-xl font-bold', getScoreColor(item.score))}>
                        {item.score.toFixed(0)}
                      </p>
                      <p className="text-xs text-surface-500 mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                {selectedAnalysis.parsed_skills.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                      Detected Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAnalysis.parsed_skills.map((skill: string) => (
                        <Badge key={skill} variant="brand">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {selectedAnalysis.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {selectedAnalysis.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-surface-600 dark:text-surface-400">
                          <svg className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <Card className="flex items-center justify-center h-64">
              <div className="text-center text-surface-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-surface-300 dark:text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">Select an analysis or upload a new resume</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
