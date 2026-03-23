import { useGetProduct } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ShieldCheck, Truck } from "lucide-react";
import { Link } from "wouter";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useGetProduct(Number(id));
  const { addItem } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [customQty, setCustomQty] = useState("");

  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (error || !product) {
    return <div className="min-h-screen flex justify-center items-center flex-col gap-4">
      <h2 className="text-2xl font-bold">Product not found</h2>
      <Link href="/products"><Button>Back to Products</Button></Link>
    </div>;
  }

  const handleCustomQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomQty(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setQuantity(num / 1000); // convert grams to kg
    }
  };

  const handleAddToCart = () => {
    if (quantity > 0) {
      addItem(product, quantity);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to all products
        </Link>

        <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm flex flex-col md:flex-row">
          {/* Image */}
          <div className="w-full md:w-1/2 bg-muted/20 p-12 flex items-center justify-center relative">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full max-w-md object-contain drop-shadow-2xl"
              />
            ) : (
              <div className="w-64 h-64 bg-muted rounded-full flex items-center justify-center text-muted-foreground">No Image</div>
            )}
          </div>

          {/* Details */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
            <div className="mb-8">
              <div className="text-primary font-bold tracking-wider uppercase text-sm mb-3">
                {product.category}
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-black text-foreground mb-4">
                {product.name}
              </h1>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-4xl font-black text-foreground">${product.price.toFixed(2)}</span>
                <span className="text-muted-foreground text-lg pb-1">/ kg</span>
              </div>
              
              <div className="flex items-center gap-4 text-sm font-medium">
                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full">
                  <ShieldCheck className="w-4 h-4" /> Fresh Guarantee
                </div>
                <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 rounded-full">
                  <Truck className="w-4 h-4" /> 90 Min Delivery
                </div>
              </div>
            </div>

            <div className="space-y-6 mb-8 flex-1">
              <div>
                <h3 className="font-bold text-foreground mb-3">Select Quantity</h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[0.25, 0.5, 1].map((kg) => (
                    <Button
                      key={kg}
                      variant={quantity === kg && !customQty ? "default" : "outline"}
                      className={`h-14 rounded-xl text-base ${quantity === kg && !customQty ? "shadow-md shadow-primary/20" : ""}`}
                      onClick={() => {
                        setQuantity(kg);
                        setCustomQty("");
                      }}
                    >
                      {kg >= 1 ? `${kg} kg` : `${kg * 1000} g`}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground shrink-0">Custom (grams):</span>
                  <input 
                    type="number" 
                    placeholder="e.g. 750" 
                    value={customQty}
                    onChange={handleCustomQtyChange}
                    className="flex-1 h-12 rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="bg-muted/50 rounded-2xl p-4 flex justify-between items-center border border-border/50">
                <span className="text-muted-foreground font-medium">Total Price:</span>
                <span className="font-display font-bold text-2xl text-foreground">
                  ${(product.price * quantity).toFixed(2)}
                </span>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full h-16 text-lg rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1"
              disabled={product.stock <= 0}
              onClick={handleAddToCart}
            >
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
