import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeNotionCode } from "@/lib/notion";
import { encrypt } from "@/lib/crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getOrCreateCurrentUser } from "@/lib/user";

// Notion redirects back here with ?code & ?state. We verify state, exchange the
// code for a token, encrypt + store the connection, then send the user onward.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const back = (reason: string) =>
    NextResponse.redirect(new URL(`/connect?error=${reason}`, req.url));

  if (oauthError) return back(encodeURIComponent(oauthError));
  if (!code || !state) return back("missing_code");

  // CSRF check: the state must match the cookie we set in /api/notion/start.
  const cookieStore = await cookies();
  const savedState = cookieStore.get("notion_oauth_state")?.value;
  if (!savedState || savedState !== state) return back("state_mismatch");

  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/sign-in", req.url));

  try {
    const token = await exchangeNotionCode(code);

    // One active connection per user (v1): replace any existing one.
    await supabaseAdmin
      .from("notion_connections")
      .delete()
      .eq("user_id", user.id);

    const { error: dbError } = await supabaseAdmin
      .from("notion_connections")
      .insert({
        user_id: user.id,
        access_token_encrypted: encrypt(token.access_token),
        workspace_id: token.workspace_id,
        workspace_name: token.workspace_name ?? null,
        bot_id: token.bot_id ?? null,
      });
    if (dbError) throw new Error(dbError.message);
  } catch (err) {
    console.error("Notion connect failed:", err);
    return back("exchange_failed");
  }

  const res = NextResponse.redirect(new URL("/graph?connected=1", req.url));
  res.cookies.delete("notion_oauth_state");
  return res;
}
