import "next-auth/jwt";
import { type DefaultSession } from "next-auth";

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    name: string;
    error?: string;
    token: string;
  }
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    token: string | null;
    name: string;
    role: string;
    error?: string;
  }
}
