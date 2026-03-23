export function isMicrosoftAuthConfigured() {
  return Boolean(
    process.env.NEXTAUTH_URL &&
      process.env.NEXTAUTH_SECRET &&
      process.env.AZURE_AD_CLIENT_ID &&
      process.env.AZURE_AD_CLIENT_SECRET &&
      process.env.AZURE_AD_TENANT_ID,
  );
}

export function isAllowedCompanyEmail(email?: string | null) {
  return Boolean(email && email.toLowerCase().endsWith("@neotechie.in"));
}
