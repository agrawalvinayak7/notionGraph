import "server-only";
import { z } from "zod";

const NOTION_OAUTH_BASE = "https://api.notion.com/v1/oauth";

/** Build the Notion "authorize" URL the user is redirected to. */
export function getNotionAuthorizeUrl(state: string): string {
  const clientId = process.env.NOTION_CLIENT_ID;
  const redirectUri = process.env.NOTION_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    throw new Error("Missing NOTION_CLIENT_ID or NOTION_REDIRECT_URI");
  }
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    owner: "user",
    redirect_uri: redirectUri,
    state,
  });
  return `${NOTION_OAUTH_BASE}/authorize?${params.toString()}`;
}

// Notion's token response — validated, since we never trust external data (RULES §3).
const tokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string().optional(),
  bot_id: z.string().optional(),
  workspace_id: z.string(),
  workspace_name: z.string().nullable().optional(),
  workspace_icon: z.string().nullable().optional(),
});
export type NotionTokenResponse = z.infer<typeof tokenResponseSchema>;

/** Exchange an OAuth `code` for a Notion access token. */
export async function exchangeNotionCode(
  code: string,
): Promise<NotionTokenResponse> {
  const clientId = process.env.NOTION_CLIENT_ID;
  const clientSecret = process.env.NOTION_CLIENT_SECRET;
  const redirectUri = process.env.NOTION_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Missing Notion OAuth env vars");
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const res = await fetch(`${NOTION_OAUTH_BASE}/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Notion token exchange failed (${res.status}): ${detail}`);
  }

  return tokenResponseSchema.parse(await res.json());
}
