import "./PolicyPage.css";
import artworkDetail from "@/assets/contact-artwork-detail.webp";

interface PolicyPageProps {
  variant: "shipping" | "returns";
  onBack: () => void;
  onContact: () => void;
}

type PolicyIconName =
  | "package"
  | "delivery"
  | "world"
  | "return"
  | "shield"
  | "photo";

function PolicyIcon({ name }: { name: PolicyIconName }) {
  const paths = {
    package: (
      <>
        <path d="m4 7 8-4 8 4-8 4-8-4Z" />
        <path d="M4 7v10l8 4 8-4V7M12 11v10M8 5l8 4" />
      </>
    ),
    delivery: (
      <>
        <path d="M3 6h11v11H3zM14 10h4l3 4v3h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    world: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.4 2.5 3.5 5.5 3.5 9S14.4 18.5 12 21M12 3C9.6 5.5 8.5 8.5 8.5 12s1.1 6.5 3.5 9" />
      </>
    ),
    return: (
      <>
        <path d="m8 7-5 5 5 5" />
        <path d="M4 12h10a6 6 0 0 1 6 6v1" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v5c0 4.7 2.8 8 7 10 4.2-2 7-5.3 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-5" />
      </>
    ),
    photo: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="1" />
        <circle cx="9" cy="10" r="2" />
        <path d="m5 17 4-4 3 3 3-3 4 4" />
      </>
    ),
  } satisfies Record<PolicyIconName, React.ReactNode>;

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

const content = {
  shipping: {
    eyebrow: "Shipping",
    title: "Art, delivered with care.",
    intro:
      "Every artwork is prepared in the studio and entrusted to an insured, trackable delivery service.",
    sections: [
      [
        "package",
        "Preparation",
        "Works are carefully wrapped using archival and protective materials. Please allow 3–5 business days for preparation before dispatch.",
      ],
      [
        "delivery",
        "Delivery",
        "Delivery timing and cost depend on the artwork, destination, and any framing requirements. A tailored quote is confirmed before your order is finalised.",
      ],
      [
        "world",
        "International orders",
        "International delivery is available. Import duties or local taxes, where applicable, are the responsibility of the recipient.",
      ],
    ],
    note: "Need a delivery estimate for a particular work?",
  },
  returns: {
    eyebrow: "Returns",
    title: "Buy with confidence.",
    intro:
      "We want every work to feel at home in your space. If something is not right, please get in touch promptly.",
    sections: [
      [
        "return",
        "Starting a return",
        "Contact the studio within 14 days of delivery. The artwork must be returned in its original condition and protective packaging.",
      ],
      [
        "shield",
        "Return delivery",
        "Return shipping and insurance are arranged with the studio to make sure the work travels safely. Costs are normally the responsibility of the buyer.",
      ],
      [
        "photo",
        "Damaged artwork",
        "If a work arrives damaged, photograph the artwork and packaging and contact us within 48 hours so we can resolve it with the courier.",
      ],
    ],
    note: "Have a question about an order or return?",
  },
} as const;

export function PolicyPage({ variant, onBack, onContact }: PolicyPageProps) {
  const page = content[variant];

  return (
    <div className={`policy-page policy-page-${variant}`}>
      <button type="button" className="policy-back" onClick={onBack}>
        <span aria-hidden="true">←</span> Back to cart
      </button>
      <main className="policy-layout">
        <header className="policy-heading">
          <p className="page-eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
          <figure className="policy-artwork">
            <img
              src={artworkDetail}
              alt="Textural detail of an abstract artwork in warm neutral tones"
            />
          </figure>
        </header>
        <div className="policy-sections">
          {page.sections.map(([icon, heading, body]) => (
            <section key={heading}>
              <span className="policy-icon">
                <PolicyIcon name={icon as PolicyIconName} />
              </span>
              <div>
                <h2>{heading}</h2>
                <p>{body}</p>
              </div>
            </section>
          ))}
          <aside>
            <p>{page.note}</p>
            <button type="button" onClick={onContact}>
              Contact the studio <span aria-hidden="true">→</span>
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}
