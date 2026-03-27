import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { isMicrosoftAuthConfigured } from "@/lib/auth";

export default function SignInPage() {
  const configured = isMicrosoftAuthConfigured();

  return (
    <div className="page-stack">
      <section className="hero">
        <div>
          <p className="eyebrow">Access Control</p>
          <h2>Microsoft sign-in for NeoTechie only.</h2>
          <p>
          Momento is prepared for Microsoft / Entra ID access control. Only verified team members with{" "}
            <code style={{ fontFamily: "monospace", opacity: 0.85 }}>@neotechie.in</code>{" "}
            addresses should be allowed into the production workspace.
          </p>
        </div>
        <div className="panel">
          <div className="section-header">
            <strong>Current setup state</strong>
            <StatusBadge label={configured ? "Configured" : "Needs env setup"} tone={configured ? "good" : "warn"} />
          </div>
          <p className="muted">
            {configured
              ? "Authentication environment variables are present. NextAuth route is ready for Microsoft sign-in."
              : "Add NEXTAUTH_URL, NEXTAUTH_SECRET, AZURE_AD_CLIENT_ID, AZURE_AD_CLIENT_SECRET, and AZURE_AD_TENANT_ID to enable login."}
          </p>
          <div className="button-row" style={{ marginTop: 18 }}>
            <Link href="/" className="button">
              Back to dashboard
            </Link>
            <Link className="button-secondary" href="/api/auth/signin">
              Open sign-in route
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
