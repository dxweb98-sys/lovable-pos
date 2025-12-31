import React from 'react';
import { Plus } from 'lucide-react';
import { usePOS } from '@/context/POSContext';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  discount?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  description,
  price,
  image,
  discount,
}) => {
  const { addToCart } = usePOS();

  const discountedPrice = discount ? price * (1 - discount / 100) : price;

  const handleAdd = () => {
    addToCart({ id, name, price: discountedPrice, image });
  };

  return (
    <div className="card-product relative animate-fade-in">
      {discount && (
        <span className="discount-badge">-{discount}%</span>
      )}
      
      <div className="aspect-square rounded-xl bg-secondary overflow-hidden mb-3">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="space-y-1">
        <h3 className="font-semibold text-sm text-card-foreground line-clamp-1">{name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-primary font-bold">${discountedPrice.toFixed(2)}</span>
            {discount && (
              <span className="text-xs text-muted-foreground line-through">${price.toFixed(2)}</span>
            )}
          </div>
          
          <button
            onClick={handleAdd}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 bg-primary text-primary-foreground hover:scale-110 active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
