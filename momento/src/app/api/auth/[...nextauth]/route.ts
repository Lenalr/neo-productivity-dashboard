import NextAuth, { type NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { isAllowedCompanyEmail, isMicrosoftAuthConfigured } from "@/lib/auth";

const providers = isMicrosoftAuthConfigured()
  ? [
      AzureADProvider({
        clientId: process.env.AZURE_AD_CLIENT_ID ?? "",
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? "",
        tenantId: process.env.AZURE_AD_TENANT_ID ?? "",
      }),
    ]
  : [];

export const authOptions: NextAuthOptions = {
  providers,
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async signIn({ profile, user }) {
      const email =
        typeof profile?.email === "string"
          ? profile.email
          : typeof user.email === "string"
            ? user.email
            : null;

      return isAllowedCompanyEmail(email);
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
