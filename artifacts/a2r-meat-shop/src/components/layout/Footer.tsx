import { Link } from "wouter";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-xl">
                A2R
              </div>
              <span className="font-display font-bold text-2xl tracking-tight">
                Meat Shop
              </span>
            </div>
            <p className="text-secondary-foreground/70 mb-6 text-sm leading-relaxed">
              Premium quality, farm-fresh meat delivered straight to your doorstep. We take pride in hygiene, quality, and the perfect cuts.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-display font-bold text-lg mb-6">Categories</h3>
            <ul className="space-y-4 text-sm text-secondary-foreground/70">
              <li><Link href="/products?category=Chicken" className="hover:text-primary transition-colors">Fresh Chicken</Link></li>
              <li><Link href="/products?category=Mutton" className="hover:text-primary transition-colors">Premium Mutton</Link></li>
              <li><Link href="/products?category=Fish" className="hover:text-primary transition-colors">Seafood & Fish</Link></li>
              <li><Link href="/products?category=Eggs" className="hover:text-primary transition-colors">Farm Eggs</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-4 text-sm text-secondary-foreground/70">
              <li><Link href="/admin/login" className="hover:text-primary transition-colors">Admin Login</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Delivery Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display font-bold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm text-secondary-foreground/70">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>123 Butcher Street, Meat District, Food City 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>hello@a2rmeatshop.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-secondary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-secondary-foreground/50">
          <p>© {new Date().getFullYear()} A2R Meat Shop. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Payment Method: Cash on Delivery Only</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
