import { useState } from "react";
import { useAdminGetProducts, useAdminCreateProduct, useAdminUpdateProduct, useAdminDeleteProduct, type CreateProductInput } from "@workspace/api-client-react";
import { useAuthHeaders } from "@/hooks/use-admin-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  price: z.coerce.number().min(0.01),
  stock: z.coerce.number().min(0),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean(),
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

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: { isActive: true, stock: 10, price: 10 }
  });

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

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold">Products</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4"/> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">Product Name</label>
                  <input {...form.register("name")} className="w-full h-10 rounded-lg border px-3" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Category</label>
                  <select {...form.register("category")} className="w-full h-10 rounded-lg border px-3 bg-background">
                    <option value="Chicken">Chicken</option>
                    <option value="Mutton">Mutton</option>
                    <option value="Fish">Fish</option>
                    <option value="Eggs">Eggs</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Price per kg</label>
                  <input type="number" step="0.01" {...form.register("price")} className="w-full h-10 rounded-lg border px-3" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Stock (kg)</label>
                  <input type="number" step="0.1" {...form.register("stock")} className="w-full h-10 rounded-lg border px-3" />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input type="checkbox" {...form.register("isActive")} className="w-5 h-5 rounded border-input text-primary" />
                    Active (Visible to customers)
                  </label>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">Image URL</label>
                  <input {...form.register("imageUrl")} className="w-full h-10 rounded-lg border px-3" placeholder="/images/..." />
                </div>
              </div>
              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="p-4 font-medium text-sm text-muted-foreground w-16">Image</th>
              <th className="p-4 font-medium text-sm text-muted-foreground">Details</th>
              <th className="p-4 font-medium text-sm text-muted-foreground">Price/Stock</th>
              <th className="p-4 font-medium text-sm text-muted-foreground">Status</th>
              <th className="p-4 font-medium text-sm text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products?.map(product => (
              <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                <td className="p-4">
                  <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex items-center justify-center text-xs">
                    {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover"/> : "No Img"}
                  </div>
                </td>
                <td className="p-4">
                  <p className="font-bold text-foreground">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                </td>
                <td className="p-4">
                  <p className="font-bold">${product.price.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{product.stock} kg</p>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEdit(product)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(product.id)} className="text-destructive hover:bg-destructive hover:text-white">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
