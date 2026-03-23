import { useAdminGetOrders, useAdminUpdateOrderStatus } from "@workspace/api-client-react";
import { useAuthHeaders } from "@/hooks/use-admin-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function AdminOrders() {
  const headers = useAuthHeaders();
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useAdminGetOrders({ request: { headers } });
  const updateStatusMutation = useAdminUpdateOrderStatus({ request: { headers } });

  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate(
      { id, data: { status } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/admin/orders`] }) }
    );
  };

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-display font-bold mb-8">Manage Orders</h1>

      <div className="space-y-6">
        {orders?.map(order => (
          <div key={order.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div className="p-6 md:w-1/3 bg-muted/20 border-r border-border/50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">Order #{order.id}</h3>
                  <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-2xl text-primary">${order.totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">COD</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Customer:</strong> {order.customerName}</p>
                <p><strong>Phone:</strong> {order.customerPhone}</p>
                <p><strong>Address:</strong> {order.customerAddress}</p>
              </div>
              <div className="mt-6 pt-6 border-t border-border/50">
                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Update Status</label>
                <select 
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="w-full h-10 rounded-lg border px-3 bg-background font-semibold"
                  disabled={updateStatusMutation.isPending}
                >
                  <option value="Placed">Placed</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>
            <div className="p-6 md:w-2/3">
              <h4 className="font-bold text-sm text-muted-foreground uppercase mb-4">Order Items</h4>
              <div className="space-y-3">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 rounded-xl border border-border/50 bg-background">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {item.quantity}x
                      </div>
                      <span className="font-bold">{item.productName}</span>
                    </div>
                    <div className="font-medium text-muted-foreground">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
