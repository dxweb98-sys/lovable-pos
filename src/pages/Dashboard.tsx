import React, { useState } from 'react';
import { Plus, Package, Tag, Edit2, Trash2, TrendingUp, Clock, Receipt, ChevronRight, X } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { GlassNavigation } from '@/components/GlassNavigation';
import { usePOS } from '@/context/POSContext';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  sold?: number;
}

interface Category {
  id: string;
  name: string;
}

const initialProducts: Product[] = [
  { id: '1', name: 'Noodles Ramen', price: 7.00, category: 'food', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=100&h=100&fit=crop', sold: 156 },
  { id: '2', name: 'Beef Burger', price: 6.01, category: 'food', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop', sold: 142 },
  { id: '3', name: 'French Fries', price: 3.50, category: 'snack', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=100&h=100&fit=crop', sold: 98 },
  { id: '4', name: 'Iced Coffee', price: 4.50, category: 'drink', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=100&h=100&fit=crop', sold: 87 },
];

const initialCategories: Category[] = [
  { id: 'food', name: 'Food' },
  { id: 'snack', name: 'Snack' },
  { id: 'drink', name: 'Drink' },
  { id: 'dessert', name: 'Dessert' },
];

const peakHours = [
  { hour: '11:00', orders: 45, percentage: 60 },
  { hour: '12:00', orders: 78, percentage: 100 },
  { hour: '13:00', orders: 62, percentage: 80 },
  { hour: '18:00', orders: 55, percentage: 70 },
  { hour: '19:00', orders: 72, percentage: 92 },
  { hour: '20:00', orders: 48, percentage: 62 },
];

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories'>('overview');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'food', image: '' });
  const [newCategory, setNewCategory] = useState({ name: '' });
  
  const { transactions, currentShift } = usePOS();

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.price) {
      setProducts([...products, {
        id: Date.now().toString(),
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        image: newProduct.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop',
        sold: 0,
      }]);
      setNewProduct({ name: '', price: '', category: 'food', image: '' });
      setShowAddProduct(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.name) {
      setCategories([...categories, {
        id: newCategory.name.toLowerCase().replace(/\s+/g, '-'),
        name: newCategory.name,
      }]);
      setNewCategory({ name: '' });
      setShowAddCategory(false);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetail(true);
  };

  const bestSellers = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 4);
  const totalTransactions = currentShift?.transactions.length || transactions.length;
  const totalRevenue = (currentShift?.transactions || transactions).reduce((sum, t) => sum + t.total, 0);

  return (
    <div className="page-container bg-background">
      <PageHeader title="Dashboard" />

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="bg-secondary/50 rounded-2xl p-1 flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'overview' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline-block mr-1.5" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'products' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground'
            }`}
          >
            <Package className="w-4 h-4 inline-block mr-1.5" />
            Products
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'categories' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground'
            }`}
          >
            <Tag className="w-4 h-4 inline-block mr-1.5" />
            Categories
          </button>
        </div>
      </div>

      <main className="px-4 space-y-4 pb-32">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Today's Sales</p>
                <p className="text-2xl font-bold text-foreground mt-1">${totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-success mt-1">+12.5% vs yesterday</p>
              </div>
              <div className="bg-gradient-to-br from-success/20 to-success/5 rounded-2xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Transactions</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalTransactions}</p>
                <p className="text-xs text-success mt-1">+8 vs yesterday</p>
              </div>
            </div>

            {/* Best Sellers */}
            <div className="bg-secondary/30 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Best Sellers
                </h3>
                <span className="text-xs text-muted-foreground">This month</span>
              </div>
              <div className="space-y-3">
                {bestSellers.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                      index === 1 ? 'bg-gray-300/30 text-gray-500' :
                      index === 2 ? 'bg-amber-600/20 text-amber-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </span>
                    <img src={product.image} alt={product.name} className="w-10 h-10 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sold} sold</p>
                    </div>
                    <p className="font-semibold text-primary text-sm">${product.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Peak Hours */}
            <div className="bg-secondary/30 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Peak Hours
                </h3>
                <span className="text-xs text-muted-foreground">Average</span>
              </div>
              <div className="flex items-end gap-2 h-24">
                {peakHours.map((hour) => (
                  <div key={hour.hour} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary/30"
                      style={{ height: `${hour.percentage}%` }}
                    >
                      <div 
                        className="w-full bg-primary rounded-t-lg"
                        style={{ height: '100%', opacity: hour.percentage / 100 }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{hour.hour}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Peak time: <span className="text-foreground font-medium">12:00 - 13:00</span> & <span className="text-foreground font-medium">19:00 - 20:00</span>
              </p>
            </div>

            {/* Recent Transactions */}
            <div className="bg-secondary/30 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary" />
                  Recent Transactions
                </h3>
              </div>
              {(currentShift?.transactions || transactions).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
              ) : (
                <div className="space-y-2">
                  {(currentShift?.transactions || transactions).slice(-5).reverse().map((transaction) => (
                    <button
                      key={transaction.id}
                      onClick={() => handleTransactionClick(transaction)}
                      className="w-full bg-background rounded-xl p-3 flex items-center justify-between hover:bg-muted/50 active:scale-[0.98] transition-all"
                    >
                      <div className="text-left">
                        <p className="font-medium text-foreground text-sm">
                          {transaction.items.length} items
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          {' • '}
                          <span className="capitalize">{transaction.paymentMethod}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-success">${transaction.total.toFixed(2)}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            <button
              onClick={() => setShowAddProduct(true)}
              className="w-full h-14 bg-primary/10 border-2 border-dashed border-primary/30 rounded-2xl flex items-center justify-center gap-2 text-primary hover:bg-primary/20 active:scale-[0.98] transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Product</span>
            </button>

            <div className="space-y-2">
              {products.map(product => (
                <div key={product.id} className="bg-secondary/30 rounded-2xl p-3 flex items-center gap-3 animate-fade-in">
                  <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">${product.price.toFixed(2)} • {product.category}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 active:scale-95 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <>
            <button
              onClick={() => setShowAddCategory(true)}
              className="w-full h-14 bg-primary/10 border-2 border-dashed border-primary/30 rounded-2xl flex items-center justify-center gap-2 text-primary hover:bg-primary/20 active:scale-[0.98] transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Category</span>
            </button>

            <div className="space-y-2">
              {categories.map(category => (
                <div key={category.id} className="bg-secondary/30 rounded-2xl p-4 flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Tag className="w-5 h-5 text-primary" />
                    </div>
                    <p className="font-semibold text-foreground">{category.name}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(category.id)}
                      className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 active:scale-95 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Add Product Drawer */}
      <Drawer open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DrawerContent className="max-h-[85vh] rounded-t-3xl">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-xl font-bold text-center">Add Product</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Product Name</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Enter product name"
                className="w-full h-12 px-4 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Price</label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                placeholder="0.00"
                step="0.01"
                className="w-full h-12 px-4 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Category</label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full h-12 px-4 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Image URL (optional)</label>
              <input
                type="text"
                value={newProduct.image}
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                placeholder="https://..."
                className="w-full h-12 px-4 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <button
              onClick={handleAddProduct}
              disabled={!newProduct.name || !newProduct.price}
              className="w-full h-14 bg-primary text-primary-foreground font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 btn-primary-glow"
            >
              Add Product
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Add Category Drawer */}
      <Drawer open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DrawerContent className="rounded-t-3xl">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-xl font-bold text-center">Add Category</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Category Name</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Enter category name"
                className="w-full h-12 px-4 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <button
              onClick={handleAddCategory}
              disabled={!newCategory.name}
              className="w-full h-14 bg-primary text-primary-foreground font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 btn-primary-glow"
            >
              Add Category
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Transaction Detail Drawer */}
      <Drawer open={showTransactionDetail} onOpenChange={setShowTransactionDetail}>
        <DrawerContent className="max-h-[85vh] rounded-t-3xl">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-xl font-bold text-center">Transaction Details</DrawerTitle>
          </DrawerHeader>
          {selectedTransaction && (
            <div className="px-4 pb-8 space-y-4">
              {/* Transaction Info */}
              <div className="bg-success/10 rounded-2xl p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Amount</p>
                <p className="text-3xl font-bold text-success mt-1">${selectedTransaction.total.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-2 capitalize">
                  {selectedTransaction.paymentMethod} • {new Date(selectedTransaction.timestamp).toLocaleString()}
                </p>
              </div>

              {/* Items */}
              <div className="bg-secondary/30 rounded-2xl p-4">
                <h4 className="font-semibold text-foreground mb-3">Items ({selectedTransaction.items.length})</h4>
                <div className="space-y-2">
                  {selectedTransaction.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium text-foreground text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-secondary/30 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${selectedTransaction.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-success">-${selectedTransaction.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">${selectedTransaction.tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-primary">${selectedTransaction.total.toFixed(2)}</span>
                </div>
              </div>

              {selectedTransaction.customer && (
                <div className="bg-secondary/30 rounded-2xl p-4">
                  <h4 className="font-semibold text-foreground mb-2">Customer</h4>
                  <p className="text-foreground">{selectedTransaction.customer.name}</p>
                  {selectedTransaction.customer.phone && (
                    <p className="text-sm text-muted-foreground">{selectedTransaction.customer.phone}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DrawerContent>
      </Drawer>

      <GlassNavigation />
    </div>
  );
};

export default Dashboard;
