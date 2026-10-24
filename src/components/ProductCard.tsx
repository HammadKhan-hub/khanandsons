import React from 'react';
import { Product } from '../types';
import { Link } from '../router/Router';
import { useSettings } from '../context/SettingsContext';
import { MessageCircle, Eye, Sparkles, Box } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { buildWhatsAppUrl, buildProductWhatsAppMessage, isWhatsAppConfigured } = useSettings();

  const productUrl = typeof window !== 'undefined' ? `${window.location.origin}/product/${product.slug}` : '';
  const waMessage = buildProductWhatsAppMessage({
    productName: product.name,
    productUrl,
    dimensions: product.availableDimensions?.[0],
    material: product.materialOptions?.[0],
  });

  const waUrl = isWhatsAppConfigured ? buildWhatsAppUrl(waMessage, false) : `https://wa.me/923108216304?text=${encodeURIComponent(waMessage)}`;

  const priceText = product.pricingMode === 'indicative' && product.indicativePrice
    ? product.indicativePrice
    : 'Price on Request';

  return (
    <article className="group bg-white border border-[#E8E2D8] hover:border-[#8C6D3B]/70 transition-all duration-300 flex flex-col h-full rounded-xs overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] min-w-0 max-w-full">
      {/* Image Container with high-res packaging mockup */}
      <Link
        to={`/product/${product.slug}`}
        className="relative block aspect-[4/3] bg-[#F5F0E8] overflow-hidden"
        aria-label={`View specifications for ${product.name}`}
      >
        <img
          src={product.imageUrl}
          alt={`Custom packaging mockup for ${product.name}`}
          className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
          loading="lazy"
          decoding="async"
        />

        {product.isFeatured && (
          <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-[#1E1B18]/90 backdrop-blur-xs text-[#D4AF37] text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 flex items-center gap-1 shadow-xs rounded-xs">
            <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
            <span>Featured</span>
          </span>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-white/95 text-[#1E1B18] text-[11px] font-semibold uppercase tracking-wider shadow-sm rounded-xs transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
            <Eye className="w-3 h-3 text-[#8C6D3B]" />
            <span>View Specifications</span>
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-4.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & MOQ Row */}
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-[#8C6D3B] font-semibold uppercase tracking-wider mb-1">
            <span className="truncate max-w-[65%]" title={product.subcategoryName ? `${product.categoryName} › ${product.subcategoryName}` : (product.categoryName || 'Packaging')}>
              {product.subcategoryName ? `${product.categoryName} › ${product.subcategoryName}` : (product.categoryName || 'Packaging')}
            </span>
            <span className="text-[#6B6357] font-normal normal-case text-[9px] sm:text-[10px] bg-[#FAF7F2] px-1.5 py-0.5 rounded-xs border border-[#EDE6DC]">
              {product.minOrderQuantity ? `MOQ ${product.minOrderQuantity.split(' ')[0]}` : 'MOQ 500'}
            </span>
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.slug}`} className="block group-hover:text-[#8C6D3B] transition-colors">
            <h3 className="font-serif text-sm sm:text-base font-semibold text-[#1E1B18] leading-snug line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Short description */}
          <p className="hidden sm:block text-[11px] text-[#6B6357] mt-1.5 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Dimension or Material Spec Badge */}
          {product.availableDimensions && product.availableDimensions.length > 0 && (
            <div className="mt-2 text-[9px] sm:text-[10px] text-[#635B50] bg-[#FAF7F2] p-1.5 rounded-xs border border-[#EDE6DC] flex items-center gap-1 truncate">
              <Box className="w-3 h-3 text-[#8C6D3B] shrink-0" />
              <span className="font-medium text-[#1E1B18]">Sample:</span>
              <span className="truncate">{product.availableDimensions[0]}</span>
            </div>
          )}
        </div>

        {/* Pricing & Order on WhatsApp Actions */}
        <div className="mt-3 pt-2.5 sm:pt-3.5 border-t border-[#F0ECE4]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] sm:text-[10px] text-[#8A8275] uppercase tracking-wider font-medium">Price</span>
            <span className="font-serif text-xs sm:text-sm font-semibold text-[#1E1B18] truncate ml-1">
              {priceText}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 min-w-0">
            {/* Clear Order on WhatsApp Button */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:col-span-8 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 bg-[#25D366] hover:bg-[#20BA5A] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-2xs hover:shadow-xs rounded-xs min-w-0"
              title={`Order ${product.name} on WhatsApp`}
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white shrink-0" />
              <span className="truncate">Order on WhatsApp</span>
            </a>

            {/* Quick Details Button */}
            <Link
              to={`/product/${product.slug}`}
              className="sm:col-span-4 flex items-center justify-center gap-1 px-2 py-2 border border-[#D5CDBD] text-[#2E2924] hover:bg-[#FAF7F2] hover:border-[#8C6D3B] text-[10px] sm:text-xs font-medium uppercase tracking-wider transition-colors rounded-xs shrink-0"
              title="View product specifications"
            >
              <Eye className="w-3 h-3 text-[#7A7266] shrink-0" />
              <span className="sm:hidden md:inline">Specs</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};
