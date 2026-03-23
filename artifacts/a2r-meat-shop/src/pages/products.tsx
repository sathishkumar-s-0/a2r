import { useGetProducts } from "@workspace/api-client-react";
import { useSearch, Link } from "wouter";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";

export default function Products() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const category = searchParams.get("category") || undefined;

  const { data: products, isLoading, error } = useGetProducts({ category });
  const { addItem } = useCart();

  const categories = ["All", "Chicken", "Mutton", "Fish", "Eggs"];

  if (error) {
    return <div className="p-8 text-center text-destructive">Failed to load products.</div>;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground">
              {category ? `${category} Products` : "All Products"}
            </h1>
            <p className="text-muted-foreground mt-2">Finest cuts guaranteed fresh every day.</p>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {categories.map((cat) => {
              const isActive = (cat === "All" && !category) || cat === category;
              const href = cat === "All" ? "/products" : `/products?category=${cat}`;
              return (
                <Link key={cat} href={href}>
                  <div className={`
                    px-6 py-2.5 rounded-full font-semibold whitespace-nowrap cursor-pointer transition-all
                    ${isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "bg-card text-foreground hover:bg-accent border border-border"}
                  `}>
                    {cat}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !products?.length ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-border">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No products found</h2>
            <p className="text-muted-foreground">Check back later or try a different category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.filter(p => p.isActive).map((product) => (
              <div key={product.id} className="bg-card rounded-3xl overflow-hidden border border-border/60 hover:border-primary/30 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
                <Link href={`/product/${product.id}`} className="block relative aspect-[4/3] bg-muted/30 p-6 overflow-hidden">
                  {product.stock < 5 && product.stock > 0 && (
                    <div className="absolute top-4 left-4 z-10 bg-destructive/10 text-destructive text-xs font-bold px-3 py-1 rounded-full border border-destructive/20">
                      Only {product.stock} left
                    </div>
                  )}
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-xl"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                      <ShoppingBag className="w-12 h-12" />
                    </div>
                  )}
                </Link>
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">{product.category}</div>
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-display font-bold text-xl text-foreground mb-2 hover:text-primary transition-colors cursor-pointer">{product.name}</h3>
                  </Link>
                  <div className="flex items-end gap-2 mb-6 mt-auto">
                    <span className="text-2xl font-black text-foreground">${product.price.toFixed(2)}</span>
                    <span className="text-muted-foreground text-sm pb-1">/ kg</span>
                  </div>
                  <Button 
                    onClick={(e) => {
                      e.preventDefault();
                      addItem(product, 1); // Default add 1kg
                    }}
                    className="w-full rounded-xl py-6 font-bold"
                    disabled={product.stock <= 0}
                  >
                    {product.stock > 0 ? "Add to Cart (1kg)" : "Out of Stock"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
