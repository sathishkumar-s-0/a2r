import { useAdminGetDashboard } from "@workspace/api-client-react";
import { useAuthHeaders } from "@/hooks/use-admin-auth";
import { DollarSign, ShoppingBag, AlertTriangle, Package, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminDashboard() {
  const headers = useAuthHeaders();
  const queryClient = useQueryClient();
  const { data: stats, isLoading } = useAdminGetDashboard({ request: { headers } });

  useEffect(() => {
    const handleNewOrder = () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/dashboard`] });
    };
    socket.on("new_order", handleNewOrder);
    return () => {
      socket.off("new_order", handleNewOrder);
    };
  }, [queryClient]);

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!stats) return <div className="p-12 text-destructive">Failed to load dashboard</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-display font-bold mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Today's Revenue</p>
            <h3 className="text-2xl font-black text-foreground">${stats.todayRevenue.toFixed(2)}</h3>
          </div>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Orders</p>
            <h3 className="text-2xl font-black text-foreground">{stats.totalOrders}</h3>
          </div>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Low Stock Items</p>
            <h3 className="text-2xl font-black text-foreground">{stats.lowStockProducts.length}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {stats.recentOrders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No recent orders</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="p-4 font-medium text-sm text-muted-foreground">Order ID</th>
                    <th className="p-4 font-medium text-sm text-muted-foreground">Customer</th>
                    <th className="p-4 font-medium text-sm text-muted-foreground">Amount</th>
                    <th className="p-4 font-medium text-sm text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-mono font-medium">#{order.id}</td>
                      <td className="p-4">{order.customerName}</td>
                      <td className="p-4 font-bold">${order.totalPrice.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                          ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 
                            order.status === 'Preparing' ? 'bg-amber-100 text-amber-700' : 
                            'bg-blue-100 text-blue-700'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Low Stock Alerts</h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {stats.lowStockProducts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Stock looks good!</div>
            ) : (
              <div className="divide-y divide-border">
                {stats.lowStockProducts.map(prod => (
                  <div key={prod.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        {prod.imageUrl ? <img src={prod.imageUrl} className="w-full h-full object-cover"/> : <Package className="w-5 h-5 text-muted-foreground" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{prod.name}</p>
                        <p className="text-xs text-muted-foreground">{prod.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-destructive">{prod.stock} kg left</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
