import type { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { cookies } from 'next/headers';
import { generateToken, isAdminEmail } from '@/lib/auth';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email;
      if (!email || !isAdminEmail(email)) {
        return '/login/admin?error=unauthorized_google';
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === 'google' && profile?.email && isAdminEmail(profile.email)) {
        const authToken = generateToken({
          userId: 0,
          email: profile.email,
          role: 'ADMIN',
        });

        token.authToken = authToken;
        token.role = 'ADMIN';
        token.email = profile.email;

        const cookieStore = await cookies();
        cookieStore.set('auth-token', authToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        });
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.email) {
        session.user = {
          ...session.user,
          email: String(token.email),
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.includes('/login/admin?error=')) {
        return url.startsWith('http') ? url : `${baseUrl}${url}`;
      }

      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/admin/dashboard`;
    },
  },
  pages: {
    signIn: '/login/admin',
    error: '/login/admin',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};
