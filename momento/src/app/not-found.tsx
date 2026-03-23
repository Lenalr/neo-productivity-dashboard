import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-stack">
      <section className="hero">
        <div>
          <p className="eyebrow">Not Found</p>
          <h2>This Momento view does not exist.</h2>
          <p>The route may have moved while the internal product shell is being built out.</p>
        </div>
        <div className="panel">
          <div className="button-row">
            <Link href="/" className="button">
              Return to dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
