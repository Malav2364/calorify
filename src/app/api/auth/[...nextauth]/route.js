import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }
        
        try {
          // Get the complete user object including height, weight and gender
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              hashedPassword: true,
              height: true,
              weight: true,
              gender: true
            }
          });
  
          if (!user || !user.hashedPassword) {
            console.log("User not found or missing password", credentials.email);
            return null;
          }
  
          const passwordMatch = await compare(credentials.password, user.hashedPassword);
  
          if (!passwordMatch) {
            console.log("Password did not match");
            return null;
          }
  
          console.log("Login successful for user:", user.email);
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            height: user.height || null,
            weight: user.weight || null,
            gender: user.gender || null
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.height = user.height;
        token.weight = user.weight;
        token.gender = user.gender;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          name: token.name,
          email: token.email,
          height: token.height,
          weight: token.weight,
          gender: token.gender
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV !== "development"
      }
    }
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET || process.env.NEXT_SECRET,
};

// Create the handler using the updated NextAuth import
const handler = NextAuth(authOptions);

// Export the handler
export { handler as GET, handler as POST };