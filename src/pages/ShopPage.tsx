import React, { useState, useEffect, useMemo } from 'react';
import { Link, useRouter } from '../router/Router';
import { getProducts, getCategories } from '../services/dataService';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, SlidersHorizontal, Package, ArrowRight, MessageCircle, Layers, CornerDownRight } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const ShopPage: React.FC = () => {
  const { buildWhatsAppUrl, isWhatsAppConfigured } = useSettings();
  const { search } = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'name-asc' | 'name-desc'>('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Packaging & Printing Catalog — KHAN&SON'S PRINTER & PACKAGES";
    Promise.all([getProducts(), getCategories()]).then(([prods, cats]) => {
      setProducts(prods.filter((p) => p.isPublished));
      setCategories(cats.filter((c) => c.isPublished));
      setLoading(false);
    });
  }, []);

  // Split categories into Main Categories and Subcategories
  const mainCategories = useMemo(
    () => categories.filter((c) => !c.parentCategoryId || c.parentCategoryId.trim() === ''),
    [categories]
  );

  const subcategories = useMemo(
    () => categories.filter((c) => c.parentCategoryId && c.parentCategoryId.trim() !== ''),
    [categories]
  );

  // Sync URL search params
  useEffect(() => {
    if (search) {
      const params = new URLSearchParams(search);
      const q = params.get('search') || params.get('q');
      const cat = params.get('category');
      const sub = params.get('subcategory');
      if (q) setSearchQuery(q);
      if (cat) {
        setSelectedCategory(cat);
        if (sub) setSelectedSubcategory(sub);
      }
    }
  }, [search]);

  // When selected main category changes, reset subcategory filter
  const handleSelectMainCategory = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedSubcategory('all');
  };

  // Subcategories available under the currently selected main category
  const activeSubcategories = useMemo(() => {
    if (selectedCategory === 'all' || selectedCategory.startsWith('sub:')) return [];
    return subcategories.filter((s) => s.parentCategoryId === selectedCategory);
  }, [subcategories, selectedCategory]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        let matchesCategory = true;
        if (selectedCategory !== 'all') {
          if (selectedCategory.startsWith('sub:')) {
            const subId = selectedCategory.slice(4);
            matchesCategory = p.subcategoryId === subId || p.categoryId === subId;
          } else {
            // Main category selected: match direct or child subcategories
            const childSubIds = new Set(
              subcategories.filter((s) => s.parentCategoryId === selectedCategory).map((s) => s.id)
            );
            matchesCategory =
              p.categoryId === selectedCategory ||
              (Boolean(p.subcategoryId) && childSubIds.has(p.subcategoryId!));

            // If a specific subcategory quick-chip is selected
            if (matchesCategory && selectedSubcategory !== 'all') {
              matchesCategory = p.subcategoryId === selectedSubcategory || p.categoryId === selectedSubcategory;
            }
          }
        }

        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.subcategoryName && p.subcategoryName.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'featured') {
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        }
        if (sortBy === 'name-asc') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'name-desc') {
          return b.name.localeCompare(a.name);
        }
        return 0;
      });
  }, [products, subcategories, selectedCategory, selectedSubcategory, searchQuery, sortBy]);

  const generalWaUrl = isWhatsAppConfigured
    ? buildWhatsAppUrl("Assalam-o-Alaikum! I am browsing your full catalog and need pricing on custom packaging.")
    : 'https://wa.me/923108216304?text=Assalam-o-Alaikum!%20I%20am%20browsing%20your%20packaging%20catalog.';

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
        {/* Breadcrumb & Header */}
        <div className="mb-6 sm:mb-8">
          <nav className="text-xs text-[#7A7266] uppercase tracking-wider mb-3">
            <Link to="/" className="hover:text-[#1E1B18] transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-[#1E1B18] font-semibold">Packaging Catalog</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#E8E2D8] pb-6 gap-4">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-[#1E1B18]">
                Packaging & Commercial Printing Catalog
              </h1>
              <p className="text-xs sm:text-sm text-[#6B6357] mt-1 max-w-2xl leading-relaxed">
                Browse our manufactured packaging styles across Pakistan. Filter by main collections or fine-tuned subcategories with direct WhatsApp quotes.
              </p>
            </div>

            <a
              href={generalWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs rounded-xs shrink-0"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Inquire on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 border border-[#E8E2D8] mb-8 shadow-2xs rounded-xs space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-[#8A8275] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search boxes, shopping bags, cartons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-14 py-2 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18] rounded-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8A8275] hover:text-[#1E1B18] cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Hierarchical Category Selector */}
            <div className="md:col-span-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#8A8275] shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory('all');
                }}
                className="w-full py-2 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18] rounded-xs cursor-pointer font-medium"
              >
                <option value="all">All Packaging Collections ({products.length})</option>
                {mainCategories.map((main) => {
                  const subs = subcategories.filter((s) => s.parentCategoryId === main.id);
                  return (
                    <React.Fragment key={main.id}>
                      <option value={main.id} className="font-semibold text-[#1E1B18]">
                        📁 {main.name} (All)
                      </option>
                      {subs.map((s) => (
                        <option key={s.id} value={`sub:${s.id}`}>
                          &nbsp;&nbsp;&nbsp;&nbsp;↳ {s.name}
                        </option>
                      ))}
                    </React.Fragment>
                  );
                })}
              </select>
            </div>

            {/* Sorting */}
            <div className="md:col-span-3 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#8A8275] shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full py-2 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18] rounded-xs cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="name-asc">Alphabetical: A to Z</option>
                <option value="name-desc">Alphabetical: Z to A</option>
              </select>
            </div>
          </div>

          {/* Primary Main Category Quick Chips */}
          <div className="pt-2 border-t border-[#F0ECE4] flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] text-[#8C6D3B] font-semibold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>Main:</span>
            </span>
            <button
              type="button"
              onClick={() => handleSelectMainCategory('all')}
              className={`px-3 py-1 rounded-xs text-[11px] font-medium transition-colors shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#1E1B18] text-[#D4AF37]'
                  : 'bg-[#FAF7F2] text-[#4A433A] hover:bg-[#EFE9DF]'
              }`}
            >
              All
            </button>
            {mainCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectMainCategory(c.id)}
                className={`px-3 py-1 rounded-xs text-[11px] font-medium transition-colors shrink-0 cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-[#1E1B18] text-[#D4AF37]'
                    : 'bg-[#FAF7F2] text-[#4A433A] hover:bg-[#EFE9DF]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Dependent Subcategory Quick Chips (Appears when a main category is selected and has subcategories) */}
          {activeSubcategories.length > 0 && (
            <div className="pt-2 border-t border-[#F0ECE4] flex items-center gap-1.5 overflow-x-auto pb-1 text-xs bg-[#FAF7F2]/60 p-2 rounded-xs">
              <span className="text-[10px] text-[#8C6D3B] font-semibold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <CornerDownRight className="w-3 h-3" />
                <span>Subcategories:</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedSubcategory('all')}
                className={`px-2.5 py-0.5 rounded-xs text-[11px] font-medium transition-colors shrink-0 cursor-pointer ${
                  selectedSubcategory === 'all'
                    ? 'bg-[#8C6D3B] text-white font-semibold'
                    : 'bg-white text-[#4A433A] hover:bg-[#EFE9DF] border border-[#DDD6C9]'
                }`}
              >
                All Subcategories
              </button>
              {activeSubcategories.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubcategory(sub.id)}
                  className={`px-2.5 py-0.5 rounded-xs text-[11px] font-medium transition-colors shrink-0 cursor-pointer ${
                    selectedSubcategory === sub.id
                      ? 'bg-[#8C6D3B] text-white font-semibold'
                      : 'bg-white text-[#4A433A] hover:bg-[#EFE9DF] border border-[#DDD6C9]'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results Count & Product Grid */}
        <div className="mb-4 flex items-center justify-between text-xs text-[#7A7266]">
          <span>
            Showing <strong>{filteredProducts.length}</strong> packaging items
          </span>
          {(selectedCategory !== 'all' || selectedSubcategory !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSubcategory('all');
                setSearchQuery('');
              }}
              className="text-[#8C6D3B] hover:underline cursor-pointer font-semibold"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E8E2D8] p-10 text-center rounded-xs max-w-lg mx-auto">
            <Package className="w-12 h-12 text-[#A89F91] mx-auto mb-3" />
            <h3 className="font-serif text-lg font-semibold text-[#1E1B18]">
              No Products Found
            </h3>
            <p className="text-xs text-[#6B6357] mt-1 mb-6">
              We couldn't find any products matching your selected criteria. You can submit custom dimensions and packaging requirements directly.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedSubcategory('all');
                }}
                className="px-4 py-2 bg-[#FAF7F2] border border-[#DDD6C9] text-xs font-semibold uppercase tracking-wider text-[#1E1B18] hover:bg-[#EFE9DF] rounded-xs cursor-pointer"
              >
                Clear Filters
              </button>
              <Link
                to="/custom-packaging"
                className="px-4 py-2 bg-[#1E1B18] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#2C2723] rounded-xs"
              >
                Submit Custom Specification
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
