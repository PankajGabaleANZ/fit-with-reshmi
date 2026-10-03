import { Plus } from 'lucide-react';
import { Card, Field, PageTitle, RowTools, SaveBar, SmallButton, StringList, TextArea, TextInput, Toggle, move, useContentDoc } from './ui';

export default function ContentEditor() {
  const { content: c, patch, loading, saving, message, error, save } = useContentDoc();
  if (loading) return <p className="text-momo/70">Loading…</p>;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Website Content"
        hint="Change the words and pictures on the home page. Nothing goes live until you press Save at the bottom, and you can change it back at any time."
      />

      <Card title="Announcement banner" hint="A thin bar at the very top of the home page, for offers, holidays or news.">
        <Toggle checked={c.banner.enabled} onChange={(v) => patch('banner', { ...c.banner, enabled: v })} label="Show the banner" />
        <Field label="Message">
          <TextInput value={c.banner.text} onChange={(e) => patch('banner', { ...c.banner, text: e.target.value })} placeholder="e.g. Closed 20–27 December. Bookings reopen on 28 December." />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Link text (optional)">
            <TextInput value={c.banner.linkLabel} onChange={(e) => patch('banner', { ...c.banner, linkLabel: e.target.value })} placeholder="Book now" />
          </Field>
          <Field label="Link address (optional)" hint="Use /booking for the booking page, or a full https:// link.">
            <TextInput value={c.banner.linkUrl} onChange={(e) => patch('banner', { ...c.banner, linkUrl: e.target.value })} placeholder="/booking" />
          </Field>
        </div>
      </Card>

      <Card title="Top of the home page" hint="The big headline area visitors see first.">
        <Field label="Small line above the headline">
          <TextInput value={c.hero.eyebrow} onChange={(e) => patch('hero', { ...c.hero, eyebrow: e.target.value })} />
        </Field>
        <Field label="Headline" hint="Put each line on its own row. The last line is shown in italics.">
          <TextArea rows={4} value={c.hero.headline} onChange={(e) => patch('hero', { ...c.hero, headline: e.target.value })} />
        </Field>
        <Field label="Short description under the headline">
          <TextArea value={c.hero.subheadline} onChange={(e) => patch('hero', { ...c.hero, subheadline: e.target.value })} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Main button text">
            <TextInput value={c.hero.primaryButton} onChange={(e) => patch('hero', { ...c.hero, primaryButton: e.target.value })} />
          </Field>
          <Field label="Second button text">
            <TextInput value={c.hero.secondaryButton} onChange={(e) => patch('hero', { ...c.hero, secondaryButton: e.target.value })} />
          </Field>
        </div>
        <Field label="Background photo address" hint="Paste the web address of a wide photo (https://…). Keep the left side of the picture calm, because the headline sits over it.">
          <TextInput value={c.hero.imageUrl} onChange={(e) => patch('hero', { ...c.hero, imageUrl: e.target.value })} />
        </Field>
      </Card>

      <Card title="Highlights strip" hint="The short facts shown in a row under the headline (up to 6). Leave empty to hide the strip.">
        <StringList items={c.credibility} onChange={(v) => patch('credibility', v)} placeholder="e.g. 20+ Years in Healthcare" />
      </Card>

      <Card title="About Reshmi">
        <Field label="Photo address">
          <TextInput value={c.about.portraitUrl} onChange={(e) => patch('about', { ...c.about, portraitUrl: e.target.value })} />
        </Field>
        <Field label="Story paragraphs">
          <StringList multiline items={c.about.paragraphs} onChange={(v) => patch('about', { ...c.about, paragraphs: v })} addLabel="Add a paragraph" />
        </Field>
        <Field label="Qualification tags" hint="The small rounded labels under the story.">
          <StringList items={c.about.credentials} onChange={(v) => patch('about', { ...c.about, credentials: v })} addLabel="Add a tag" />
        </Field>
      </Card>

      <Card title="My transformation story">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Before">
            <TextInput value={c.transformation.before} onChange={(e) => patch('transformation', { ...c.transformation, before: e.target.value })} placeholder="98 kg" />
          </Field>
          <Field label="After">
            <TextInput value={c.transformation.after} onChange={(e) => patch('transformation', { ...c.transformation, after: e.target.value })} placeholder="60s kg" />
          </Field>
        </div>
        <Field label="Paragraphs">
          <StringList multiline items={c.transformation.paragraphs} onChange={(v) => patch('transformation', { ...c.transformation, paragraphs: v })} addLabel="Add a paragraph" />
        </Field>
        <Field label="Before / after photos" hint="Optional (up to 6). When there are none, the section is shown without pictures.">
          <div className="space-y-4">
            {c.transformation.photos.map((p, i) => (
              <div key={i} className="grid sm:grid-cols-[1fr_1fr_140px_auto] gap-3 items-start">
                <TextInput placeholder="Photo address (https://…)" value={p.src} onChange={(e) => patch('transformation', { ...c.transformation, photos: c.transformation.photos.map((x, n) => (n === i ? { ...x, src: e.target.value } : x)) })} />
                <TextInput placeholder="What the photo shows" value={p.alt} onChange={(e) => patch('transformation', { ...c.transformation, photos: c.transformation.photos.map((x, n) => (n === i ? { ...x, alt: e.target.value } : x)) })} />
                <TextInput placeholder="Label, e.g. Before" value={p.label} onChange={(e) => patch('transformation', { ...c.transformation, photos: c.transformation.photos.map((x, n) => (n === i ? { ...x, label: e.target.value } : x)) })} />
                <RowTools index={i} count={c.transformation.photos.length} onMove={(to) => patch('transformation', { ...c.transformation, photos: move(c.transformation.photos, i, to) })} onRemove={() => patch('transformation', { ...c.transformation, photos: c.transformation.photos.filter((_, n) => n !== i) })} />
              </div>
            ))}
            <SmallButton onClick={() => patch('transformation', { ...c.transformation, photos: [...c.transformation.photos, { src: '', alt: '', label: '' }] })}>
              <Plus size={14} /> Add a photo
            </SmallButton>
          </div>
        </Field>
      </Card>

      <Card title="What happens in the session" hint="The bullet list under “What happens in the 60 minutes”.">
        <StringList items={c.clarity.includes} onChange={(v) => patch('clarity', { includes: v })} />
      </Card>

      <Card title="Testimonials" hint="Only real client words, with their permission. The whole section stays hidden until you add one.">
        <div className="space-y-5">
          {c.testimonials.map((t, i) => (
            <div key={i} className="p-4 rounded-2xl border border-momo/15 bg-sakura/10 space-y-3">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <TextArea placeholder="What the client said" value={t.quote} onChange={(e) => patch('testimonials', c.testimonials.map((x, n) => (n === i ? { ...x, quote: e.target.value } : x)))} />
                </div>
                <RowTools index={i} count={c.testimonials.length} onMove={(to) => patch('testimonials', move(c.testimonials, i, to))} onRemove={() => patch('testimonials', c.testimonials.filter((_, n) => n !== i))} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <TextInput placeholder="Name (or first name and initial)" value={t.name} onChange={(e) => patch('testimonials', c.testimonials.map((x, n) => (n === i ? { ...x, name: e.target.value } : x)))} />
                <TextInput placeholder="Detail, e.g. Mumbai · Gut health programme" value={t.detail} onChange={(e) => patch('testimonials', c.testimonials.map((x, n) => (n === i ? { ...x, detail: e.target.value } : x)))} />
              </div>
            </div>
          ))}
          <SmallButton onClick={() => patch('testimonials', [...c.testimonials, { quote: '', name: '', detail: '' }])}>
            <Plus size={14} /> Add a testimonial
          </SmallButton>
        </div>
      </Card>

      <Card title="Contact & links" hint="Anything left empty simply isn't shown.">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Email address (shown in the footer)">
            <TextInput type="email" value={c.contact.email} onChange={(e) => patch('contact', { ...c.contact, email: e.target.value })} />
          </Field>
          <Field label="Phone number (shown in the footer)">
            <TextInput value={c.contact.phone} onChange={(e) => patch('contact', { ...c.contact, phone: e.target.value })} placeholder="+91 …" />
          </Field>
          <Field label="Instagram username" hint="Without the @ sign.">
            <TextInput value={c.contact.instagramHandle} onChange={(e) => patch('contact', { ...c.contact, instagramHandle: e.target.value })} />
          </Field>
          <Field label="Pinned Instagram post link" hint="Shown beside “How we work together”.">
            <TextInput value={c.contact.pinnedPostUrl} onChange={(e) => patch('contact', { ...c.contact, pinnedPostUrl: e.target.value })} placeholder="https://www.instagram.com/p/…" />
          </Field>
        </div>
        <Field label="Use my own assessment form instead (optional)" hint="If you paste a Google Form or Typeform link here, the “Take the assessment” buttons open it instead of the built-in questionnaire.">
          <TextInput value={c.contact.assessmentFormUrl} onChange={(e) => patch('contact', { ...c.contact, assessmentFormUrl: e.target.value })} placeholder="https://forms.gle/…" />
        </Field>
      </Card>

      <Card title="Show or hide parts of the home page">
        <div className="space-y-4">
          <Toggle checked={c.sections.breathe} onChange={(v) => patch('sections', { ...c.sections, breathe: v })} label="Breathing exercise section" />
          <Toggle checked={c.sections.eva} onChange={(v) => patch('sections', { ...c.sections, eva: v })} label="Eva, the AI assistant" />
          <Toggle checked={c.sections.instagram} onChange={(v) => patch('sections', { ...c.sections, instagram: v })} label="Instagram reels" />
        </div>
      </Card>

      <SaveBar onSave={save} saving={saving} message={message} error={error} label="Save website content" />
    </div>
  );
}
