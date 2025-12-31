import React, { useState } from 'react';
import { Search, Settings, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '@/components/ProductCard';
import { CategoryPill } from '@/components/CategoryPill';
import { GlassNavigation } from '@/components/GlassNavigation';
import { PlanBadge } from '@/components/FeatureGate';
import { useSubscription } from '@/context/SubscriptionContext';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'snack', label: 'Snack' },
  { id: 'food', label: 'Food' },
  { id: 'drink', label: 'Drink' },
  { id: 'dessert', label: 'Dessert' },
];

const products = [
  { id: '1', name: 'Noodles Ramen', description: 'With Spicy Sauce', price: 7.00, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop', category: 'food', discount: 30 },
  { id: '2', name: 'Dumplings', description: 'Japanese Beef Filling', price: 4.67, image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=200&h=200&fit=crop', category: 'food', discount: 30 },
  { id: '3', name: 'Beef Burger', description: 'Selected Meat Specials', price: 6.01, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop', category: 'food', discount: 30 },
  { id: '4', name: 'Pizza Sicilia', description: 'Cheese & Pepperoni', price: 12.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop', category: 'food' },
  { id: '5', name: 'French Fries', description: 'Crispy & Salted', price: 3.50, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&h=200&fit=crop', category: 'snack' },
  { id: '6', name: 'Iced Coffee', description: 'Cold Brew Special', price: 4.50, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&h=200&fit=crop', category: 'drink' },
  { id: '7', name: 'Fresh Orange', description: 'Freshly Squeezed', price: 3.99, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200&h=200&fit=crop', category: 'drink' },
  { id: '8', name: 'Chocolate Cake', description: 'Rich & Creamy', price: 5.99, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop', category: 'dessert' },
];

const POS: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { canMakeTransaction } = useSubscription();
  const navigate = useNavigate();

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isTransactionLimitReached = !canMakeTransaction();

  return (
    <div className="page-container bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">QuickPOS</span>
            <PlanBadge />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/subscription')}
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 active:scale-95 transition-all"
            >
              <Crown className="w-5 h-5 text-primary" />
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-muted active:scale-95 transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu..."
            className="w-full h-12 pl-12 pr-4 bg-secondary/50 border-0 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {categories.map(category => (
            <CategoryPill
              key={category.id}
              label={category.label}
              isActive={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            />
          ))}
        </div>
      </header>

      {/* Transaction Limit Reached Banner */}
      {isTransactionLimitReached && (
        <div className="mx-4 mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl">
          <p className="text-sm text-destructive font-medium text-center">
            Monthly transaction limit reached. Upgrade to continue.
          </p>
        </div>
      )}

      {/* Products Grid */}
      <main className="px-4 py-4 pb-36">
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description}
              price={product.price}
              image={product.image}
              discount={product.discount}
            />
          ))}
        </div>
      </main>

      <GlassNavigation />
    </div>
  );
};

export default POS;
