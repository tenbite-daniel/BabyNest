import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          console.log('Attempting Google sign-in for:', user.email);
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google-signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: user.email, 
              name: user.name,
              googleId: account.providerAccountId 
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Backend response success:', data);
            (user as any).accessToken = data.access_token;
            (user as any).userData = data.user;
            return true;
          } else {
            const errorText = await response.text();
            console.error('Backend error:', response.status, errorText);
            return false;
          }
        } catch (error) {
          console.error('Google sign-in error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if ((user as any)?.accessToken) {
        token.accessToken = (user as any).accessToken;
        token.userData = (user as any).userData;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).user = token.userData || session.user;
      return session;
    },
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/auth/callback`;
    },
  },
});

export { handler as GET, handler as POST };