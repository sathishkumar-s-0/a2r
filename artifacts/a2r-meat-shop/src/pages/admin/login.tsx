import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const { setAuth, token } = useAdminAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (token) setLocation("/a2r-portal/dashboard");
  }, [token, setLocation]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.username, password: data.password }),
      });
      if (!res.ok) {
        setError("Invalid username or password");
        return;
      }
      const json = await res.json();
      setAuth(json.token, json.admin);
      setLocation("/a2r-portal/dashboard");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-3xl p-8 shadow-2xl border border-border">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-3xl font-display font-bold text-center text-foreground mb-2">Admin Portal</h1>
        <p className="text-center text-muted-foreground mb-8">Sign in to manage your shop</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              {...register("username")}
              className="w-full h-12 rounded-xl border border-input bg-background px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="admin"
              autoComplete="username"
            />
            {errors.username && <p className="text-destructive text-sm mt-1">{errors.username.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="w-full h-12 rounded-xl border border-input bg-background px-4 pr-12 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-14 text-lg rounded-xl mt-4"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
