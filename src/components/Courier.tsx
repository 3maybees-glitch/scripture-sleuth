import { useState, type FormEvent } from 'react';
import { phases } from '../data/decks';
import type { PhaseId, ReminderPrefs } from '../types';

const empty: ReminderPrefs = {
  name: '',
  email: '',
  phone: '',
  emailOn: true,
  smsOn: false,
  times: ['morning', 'midday', 'afternoon', 'evening', 'bedtime'],
};

export function Courier({
  saved,
  onSave,
}: {
  saved: ReminderPrefs | null;
  onSave: (prefs: ReminderPrefs) => void;
}) {
  const [form, setForm] = useState<ReminderPrefs>(saved ?? empty);
  const [done, setDone] = useState(Boolean(saved));

  function toggleTime(id: PhaseId) {
    setForm((f) => ({
      ...f,
      times: f.times.includes(id) ? f.times.filter((t) => t !== id) : [...f.times, id],
    }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.emailOn && !form.smsOn) return;
    if (form.emailOn && !form.email.trim()) return;
    if (form.smsOn && !form.phone.trim()) return;
    onSave({
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    });
    setDone(true);
  }

  return (
    <section className="courier parchment">
      <p className="kicker">The courier</p>
      <h2>Letters for the day’s seals</h2>
      <p>
        The mystery is meant to follow you — not only when you open the site. We will send each
        new fragment as it unseals: morning words, midday words, afternoon, dusk, and the night
        reflection.
      </p>
      <p className="fine">
        Email and text delivery are next to be wired. Name the courier and we will keep the hours
        on this device until the letters ride out.
      </p>

      {done && saved ? (
        <div className="saved-courier">
          <p>
            Courier posted{saved.name ? ` for ${saved.name}` : ''}.{' '}
            {saved.emailOn && saved.email ? `Letters to ${saved.email}. ` : ''}
            {saved.smsOn && saved.phone ? `A word to ${saved.phone}.` : ''}
          </p>
          <button type="button" className="text-btn" onClick={() => setDone(false)}>
            Change the hours
          </button>
        </div>
      ) : (
        <form className="courier-form" onSubmit={submit}>
          <label>
            Name
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoComplete="name"
            />
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={form.emailOn}
              onChange={(e) => setForm({ ...form, emailOn: e.target.checked })}
            />
            Send by email
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
              required={form.emailOn}
            />
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={form.smsOn}
              onChange={(e) => setForm({ ...form, smsOn: e.target.checked })}
            />
            Send by text message
          </label>
          <label>
            Mobile number
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              autoComplete="tel"
              required={form.smsOn}
            />
          </label>
          <fieldset>
            <legend>Hours to ride</legend>
            {phases.map((p) => (
              <label key={p.id} className="check">
                <input
                  type="checkbox"
                  checked={form.times.includes(p.id)}
                  onChange={() => toggleTime(p.id)}
                />
                {p.label}
                {p.id === 'morning' && ' — first words'}
                {p.id === 'midday' && ' — next fragment'}
                {p.id === 'afternoon' && ' — third unsealing'}
                {p.id === 'evening' && ' — fourth unsealing'}
                {p.id === 'bedtime' && ' — full verse & reflection'}
              </label>
            ))}
          </fieldset>
          <button type="submit" className="btn gold">
            Send the courier
          </button>
        </form>
      )}
    </section>
  );
}
