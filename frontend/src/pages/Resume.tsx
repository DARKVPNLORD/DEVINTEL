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
    resumeService.getAll().then(setAnalyses).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) { addToast('Please select a PDF file', 'warning'); return; }
    setUploading(true);
    try {
      const result = await resumeService.uploadAndAnalyze(selectedFile, targetRole || undefined);
      setAnalyses((prev) => [result, ...prev]);
      setSelectedAnalysis(result);
      setSelectedFile(null);
      setTargetRole('');
      if (fileRef.current) fileRef.current.value = '';
      addToast('Resume analyzed successfully!', 'success');
    } catch { addToast('Failed to analyze resume', 'error'); }
    finally { setUploading(false); }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = { completed: 'success', processing: 'info', failed: 'danger' };
    return (map[status] || 'warning') as any;
  };

  const getScoreColor = (score: number | string) => { const n = Number(score) || 0; return n >= 80 ? 'text-emerald-400' : n >= 60 ? 'text-amber-400' : 'text-nothing-red'; };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-mono font-bold text-nothing-white tracking-tight">RESUME ANALYZER</h1>
        <p className="text-[11px] font-mono text-nothing-grey-500 mt-1 tracking-wide">Upload your resume for AI-powered analysis</p>
      </div>

      <Card>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-nothing-grey-400 mb-4">Upload</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div
            className={clsx('flex-1 border-2 border-dashed p-8 text-center cursor-pointer transition-colors duration-300',
              selectedFile ? 'border-nothing-red/50 bg-nothing-red/5' : 'border-nothing-grey-700 hover:border-nothing-grey-500'
            )}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
            {selectedFile ? (
              <div>
                <p className="text-sm font-mono text-nothing-white">{selectedFile.name}</p>
                <p className="text-[10px] font-mono text-nothing-grey-500 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-mono text-nothing-grey-400">Click to upload a PDF resume</p>
                <p className="text-[10px] font-mono text-nothing-grey-600 mt-1">Max 10 MB</p>
              </div>
            )}
          </div>
          <div className="sm:w-64 space-y-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-nothing-grey-500 mb-1.5">Target Role</label>
              <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g., Senior Frontend Engineer" className="input-base w-full" />
            </div>
            <Button variant="primary" className="w-full" onClick={handleUpload} isLoading={uploading} disabled={!selectedFile}>Analyze</Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-nothing-grey-400">History</h3>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (<Card key={i}><Skeleton height="60px" /></Card>))}</div>
          ) : analyses.length === 0 ? (
            <Card className="text-center py-8"><p className="text-xs font-mono text-nothing-grey-500">No analyses yet</p></Card>
          ) : (
            analyses.map((a) => (
              <Card key={a.id} hoverable className={clsx('cursor-pointer', selectedAnalysis?.id === a.id && 'border-nothing-red')} padding="sm">
                <div onClick={() => setSelectedAnalysis(a)}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-mono text-nothing-white truncate">{a.file_name}</p>
                    <Badge variant={getStatusBadge(a.processing_status)} size="sm">{a.processing_status}</Badge>
                  </div>
                  {a.target_role && <p className="text-[10px] font-mono text-nothing-grey-600 truncate">{a.target_role}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <span className={clsx('text-lg font-mono font-bold', getScoreColor(a.overall_score))}>{Number(a.overall_score).toFixed(0)}</span>
                    <span className="text-[10px] font-mono text-nothing-grey-600">{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedAnalysis ? (
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-mono text-nothing-white">{selectedAnalysis.file_name}</h3>
                  {selectedAnalysis.target_role && <p className="text-[10px] font-mono text-nothing-grey-500 mt-1">Target: {selectedAnalysis.target_role}</p>}
                </div>
                <div className={clsx('text-3xl font-mono font-bold', getScoreColor(selectedAnalysis.overall_score))}>{Number(selectedAnalysis.overall_score).toFixed(0)}</div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Skill Match', score: selectedAnalysis.skill_match_score },
                  { label: 'Experience', score: selectedAnalysis.experience_score },
                  { label: 'Education', score: selectedAnalysis.education_score },
                ].map((item) => (
                  <div key={item.label} className="text-center p-3 border border-nothing-grey-800">
                    <p className={clsx('text-xl font-mono font-bold', getScoreColor(item.score))}>{Number(item.score).toFixed(0)}</p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-nothing-grey-500 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>

              {selectedAnalysis.parsed_skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-[10px] font-mono uppercase tracking-[0.15em] text-nothing-grey-500 mb-3">Detected Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnalysis.parsed_skills.map((skill: string) => (<Badge key={skill}>{skill}</Badge>))}
                  </div>
                </div>
              )}

              {selectedAnalysis.recommendations.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-mono uppercase tracking-[0.15em] text-nothing-grey-500 mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {selectedAnalysis.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs font-mono text-nothing-grey-400">
                        <div className="w-1 h-1 bg-nothing-red mt-1.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-64">
              <p className="text-xs font-mono text-nothing-grey-500">Select an analysis or upload a new resume</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
