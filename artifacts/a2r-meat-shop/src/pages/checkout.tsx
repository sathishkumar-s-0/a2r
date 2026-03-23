import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateOrder } from "@workspace/api-client-react";
import { useCart } from "@/hooks/use-cart";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { getCustomer } from "@/pages/customer-login";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  customerAddress: z.string().min(10, "Full delivery address required"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, getTotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const createOrderMutation = useCreateOrder();
  const customer = getCustomer();

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: customer?.name || "",
      customerPhone: customer?.phone || "",
    },
  });

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link href="/products"><Button size="lg">Browse Products</Button></Link>
      </div>
    );
  }

  const onSubmit = (data: CheckoutForm) => {
    createOrderMutation.mutate(
      {
        data: {
          ...data,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        }
      },
      {
        onSuccess: (order) => {
          clearCart();
          setLocation(`/order-confirmation/${order.id}`);
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to shopping
        </Link>
        
        <h1 className="text-4xl font-display font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form */}
          <div className="lg:col-span-7">
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <h2 className="text-xl font-bold mb-6">Delivery Details</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input 
                    {...register("customerName")}
                    className="w-full h-12 rounded-xl border border-input bg-background px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                  {errors.customerName && <p className="text-destructive text-sm mt-1">{errors.customerName.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input 
                    {...register("customerPhone")}
                    className="w-full h-12 rounded-xl border border-input bg-background px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                  {errors.customerPhone && <p className="text-destructive text-sm mt-1">{errors.customerPhone.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Delivery Address</label>
                  <textarea 
                    {...register("customerAddress")}
                    className="w-full rounded-xl border border-input bg-background p-4 min-h-[120px] focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Full street address, apartment, city, zip code"
                  />
                  {errors.customerAddress && <p className="text-destructive text-sm mt-1">{errors.customerAddress.message}</p>}
                </div>

                <div className="bg-muted/50 p-6 rounded-2xl border border-border/50">
                  <h3 className="font-bold flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    Payment Method
                  </h3>
                  <p className="text-muted-foreground text-sm">Cash on Delivery (COD) is selected by default. Pay when your fresh meat arrives.</p>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20"
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Place Order"}
                </Button>
              </form>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-5">
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm sticky top-28">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="w-16 h-16 bg-muted rounded-xl flex-shrink-0 overflow-hidden">
                       {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover"/>}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-muted-foreground text-sm">{item.quantity} kg x ${item.price.toFixed(2)}</p>
                    </div>
                    <div className="font-bold text-primary">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-border/50 pt-6 space-y-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between items-center pt-4 mt-2 border-t border-border/50">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-display font-black text-3xl text-foreground">
                    ${getTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
