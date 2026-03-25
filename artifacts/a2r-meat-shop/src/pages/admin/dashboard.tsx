import { useAdminGetDashboard } from "@workspace/api-client-react";
import { useAuthHeaders } from "@/hooks/use-admin-auth";
import { DollarSign, ShoppingBag, AlertTriangle, Package, Loader2, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

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

  // Type safe access for new fields
  const weeklyRevenue = (stats as any).weeklyRevenue || [];
  const topProducts = (stats as any).topProducts || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Today's Revenue</p>
            <h3 className="text-3xl font-black text-foreground">${stats.todayRevenue.toFixed(2)}</h3>
          </div>
        </div>
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Total Orders</p>
            <h3 className="text-3xl font-black text-foreground">{stats.totalOrders}</h3>
          </div>
        </div>
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Low Stock</p>
            <h3 className="text-3xl font-black text-foreground">{stats.lowStockProducts.length}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Sales Trend Chart */}
          <div className="bg-card p-8 rounded-3xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Sales Trend (Last 7 Days)</h2>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyRevenue}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}}
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {weekday: 'short'})}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))'}}
                    itemStyle={{color: 'hsl(var(--primary))', fontWeight: 'bold'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Recent Orders
            </h2>
            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
              {stats.recentOrders.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No recent orders yet</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-muted/30 border-b border-border">
                    <tr>
                      <th className="p-5 font-bold text-xs text-muted-foreground uppercase tracking-wider">Order ID</th>
                      <th className="p-5 font-bold text-xs text-muted-foreground uppercase tracking-wider">Customer</th>
                      <th className="p-5 font-bold text-xs text-muted-foreground uppercase tracking-wider">Amount</th>
                      <th className="p-5 font-bold text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {stats.recentOrders.map(order => (
                      <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-5 font-mono text-sm font-medium">#{order.id}</td>
                        <td className="p-5">
                          <p className="font-bold text-sm">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="p-5 font-black text-primary">${order.totalPrice.toFixed(2)}</td>
                        <td className="p-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                            ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 
                              order.status === 'Preparing' ? 'bg-amber-100 text-amber-700' : 
                              'bg-primary/10 text-primary'}`}>
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
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Top Selling</h2>
            <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
              {topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
              ) : (
                topProducts.map((prod: any, idx: number) => (
                  <div key={prod.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center font-black text-primary text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{prod.name}</p>
                        <p className="text-xs text-muted-foreground">{prod.quantity} kg sold</p>
                      </div>
                    </div>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{width: `${(prod.quantity / topProducts[0].quantity) * 100}%`}}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Low Stock Alerts
            </h2>
            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
              {stats.lowStockProducts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="text-sm">All items are well-stocked!</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {stats.lowStockProducts.map(prod => (
                    <div key={prod.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center overflow-hidden border border-border/50">
                          {prod.imageUrl ? <img src={prod.imageUrl} className="w-full h-full object-cover"/> : <Package className="w-6 h-6 text-muted-foreground/30" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{prod.name}</p>
                          <p className="text-xs text-muted-foreground uppercase tracking-tighter">{prod.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-red-500">{prod.stock} kg</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Remaining</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
