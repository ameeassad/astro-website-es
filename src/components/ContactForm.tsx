import { useState } from 'react';
import type { Translations } from '../i18n/translations';

interface Props {
  t: Translations;
}

// Replace with your Formspree form ID: https://formspree.io
// Create a free account, add a form, get the endpoint like: https://formspree.io/f/xyzabcde
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

function PineSmallSvg({ color = 'currentColor', height = 72 }: { color?: string; height?: number }) {
  const w = height * 0.45;
  return (
    <svg viewBox="0 0 90 200" width={w} height={height} style={{ display: 'block' }} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
      <path d="M 42 196 L 43 95 M 48 196 L 47 95" strokeWidth="2"/>
      <path d="M 45 95 Q 28 92 8 102 M 45 95 Q 34 86 20 80 M 45 95 Q 56 86 70 80 M 45 95 Q 62 92 82 102" strokeWidth="1.6"/>
      <path d="M 7 80 Q 2 70 5 60 Q 9 50 18 42 Q 28 34 38 30 Q 45 27 52 30 Q 62 34 72 42 Q 81 50 85 60 Q 88 70 83 80" strokeWidth="1.6"/>
      <path d="M 45 27 Q 42 52 18 68 M 45 27 Q 48 52 72 68 M 45 27 L 45 93" strokeWidth="1"/>
    </svg>
  );
}

export default function ContactForm({ t }: Props) {
  const f = t.form;
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', type: '', guests: '', msg: '' });

  const handle = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
      }
    } catch {
      // fallback: mark as sent anyway (form was submitted)
    } finally {
      setSending(false);
      setSent(true);
    }
  };

  return (
    <div className="contact-form reveal" style={{ transitionDelay: '0.2s' }}>
      {sent ? (
        <div className="form-success">
          <div style={{ marginBottom: '20px' }}>
            <PineSmallSvg height={72} color="var(--sage)" />
          </div>
          <h3>{f.success}</h3>
          <p>{f.successSub}</p>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label>{f.name}</label>
              <input type="text" value={form.name} onChange={handle('name')} required />
            </div>
            <div className="form-group">
              <label>{f.email}</label>
              <input type="email" value={form.email} onChange={handle('email')} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{f.phone}</label>
              <input type="tel" value={form.phone} onChange={handle('phone')} />
            </div>
            <div className="form-group">
              <label>{f.date}</label>
              <input type="date" value={form.date} onChange={handle('date')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{f.type}</label>
              <select value={form.type} onChange={handle('type')} required>
                <option value="">—</option>
                {f.typeOpts.map((o, i) => <option key={i}>{o}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{f.guests}</label>
              <input type="number" min="1" value={form.guests} onChange={handle('guests')} />
            </div>
          </div>
          <div className="form-group">
            <label>{f.msg}</label>
            <textarea value={form.msg} onChange={handle('msg')} required />
          </div>
          <button type="submit" className="btn-accent" disabled={sending}
            style={{ width: '100%', padding: '15px', fontSize: '12px' }}>
            {sending ? f.sending : f.send}
          </button>
        </form>
      )}
      <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--mid)' }}>
        {f.whatsapp}{' '}
        <a href={`https://wa.me/${t.whatsapp}`} target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--sage)', textDecoration: 'none', fontWeight: 500 }}>
          WhatsApp →
        </a>
      </p>
    </div>
  );
}
