import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { initializeUser } from "@/lib/user";

const STORAGE_KEY = "therapy_user_id";

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

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Check if we already have a REAL (numeric) user ID saved persistently
      const savedUserId = localStorage.getItem(STORAGE_KEY);
      if (isRealUserId(savedUserId)) {
        // Already authenticated with a real ID — just render
        setIsReady(true);
        return;
      }

      // 2. Check URL for incoming credentials from the auth portal
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const urlUserId = urlParams.get("userId") || urlParams.get("user_id");

      if (token || urlUserId) {
        // 3a. If the auth portal sent a real userId directly, use it
        if (isRealUserId(urlUserId)) {
          console.log(`[Auth] Real userId received from URL: ${urlUserId}`);
          localStorage.setItem(STORAGE_KEY, urlUserId!);
          await initializeUser(urlUserId!);
          setIsReady(true);
          restoreAndNavigate(urlParams, navigate);
          return;
        }

        // 3b. Try to exchange the token for the real user_id via the Mantra API
        if (token) {
          try {
            console.log(`[Auth] Exchanging token for real user_id...`);
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
                await initializeUser(userId);
                setIsReady(true);
                restoreAndNavigate(urlParams, navigate);
                return;
              }
            }
          } catch (err) {
            // CORS or network error — log and fall through
            console.warn("[Auth] API exchange failed (likely CORS):", err);
          }
        }

        // 3c. Last resort: save whatever we have (token) so the user isn't stuck
        // This will create a new user on each session, but at least they can use the app
        const fallback = urlUserId || token!;
        console.warn(`[Auth] Falling back to token as ID: ${fallback}`);
        localStorage.setItem(STORAGE_KEY, fallback);
        await initializeUser(fallback);
        setIsReady(true);
        restoreAndNavigate(urlParams, navigate);
        return;
      }

      // 4. No credentials anywhere — redirect to auth portal
      const lastRedirect = sessionStorage.getItem("auth_last_redirect");
      const now = Date.now();
      if (lastRedirect && now - parseInt(lastRedirect) < 5000) {
        console.error("[Auth] Loop detected. Stopping.");
        document.body.innerHTML = "<div style='padding:40px;text-align:center;'><h3>Authentication Error</h3><p>Please close this tab and try again from the app.</p></div>";
        return;
      }

      sessionStorage.setItem("auth_last_redirect", now.toString());
      sessionStorage.setItem("redirect_path", location.pathname + location.search);

      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("token");

      console.log(`[Auth] No session. Redirecting to auth portal. Saving path: ${location.pathname}`);
      window.location.href = `https://web.mantracare.com/app/quit?redirect_url=${encodeURIComponent(cleanUrl.toString())}`;
    };

    checkAuth();
  }, []); // Run ONLY once on mount, not on every location change

  if (!isReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
};

function restoreAndNavigate(urlParams: URLSearchParams, navigate: ReturnType<typeof useNavigate>) {
  const savedPath = sessionStorage.getItem("redirect_path") || "/";
  sessionStorage.removeItem("redirect_path");

  urlParams.delete("token");
  urlParams.delete("userId");
  urlParams.delete("user_id");
  const newSearch = urlParams.toString();

  const targetPath = (savedPath.startsWith("/") ? savedPath : "/" + savedPath) + (newSearch ? `?${newSearch}` : "");
  navigate(targetPath, { replace: true });
}
