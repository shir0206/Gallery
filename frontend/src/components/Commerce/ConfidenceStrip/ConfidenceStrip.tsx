import type { Artwork } from '@/types/artwork';
import './ConfidenceStrip.css';

const Shield=()=> <svg viewBox="0 0 32 32"><path d="M16 3 27 7v8c0 7-4.8 11.5-11 14-6.2-2.5-11-7-11-14V7l11-4Z"/><path d="m11 16 3 3 7-8"/></svg>;
const Document=()=> <svg viewBox="0 0 32 32"><path d="M7 3h14l5 5v21H7zM21 3v6h5M11 15h11M11 20h11M11 25h7"/></svg>;
const Truck=()=> <svg viewBox="0 0 32 32"><path d="M3 7h17v15H3zM20 12h5l4 5v5h-9z"/><circle cx="9" cy="24" r="2.5"/><circle cx="24" cy="24" r="2.5"/></svg>;
const Diamond=()=> <svg viewBox="0 0 32 32"><path d="m3 11 6-7h14l6 7-13 18L3 11Z"/><path d="M3 11h26M9 4l7 25M23 4l-7 25M9 4l4 7 3-7 3 7 4-7"/></svg>;

export function ConfidenceStrip({ artwork }: { artwork: Artwork }) {
  const commerce=artwork.commerce;
  const items=[
    commerce?.signed?{label:'Signed original',icon:<Shield/>}:null,
    commerce?.certificateIncluded?{label:'Certificate of authenticity',icon:<Document/>}:null,
    commerce?.shipping?.worldwide?{label:'Worldwide shipping',icon:<Truck/>}:null,
    {label:'One of one',icon:<Diamond/>},
  ].filter((item):item is NonNullable<typeof item>=>Boolean(item));
  return <div className="confidence-strip" aria-label="Collector benefits">{items.map(item=><div className="confidence-item" key={item.label}><span className="confidence-icon" aria-hidden="true">{item.icon}</span><span className="confidence-label">{item.label}</span></div>)}</div>;
}
