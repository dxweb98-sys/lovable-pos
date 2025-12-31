import React, { useState } from 'react';
import { Plus, Package, Tag, Edit2, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { GlassNavigation } from '@/components/GlassNavigation';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

const initialProducts: Product[] = [
  { id: '1', name: 'Noodles Ramen', price: 7.00, category: 'food', image: '🍜' },
  { id: '2', name: 'Beef Burger', price: 6.01, category: 'food', image: '🍔' },
  { id: '3', name: 'French Fries', price: 3.50, category: 'snack', image: '🍟' },
  { id: '4', name: 'Iced Coffee', price: 4.50, category: 'drink', image: '☕' },
];

const initialCategories: Category[] = [
  { id: 'food', name: 'Food', icon: '🍔' },
  { id: 'snack', name: 'Snack', icon: '🍟' },
  { id: 'drink', name: 'Drink', icon: '🥤' },
  { id: 'dessert', name: 'Dessert', icon: '🍰' },
];

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'food' });
  const [newCategory, setNewCategory] = useState({ name: '', icon: '🍽️' });

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.price) {
      setProducts([...products, {
        id: Date.now().toString(),
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        image: '📦',
      }]);
      setNewProduct({ name: '', price: '', category: 'food' });
      setShowAddProduct(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.name) {
      setCategories([...categories, {
        id: newCategory.name.toLowerCase(),
        name: newCategory.name,
        icon: newCategory.icon,
      }]);
      setNewCategory({ name: '', icon: '🍽️' });
      setShowAddCategory(false);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  return (
    <div className="page-container bg-background">
      <PageHeader title="Dashboard" />

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="bg-secondary rounded-2xl p-1 flex">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'products' 
                ? 'bg-card text-foreground shadow-sm' 
                : 'text-muted-foreground'
            }`}
          >
            <Package className="w-4 h-4 inline-block mr-2" />
            Products
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'categories' 
                ? 'bg-card text-foreground shadow-sm' 
                : 'text-muted-foreground'
            }`}
          >
            <Tag className="w-4 h-4 inline-block mr-2" />
            Categories
          </button>
        </div>
      </div>

      <main className="px-4 space-y-4 pb-4">
        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            {/* Add Product Form */}
            {showAddProduct ? (
              <div className="bg-card rounded-2xl p-4 space-y-3 animate-fade-in">
                <h3 className="font-semibold text-foreground">Add Product</h3>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Product name"
                  className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="Price"
                  step="0.01"
                  className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddProduct(false)}
                    className="flex-1 h-10 bg-secondary text-secondary-foreground font-medium rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddProduct}
                    className="flex-1 h-10 bg-foreground text-background font-medium rounded-xl"
                  >
                    Add Product
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddProduct(true)}
                className="w-full h-14 bg-card border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add Product</span>
              </button>
            )}

            {/* Products List */}
            <div className="space-y-2">
              {products.map(product => (
                <div key={product.id} className="bg-card rounded-2xl p-4 flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{product.image}</span>
                    <div>
                      <p className="font-semibold text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">${product.price.toFixed(2)} • {product.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"
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
            {/* Add Category Form */}
            {showAddCategory ? (
              <div className="bg-card rounded-2xl p-4 space-y-3 animate-fade-in">
                <h3 className="font-semibold text-foreground">Add Category</h3>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Category name"
                  className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="text"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  placeholder="Emoji icon"
                  className="w-full h-12 px-4 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddCategory(false)}
                    className="flex-1 h-10 bg-secondary text-secondary-foreground font-medium rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCategory}
                    className="flex-1 h-10 bg-foreground text-background font-medium rounded-xl"
                  >
                    Add Category
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddCategory(true)}
                className="w-full h-14 bg-card border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add Category</span>
              </button>
            )}

            {/* Categories List */}
            <div className="space-y-2">
              {categories.map(category => (
                <div key={category.id} className="bg-card rounded-2xl p-4 flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <p className="font-semibold text-foreground">{category.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(category.id)}
                      className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"
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

      <GlassNavigation />
    </div>
  );
};

export default Dashboard;
