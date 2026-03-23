import { useParams } from "wouter";
import { useGetOrderStatus } from "@workspace/api-client-react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "@/lib/socket";
import { Package, ChefHat, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const statuses = ["Placed", "Accepted", "Preparing", "Delivered"];

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: order, isLoading } = useGetOrderStatus(Number(id));

  useEffect(() => {
    socket.on("order_status_changed", (payload) => {
      if (payload.orderId === Number(id)) {
        queryClient.invalidateQueries({ queryKey: [`/api/orders/${id}/status`] });
      }
    });
    return () => {
      socket.off("order_status_changed");
    };
  }, [id, queryClient]);

  if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!order) return <div className="p-12 text-center">Order not found</div>;

  const currentIdx = statuses.indexOf(order.status);

  return (
    <div className="min-h-[80vh] bg-background py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/50 pb-6 mb-10">
            <div>
              <h1 className="text-3xl font-display font-black mb-2">Track Order</h1>
              <p className="text-muted-foreground">Order #{order.id}</p>
            </div>
            <div className="text-right mt-4 md:mt-0">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold text-foreground">${order.totalPrice.toFixed(2)}</p>
            </div>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-[27px] sm:left-1/2 top-0 bottom-0 w-1 bg-muted sm:-translate-x-1/2 rounded-full hidden sm:block" />

            <div className="space-y-12">
              {[
                { s: "Placed", desc: "We have received your order", icon: Clock },
                { s: "Accepted", desc: "Order confirmed by butcher", icon: CheckCircle2 },
                { s: "Preparing", desc: "Your meat is being cut and packed", icon: ChefHat },
                { s: "Delivered", desc: "Order delivered to your address", icon: Package },
              ].map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = currentIdx >= idx;
                const isCurrent = currentIdx === idx;

                return (
                  <div key={step.s} className={cn(
                    "flex items-center gap-6 sm:justify-between relative z-10",
                    "flex-row sm:flex-row"
                  )}>
                    <div className="hidden sm:block w-5/12 text-right">
                      {idx % 2 === 0 && (
                        <div>
                          <h3 className={cn("font-bold text-lg", isCompleted ? "text-foreground" : "text-muted-foreground")}>{step.s}</h3>
                          <p className="text-sm text-muted-foreground">{step.desc}</p>
                        </div>
                      )}
                    </div>

                    <div className={cn(
                      "w-14 h-14 shrink-0 rounded-full flex items-center justify-center border-4 border-card transition-all duration-500",
                      isCompleted ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110" : "bg-muted text-muted-foreground",
                      isCurrent && "ring-4 ring-primary/20"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="w-full sm:w-5/12 text-left">
                      {(idx % 2 !== 0 || window.innerWidth < 640) && (
                        <div>
                          <h3 className={cn("font-bold text-lg", isCompleted ? "text-foreground" : "text-muted-foreground")}>{step.s}</h3>
                          <p className="text-sm text-muted-foreground">{step.desc}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
