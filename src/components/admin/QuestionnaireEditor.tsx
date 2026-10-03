import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { DEFAULT_ASSESSMENT_CONFIG, type AssessmentConfig } from '../../lib/assessment';
import { Card, Field, PageTitle, RowTools, SaveBar, SmallButton, StringList, TextInput, move, useContentDoc } from './ui';

type Domain = AssessmentConfig['domains'][number];

function AssessmentEditor() {
  const [cfg, setCfg] = useState<AssessmentConfig>(DEFAULT_ASSESSMENT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/assessment/config')
      .then((r) => r.json())
      .then((d) => d.config && setCfg(d.config))
      .catch(() => setError('Could not load the questionnaire. Reload the page before editing.'))
      .finally(() => setLoading(false));
  }, []);

  const setDomain = (i: number, d: Partial<Domain>) => setCfg({ domains: cfg.domains.map((x, n) => (n === i ? { ...x, ...d } : x)) });

  const save = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/admin/assessment/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: cfg }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(res.status === 401 ? 'Your admin session expired. Please sign in again.' : data.error || 'Could not save');
      setCfg(data.config);
      setMessage('Saved. The assessment on the website now uses these questions.');
      setTimeout(() => setMessage(''), 6000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-momo/70">Loading…</p>;

  return (
    <div className="space-y-6">
      <p className="text-sm text-momo/80 max-w-3xl">
        The Health Resilience Assessment is split into <strong>areas</strong> (for example Gut Health). Each answer is worth some <strong>points</strong>: give healthier answers more points.
        An area’s score is the points earned out of the most it could earn, shown as a percentage. You can add, remove and reorder anything.
      </p>

      {cfg.domains.map((d, di) => (
        <Card key={di} title={`Area ${di + 1}: ${d.label || 'Untitled'}`}>
          <div className="flex gap-3 items-start">
            <div className="flex-1 grid sm:grid-cols-2 gap-3">
              <Field label="Area name (shown in results)">
                <TextInput value={d.label} onChange={(e) => setDomain(di, { label: e.target.value })} />
              </Field>
              <Field label="Heading">
                <TextInput value={d.title} onChange={(e) => setDomain(di, { title: e.target.value })} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="One-line description">
                  <TextInput value={d.subtitle} onChange={(e) => setDomain(di, { subtitle: e.target.value })} />
                </Field>
              </div>
            </div>
            <RowTools index={di} count={cfg.domains.length} onMove={(to) => setCfg({ domains: move(cfg.domains, di, to) })} onRemove={() => cfg.domains.length > 1 && setCfg({ domains: cfg.domains.filter((_, n) => n !== di) })} />
          </div>

          <div className="space-y-4">
            {d.questions.map((q, qi) => {
              const setQ = (next: Partial<typeof q>) => setDomain(di, { questions: d.questions.map((x, n) => (n === qi ? { ...x, ...next } : x)) });
              return (
                <div key={qi} className="p-4 rounded-2xl border border-momo/15 bg-sakura/10 space-y-3">
                  <div className="flex gap-3 items-start">
                    <span className="pt-3 text-xs font-bold text-momo/60">Q{qi + 1}</span>
                    <div className="flex-1">
                      <TextInput value={q.question} placeholder="The question" onChange={(e) => setQ({ question: e.target.value })} />
                    </div>
                    <RowTools index={qi} count={d.questions.length} onMove={(to) => setDomain(di, { questions: move(d.questions, qi, to) })} onRemove={() => d.questions.length > 1 && setDomain(di, { questions: d.questions.filter((_, n) => n !== qi) })} />
                  </div>
                  <div className="pl-7 space-y-2">
                    <div className="hidden sm:grid grid-cols-[1fr_90px_auto] gap-3 text-[10px] uppercase font-bold text-momo/60">
                      <span>Answer</span>
                      <span>Points</span>
                      <span className="w-[112px]" />
                    </div>
                    {q.options.map((o, oi) => (
                      <div key={oi} className="grid grid-cols-[1fr_90px_auto] gap-3 items-start">
                        <TextInput value={o.label} placeholder="Answer text" onChange={(e) => setQ({ options: q.options.map((x, n) => (n === oi ? { ...x, label: e.target.value } : x)) })} />
                        <TextInput type="number" min={0} max={100} value={o.points} onChange={(e) => setQ({ options: q.options.map((x, n) => (n === oi ? { ...x, points: Number(e.target.value) } : x)) })} />
                        <RowTools index={oi} count={q.options.length} onMove={(to) => setQ({ options: move(q.options, oi, to) })} onRemove={() => q.options.length > 2 && setQ({ options: q.options.filter((_, n) => n !== oi) })} />
                      </div>
                    ))}
                    {q.options.length < 8 && (
                      <SmallButton onClick={() => setQ({ options: [...q.options, { label: '', points: 0 }] })}>
                        <Plus size={14} /> Add an answer
                      </SmallButton>
                    )}
                  </div>
                </div>
              );
            })}
            {d.questions.length < 12 && (
              <SmallButton onClick={() => setDomain(di, { questions: [...d.questions, { question: '', options: [{ label: '', points: 25 }, { label: '', points: 0 }] }] })}>
                <Plus size={14} /> Add a question to this area
              </SmallButton>
            )}
          </div>
        </Card>
      ))}

      {cfg.domains.length < 8 && (
        <SmallButton onClick={() => setCfg({ domains: [...cfg.domains, { key: `area-${cfg.domains.length + 1}`, label: '', title: '', subtitle: '', questions: [{ question: '', options: [{ label: '', points: 25 }, { label: '', points: 0 }] }] }] })}>
          <Plus size={14} /> Add a new area
        </SmallButton>
      )}

      <SaveBar onSave={save} saving={saving} message={message} error={error} label="Save assessment" />
    </div>
  );
}

