import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { initializeUser } from "@/lib/user";
import { migrateAnonData } from "@/data/storage";

const STORAGE_KEY = "therapy_user_id";

// The BrowserRouter basename — must match App.tsx <BrowserRouter basename="/quit">
const BASENAME = "/quit";

// Returns user id only if it looks like a real numeric ID (4-8 digits), not a UUID
const isRealUserId = (id: string | null): boolean => {
  if (!id) return false;
  // Real user IDs are numeric, 4-8 digits. UUIDs contain hyphens and are 36 chars.
  return /^\d{4,8}$/.test(id.trim());
};

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  // -----------------------------------------------------------------------
  // Bug fix #2: strip stale auth params from URL for already-authenticated users.
  // This runs on every URL change and handles the case where a logged-in user
  // visits a URL that still carries a token= param.
  // -----------------------------------------------------------------------
  useEffect(() => {
    const savedUserId = localStorage.getItem(STORAGE_KEY);
    if (!isRealUserId(savedUserId)) return; // Not authenticated yet — main flow handles it

    const urlParams = new URLSearchParams(window.location.search);
    const hasAuthParams =
      urlParams.has("token") || urlParams.has("userId") || urlParams.has("user_id");
    if (!hasAuthParams) return;

    urlParams.delete("token");
    urlParams.delete("userId");
    urlParams.delete("user_id");
    const cleanSearch = urlParams.toString();
    const newUrl = location.pathname + (cleanSearch ? `?${cleanSearch}` : "");
    console.log("[Auth] Already logged in — stripping auth params from URL:", newUrl);
    navigate(newUrl, { replace: true });
  }, [location.search]); // eslint-disable-line react-hooks/exhaustive-deps

  // -----------------------------------------------------------------------
  // Main auth flow: runs once on mount.
  // -----------------------------------------------------------------------
  useEffect(() => {
    const checkAuth = async () => {
      // 1. Already have a real user ID saved? — just render (fast path)
      const savedUserId = localStorage.getItem(STORAGE_KEY);
      if (isRealUserId(savedUserId)) {
        setIsReady(true);
        return;
      }

      // 2. Check URL for incoming credentials from the auth portal
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const urlUserId = urlParams.get("userId") || urlParams.get("user_id");

      if (token || urlUserId) {
        // 3a. Auth portal sent a real userId directly
        if (isRealUserId(urlUserId)) {
          console.log(`[Auth] Real userId received from URL: ${urlUserId}`);
          localStorage.setItem(STORAGE_KEY, urlUserId!);
          await migrateAnonData(urlUserId!);
          await initializeUser(urlUserId!);
          setIsReady(true);
          restoreAndNavigate(urlParams, navigate);
          return;
        }

        // 3b. Exchange the token for the real user_id via the Mantra API
        if (token) {
          try {
            console.log("[Auth] Exchanging token for real user_id...");
            const resp = await fetch("https://api.mantracare.com/user/user-info", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            });

            if (resp.ok) {
              const data = await resp.json();
              const userId = data.user_id?.toString() || data.id?.toString();
              if (userId) {
                console.log(`[Auth] Real user_id from API: ${userId}`);
                localStorage.setItem(STORAGE_KEY, userId);
                await migrateAnonData(userId);
                await initializeUser(userId);
                setIsReady(true);
                restoreAndNavigate(urlParams, navigate);
                return;
              }
            }
          } catch (err) {
            // CORS or network error — log and fall through to 3c
            console.warn("[Auth] API exchange failed (likely CORS):", err);
          }
        }

        // 3c. Last resort: save whatever we have so the user isn't stuck
        const fallback = urlUserId || token!;
        console.warn(`[Auth] Falling back to token as ID: ${fallback}`);
        localStorage.setItem(STORAGE_KEY, fallback);
        await migrateAnonData(fallback);
        await initializeUser(fallback);
        setIsReady(true);
        restoreAndNavigate(urlParams, navigate);
        return;
      }

      // 4. No credentials anywhere — redirect to auth portal
      const lastRedirect = sessionStorage.getItem("auth_last_redirect");
      const now = Date.now();
      if (lastRedirect && now - parseInt(lastRedirect) < 5000) {
        console.error("[Auth] Redirect loop detected. Stopping.");
        document.body.innerHTML =
          "<div style='padding:40px;text-align:center;'><h3>Authentication Error</h3><p>Please close this tab and try again from the app.</p></div>";
        return;
      }

      sessionStorage.setItem("auth_last_redirect", now.toString());

      // -------------------------------------------------------------------
      // Bug fix #1: save the current path (as given by React Router, which is
      // already relative to the /quit basename) so we can return here after auth.
      // Example: location.pathname on /quit/alcohol = "/alcohol"
      // -------------------------------------------------------------------
      const pathToRestore = location.pathname + location.search;
      sessionStorage.setItem("redirect_path", pathToRestore);

      // Build the return URL pointing back at the current full page URL
      // (the auth portal will append ?token=... to this URL after login)
      const returnUrl = new URL(window.location.href);
      returnUrl.searchParams.delete("token"); // don't loop tokens

      console.log(`[Auth] No session. Redirecting to auth portal. Will restore: ${pathToRestore}`);
      window.location.href = `https://web.mantracare.com/app/quit?redirect_url=${encodeURIComponent(
        returnUrl.toString()
      )}`;
    };

    checkAuth();
  }, []); // Run ONLY once on mount

  if (!isReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
};

