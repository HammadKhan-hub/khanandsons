import React, { useState, useEffect, useMemo } from 'react';
import { Link } from '../router/Router';
import { getCategories, getProducts } from '../services/dataService';
import { Category, Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { useSettings } from '../context/SettingsContext';
import {
  MessageCircle,
  ArrowRight,
  Package,
  ArrowLeft,
  Sparkles,
  Box,
  Layers,
  CornerDownRight,
  Filter,
} from 'lucide-react';

interface CategoryPageProps {
  slug: string;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ slug }) => {
  const { buildWhatsAppUrl, isWhatsAppConfigured } = useSettings();
  const [category, setCategory] = useState<Category | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [activeSubFilter, setActiveSubFilter] = useState<string>('all');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getCategories(), getProducts()]).then(([cats, prods]) => {
      setAllCategories(cats);
      const match = cats.find((c) => c.slug === slug || c.id === slug);
      if (match) {
        setCategory(match);
        document.title = `${match.name} Packaging — KHAN&SON'S PRINTER & PACKAGES`;

        if (match.parentCategoryId) {
          // It's a subcategory
          const parent = cats.find((c) => c.id === match.parentCategoryId);
          setParentCategory(parent || null);
          setSubcategories([]);
        } else {
          // It's a main category: find its nested subcategories
          const subs = cats.filter((c) => c.parentCategoryId === match.id);
          setParentCategory(null);
          setSubcategories(subs);
        }

        setAllProducts(prods.filter((p) => p.isPublished));
      } else {
        setCategory(null);
      }
      setLoading(false);
    });
  }, [slug]);

  // Reset subcategory filter when switching categories
  useEffect(() => {
    setActiveSubFilter('all');
  }, [slug]);

  // Determine matching products for current category/subcategory
  const categoryProducts = useMemo(() => {
    if (!category) return [];

    if (category.parentCategoryId) {
      // Subcategory view: products assigned to this subcategory
      return allProducts.filter(
        (p) =>
          p.subcategoryId === category.id ||
          p.categoryId === category.id ||
          p.categoryId === category.slug ||
          (p.subcategoryName && p.subcategoryName.toLowerCase() === category.name.toLowerCase())
      );
    }

    // Main category view: products assigned directly or to any child subcategory
    const childIds = new Set(subcategories.map((s) => s.id));
    return allProducts.filter(
      (p) =>
        p.categoryId === category.id ||
        p.categoryId === category.slug ||
        (Boolean(p.subcategoryId) && childIds.has(p.subcategoryId!)) ||
        (p.categoryName && p.categoryName.toLowerCase() === category.name.toLowerCase())
    );
  }, [category, subcategories, allProducts]);

  // Filtered by subcategory chip if on main category page
  const displayedProducts = useMemo(() => {
    if (activeSubFilter === 'all') {
      return categoryProducts;
    }
    return categoryProducts.filter((p) => p.subcategoryId === activeSubFilter);
  }, [categoryProducts, activeSubFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-12">
        <div className="text-center font-serif text-lg text-[#8C6D3B] animate-pulse flex items-center gap-2">
          <Box className="w-5 h-5 animate-spin" />
          <span>Loading packaging catalog collection...</span>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] py-20 px-4">
        <div className="max-w-md mx-auto text-center bg-white p-8 border border-[#E8E2D8] shadow-sm rounded-xs">
          <Package className="w-12 h-12 text-[#A89F91] mx-auto mb-3" />
          <h2 className="font-serif text-2xl font-semibold text-[#1E1B18]">
            Category Not Found
          </h2>
          <p className="text-xs text-[#6B6357] mt-2 mb-6">
            The packaging category you requested could not be located or has been archived.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E1B18] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#2C2723] rounded-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  const categoryWaUrl = isWhatsAppConfigured
    ? buildWhatsAppUrl(
        `Assalam-o-Alaikum! I am inquiring about custom packaging orders for: ${
          parentCategory ? `${parentCategory.name} › ${category.name}` : category.name
        }.`
      )
    : `https://wa.me/923108216304?text=Assalam-o-Alaikum!%20I%20am%20inquiring%20about%20custom%20orders%20for%20${encodeURIComponent(
        category.name
      )}.`;

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
        {/* Hierarchical Breadcrumb Navigation */}
        <nav className="text-xs text-[#7A7266] uppercase tracking-wider mb-6 flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-[#1E1B18] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#1E1B18] transition-colors">
            Packaging Catalog
          </Link>
          <span>/</span>
          {parentCategory && (
            <>
              <Link
                to={`/category/${parentCategory.slug}`}
                className="hover:text-[#1E1B18] transition-colors flex items-center gap-1"
              >
                <span>{parentCategory.name}</span>
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-[#1E1B18] font-semibold">{category.name}</span>
        </nav>

        {/* Category Hero Banner */}
        <div className="relative bg-[#1E1B18] text-[#FAF7F2] border border-[#3A332C] overflow-hidden mb-8 sm:mb-10 rounded-xs shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#D4AF37]/40 bg-[#2D0B15]/80 text-[#E8D4B0] text-[10px] font-semibold tracking-[0.2em] uppercase">
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  <span>
                    {parentCategory ? `Subcategory of ${parentCategory.name}` : "Khan & Son's Collection"}
                  </span>
                </div>

                {category.parentCategoryId && (
                  <Link
                    to={`/category/${parentCategory?.slug || ''}`}
                    className="text-[10px] text-[#D4AF37] hover:underline flex items-center gap-1"
                  >
                    <span>View Parent Collection</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight text-white">
                {category.name}
              </h1>

              <p className="text-xs sm:text-sm text-[#C5BDB2] leading-relaxed max-w-xl font-light">
                {category.description}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href={categoryWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-wrap items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm rounded-xs text-center"
                >
                  <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                  <span className="text-center break-words">Order on WhatsApp (0310 8216304)</span>
                </a>
                <Link
                  to="/custom-packaging"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider border border-[#5A5044] transition-colors rounded-xs text-center"
                >
                  <span>Request Custom Dimensions</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 h-56 sm:h-72 lg:h-full relative overflow-hidden bg-[#2C2723]">
              <img
                src={category.imageUrl}
                alt={`${category.name} mockup`}
                className="w-full h-full object-cover object-center"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#1E1B18] via-transparent to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Subcategories Filter Bar (when viewing a Main Category that has nested subcategories) */}
        {!category.parentCategoryId && subcategories.length > 0 && (
          <div className="bg-white p-4 border border-[#E8E2D8] rounded-xs mb-8 shadow-2xs">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1E1B18] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#8C6D3B]" />
                <span>Browse {category.name} Subcategories</span>
              </span>
              <span className="text-[11px] text-[#7A7266]">
                {subcategories.length} Subcategories
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveSubFilter('all')}
                className={`px-3.5 py-1.5 rounded-xs text-xs font-semibold tracking-wide transition-colors shrink-0 cursor-pointer ${
                  activeSubFilter === 'all'
                    ? 'bg-[#1E1B18] text-[#D4AF37]'
                    : 'bg-[#FAF7F2] text-[#4A433A] hover:bg-[#EFE9DF]'
                }`}
              >
                All {category.name} ({categoryProducts.length})
              </button>

              {subcategories.map((sub) => {
                const subCount = allProducts.filter((p) => p.subcategoryId === sub.id).length;
                const isActive = activeSubFilter === sub.id;

                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setActiveSubFilter(sub.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xs text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#8C6D3B] text-white font-semibold'
                        : 'bg-[#FAF7F2] text-[#4A433A] hover:bg-[#EFE9DF]'
                    }`}
                  >
                    <span>{sub.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#E8E2D8] text-[#6B6357]'
                      }`}
                    >
                      {subCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Product Listing Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8E2D8] pb-4 gap-2">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#1E1B18]">
              {activeSubFilter !== 'all'
                ? subcategories.find((s) => s.id === activeSubFilter)?.name || 'Filtered Products'
                : 'Available Designs & Styles'}
            </h2>
            <p className="text-xs text-[#6B6357] mt-0.5">
              Select any design below to configure dimensions, paper material, and generate your direct WhatsApp order.
            </p>
          </div>
          <span className="text-xs text-[#7A7266] font-medium bg-[#EFE9DF] px-2.5 py-1 rounded-xs self-start sm:self-auto">
            {displayedProducts.length} {displayedProducts.length === 1 ? 'Design Available' : 'Designs Available'}
          </span>
        </div>

        {/* Product Grid */}
        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E8E2D8] p-8 sm:p-12 text-center rounded-xs max-w-lg mx-auto">
            <Package className="w-12 h-12 text-[#A89F91] mx-auto mb-3" />
            <h3 className="font-serif text-lg font-semibold text-[#1E1B18]">
              Custom Order Available
            </h3>
            <p className="text-xs text-[#6B6357] mt-1 mb-6">
              We engineer custom boxes for {category.name} made to your exact dimensions and artwork specifications.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <a
                href={categoryWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider rounded-xs inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Discuss on WhatsApp</span>
              </a>
              <Link
                to="/custom-packaging"
                className="px-5 py-2.5 bg-[#1E1B18] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#2C2723] rounded-xs inline-flex items-center justify-center"
              >
                Submit Custom Dimensions
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
