import { getOrCreateCurrentUser } from "@/lib/user";

/**
 * Layout for all authenticated app routes (graph, settings, connect).
 * Reaching here means the proxy already required sign-in; we ensure the matching
 * Supabase `users` row exists before rendering any protected page.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getOrCreateCurrentUser();
  return <>{children}</>;
}
