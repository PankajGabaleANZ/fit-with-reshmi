import { useState } from 'react';
import { ExternalLink, Plus } from 'lucide-react';
import { instagramCode } from '../../lib/content';
import { Card, PageTitle, RowTools, SaveBar, SmallButton, TextInput, move, useContentDoc } from './ui';

export default function ReelsEditor() {
  const { content: c, patch, loading, saving, message, error, save } = useContentDoc();
  const [draft, setDraft] = useState('');
  const [problem, setProblem] = useState('');
  if (loading) return <p className="text-momo/70">Loading…</p>;

  const add = () => {
    const link = draft.trim();
    if (!instagramCode(link) || !/^https?:\/\//i.test(link)) {
      setProblem('That doesn’t look like an Instagram reel or post link. Copy it from Instagram: open the reel, tap Share, then Copy link.');
      return;
    }
    if (c.reels.includes(link)) {
      setProblem('That reel is already in the list.');
      return;
    }
    setProblem('');
    patch('reels', [link, ...c.reels]); // newest first
    setDraft('');
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="Instagram Reels"
        hint="The reels shown on the home page, in this order (the first one appears first). Paste a link from Instagram to add a new one; it goes to the top."
      />

      <Card title="Add a reel">
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <TextInput
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
              placeholder="https://www.instagram.com/healthwithreshmi/reel/…"
            />
            {problem && <p className="text-xs text-rose-700 mt-2">{problem}</p>}
          </div>
          <SmallButton onClick={add}>
            <Plus size={14} /> Add
          </SmallButton>
        </div>
      </Card>

      <Card title={`Reels on the website (${c.reels.length})`} hint="Only reels from Instagram accounts that allow embedding will play. Press Save when you're done.">
        {c.reels.length === 0 ? (
          <p className="text-sm text-momo/70">No reels. The Instagram section is hidden until you add one.</p>
        ) : (
          <ol className="space-y-3">
            {c.reels.map((url, i) => (
              <li key={url} className="flex items-center gap-3 p-3 rounded-2xl border border-momo/15 bg-sakura/10">
                <span className="w-7 text-center font-bold text-momo/60">{i + 1}</span>
                <a href={url} target="_blank" rel="noreferrer" className="flex-1 min-w-0 truncate text-sm text-momo underline underline-offset-2 inline-flex items-center gap-1.5">
                  <ExternalLink size={13} className="shrink-0" /> <span className="truncate">{url}</span>
                </a>
                <RowTools index={i} count={c.reels.length} onMove={(to) => patch('reels', move(c.reels, i, to))} onRemove={() => patch('reels', c.reels.filter((_, n) => n !== i))} />
              </li>
            ))}
          </ol>
        )}
      </Card>

      <SaveBar onSave={save} saving={saving} message={message} error={error} label="Save reels" />
    </div>
  );
}
