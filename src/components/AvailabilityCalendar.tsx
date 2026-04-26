import { useState } from 'react';
import type { Lang } from '../i18n/translations';

interface Props {
  lang: Lang;
  propertyId?: string;
}

// Replace with real Lodgify property ID once available
const LODGIFY_PROPERTY_ID = 'YOUR_PROPERTY_ID';

// Hardcoded demo booked ranges — replace with Lodgify API data
const BOOKED_RANGES: [string, string][] = [
  ['2026-05-03', '2026-05-10'],
  ['2026-05-18', '2026-05-25'],
  ['2026-06-07', '2026-06-21'],
  ['2026-07-01', '2026-07-20'],
  ['2026-07-26', '2026-08-10'],
  ['2026-08-20', '2026-09-05'],
];

function isBooked(date: Date): boolean {
  const d = date.getTime();
  return BOOKED_RANGES.some(
    ([s, e]) => d >= new Date(s).getTime() && d <= new Date(e).getTime()
  );
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function inRange(d: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const [lo, hi] = start <= end ? [start, end] : [end, start];
  return d > lo && d < hi;
}

const DAY_NAMES = {
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  es: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'],
  ca: ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'],
};

const MONTH_NAMES = {
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  ca: ['Gener','Febrer','Març','Abril','Maig','Juny','Juliol','Agost','Setembre','Octubre','Novembre','Desembre'],
};

const LABELS = {
  en: { ci: 'Check-in', co: 'Check-out', nights: 'nights', clear: 'Clear dates', btn: 'Continue to booking', note: 'Indicative only — confirm on booking', avail: 'Available', booked: 'Booked' },
  es: { ci: 'Entrada', co: 'Salida', nights: 'noches', clear: 'Borrar fechas', btn: 'Continuar reserva', note: 'Orientativo — confirmar al reservar', avail: 'Disponible', booked: 'Reservado' },
  ca: { ci: 'Entrada', co: 'Sortida', nights: 'nits', clear: 'Esborrar dates', btn: 'Continuar reserva', note: 'Orientatiu — confirmar en reservar', avail: 'Disponible', booked: 'Reservat' },
};

interface MonthProps {
  year: number;
  month: number;
  checkIn: Date | null;
  checkOut: Date | null;
  hovered: Date | null;
  onDay: (d: Date) => void;
  onHover: (d: Date | null) => void;
  lang: Lang;
}

function CalendarMonth({ year, month, checkIn, checkOut, hovered, onDay, onHover, lang }: MonthProps) {
  const dayNames = DAY_NAMES[lang];
  const monthNames = MONTH_NAMES[lang];
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div style={{ flex: '1 1 260px', minWidth: '240px' }}>
      <div style={{ fontFamily: 'var(--serif)', fontSize: '16px', fontWeight: 500, letterSpacing: '0.04em', marginBottom: '14px', color: 'var(--dark)', textAlign: 'center' }}>
        {monthNames[month]} {year}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '1px', marginBottom: '4px' }}>
        {dayNames.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '9.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', padding: '3px 0' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px' }}>
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`} />;
          const booked = isBooked(date);
          const past = date < today;
          const isCI = checkIn && isSameDay(date, checkIn);
          const isCO = checkOut && isSameDay(date, checkOut);
          const isHov = hovered && !checkOut && isSameDay(date, hovered);
          const inSel = inRange(date, checkIn, checkOut || hovered);
          const disabled = booked || past;

          let bg = 'transparent';
          let color = disabled ? 'var(--light)' : 'var(--dark)';
          let border = '1px solid transparent';
          let fontWeight = '300';
          const cursor = disabled ? 'default' : 'pointer';

          if (booked) { bg = '#f0e8e0'; color = '#d4c0b0'; }
          if (isCI || isCO) { bg = 'var(--accent)'; color = 'white'; fontWeight = '500'; }
          if (inSel && !disabled) { bg = 'rgba(155,107,74,0.1)'; }
          if (isHov && !disabled) { border = '1px solid var(--accent)'; }

          return (
            <div
              key={date.toISOString()}
              onClick={() => !disabled && onDay(date)}
              onMouseEnter={() => !disabled && onHover(date)}
              onMouseLeave={() => onHover(null)}
              style={{ textAlign: 'center', padding: '7px 2px', fontSize: '13px', background: bg, color, border, cursor, fontWeight, transition: 'background 0.12s', userSelect: 'none', position: 'relative' }}
            >
              {booked && <span style={{ position: 'absolute', bottom: '3px', left: '50%', transform: 'translateX(-50%)', width: '3px', height: '3px', borderRadius: '50%', background: '#c8b0a0', display: 'block' }} />}
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AvailabilityCalendar({ lang }: Props) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [hovered, setHovered] = useState<Date | null>(null);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const month2 = viewMonth === 11 ? 0 : viewMonth + 1;
  const year2 = viewMonth === 11 ? viewYear + 1 : viewYear;

  const handleDay = (date: Date) => {
    if (!checkIn || (checkIn && checkOut)) { setCheckIn(date); setCheckOut(null); return; }
    if (date <= checkIn) { setCheckIn(date); setCheckOut(null); return; }
    let d = new Date(checkIn); d.setDate(d.getDate() + 1);
    while (d < date) {
      if (isBooked(d)) { setCheckIn(date); setCheckOut(null); return; }
      d.setDate(d.getDate() + 1);
    }
    setCheckOut(date);
  };

  const nights = checkIn && checkOut ? Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const fmt = (d: Date | null) => d ? d.toLocaleDateString(lang === 'en' ? 'en-GB' : lang === 'es' ? 'es-ES' : 'ca-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const checkoutUrl = `https://checkout.lodgify.com/en/finca-matriz/${LODGIFY_PROPERTY_ID}/reservation?currency=EUR${checkIn ? `&checkInDate=${checkIn.toISOString().split('T')[0]}` : ''}${checkOut ? `&checkOutDate=${checkOut.toISOString().split('T')[0]}` : ''}`;

  const L = LABELS[lang];

  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--bg3)', padding: '36px 40px' }}>
      {/* Navigation row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <button onClick={prevMonth} style={{ background: 'none', border: '1px solid var(--bg3)', padding: '6px 16px', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--mid)' }}>←</button>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {checkIn && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '2px' }}>{L.ci}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--dark)', fontStyle: 'italic' }}>{fmt(checkIn)}</div>
            </div>
          )}
          {checkIn && checkOut && (
            <>
              <div style={{ color: 'var(--light)', fontSize: '18px' }}>→</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '2px' }}>{L.co}</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--dark)', fontStyle: 'italic' }}>{fmt(checkOut)}</div>
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '14px', color: 'var(--accent)', fontStyle: 'italic' }}>{nights} {L.nights}</div>
            </>
          )}
        </div>
        <button onClick={nextMonth} style={{ background: 'none', border: '1px solid var(--bg3)', padding: '6px 16px', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--mid)' }}>→</button>
      </div>

      {/* Two-month grid */}
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        <CalendarMonth year={viewYear} month={viewMonth} checkIn={checkIn} checkOut={checkOut} hovered={hovered} onDay={handleDay} onHover={setHovered} lang={lang} />
        <CalendarMonth year={year2} month={month2} checkIn={checkIn} checkOut={checkOut} hovered={hovered} onDay={handleDay} onHover={setHovered} lang={lang} />
      </div>

      {/* Footer */}
      <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--bg3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', background: 'var(--bg)', border: '1px solid var(--bg3)' }} />
            <span style={{ fontSize: '11px', color: 'var(--mid)', letterSpacing: '0.06em' }}>{L.avail}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', background: '#f0e8e0', position: 'relative' }}>
              <span style={{ position: 'absolute', bottom: '1px', left: '50%', transform: 'translateX(-50%)', width: '3px', height: '3px', borderRadius: '50%', background: '#c8b0a0', display: 'block' }} />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--mid)', letterSpacing: '0.06em' }}>{L.booked}</span>
          </div>
          {checkIn && (
            <button onClick={() => { setCheckIn(null); setCheckOut(null); }} style={{ background: 'none', border: 'none', fontSize: '11px', color: 'var(--mid)', cursor: 'pointer', letterSpacing: '0.06em', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              {L.clear}
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
          <a
            href={checkIn && checkOut ? checkoutUrl : '#'}
            onClick={e => { if (!checkIn || !checkOut) e.preventDefault(); }}
            target={checkIn && checkOut ? '_blank' : undefined}
            rel="noopener noreferrer"
            style={{ background: checkIn && checkOut ? 'var(--accent)' : 'var(--bg3)', color: checkIn && checkOut ? 'white' : 'var(--mid)', padding: '11px 28px', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', fontFamily: 'var(--sans)', transition: 'background 0.2s', cursor: checkIn && checkOut ? 'pointer' : 'default' }}>
            {L.btn}
          </a>
          <span style={{ fontSize: '10px', color: 'var(--light)', letterSpacing: '0.04em' }}>{L.note}</span>
        </div>
      </div>
    </div>
  );
}
