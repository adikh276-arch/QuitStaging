import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { initializeUser } from "@/lib/user";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const therapyUserId = sessionStorage.getItem("therapy_user_id");
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const urlUserId = urlParams.get("userId") || urlParams.get("user_id");

      // 1. Handshake Logic: Process incoming credentials
      if (token || urlUserId) {
        try {
          const finalId = urlUserId || token; // Prioritize 4-6 digit userId if available
          
          if (token) sessionStorage.setItem("therapy_token", token);
          if (finalId) sessionStorage.setItem("therapy_user_id", finalId);
          if (finalId) sessionStorage.setItem("user_id", finalId); // Legacy compatibility
          
          // Initialize in DB
          await initializeUser(finalId!);
          setIsReady(true);

          // 2. Clear URL and restore deep-link
          const savedPath = sessionStorage.getItem("redirect_path") || "/";
          sessionStorage.removeItem("redirect_path");
          
          urlParams.delete("token");
          urlParams.delete("userId");
          urlParams.delete("user_id");
          const newSearch = urlParams.toString();
          
          const targetPath = (savedPath.startsWith('/') ? savedPath : '/' + savedPath) + (newSearch ? `?${newSearch}` : "");
          navigate(targetPath, { replace: true });
          return;
        } catch (err) {
          console.error("Auth Handshake Error:", err);
        }
      }

      // 3. Existing Session logic
      if (therapyUserId) {
        setIsReady(true);
      } else {
        // 4. Redirect to Auth Portal if no session
        const lastRedirect = sessionStorage.getItem("auth_last_redirect");
        const now = Date.now();
        if (lastRedirect && now - parseInt(lastRedirect) < 5000) {
           console.error("Infinite redirect loop detected.");
           document.body.innerHTML = "<div style='padding:40px;text-align:center;'><h3>Authentication Error</h3></div>";
           return;
        }
        
        sessionStorage.setItem("auth_last_redirect", now.toString());
        sessionStorage.setItem("redirect_path", location.pathname + location.search);

        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("token");
        
        window.location.href = `https://web.mantracare.com/app/quit?redirect_url=${encodeURIComponent(cleanUrl.toString())}`;
      }
    };

    checkAuth();
  }, [location, navigate]);

  if (!isReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
};
