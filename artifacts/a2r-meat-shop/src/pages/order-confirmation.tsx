import { useParams, Link } from "wouter";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-card rounded-3xl p-8 border border-border shadow-xl text-center"
      >
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
        </div>
        
        <h1 className="text-3xl font-display font-black text-foreground mb-4">Order Placed!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for choosing A2R Meat Shop. Your fresh cuts are being prepared.
        </p>

        <div className="bg-muted/50 rounded-2xl p-6 mb-8 border border-border/50">
          <p className="text-sm text-muted-foreground mb-1">Order ID</p>
          <p className="text-2xl font-mono font-bold text-foreground">#{id}</p>
        </div>

        <div className="space-y-4">
          <Link href={`/track/${id}`}>
            <Button size="lg" className="w-full rounded-xl h-14 text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
              <Package className="w-5 h-5" /> Track Order Status
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" size="lg" className="w-full rounded-xl h-14 text-base flex items-center justify-center gap-2">
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
