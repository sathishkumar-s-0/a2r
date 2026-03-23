import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { User, Phone, LogIn, UserPlus, Beef } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "a2r_customer";

export interface CustomerInfo {
  name: string;
  phone: string;
}

export function getCustomer(): CustomerInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCustomer(info: CustomerInfo) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
}

export function clearCustomer() {
  localStorage.removeItem(STORAGE_KEY);
}

export default function CustomerLogin() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter your name"); return; }
    if (!phone.trim() || phone.length < 10) { setError("Please enter a valid phone number"); return; }
    saveCustomer({ name: name.trim(), phone: phone.trim() });
    setLocation("/home");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel */}
      <div className="lg:w-1/2 relative flex items-center justify-center p-12 bg-gray-950 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="A2R Meat Shop"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-primary/30" />
        </div>
        <div className="relative z-10 text-center text-white max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
                <Beef className="w-9 h-9 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
              A2R <span className="text-primary">Meat Shop</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Farm-fresh meat delivered to your doorstep. Premium quality, expert cuts, guaranteed freshness.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[["100%", "Halal"], ["Fresh", "Daily"], ["Fast", "Delivery"]].map(([val, label], i) => (
                <div key={i} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-2xl font-black text-primary">{val}</div>
                  <div className="text-xs text-white/60 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {tab === "login" ? "Welcome back!" : "Create Account"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {tab === "login"
              ? "Enter your details to continue shopping"
              : "Register to track orders and shop faster"}
          </p>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-muted rounded-xl mb-8">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${tab === "login" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${tab === "register" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              <UserPlus className="w-4 h-4" /> Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Your Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full h-12 rounded-xl border border-input bg-background pl-11 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full h-12 rounded-xl border border-input bg-background pl-11 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base rounded-xl mt-2">
              {tab === "login" ? "Continue Shopping" : "Create Account & Shop"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Your details are used only for order delivery. No password needed.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