function BookingQuestionsEditor() {
  const { content: c, patch, loading, saving, message, error, save } = useContentDoc();
  if (loading) return <p className="text-momo/70">Loading…</p>;

  const setQ = (i: number, q: Partial<(typeof c.onboarding)[number]>) => patch('onboarding', c.onboarding.map((x, n) => (n === i ? { ...x, ...q } : x)));

  return (
    <div className="space-y-6">
      <p className="text-sm text-momo/80 max-w-3xl">
        These multiple-choice questions are asked before someone books, so Reshmi knows their situation in advance. The answers are attached to the booking. There are no points here.
      </p>
      {c.onboarding.map((q, i) => (
        <Card key={i} title={`Question ${i + 1}`}>
          <div className="flex gap-3 items-start">
            <div className="flex-1 space-y-3">
              <Field label="Question">
                <TextInput value={q.title} onChange={(e) => setQ(i, { title: e.target.value })} />
              </Field>
              <Field label="Helper text under the question (optional)">
                <TextInput value={q.subtitle} onChange={(e) => setQ(i, { subtitle: e.target.value })} />
              </Field>
              <Field label="Answer choices">
                <StringList items={q.options} onChange={(v) => setQ(i, { options: v })} addLabel="Add a choice" />
              </Field>
            </div>
            <RowTools index={i} count={c.onboarding.length} onMove={(to) => patch('onboarding', move(c.onboarding, i, to))} onRemove={() => c.onboarding.length > 1 && patch('onboarding', c.onboarding.filter((_, n) => n !== i))} />
          </div>
        </Card>
      ))}
      {c.onboarding.length < 12 && (
        <SmallButton onClick={() => patch('onboarding', [...c.onboarding, { id: '', title: '', subtitle: '', options: ['', ''] }])}>
          <Plus size={14} /> Add a question
        </SmallButton>
      )}
      <SaveBar onSave={save} saving={saving} message={message} error={error} label="Save booking questions" />
    </div>
  );
}

export default function QuestionnaireEditor() {
  const [tab, setTab] = useState<'assessment' | 'booking'>('assessment');
  return (
    <div>
      <PageTitle title="Questionnaires" hint="Edit the questions your visitors answer. Empty questions or answers are removed when you save." />
      <div className="flex gap-2 mb-8">
        {([['assessment', 'Health Resilience Assessment'], ['booking', 'Before-booking questions']] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 rounded-xl text-xs uppercase font-bold tracking-wider border ${tab === key ? 'bg-momo text-mashiro border-momo' : 'border-momo/25 text-momo hover:bg-sakura/40'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'assessment' ? <AssessmentEditor /> : <BookingQuestionsEditor />}
    </div>
  );
}
