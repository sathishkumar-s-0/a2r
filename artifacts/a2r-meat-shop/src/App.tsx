import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { AdminLayout } from "./components/layout/AdminLayout";
import { CartDrawer } from "./components/CartDrawer";

import CustomerLogin, { getCustomer } from "./pages/customer-login";
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

function CustomerGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const customer = getCustomer();
  if (!customer) {
    setLocation("/");
    return null;
  }
  return <>{children}</>;
}

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
      {/* Customer Login — shown first */}
      <Route path="/" component={CustomerLogin} />

      {/* Customer Shop (protected) */}
      <Route path="/home">
        <CustomerGuard>
          <CustomerLayout><Home /></CustomerLayout>
        </CustomerGuard>
      </Route>
      <Route path="/products">
        <CustomerGuard>
          <CustomerLayout><Products /></CustomerLayout>
        </CustomerGuard>
      </Route>
      <Route path="/product/:id">
        <CustomerGuard>
          <CustomerLayout><ProductDetail /></CustomerLayout>
        </CustomerGuard>
      </Route>
      <Route path="/checkout">
        <CustomerGuard>
          <CustomerLayout><Checkout /></CustomerLayout>
        </CustomerGuard>
      </Route>
      <Route path="/order-confirmation/:id">
        <CustomerGuard>
          <CustomerLayout><OrderConfirmation /></CustomerLayout>
        </CustomerGuard>
      </Route>
      <Route path="/track/:id">
        <CustomerLayout><OrderTracking /></CustomerLayout>
      </Route>

      {/* Hidden Admin Portal — not linked anywhere publicly */}
      <Route path="/a2r-portal">
        <Redirect to="/a2r-portal/login" />
      </Route>
      <Route path="/a2r-portal/login">
        <AdminLayout><AdminLogin /></AdminLayout>
      </Route>
      <Route path="/a2r-portal/dashboard">
        <AdminLayout><AdminDashboard /></AdminLayout>
      </Route>
      <Route path="/a2r-portal/products">
        <AdminLayout><AdminProducts /></AdminLayout>
      </Route>
      <Route path="/a2r-portal/orders">
        <AdminLayout><AdminOrders /></AdminLayout>
      </Route>

      {/* Old /admin redirect to hidden portal */}
      <Route path="/admin">
        <Redirect to="/a2r-portal/login" />
      </Route>
      <Route path="/admin/login">
        <Redirect to="/a2r-portal/login" />
      </Route>
      <Route path="/admin/dashboard">
        <Redirect to="/a2r-portal/dashboard" />
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
