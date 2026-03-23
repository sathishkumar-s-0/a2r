import { AdminSidebar } from "./AdminSidebar";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAdminAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!token && location !== "/a2r-portal/login") {
      setLocation("/a2r-portal/login");
    }
  }, [token, location, setLocation]);

  if (!token && location !== "/a2r-portal/login") {
    return null;
  }

  if (location === "/a2r-portal/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 ml-64 bg-muted/20 min-h-screen">
        {children}
      </main>
    </div>
  );
}
