import { FormEvent, useState } from 'react';
import './ContactPage.css';

export function ContactPage() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); };
  return (
    <div className="contact-page">
      <main className="contact-layout">
        <section className="contact-intro">
          <p className="page-eyebrow">Contact</p>
          <h1>Let’s start a conversation.</h1>
          <p>For artwork enquiries, commissions, exhibitions, and collaborations, send a note using the form.</p>
          <div className="contact-note"><span>Studio enquiries</span><p>Please include the artwork title when asking about a specific piece.</p></div>
        </section>
        {sent ? (
          <section className="contact-success" role="status"><span>Thank you</span><h2>Your message is ready.</h2><p>This demo form has been completed successfully. Connect it to your preferred inbox service to receive submissions.</p><button type="button" className="text-link" onClick={() => setSent(false)}>Send another message</button></section>
        ) : (
          <form className="contact-form" onSubmit={submit}>
            <label>Name<input name="name" autoComplete="name" required /></label>
            <label>Email<input name="email" type="email" autoComplete="email" required /></label>
            <label>Subject<select name="subject" defaultValue="Artwork enquiry"><option>Artwork enquiry</option><option>Commission</option><option>Exhibition or press</option><option>Other</option></select></label>
            <label>Message<textarea name="message" rows={6} required /></label>
            <button className="contact-submit" type="submit">Send enquiry <span>→</span></button>
          </form>
        )}
      </main>
    </div>
  );
}
