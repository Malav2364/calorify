import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";

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
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
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
            name: user.name
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
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  debug: true,
  secret: process.env.NEXT_SECRET,
};

// Create a base handler
const baseHandler = NextAuth(authOptions);

// Custom handler to wrap NextAuth and provide token response
export async function POST(req) {
  try {
    // Check if this is a credentials login request
    const body = await req.json();
    
    if (body.email && body.password) {
      console.log("Processing login request for:", body.email);
      
      // Find the user
      const user = await prisma.user.findUnique({
        where: { email: body.email }
      });
      
      if (!user) {
        console.log("User not found:", body.email);
        return Response.json({ success: false, message: "Invalid credentials" }, { status: 401 });
      }
      
      // Verify password
      const passwordValid = await compare(body.password, user.hashedPassword);
      
      if (!passwordValid) {
        console.log("Invalid password for:", body.email);
        return Response.json({ success: false, message: "Invalid credentials" }, { status: 401 });
      }
      
      // Generate a token
      const token = jwt.sign(
        { 
          id: user.id,
          email: user.email,
          name: user.name
        },
        process.env.NEXT_SECRET,
        { expiresIn: '7d' }
      );
      
      
      // Return token and user data
      return Response.json({
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      }, { status: 200 });
    }
    
    // If not a credential login, pass to NextAuth
    return baseHandler(req);
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ success: false, message: "An error occurred during login" }, { status: 500 });
  }
}

// For GET requests, use standard NextAuth handler
export const GET = baseHandler;