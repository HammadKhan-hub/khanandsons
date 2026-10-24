import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, Link } from '../router/Router';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Search,
  Layers,
  CornerDownRight,
} from 'lucide-react';
import { getCategories } from '../services/dataService';
import { INITIAL_CATEGORIES } from '../data/seedData';
import { Category } from '../types';

export const Navbar: React.FC = () => {
  const { path, navigate } = useRouter();
  const { settings, buildWhatsAppUrl, isWhatsAppConfigured } = useSettings();
  const { isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [mobileCategoriesExpanded, setMobileCategoriesExpanded] = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load live categories with fallback to INITIAL_CATEGORIES
  useEffect(() => {
    getCategories().then((cats) => {
      if (cats && cats.length > 0) {
        setCategories(cats);
      }
    });
  }, [path]);

  const mainCategories = useMemo(
    () => categories.filter((c) => !c.parentCategoryId || c.parentCategoryId.trim() === ''),
    [categories]
  );

  const subcategories = useMemo(
    () => categories.filter((c) => c.parentCategoryId && c.parentCategoryId.trim() !== ''),
    [categories]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/shop?search=${encodeURIComponent(navSearch.trim())}`);
    } else {
      navigate('/shop');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoriesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCategoriesDropdownOpen(false);
  }, [path]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FAF7F2]/95 backdrop-blur-md shadow-xs border-b border-[#E8E2D8]'
          : 'bg-[#FAF7F2] border-b border-[#EDE6DC]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4 min-w-0">
          {/* Brand Logo */}
          <Link to="/" className="flex flex-col items-start group shrink min-w-0">
            <span className="font-serif text-xl sm:text-2xl md:text-3xl font-bold tracking-[0.04em] sm:tracking-[0.08em] text-[#3B131D] group-hover:text-[#8C6D3B] transition-colors uppercase truncate">
              KHANANDSON'S
            </span>
            <span className="text-[8px] sm:text-[10px] font-sans tracking-[0.2em] sm:tracking-[0.25em] text-[#8C6D3B] uppercase font-semibold -mt-0.5 sm:-mt-1 truncate">
              PRINTING & PACKAGES
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-[13px] font-medium tracking-wide">
            <Link
              to="/"
              className={`transition-colors py-1.5 relative ${
                path === '/' ? 'text-[#3B131D] font-bold border-b-2 border-[#3B131D]' : 'text-[#4A433A] hover:text-[#1E1B18]'
              }`}
            >
              Home
            </Link>

            {/* Hierarchical Categories Dropdown */}
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={() => setCategoriesDropdownOpen(true)}
              onMouseLeave={() => setCategoriesDropdownOpen(false)}
            >
              <Link
                to="/shop"
                className={`transition-colors py-1.5 flex items-center gap-1 ${
                  path.startsWith('/category') || path === '/shop'
                    ? 'text-[#3B131D] font-bold border-b-2 border-[#3B131D]'
                    : 'text-[#4A433A] hover:text-[#1E1B18]'
                }`}
              >
                <span>Categories</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#8C6D3B] transition-transform duration-200 ${
                    categoriesDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </Link>

              {categoriesDropdownOpen && (
                <div className="absolute top-full left-0 w-[540px] bg-white border border-[#E8E2D8] shadow-2xl rounded-xs p-5 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0ECE4]">
                    <span className="font-serif text-sm font-bold text-[#1E1B18] flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#8C6D3B]" />
                      <span>Packaging Collections</span>
                    </span>
                    <Link
                      to="/shop"
                      onClick={() => setCategoriesDropdownOpen(false)}
                      className="text-[11px] font-semibold text-[#8C6D3B] hover:text-[#1E1B18] flex items-center gap-1 uppercase tracking-wider"
                    >
                      <span>View All Products</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                    {mainCategories.map((main) => {
                      const subs = subcategories.filter((s) => s.parentCategoryId === main.id);

                      return (
                        <div key={main.id} className="space-y-1">
                          <Link
                            to={`/category/${main.slug}`}
                            onClick={() => setCategoriesDropdownOpen(false)}
                            className="font-serif text-xs font-bold text-[#1E1B18] hover:text-[#8C6D3B] transition-colors block truncate"
                          >
                            {main.name}
                          </Link>

                          {subs.length > 0 && (
                            <div className="space-y-0.5 pl-2 border-l border-[#DDD6C9]">
                              {subs.slice(0, 3).map((sub) => (
                                <Link
                                  key={sub.id}
                                  to={`/category/${sub.slug}`}
                                  onClick={() => setCategoriesDropdownOpen(false)}
                                  className="block text-[11px] text-[#6B6357] hover:text-[#8C6D3B] transition-colors truncate"
                                >
                                  ↳ {sub.name}
                                </Link>
                              ))}
                              {subs.length > 3 && (
                                <Link
                                  to={`/category/${main.slug}`}
                                  onClick={() => setCategoriesDropdownOpen(false)}
                                  className="block text-[10px] text-[#8C6D3B] font-semibold hover:underline"
                                >
                                  +{subs.length - 3} more
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#F0ECE4] bg-[#FAF7F2] -mx-5 -mb-5 p-3 px-5 flex items-center justify-between text-xs text-[#6B6357] rounded-b-xs">
                    <span>Need custom box dimensions or die-cut samples?</span>
                    <Link
                      to="/custom-packaging"
                      onClick={() => setCategoriesDropdownOpen(false)}
                      className="font-semibold text-[#8C6D3B] hover:text-[#1E1B18] uppercase tracking-wider text-[11px]"
                    >
                      Request Custom Quote →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/custom-packaging"
              className={`transition-colors py-1.5 ${
                path === '/custom-packaging' ? 'text-[#3B131D] font-bold border-b-2 border-[#3B131D]' : 'text-[#4A433A] hover:text-[#1E1B18]'
              }`}
            >
              Custom Packaging
            </Link>

            <Link
              to="/about"
              className={`transition-colors py-1.5 ${
                path === '/about' ? 'text-[#3B131D] font-bold border-b-2 border-[#3B131D]' : 'text-[#4A433A] hover:text-[#1E1B18]'
              }`}
            >
              About Us
            </Link>

            <Link
              to="/contact"
              className={`transition-colors py-1.5 ${
                path === '/contact' ? 'text-[#3B131D] font-bold border-b-2 border-[#3B131D]' : 'text-[#4A433A] hover:text-[#1E1B18]'
              }`}
            >
              Contact Us
            </Link>
          </nav>

          {/* Right Action: Search box & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative">
              <Search className="w-3.5 h-3.5 text-[#8A8275] absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search boxes..."
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                className="w-40 md:w-52 pl-8 pr-3 py-1.5 text-xs bg-white border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] rounded-xs text-[#1E1B18] shadow-2xs"
              />
            </form>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#2E2924] hover:text-[#8C6D3B] transition-colors focus:outline-none cursor-pointer rounded-xs hover:bg-[#EFE9DF]"
              aria-label="Open mobile navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[9999] lg:hidden flex">
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-out Menu Panel */}
            <div className="relative w-4/5 max-w-sm bg-[#FAF7F2] h-full shadow-2xl flex flex-col z-10 border-r border-[#E8E2D8]">
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#E8E2D8] flex items-center justify-between bg-white">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex flex-col items-start"
                >
                  <span className="font-serif text-lg font-bold tracking-[0.08em] text-[#3B131D] uppercase">
                    KHAN&SON'S
                  </span>
                  <span className="text-[9px] font-sans tracking-[0.2em] text-[#6B6357] uppercase font-medium -mt-0.5">
                    Printer & Packages • Multan
                  </span>
                </Link>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-[#2E2924] hover:text-[#8C6D3B] hover:bg-[#E8E2D8] rounded-full transition-colors cursor-pointer"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Navigation List */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
                {/* Primary CTA */}
                <div className="mb-4">
                  <Link
                    to="/custom-packaging"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1E1B18] text-[#F5F0E8] text-xs font-semibold uppercase tracking-[0.15em] rounded-xs shadow-xs hover:bg-[#2C2723]"
                  >
                    <span>Request Custom Quote</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                  </Link>
                </div>

                {/* Primary Links */}
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-xs text-sm font-serif font-medium transition-colors ${
                    path === '/' ? 'bg-[#EFE9DF] text-[#8C6D3B] font-bold' : 'text-[#1E1B18] hover:bg-[#F2ECE3]'
                  }`}
                >
                  <span>Home</span>
                </Link>

                {/* Hierarchical Categories Accordion */}
                <div className="border border-[#E8E2D8] rounded-xs overflow-hidden my-1 bg-white">
                  <button
                    onClick={() => setMobileCategoriesExpanded(!mobileCategoriesExpanded)}
                    className="w-full flex items-center justify-between py-2.5 px-3 text-sm font-serif font-medium text-[#1E1B18] hover:bg-[#FAF7F2] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span>Packaging Categories</span>
                      <span className="text-[10px] bg-[#EFE9DF] text-[#8C6D3B] px-1.5 py-0.5 rounded-xs font-sans">
                        {mainCategories.length}
                      </span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#8C6D3B] transition-transform duration-200 ${
                        mobileCategoriesExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {mobileCategoriesExpanded && (
                    <div className="border-t border-[#E8E2D8] bg-[#FAF7F2] divide-y divide-[#EFE9DF] max-h-72 overflow-y-auto">
                      {mainCategories.map((c) => {
                        const subs = subcategories.filter((s) => s.parentCategoryId === c.id);
                        const isSubExpanded = mobileExpandedCat === c.id;

                        return (
                          <div key={c.id} className="bg-white">
                            <div className="flex items-center justify-between py-2 px-3 text-xs">
                              <Link
                                to={`/category/${c.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-[#1E1B18] font-semibold hover:text-[#8C6D3B] flex-1 truncate"
                              >
                                {c.name}
                              </Link>
                              {subs.length > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => setMobileExpandedCat(isSubExpanded ? null : c.id)}
                                  className="p-1 text-[#8C6D3B] hover:bg-[#FAF7F2] rounded-xs"
                                  title="Toggle subcategories"
                                >
                                  <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                      isSubExpanded ? 'rotate-180' : ''
                                    }`}
                                  />
                                </button>
                              ) : (
                                <Link
                                  to={`/category/${c.slug}`}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="p-1 text-[#B0A799]"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </Link>
                              )}
                            </div>

                            {subs.length > 0 && isSubExpanded && (
                              <div className="bg-[#FAF7F2] border-t border-[#EFE9DF] pl-5 pr-3 py-1 space-y-1">
                                {subs.map((sub) => (
                                  <Link
                                    key={sub.id}
                                    to={`/category/${sub.slug}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block py-1 text-[11px] text-[#6B6357] hover:text-[#8C6D3B] transition-colors truncate"
                                  >
                                    ↳ {sub.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Link
                  to="/custom-packaging"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-xs text-sm font-serif font-medium transition-colors ${
                    path === '/custom-packaging' ? 'bg-[#EFE9DF] text-[#8C6D3B] font-bold' : 'text-[#1E1B18] hover:bg-[#F2ECE3]'
                  }`}
                >
                  <span>Custom Packaging</span>
                </Link>

                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-xs text-sm font-serif font-medium transition-colors ${
                    path === '/about' ? 'bg-[#EFE9DF] text-[#8C6D3B] font-bold' : 'text-[#1E1B18] hover:bg-[#F2ECE3]'
                  }`}
                >
                  <span>About Us</span>
                </Link>

                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-xs text-sm font-serif font-medium transition-colors ${
                    path === '/contact' ? 'bg-[#EFE9DF] text-[#8C6D3B] font-bold' : 'text-[#1E1B18] hover:bg-[#F2ECE3]'
                  }`}
                >
                  <span>Contact Us</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xs text-sm font-serif font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors mt-4"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Admin Control Panel</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                  </Link>
                )}
              </div>

              {/* Mobile Drawer Footer with Verified Contacts */}
              <div className="p-4 border-t border-[#E8E2D8] bg-[#F2ECE3] text-[11px] text-[#6B6357] space-y-2">
                <a
                  href={`tel:${settings.whatsappNumber || '923108216304'}`}
                  className="flex items-center gap-2 text-[#1E1B18] hover:text-[#8C6D3B]"
                >
                  <Phone className="w-3.5 h-3.5 text-[#8C6D3B]" />
                  <span>Direct Hotline: {settings.phoneNumber || '+92 310 8216304'}</span>
                </a>
                <a
                  href={`mailto:${settings.email || 'nasirkhanprinting@gmail.com'}`}
                  className="flex items-center gap-2 text-[#1E1B18] hover:text-[#8C6D3B]"
                >
                  <Mail className="w-3.5 h-3.5 text-[#8C6D3B]" />
                  <span className="truncate">{settings.email || 'nasirkhanprinting@gmail.com'}</span>
                </a>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
};
