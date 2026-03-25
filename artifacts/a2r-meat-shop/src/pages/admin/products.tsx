import { useAdminGetProducts, useAdminCreateProduct, useAdminUpdateProduct, useAdminDeleteProduct } from "@workspace/api-client-react";
import { useAuthHeaders } from "@/hooks/use-admin-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Package, Edit, Trash2, AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().min(0.01, "Price must be positive"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

export default function AdminProducts() {
  const headers = useAuthHeaders();
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useAdminGetProducts({ request: { headers } });
  
  const createMutation = useAdminCreateProduct({ request: { headers } });
  const updateMutation = useAdminUpdateProduct({ request: { headers } });
  const deleteMutation = useAdminDeleteProduct({ request: { headers } });

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: { isActive: true, stock: 10, price: 10 }
  });

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB limit for DB storage
      alert("Image is too large. Please use an image smaller than 1MB for database storage.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      form.setValue("imageUrl", base64String);
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert("Failed to read image file");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: z.infer<typeof productSchema>) => {
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data },
        { onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/admin/products`] });
            setIsOpen(false);
          }
        }
      );
    } else {
      createMutation.mutate(
        { data },
        { onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/admin/products`] });
            setIsOpen(false);
          }
        }
      );
    }
  };

  const openEdit = (product: any) => {
    setEditingId(product.id);
    form.reset({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
    });
    setIsOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    form.reset({ isActive: true, stock: 10, price: 10, name: '', category: 'Chicken', imageUrl: '' });
    setIsOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/admin/products`] })
      });
    }
  };

  const filteredProducts = products?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const isLowStock = Number(p.stock) < 5;
    return matchesSearch && (showLowStockOnly ? isLowStock : true);
  });

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-tight">Inventory</h1>
          <p className="text-muted-foreground font-medium">Manage your {products?.length} products and stock levels.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="gap-2 h-12 px-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px]">
              <Plus className="w-4 h-4"/> Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-3xl overflow-hidden p-0 border-none shadow-2xl">
            <div className="bg-primary p-6 text-primary-foreground">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display font-black uppercase tracking-tighter">
                  {editingId ? "Edit Product" : "Create Product"}
                </DialogTitle>
              </DialogHeader>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6 bg-card">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block px-1">Product Name</label>
                  <input {...form.register("name")} className="w-full h-12 rounded-xl border-2 border-border px-4 focus:ring-0 focus:border-primary transition-all font-bold" placeholder="e.g. Chicken Keema" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block px-1">Category</label>
                  <select {...form.register("category")} className="w-full h-12 rounded-xl border-2 border-border px-4 focus:ring-0 focus:border-primary transition-all font-bold bg-background">
                    <option value="Chicken">Chicken</option>
                    <option value="Mutton">Mutton</option>
                    <option value="Fish">Fish</option>
                    <option value="Eggs">Eggs</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block px-1">Price (per kg)</label>
                  <input type="number" step="0.01" {...form.register("price")} className="w-full h-12 rounded-xl border-2 border-border px-4 focus:ring-0 focus:border-primary transition-all font-bold" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block px-1">Initial Stock</label>
                  <input type="number" step="0.1" {...form.register("stock")} className="w-full h-12 rounded-xl border-2 border-border px-4 focus:ring-0 focus:border-primary transition-all font-bold" />
                </div>
                <div className="flex items-center pb-2">
                  <label className="flex items-center gap-3 text-sm font-bold cursor-pointer group">
                    <input type="checkbox" {...form.register("isActive")} className="w-6 h-6 rounded-lg border-2 border-border text-primary focus:ring-0 transition-all checked:bg-primary" />
                    <span>Active Product</span>
                  </label>
                </div>
                <div className="col-span-2 pt-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 block px-1">Product Visual</label>
                  <div className="flex gap-4 items-center">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-2xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50">
                        {form.watch("imageUrl") ? (
                          <img src={form.watch("imageUrl")!} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-8 h-8 text-muted-foreground/30" />
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={onFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      {isUploading && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-bold">Upload from computer</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">JPG, PNG or WEBP (Max 1MB)</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-border">
                <Button type="submit" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-primary/20" disabled={createMutation.isPending || updateMutation.isPending || isUploading}>
                  {editingId ? "Save Changes" : "Create Product Entry"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <input 
            type="text" 
            placeholder="Search inventory by item name or category..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 rounded-2xl border-2 border-border px-4 pl-12 focus:ring-0 focus:border-primary transition-all bg-card shadow-sm"
          />
          <Plus className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground rotate-45 group-focus-within:text-primary transition-colors" />
        </div>
        
        <button 
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          className={`flex items-center gap-2 h-14 px-6 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all
            ${showLowStockOnly 
              ? "bg-red-500 border-red-500 text-white shadow-xl shadow-red-500/30" 
              : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:shadow-md"}`}
        >
          <AlertTriangle className={`w-4 h-4 ${showLowStockOnly ? 'text-white' : 'text-red-500'}`} />
          {showLowStockOnly ? "Low Stock Filter: ON" : "Filter Low Stock"}
        </button>
      </div>

      <div className="bg-card rounded-[32px] border-2 border-border overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted/30 border-b-2 border-border">
              <th className="p-6 font-black text-[10px] text-muted-foreground uppercase tracking-widest w-24">Media</th>
              <th className="p-6 font-black text-[10px] text-muted-foreground uppercase tracking-widest">Product Definition</th>
              <th className="p-6 font-black text-[10px] text-muted-foreground uppercase tracking-widest">Inventory Values</th>
              <th className="p-6 font-black text-[10px] text-muted-foreground uppercase tracking-widest">Visibility</th>
              <th className="p-6 font-black text-[10px] text-muted-foreground uppercase tracking-widest text-right">Operational Tools</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredProducts?.map(product => {
              const isLowStock = Number(product.stock) < 5;
              return (
                <tr key={product.id} className="hover:bg-primary/[0.02] transition-colors group">
                  <td className="p-6">
                    <div className="w-16 h-16 bg-muted rounded-2xl overflow-hidden flex items-center justify-center border-2 border-border/50 transition-all group-hover:border-primary/20">
                      {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover"/> : <Package className="w-6 h-6 text-muted-foreground/30" />}
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="font-black text-lg text-foreground leading-tight tracking-tighter">{product.name}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary rounded-lg font-black text-[10px] uppercase tracking-wider">{product.category}</span>
                  </td>
                  <td className="p-6">
                    <p className="font-black text-2xl text-foreground leading-none mb-1">${product.price.toFixed(2)}</p>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-black text-xs uppercase tracking-tighter ${isLowStock ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {product.stock} kg in stock
                      </span>
                      {isLowStock && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm
                      ${product.isActive 
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                        : 'bg-muted text-muted-foreground border border-border'}`}>
                      {product.isActive ? "Live on Store" : "Hidden"}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" size="icon" onClick={() => openEdit(product)} className="w-11 h-11 rounded-xl border-2 hover:bg-primary hover:text-white hover:border-primary transition-all">
                        <Edit className="w-5 h-5" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(product.id)} className="w-11 h-11 rounded-xl border-2 text-destructive hover:bg-destructive hover:text-white hover:border-destructive transition-all">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!filteredProducts?.length && (
          <div className="p-24 text-center">
             <Package className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
             <h3 className="font-bold text-xl">No products found for this view</h3>
             <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
