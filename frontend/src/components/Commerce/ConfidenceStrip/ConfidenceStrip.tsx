import type { Artwork } from '@/types/artwork';
import './ConfidenceStrip.css';

export function ConfidenceStrip({ artwork }: { artwork: Artwork }) {
  const commerce = artwork.commerce;
  const items = [
    commerce?.signed ? { icon: 'shield', label: 'Authentic', detail: 'Original artwork signed by the artist' } : null,
    commerce?.shipping?.worldwide && commerce.shipping.insured ? { icon: 'truck', label: 'Worldwide shipping', detail: 'Carefully packaged and fully insured' } : null,
    commerce?.certificateIncluded ? { icon: 'medal', label: 'Certificate included', detail: 'Certificate of authenticity included' } : null,
    commerce?.reservationDays ? { icon: 'calendar', label: `${commerce.reservationDays}-day reserve`, detail: 'Reserve this piece risk-free' } : { icon: 'original', label: 'One of a kind', detail: 'A single original artwork exists' },
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (!items.length) return null;
  return (
    <div className="confidence-strip" aria-label="Purchase details">
      {items.map((item) => (
        <div className="confidence-item" key={item.label}>
          <span className="confidence-icon" aria-hidden="true">
            {item.icon === 'shield' && <svg viewBox="0 0 32 32"><path d="M16 3 27 7v8c0 7-4.8 11.5-11 14-6.2-2.5-11-7-11-14V7l11-4Z"/><path d="m11 16 3 3 7-8"/></svg>}
            {item.icon === 'truck' && <svg viewBox="0 0 32 32"><path d="M3 7h17v15H3zM20 12h5l4 5v5h-9z"/><circle cx="9" cy="24" r="2.5"/><circle cx="24" cy="24" r="2.5"/></svg>}
            {item.icon === 'medal' && <svg viewBox="0 0 32 32"><circle cx="16" cy="12" r="7"/><path d="m11 18-2 11 7-4 7 4-2-11M13 12l2 2 4-5"/></svg>}
            {item.icon === 'calendar' && <svg viewBox="0 0 32 32"><rect x="4" y="6" width="24" height="22" rx="2"/><path d="M4 12h24M10 3v6M22 3v6M10 17h3M16 17h3M22 17h1M10 22h3M16 22h3"/></svg>}
            {item.icon === 'original' && <svg viewBox="0 0 32 32"><path d="M16 3 20 11l9 1-6.5 6.2 1.6 8.8L16 23l-8.1 4 1.6-8.8L3 12l9-1 4-8Z"/></svg>}
          </span>
          <span><strong>{item.label}</strong><small>{item.detail}</small></span>
        </div>
      ))}
    </div>
  );
}
