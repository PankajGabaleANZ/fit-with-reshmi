import React, { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, CheckCircle, Plus, Save, Trash2, AlertCircle } from 'lucide-react';
import { DEFAULT_CONTENT, type SiteContent } from '../../lib/content';

export const INPUT =
  'w-full px-4 py-3 bg-mashiro border border-momo/30 rounded-xl text-sm font-medium text-momo focus:border-momo outline-none';
const BTN_SMALL =
  'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-momo/25 text-[11px] font-bold uppercase tracking-wider text-momo hover:bg-sakura/40 transition-colors';

export function PageTitle({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-serif font-bold text-momo">{title}</h1>
      <p className="text-sm text-momo/80 mt-2 max-w-3xl">{hint}</p>
    </div>
  );
}

export function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="bg-mashiro p-6 sm:p-8 rounded-3xl border border-momo/20 shadow-sm space-y-5">
      <div>
        <h2 className="text-lg font-serif font-bold text-momo">{title}</h2>
        {hint && <p className="text-xs text-momo/70 mt-1">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase font-bold text-momo mb-2 tracking-wide">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-momo/60 mt-1.5">{hint}</span>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${INPUT} ${props.className || ''}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={`${INPUT} resize-y ${props.className || ''}`} />;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-momo' : 'bg-momo/25'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
      <span className="text-sm font-medium text-momo">{label}</span>
    </label>
  );
}

export function SmallButton({ children, onClick, danger, disabled }: { children: ReactNode; onClick: () => void; danger?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${BTN_SMALL} ${danger ? 'text-rose-700 border-rose-300 hover:bg-rose-50' : ''} disabled:opacity-30`}
    >
      {children}
    </button>
  );
}

/** Move/remove controls for an item inside a list. */
export function RowTools({ index, count, onMove, onRemove }: { index: number; count: number; onMove: (to: number) => void; onRemove: () => void }) {
  return (
    <div className="flex gap-1.5 shrink-0">
      <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => onMove(index - 1)} className={`${BTN_SMALL} px-2 disabled:opacity-30`}>
        <ArrowUp size={14} />
      </button>
      <button type="button" aria-label="Move down" disabled={index === count - 1} onClick={() => onMove(index + 1)} className={`${BTN_SMALL} px-2 disabled:opacity-30`}>
        <ArrowDown size={14} />
      </button>
      <button type="button" aria-label="Remove" onClick={onRemove} className={`${BTN_SMALL} px-2 text-rose-700 border-rose-300 hover:bg-rose-50`}>
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export function move<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** An editable list of short texts (add, edit, reorder, remove). */
export function StringList({
  items, onChange, placeholder, addLabel = 'Add another', multiline,
}: { items: string[]; onChange: (v: string[]) => void; placeholder?: string; addLabel?: string; multiline?: boolean }) {
  return (
    <div className="space-y-3">
      {items.map((text, i) => (
        <div key={i} className="flex gap-3 items-start">
          {multiline ? (
            <TextArea value={text} placeholder={placeholder} onChange={(e) => onChange(items.map((x, n) => (n === i ? e.target.value : x)))} />
          ) : (
            <TextInput value={text} placeholder={placeholder} onChange={(e) => onChange(items.map((x, n) => (n === i ? e.target.value : x)))} />
          )}
          <RowTools index={i} count={items.length} onMove={(to) => onChange(move(items, i, to))} onRemove={() => onChange(items.filter((_, n) => n !== i))} />
        </div>
      ))}
      <SmallButton onClick={() => onChange([...items, ''])}>
        <Plus size={14} /> {addLabel}
      </SmallButton>
    </div>
  );
}

/** Sticky save bar with the result of the last save. */
export function SaveBar({ onSave, saving, message, error, label = 'Save changes' }: { onSave: () => void; saving: boolean; message: string; error: string; label?: string }) {
  return (
    <div className="sticky bottom-0 -mx-4 sm:mx-0 mt-8 px-4 sm:px-6 py-4 bg-mashiro/95 backdrop-blur border-t sm:border sm:rounded-2xl border-momo/20 flex flex-wrap items-center justify-between gap-3 z-20">
      <div className="text-sm font-medium min-h-[1.25rem]" aria-live="polite">
        {message && (
          <span className="inline-flex items-center gap-2 text-emerald-700">
            <CheckCircle size={16} /> {message}
          </span>
        )}
        {error && (
          <span className="inline-flex items-center gap-2 text-rose-700">
            <AlertCircle size={16} /> {error}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="px-8 py-3.5 bg-momo text-mashiro rounded-xl text-xs uppercase font-bold tracking-wider hover:bg-momo/90 disabled:opacity-50 inline-flex items-center gap-2 shadow-md"
      >
        <Save size={16} /> {saving ? 'Saving…' : label}
      </button>
    </div>
  );
}

/** Loads the website content, lets a screen edit it, and saves the whole thing back (the server cleans it). */
export function useContentDoc() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/content')
      .then((r) => r.json())
      .then((d) => d.content && setContent(d.content))
      .catch(() => setError('Could not load the current content. Reload the page before editing.'))
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(res.status === 401 ? 'Your admin session expired. Please sign in again.' : data.error || 'Could not save');
      setContent(data.content);
      try {
        localStorage.removeItem('hwr_content_v1'); // so this browser shows the new version on next visit
      } catch {
        /* ignore */
      }
      setMessage('Saved. The website now shows your changes.');
      setTimeout(() => setMessage(''), 6000);
    } catch (e: any) {
      setError(e.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  }, [content]);

  /** Update one top-level part of the content. */
  const patch = useCallback(<K extends keyof SiteContent>(key: K, value: SiteContent[K]) => setContent((c) => ({ ...c, [key]: value })), []);

  return { content, patch, loading, saving, message, error, save };
}
