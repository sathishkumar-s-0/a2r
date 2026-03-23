import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdminLogin } from "@workspace/api-client-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import { useEffect } from "react";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const { setAuth, token } = useAdminAuth();
  const [, setLocation] = useLocation();
  const loginMutation = useAdminLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  useEffect(() => {
    if (token) setLocation("/admin/dashboard");
  }, [token, setLocation]);

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        setAuth(res.token, res.admin);
        setLocation("/admin/dashboard");
      }
    });
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
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input 
              {...register("email")}
              className="w-full h-12 rounded-xl border border-input bg-background px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="admin@a2r.com"
            />
            {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input 
              type="password"
              {...register("password")}
              className="w-full h-12 rounded-xl border border-input bg-background px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
          </div>
          
          {loginMutation.isError && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm text-center">
              Invalid credentials
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-14 text-lg rounded-xl mt-4"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
