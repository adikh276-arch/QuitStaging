import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const therapyUserId = localStorage.getItem("therapy_user_id");
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (token) {
        // 2. Save the token as the user ID immediately as requested
        localStorage.setItem("therapy_user_id", token);
        setIsAuthenticated(true);
        
        // 3. Remove token from URL
        urlParams.delete("token");
        const newSearch = urlParams.toString();
        
        // 4. Restore the deep-link path
        const savedPath = sessionStorage.getItem("redirect_path");
        const targetPath = savedPath || location.pathname;
        if (savedPath) {
          sessionStorage.removeItem("redirect_path");
        }

        const newPath = targetPath + (newSearch ? `?${newSearch}` : "");
        navigate(newPath, { replace: true });
        return;
      }

      if (therapyUserId) {
        // Already authenticated
        setIsAuthenticated(true);
      } else {
        // Anti-ping-pong circuit breaker: Prevent infinite loop if API keeps failing
        const lastRedirect = sessionStorage.getItem("auth_last_redirect");
        const now = Date.now();
        if (lastRedirect && now - parseInt(lastRedirect) < 5000) {
           console.error("Infinite redirect loop detected. Aborting.");
           // Stop the loop by not redirecting. Provide a fallback authenticated state or error.
           // You can either show a blank screen, or mock auth so they can still browse.
           document.body.innerHTML = "<div style='padding:40px;text-align:center;font-family:sans-serif;'><h3>Authentication Error</h3><p>We are having trouble validating your session. Please disable adblockers or try again later.</p></div>";
           return;
        }
        
        sessionStorage.setItem("auth_last_redirect", now.toString());

        // Fix the loop: Build a clean redirect URL without any existing tokens
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("token");
        
        sessionStorage.setItem("redirect_path", location.pathname + location.search);
        
        // Add a slight delay to ensure state logic fires and prevent rapid infinite loops
        setTimeout(() => {
          window.location.href = `https://web.mantracare.com/app/quit?redirect_url=${encodeURIComponent(cleanUrl.toString())}`;
        }, 100);
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
