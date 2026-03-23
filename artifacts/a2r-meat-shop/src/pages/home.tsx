import { Link } from "wouter";
import { ArrowRight, Star, Truck, ShieldCheck, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const categories = [
    { name: "Chicken", image: `${import.meta.env.BASE_URL}images/cat-chicken.png`, color: "bg-orange-100 dark:bg-orange-950/30" },
    { name: "Mutton", image: `${import.meta.env.BASE_URL}images/cat-mutton.png`, color: "bg-red-100 dark:bg-red-950/30" },
    { name: "Fish", image: `${import.meta.env.BASE_URL}images/cat-fish.png`, color: "bg-blue-100 dark:bg-blue-950/30" },
    { name: "Eggs", image: `${import.meta.env.BASE_URL}images/cat-eggs.png`, color: "bg-yellow-100 dark:bg-yellow-950/30" },
  ];

  const features = [
    { icon: ShieldCheck, title: "100% Halal & Fresh", desc: "Sourced daily from certified farms" },
    { icon: Truck, title: "Fast Delivery", desc: "Doorstep delivery within 90 minutes" },
    { icon: Clock, title: "Perfectly Cut", desc: "Expert butchers for exact requirements" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Premium Raw Meat" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl text-white"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/50 backdrop-blur-sm text-primary-foreground text-sm font-semibold mb-6">
              <Star className="w-4 h-4 text-primary fill-primary" />
              Premium Quality Meat
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black leading-tight mb-6">
              Freshness You Can <span className="text-primary">Taste.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg leading-relaxed">
              Experience the finest cuts of chicken, mutton, and fresh seafood delivered straight from the farm to your kitchen.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <button className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1">
                  Shop Now
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-center gap-4 p-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{f.title}</h3>
                    <p className="text-muted-foreground text-sm">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">Shop by Category</h2>
              <p className="text-muted-foreground">Select from our wide range of premium products</p>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <Link key={i} href={`/products?category=${cat.name}`}>
                <motion.div 
                  whileHover={{ y: -8 }}
                  className="group cursor-pointer rounded-3xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-xl transition-all"
                >
                  <div className={`aspect-square w-full relative ${cat.color} p-8 flex items-center justify-center`}>
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl"
                    />
                  </div>
                  <div className="p-6 bg-card text-center">
                    <h3 className="font-display font-bold text-2xl text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
