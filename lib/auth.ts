import NextAuth, { CredentialsSignin } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "./mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";

class PendingError extends CredentialsSignin {
  code = "PENDING";
}

class RejectError extends CredentialsSignin {
  code = "REJECT";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  
  providers: [
    CredentialsProvider({
      name: "Credentials",
      
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();

        const user = await User.findOne({ email: credentials.email });

        if (!user) return null;
        
        const profile = await Profile.findOne({ user_id: user._id });

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        
        if (!isValid) return null;

        if (user.status === "pending") {
          throw new PendingError();
        }
        if (user.status === "reject") {
          throw new RejectError();
        }

        return {
          id:    user._id.toString(),
          name:  profile?.name ?? null,
          email: user.email,
          role:  user.role,
          image: profile?.image ?? null,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as any).role;
        token.name = user.name;
        token.image = user.image;
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image !== undefined) token.image = session.image;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id   = token.id   as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string | null;
        session.user.image = token.image as string | null;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login", 
  },
  
  session: { 
    strategy: "jwt" 
  },
});