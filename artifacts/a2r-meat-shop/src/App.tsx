import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { AdminLayout } from "./components/layout/AdminLayout";
import { CartDrawer } from "./components/CartDrawer";

import Home from "./pages/home";
import Products from "./pages/products";
import ProductDetail from "./pages/product-detail";
import Checkout from "./pages/checkout";
import OrderConfirmation from "./pages/order-confirmation";
import OrderTracking from "./pages/order-tracking";

import AdminLogin from "./pages/admin/login";
import AdminDashboard from "./pages/admin/dashboard";
import AdminProducts from "./pages/admin/products";
import AdminOrders from "./pages/admin/orders";

const queryClient = new QueryClient();

// Layout wrapper for customer-facing pages
function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Admin Routes */}
      <Route path="/admin/login">
        <AdminLayout><AdminLogin /></AdminLayout>
      </Route>
      <Route path="/admin/dashboard">
        <AdminLayout><AdminDashboard /></AdminLayout>
      </Route>
      <Route path="/admin/products">
        <AdminLayout><AdminProducts /></AdminLayout>
      </Route>
      <Route path="/admin/orders">
        <AdminLayout><AdminOrders /></AdminLayout>
      </Route>
      
      {/* Customer Routes */}
      <Route path="/">
        <CustomerLayout><Home /></CustomerLayout>
      </Route>
      <Route path="/products">
        <CustomerLayout><Products /></CustomerLayout>
      </Route>
      <Route path="/product/:id">
        <CustomerLayout><ProductDetail /></CustomerLayout>
      </Route>
      <Route path="/checkout">
        <CustomerLayout><Checkout /></CustomerLayout>
      </Route>
      <Route path="/order-confirmation/:id">
        <CustomerLayout><OrderConfirmation /></CustomerLayout>
      </Route>
      <Route path="/track/:id">
        <CustomerLayout><OrderTracking /></CustomerLayout>
      </Route>

      <Route>
        <CustomerLayout><NotFound /></CustomerLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
