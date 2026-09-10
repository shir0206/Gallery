import { FormEvent, useState } from "react";
import artworkDetail from "@/assets/contact-artwork-detail.webp";
import "./ContactPage.css";

export function ContactPage() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };
  return (
    <div className="contact-page">
      <main className="contact-layout">
        <section className="contact-intro">
          <p className="page-eyebrow">Contact</p>
          <h1>Let’s start a conversation.</h1>
          <p className="contact-lede">
            For artwork enquiries, commissions, and collaborations.
          </p>

          <figure className="contact-artwork">
            <img
              src={artworkDetail}
              alt="Textural detail of an abstract artwork in warm neutral tones"
            />
          </figure>

          <div className="contact-note">
            <span>
              Artwork enquiries <i>·</i> Commissions <i>·</i> Collaborations
            </span>
          </div>
        </section>
        {sent ? (
          <section className="contact-success" role="status">
            <span>Thank you</span>
            <h2>Your message is ready.</h2>
            <p>
              This demo form has been completed successfully. Connect it to your
              preferred inbox service to receive submissions.
            </p>
            <button
              type="button"
              className="text-link"
              onClick={() => setSent(false)}
            >
              Send another message
            </button>
          </section>
        ) : (
          <form className="contact-form" onSubmit={submit}>
            <div className="contact-fields-row">
              <label>
                Name
                <input
                  name="name"
                  autoComplete="name"
                  placeholder="Your name"
                  required
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  required
                />
              </label>
            </div>
            <label className="contact-select">
              Subject
              <select name="subject" defaultValue="Artwork enquiry">
                <option>Artwork enquiry</option>
                <option>Commission</option>
                <option>Exhibition or press</option>
                <option>Other</option>
              </select>
              <span aria-hidden="true" />
            </label>
            <label>
              Message
              <textarea
                name="message"
                rows={5}
                placeholder="Tell me about the artwork or project you have in mind…"
                required
              />
            </label>
            <button className="contact-submit" type="submit">
              <span>Send enquiry</span>
              <i aria-hidden="true">→</i>
            </button>
            <p className="contact-enquiry">
              For enquiries about a specific work, please include the artwork
              title.
            </p>
          </form>
        )}
      </main>
    </div>
  );
}
