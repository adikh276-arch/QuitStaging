import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { initializeUser } from "@/lib/user";
import { migrateAnonData } from "@/data/storage";
import { analytics } from "@/lib/analytics";

const STORAGE_KEY = "therapy_user_id";
const REDIRECT_PATH_KEY = "quit_redirect_path"; // localStorage key — survives cross-domain redirects

// Returns user id only if it looks like a real numeric ID (4-8 digits), not a UUID
const isRealUserId = (id: string | null): boolean => {
  if (!id || id === "anon") return false;
  const trimmed = id.trim();
  // Allow numeric IDs (4-8 digits) OR UUIDs (standard 36-char format)
  return /^\d{4,8}$/.test(trimmed) || 
         /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);
};

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const isAuthenticating = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[AuthGuard] Component mounted');
  }, []);

  // -----------------------------------------------------------------------
  // Strip stale auth params from URL for ALREADY-AUTHENTICATED users.
  // e.g. user is logged in but visits a URL with ?token= still in it.
  // -----------------------------------------------------------------------
  useEffect(() => {
    const savedUserId = localStorage.getItem(STORAGE_KEY);
    if (!isRealUserId(savedUserId)) return;

    const urlParams = new URLSearchParams(window.location.search);
    const hasAuthParams =
      urlParams.has("token") || urlParams.has("userId") || urlParams.has("user_id");
    if (!hasAuthParams) return;

    urlParams.delete("token");
    urlParams.delete("userId");
    urlParams.delete("user_id");
    const cleanSearch = urlParams.toString();
    navigate(location.pathname + (cleanSearch ? `?${cleanSearch}` : ""), { replace: true });
  }, [location.search]); // eslint-disable-line react-hooks/exhaustive-deps

  // -----------------------------------------------------------------------
  // Main auth flow — runs ONCE on mount.
  //
  // Flow:
  //   A) User visits /quit/alcohol (unauthenticated)
  //      → save "/alcohol" to localStorage
  //      → redirect to auth portal with redirect_url = platform.mantracare.com/quit
  //
  //   B) Auth portal authenticates, redirects to platform.mantracare.com/quit?token=...
  //      → we see the token, exchange it for user_id
  //      → read saved path "/alcohol" from localStorage
  //      → navigate to "/alcohol"
  //
  //   KEY: localStorage persists across the domain redirect (same platform.mantracare.com domain).
  //        sessionStorage does NOT survive navigation away from the page.
  // -----------------------------------------------------------------------
  useEffect(() => {
    const checkAuth = async () => {
      console.log('[AuthGuard] checkAuth function starting...');
      if (isAuthenticating.current) {
        console.log('[AuthGuard] Already authenticating, skipping...');
        return;
      }
      isAuthenticating.current = true;

      // 1. Already authenticated — just render
      const savedUserId = localStorage.getItem(STORAGE_KEY);
      console.log('[AuthGuard] Saved userId in localStorage:', savedUserId);
      if (isRealUserId(savedUserId)) {
        console.log('[AuthGuard] Valid user session found, identifying and tracking...');
        analytics.identifyUser(savedUserId!);
        analytics.trackSessionStarted({ is_returning_user: true, language: navigator.language });
        setIsReady(true);
        console.log('[AuthGuard] Set isReady to true (session found)');
        return;
      }

      // 2. Check for auth credentials in the URL (returning from auth portal)
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const urlUserId = urlParams.get("userId") || urlParams.get("user_id");
      console.log('[AuthGuard] URL Params - token:', token ? 'exists' : 'missing', 'userId:', urlUserId);

      if (token || urlUserId) {
        // 3a. Auth portal sent a real userId directly — use it immediately
        if (isRealUserId(urlUserId)) {
          console.log(`[Auth] userId received from URL: ${urlUserId}`);
          localStorage.setItem(STORAGE_KEY, urlUserId!);
          await migrateAnonData(urlUserId!);
          await initializeUser(urlUserId!);
          analytics.identifyUser(urlUserId!);
          analytics.trackSessionStarted({ is_returning_user: false, language: navigator.language });
          setIsReady(true);
          restoreAndNavigate(navigate, location.pathname);
          return;
        }

        // 3b. Exchange the token for the real user_id via the Mantra API
        if (token) {
          try {
            console.log("[Auth] Exchanging token for user_id...");
            const resp = await fetch("https://staging.mantracare.com/user/user-info", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            });

            if (resp.ok) {
              const data = await resp.json();
              const userId = data.user_id?.toString() || data.id?.toString();
              if (userId) {
                console.log(`[Auth] user_id from API: ${userId}`);
                localStorage.setItem(STORAGE_KEY, userId);
                await migrateAnonData(userId);
                await initializeUser(userId);
                analytics.identifyUser(userId);
                analytics.trackSessionStarted({ is_returning_user: false, language: navigator.language });
                setIsReady(true);
                restoreAndNavigate(navigate, location.pathname);
                return;
              }
            }
          } catch (err) {
            console.warn("[Auth] Token exchange failed (CORS?):", err);
          }
        }

        // 3c. Last resort — use the token itself as the ID so user isn't stuck
        const fallback = urlUserId || token!;
        console.warn(`[Auth] Fallback — using token as ID: ${fallback}`);
        localStorage.setItem(STORAGE_KEY, fallback);
        await migrateAnonData(fallback);
        await initializeUser(fallback);
        analytics.identifyUser(fallback);
        analytics.trackSessionStarted({ is_returning_user: false, language: navigator.language });
        setIsReady(true);
        restoreAndNavigate(navigate, location.pathname);
        return;
      }

      // 4. No credentials at all — save current path and redirect to auth portal
      //
      // location.pathname is ROUTER-relative (i.e. already stripped of the basename).
      // On /quit/alcohol → location.pathname = "/alcohol"
      // We save "/alcohol" so after auth we can navigate back to it.
      const pathToRestore = location.pathname + location.search;
      if (pathToRestore !== "/" && pathToRestore !== "") {
        localStorage.setItem(REDIRECT_PATH_KEY, pathToRestore);
        console.log(`[Auth] Saved path to restore after auth: ${pathToRestore}`);
      }

      // The redirect_url we give the auth portal is the platform ROOT (/quit),
      // because the auth portal appends ?token=... and redirects there.
      // We'll read the saved path from localStorage on return.
      const returnUrl = `https://platform.mantracare.com/quit_staging/`;

      console.log("[Auth] No session found and no URL credentials — redirecting to auth portal via returnUrl:", returnUrl);
      window.location.href = `https://web-staging.mantracare.com/app/quit_staging?redirect_url=${encodeURIComponent(returnUrl)}`;
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
// Reads the path saved in localStorage before the auth redirect and navigates
// the user back to it. Falls back to currentPath if they landed directly, or "/".
// ---------------------------------------------------------------------------
function restoreAndNavigate(navigate: ReturnType<typeof useNavigate>, currentPath: string) {
  const savedPath = localStorage.getItem(REDIRECT_PATH_KEY);
  localStorage.removeItem(REDIRECT_PATH_KEY);

  // If a path was saved prior to an auth redirect, use it.
  // Otherwise, if they landed directly via a link with token (e.g. magic link), retain their current path.
  let targetPath = savedPath;
  if (!targetPath) {
    targetPath = currentPath !== "/" && currentPath !== "" ? currentPath : "/";
  }

  // navigate() replaces the current URL including query string, thereby stripping the tokens safely.
  // Only navigate if the target is actually different to avoid double-mounts
  const currentFull = window.location.pathname + window.location.search;
  const basename = "/quit_staging";
  const absoluteTarget = basename + (targetPath.startsWith('/') ? targetPath : '/' + targetPath);
  
  if (currentFull !== absoluteTarget) {
    console.log(`[Auth] Restoring to target path: ${targetPath}`);
    navigate(targetPath, { replace: true });
  } else {
    console.log(`[Auth] Already at target path, skipping redundant navigation.`);
  }
}
