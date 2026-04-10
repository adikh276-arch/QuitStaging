import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { initializeUser } from "@/lib/user";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const therapyUserId = localStorage.getItem("therapy_user_id");
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const urlUserId = urlParams.get("userId") || urlParams.get("user_id");

      if (token || urlUserId) {
        try {
          // 1. If we have a userId in the URL, use it directly (it's the 4-6 digit ID)
          let userId = urlUserId;
          
          // 2. Otherwise exchange token for real User ID via legacy handshake API
          if (!userId && token) {
             const response = await fetch(`https://api.mantracare.com/user/user-info`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
             });
             if (response.ok) {
                const data = await response.json();
                userId = data.user_id || data.id;
             }
          }
          
          const finalId = userId || token; // Fallback to token if nothing else works
          
          localStorage.setItem("therapy_user_id", finalId);
          setIsAuthenticated(true);
          initializeUser(finalId); // Sync to Neon
          
          // 3. Remove auth params from URL
          urlParams.delete("token");
          urlParams.delete("userId");
          urlParams.delete("user_id");
          const newSearch = urlParams.toString();
          
          // 4. Restore the deep-link path
          const savedPath = sessionStorage.getItem("redirect_path") || sessionStorage.getItem("saved_path") || '/';
          
          sessionStorage.removeItem("redirect_path");
          sessionStorage.removeItem("saved_path");

          const newPath = (savedPath.startsWith('/') ? savedPath : '/' + savedPath) + (newSearch ? `?${newSearch}` : "");
          navigate(newPath, { replace: true });
          return;
        } catch (err) {
          console.error("Auth: handshake failed:", err);
          const fallbackId = urlUserId || token;
          localStorage.setItem("therapy_user_id", fallbackId);
          setIsAuthenticated(true);
          initializeUser(fallbackId);
        }
      }

      if (therapyUserId) {
        setIsAuthenticated(true);
        initializeUser(therapyUserId);
      } else {
        const lastRedirect = sessionStorage.getItem("auth_last_redirect");
        const now = Date.now();
        if (lastRedirect && now - parseInt(lastRedirect) < 5000) {
           console.error("Infinite redirect loop detected. Aborting.");
           document.body.innerHTML = "<div style='padding:40px;text-align:center;font-family:sans-serif;'><h3>Authentication Error</h3><p>We are having trouble validating your session.</p></div>";
           return;
        }
        
        sessionStorage.setItem("auth_last_redirect", now.toString());

        // Capture path for redirect
        const internalPath = location.pathname + location.search;
        sessionStorage.setItem("redirect_path", internalPath);
        sessionStorage.setItem("saved_path", internalPath); // compatibility with old keys

        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("token");
        
        window.location.href = `https://web.mantracare.com/app/quit?redirect_url=${encodeURIComponent(cleanUrl.toString())}`;
      }
    };

    checkAuth();
  }, [location]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
};