// ---------------------------------------------------------------------------
// restoreAndNavigate
//
// After successful authentication, navigate the user back to the page they
// originally requested.
//
// Key insight: sessionStorage["redirect_path"] is stored as React Router's
// `location.pathname` which is ALREADY relative to the basename (/quit).
// e.g. the user visited /quit/alcohol → location.pathname = "/alcohol"
//
// We must NOT pass "/quit/alcohol" to navigate() or it resolves to
// /quit/quit/alcohol. We use the router-relative path directly.
// ---------------------------------------------------------------------------
function restoreAndNavigate(
  urlParams: URLSearchParams,
  navigate: ReturnType<typeof useNavigate>
) {
  // sessionStorage["redirect_path"] is only reliable within the same domain.
  // When the user goes:  web.mantracare.com → auth portal → platform.mantracare.com/quit/alcohol?token=...
  // the sessionStorage set on web.mantracare.com is NOT accessible here.
  //
  // However, the auth portal appends the token to the SAME return URL we gave it,
  // so window.location.pathname already contains the correct destination
  // (e.g. /quit/alcohol). We use that as the primary source of truth.

  // Current pathname is e.g. "/quit/alcohol" (window) or "/alcohol" (router-relative).
  // Strip the basename so we get a router-relative path.
  let routerPath = window.location.pathname;
  if (routerPath.startsWith(BASENAME + "/")) {
    routerPath = routerPath.slice(BASENAME.length); // "/quit/alcohol" → "/alcohol"
  } else if (routerPath === BASENAME || routerPath === BASENAME + "/") {
    // We're on the bare /quit root — check sessionStorage for a deeper path
    const savedPath = sessionStorage.getItem("redirect_path") || "/";
    routerPath = savedPath;
    if (routerPath.startsWith(BASENAME + "/")) {
      routerPath = routerPath.slice(BASENAME.length);
    } else if (routerPath === BASENAME) {
      routerPath = "/";
    }
  }
  sessionStorage.removeItem("redirect_path");

  // Strip auth params from the remaining query string
  urlParams.delete("token");
  urlParams.delete("userId");
  urlParams.delete("user_id");
  const remainingSearch = urlParams.toString();

  const targetPath =
    (routerPath.startsWith("/") ? routerPath : "/" + routerPath) +
    (remainingSearch ? `?${remainingSearch}` : "");

  console.log(`[Auth] Restoring navigation to: ${targetPath}`);
  navigate(targetPath, { replace: true });
}
