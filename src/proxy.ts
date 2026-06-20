import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that require the user to be signed in. Everything else (landing,
// sign-in/up) stays public. See docs/USER_FLOW.md.
const isProtectedRoute = createRouteMatcher([
  "/graph(.*)",
  "/settings(.*)",
  "/connect(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Run on everything except Next.js internals and static files...
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|gif|png|svg|ico|webp|woff2?|ttf|map)).*)",
    // ...and always run on API routes.
    "/(api|trpc)(.*)",
  ],
};
