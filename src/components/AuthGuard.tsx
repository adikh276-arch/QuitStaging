import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const therapyUserId = sessionStorage.getItem("therapy_user_id");
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (token) {
        try {
          // 2. Call user-info API
          const response = await fetch("https://api.mantracare.com/user/user-info", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            const data = await response.json();
            // 3. Store therapy_user_id
            if (data && data.user && data.user.id) {
              sessionStorage.setItem("therapy_user_id", data.user.id);
              // Directly set authenticated, backend DB initialization should occur on the backend API side
              setIsAuthenticated(true);
              
              // 4. Remove token from URL
              urlParams.delete("token");
              const newSearch = urlParams.toString();
              
              const savedPath = sessionStorage.getItem("redirect_path");
              const targetPath = savedPath || location.pathname;
              if (savedPath) {
                sessionStorage.removeItem("redirect_path");
              }

              const newPath = targetPath + (newSearch ? `?${newSearch}` : "");
              navigate(newPath, { replace: true });
              return;
            }
          }
        } catch (error) {
          console.error("Auth initialization failed:", error);
        }
      }

      if (therapyUserId) {
        // Already authenticated
        setIsAuthenticated(true);
      } else {
        // Not authenticated
        const currentUrl = window.location.href;
        sessionStorage.setItem("redirect_path", location.pathname + location.search);
        window.location.href = `https://web.mantracare.com/app/quit?redirect_url=${encodeURIComponent(currentUrl)}`;
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
