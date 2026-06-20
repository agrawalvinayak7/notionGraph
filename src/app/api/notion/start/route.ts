import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getNotionAuthorizeUrl } from "@/lib/notion";

// Kicks off the Notion OAuth flow: sets a short-lived CSRF "state" cookie and
// redirects the user to Notion's authorize screen.
export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const state = randomBytes(16).toString("hex");
  const res = NextResponse.redirect(getNotionAuthorizeUrl(state));
  res.cookies.set("notion_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });
  return res;
}
