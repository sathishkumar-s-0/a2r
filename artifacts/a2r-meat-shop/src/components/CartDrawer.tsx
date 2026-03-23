import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Link, useLocation } from "wouter";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getTotal } = useCart();
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    setIsOpen(false);
    setLocation("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-background/95 backdrop-blur-xl border-l-border/50">
        <SheetHeader className="pb-6 border-b border-border/50">
          <SheetTitle className="font-display text-2xl flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            Your Cart
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 opacity-50" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg">Your cart is empty</p>
                <p className="text-sm mt-1">Looks like you haven't added any premium cuts yet.</p>
              </div>
              <Button variant="outline" onClick={() => setIsOpen(false)} className="mt-4">
                Continue Shopping
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex gap-4 bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
                <div className="w-20 h-20 bg-muted rounded-xl overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-medium">No Image</div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-foreground line-clamp-1">{item.name}</h4>
                    <button 
                      onClick={() => removeItem(item.productId)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    ${item.price.toFixed(2)} / kg
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center bg-muted rounded-lg p-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-md"
                        onClick={() => updateQuantity(item.productId, Math.max(0.1, item.quantity - 0.1))}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-12 text-center text-sm font-bold">{item.quantity}kg</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-md"
                        onClick={() => updateQuantity(item.productId, item.quantity + 0.1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="font-bold text-primary">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="border-t border-border/50 pt-6 flex-col sm:flex-col gap-4">
            <div className="flex justify-between items-center w-full">
              <span className="text-muted-foreground font-medium">Subtotal</span>
              <span className="font-display font-bold text-2xl text-foreground">
                ${getTotal().toFixed(2)}
              </span>
            </div>
            <Button 
              className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5" 
              onClick={handleCheckout}
            >
              Checkout Now
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Taxes and delivery calculated at checkout
            </p>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
