import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { DEFAULT_ASSESSMENT_CONFIG, type AssessmentConfig } from '../../lib/assessment';
import { PageTitle, SmallButton } from './ui';

export default function ResultsView() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [cfg, setCfg] = useState<AssessmentConfig>(DEFAULT_ASSESSMENT_CONFIG);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/assessments')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setRows(d.assessments || []))
      .catch((s) => setError(s === 401 ? 'Your admin session expired. Please sign in again.' : 'Could not load the results.'));
    fetch('/api/assessment/config').then((r) => r.json()).then((d) => d.config && setCfg(d.config)).catch(() => {});
  }, []);

  const label = (key: string) => cfg.domains.find((d) => d.key === key)?.label ?? key;
  const keys = Array.from(new Set([...cfg.domains.map((d) => d.key), ...(rows || []).flatMap((r) => Object.keys(r.domains || {}))]));
  const when = (iso: string) => (iso ? new Date(iso).toLocaleString() : '');

  const exportCsv = () => {
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['Date', 'Email', 'Overall', ...keys.map(label)];
    const lines = (rows || []).map((r) => [when(r.created_at), r.client_email || '', r.overall, ...keys.map((k) => r.domains?.[k] ?? '')]);
    const csv = [header, ...lines].map((l) => l.map(esc).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'assessment-results.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      <PageTitle title="Assessment Results" hint="Everyone who finished the Health Resilience Assessment on the website, newest first. Scores are out of 100. An email appears only if the person was signed in." />
      {error && <p className="text-rose-700 text-sm mb-4">{error}</p>}
      {rows === null && !error && <p className="text-momo/70">Loading…</p>}
      {rows && (
        <div className="bg-mashiro rounded-2xl border border-momo/20 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-momo/10 bg-sakura/20 flex items-center justify-between">
            <h3 className="font-bold text-momo text-xs uppercase tracking-wider">{rows.length} result{rows.length === 1 ? '' : 's'}</h3>
            <SmallButton onClick={exportCsv} disabled={rows.length === 0}>
              <Download size={14} /> Download as spreadsheet
            </SmallButton>
          </div>
          {rows.length === 0 ? (
            <p className="p-12 text-center text-momo/60 text-sm">No one has completed the assessment yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-momo">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-momo/60 border-b border-momo/10">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Overall</th>
                    {keys.map((k) => (
                      <th key={k} className="px-3 py-3">{label(k)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-momo/10">
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="px-6 py-3 whitespace-nowrap">{when(r.created_at)}</td>
                      <td className="px-3 py-3">{r.client_email || <span className="text-momo/40">anonymous</span>}</td>
                      <td className="px-3 py-3 font-bold">{r.overall}</td>
                      {keys.map((k) => (
                        <td key={k} className="px-3 py-3">{r.domains?.[k] ?? '–'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
