import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { DAY_NAMES, formatPrice, type Availability, type Service } from '../../lib/content';
import { minutesToLabel, scheduledSlots, todayIn } from '../../availability';
import { Card, Field, PageTitle, RowTools, SaveBar, SmallButton, TextArea, TextInput, Toggle, move, useContentDoc } from './ui';

const ZONES = ['Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Australia/Sydney'];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // show Monday first

export default function SessionsTimes() {
  const { content: c, patch, loading, saving, message, error, save } = useContentDoc();
  const [offDay, setOffDay] = useState('');
  const [previewDate, setPreviewDate] = useState('');
  const av = c.availability;

  const setAv = (next: Partial<Availability>) => patch('availability', { ...av, ...next });
  const setService = (i: number, s: Partial<Service>) => patch('services', c.services.map((x, n) => (n === i ? { ...x, ...s } : x)));

  const preview = useMemo(() => {
    if (!previewDate) return null;
    try {
      return scheduledSlots(av, previewDate).map(minutesToLabel);
    } catch {
      return [];
    }
  }, [av, previewDate]);

  if (loading) return <p className="text-momo/70">Loading…</p>;

  const today = todayIn(av.timezone);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Sessions & Consultation Times"
        hint="Decide which sessions people can book, what they cost, and on which days and hours you are available. Changes apply to the booking page as soon as you save."
      />

      <Card title="Sessions & prices" hint="Each session appears on the booking page. Set the price to 0 for a free session. The assistant, Eva, quotes the first session in the list.">
        <div className="space-y-5">
          {c.services.map((s, i) => (
            <div key={s.id + i} className="p-4 rounded-2xl border border-momo/15 bg-sakura/10 space-y-3">
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <TextInput placeholder="Session name" value={s.title} onChange={(e) => setService(i, { title: e.target.value })} />
                </div>
                <RowTools index={i} count={c.services.length} onMove={(to) => patch('services', move(c.services, i, to))} onRemove={() => c.services.length > 1 && patch('services', c.services.filter((_, n) => n !== i))} />
              </div>
              <TextArea placeholder="Short description shown to clients" value={s.description} onChange={(e) => setService(i, { description: e.target.value })} />
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Length (minutes)">
                  <TextInput type="number" min={5} max={480} value={s.durationMinutes} onChange={(e) => setService(i, { durationMinutes: Number(e.target.value) })} />
                </Field>
                <Field label={`Price (${c.currency})`} hint={`Shown as ${formatPrice(s.price, c.currency)}`}>
                  <TextInput type="number" min={0} value={s.price} onChange={(e) => setService(i, { price: Number(e.target.value) })} />
                </Field>
              </div>
            </div>
          ))}
          <SmallButton onClick={() => patch('services', [...c.services, { id: `session-${c.services.length + 1}`, title: '', description: '', durationMinutes: 60, price: 0 }])}>
            <Plus size={14} /> Add a session
          </SmallButton>
          <p className="text-[11px] text-momo/60">At least one session is always kept. Currency: {c.currency}.</p>
        </div>
      </Card>

      <Card title="Weekly hours" hint="Tick the days you take bookings and set your hours. Add a second block for a lunch break (for example 9:00–13:00 and 14:00–17:00).">
        <div className="space-y-3">
          {WEEK_ORDER.map((dow) => {
            const day = av.week[dow];
            const setDay = (d: typeof day) => setAv({ week: av.week.map((x, n) => (n === dow ? d : x)) });
            return (
              <div key={dow} className="flex flex-col sm:flex-row sm:items-start gap-3 py-3 border-b border-momo/10 last:border-0">
                <div className="sm:w-44 pt-1">
                  <Toggle checked={day.enabled} onChange={(v) => setDay({ enabled: v, windows: v && day.windows.length === 0 ? [{ start: '09:00', end: '17:00' }] : day.windows })} label={DAY_NAMES[dow]} />
                </div>
                {day.enabled ? (
                  <div className="space-y-2">
                    {day.windows.map((w, wi) => (
                      <div key={wi} className="flex items-center gap-2">
                        <input type="time" value={w.start} onChange={(e) => setDay({ ...day, windows: day.windows.map((x, n) => (n === wi ? { ...x, start: e.target.value } : x)) })} className="px-3 py-2 rounded-lg border border-momo/30 bg-mashiro text-sm text-momo" />
                        <span className="text-momo/60 text-sm">to</span>
                        <input type="time" value={w.end} onChange={(e) => setDay({ ...day, windows: day.windows.map((x, n) => (n === wi ? { ...x, end: e.target.value } : x)) })} className="px-3 py-2 rounded-lg border border-momo/30 bg-mashiro text-sm text-momo" />
                        <button type="button" aria-label="Remove this block" onClick={() => setDay({ ...day, windows: day.windows.filter((_, n) => n !== wi) })} className="p-2 text-rose-700 hover:bg-rose-50 rounded-lg">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {day.windows.length < 4 && (
                      <SmallButton onClick={() => setDay({ ...day, windows: [...day.windows, { start: '14:00', end: '17:00' }] })}>
                        <Plus size={14} /> Add hours
                      </SmallButton>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-momo/50 pt-1.5">Closed</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Booking rules">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Length of each appointment slot (minutes)" hint="Slots start one after another from the opening time.">
            <TextInput type="number" min={10} max={240} value={av.slotMinutes} onChange={(e) => setAv({ slotMinutes: Number(e.target.value) })} />
          </Field>
          <Field label="Rest between appointments (minutes)">
            <TextInput type="number" min={0} max={120} value={av.gapMinutes} onChange={(e) => setAv({ gapMinutes: Number(e.target.value) })} />
          </Field>
          <Field label="Earliest booking from now (hours)" hint="Stops last-minute bookings. 12 means nothing within the next 12 hours.">
            <TextInput type="number" min={0} max={720} value={av.minNoticeHours} onChange={(e) => setAv({ minNoticeHours: Number(e.target.value) })} />
          </Field>
          <Field label="How far ahead people can book (days)">
            <TextInput type="number" min={1} max={365} value={av.maxDaysAhead} onChange={(e) => setAv({ maxDaysAhead: Number(e.target.value) })} />
          </Field>
          <Field label="Your time zone" hint="Opening hours are in this time zone.">
            <select value={av.timezone} onChange={(e) => setAv({ timezone: e.target.value })} className="w-full px-4 py-3 bg-mashiro border border-momo/30 rounded-xl text-sm font-medium text-momo">
              {(ZONES.includes(av.timezone) ? ZONES : [av.timezone, ...ZONES]).map((z) => (
                <option key={z}>{z}</option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      <Card title="Days off" hint="Holidays or leave. Nobody can book these days, whatever the weekly hours say.">
        <div className="flex flex-wrap gap-2">
          {av.blockedDates.length === 0 && <span className="text-sm text-momo/60">No days off set.</span>}
          {av.blockedDates.map((d) => (
            <span key={d} className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full bg-sakura/40 border border-momo/20 text-sm text-momo">
              {d}
              <button type="button" aria-label={`Remove ${d}`} onClick={() => setAv({ blockedDates: av.blockedDates.filter((x) => x !== d) })} className="p-1 rounded-full hover:bg-white/60">
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-3 items-center">
          <input type="date" min={today} value={offDay} onChange={(e) => setOffDay(e.target.value)} className="px-3 py-2.5 rounded-lg border border-momo/30 bg-mashiro text-sm text-momo" />
          <SmallButton disabled={!offDay} onClick={() => { if (offDay && !av.blockedDates.includes(offDay)) setAv({ blockedDates: [...av.blockedDates, offDay].sort() }); setOffDay(''); }}>
            <Plus size={14} /> Add day off
          </SmallButton>
        </div>
      </Card>

      <Card title="Check what clients will see" hint="Pick a date to preview the slots your settings create (before any existing bookings are taken out).">
        <input type="date" value={previewDate} onChange={(e) => setPreviewDate(e.target.value)} className="px-3 py-2.5 rounded-lg border border-momo/30 bg-mashiro text-sm text-momo" />
        {preview && (
          <p className="text-sm text-momo mt-2">
            {preview.length ? preview.join('  ·  ') : 'No slots on this day (closed, a day off, too soon, or too far ahead).'}
          </p>
        )}
      </Card>

      <SaveBar onSave={save} saving={saving} message={message} error={error} label="Save sessions & times" />
    </div>
  );
}
