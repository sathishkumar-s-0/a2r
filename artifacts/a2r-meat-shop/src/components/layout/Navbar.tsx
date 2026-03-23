import { Link } from "wouter";
import { ShoppingBag, Menu, Search, User } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const cartItemsCount = useCart((s) => s.items.length);
  const setIsCartOpen = useCart((s) => s.setIsOpen);

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden text-foreground">
              <Menu className="h-6 w-6" />
            </Button>
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-xl shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform duration-300">
                A2R
              </div>
              <span className="font-display font-bold text-2xl tracking-tight hidden sm:block text-foreground">
                Meat Shop
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/products?category=Chicken" className="text-sm font-semibold text-foreground/80 hover:text-primary transition-colors">Chicken</Link>
            <Link href="/products?category=Mutton" className="text-sm font-semibold text-foreground/80 hover:text-primary transition-colors">Mutton</Link>
            <Link href="/products?category=Fish" className="text-sm font-semibold text-foreground/80 hover:text-primary transition-colors">Fish</Link>
            <Link href="/products?category=Eggs" className="text-sm font-semibold text-foreground/80 hover:text-primary transition-colors">Eggs</Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="hidden sm:flex text-foreground/80">
              <Search className="h-5 w-5" />
            </Button>
            <Link href="/admin/login">
              <Button variant="ghost" size="icon" className="hidden sm:flex text-foreground/80">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="relative rounded-full h-12 px-4 sm:px-6 border-2 hover:border-primary hover:text-primary transition-colors shadow-sm"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:block font-bold">Cart</span>
              {cartItemsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-primary text-primary-foreground border-2 border-background animate-in zoom-in">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
