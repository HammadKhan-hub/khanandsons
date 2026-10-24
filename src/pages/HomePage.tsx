import React, { useState, useEffect } from 'react';
import { Link } from '../router/Router';
import { useSettings } from '../context/SettingsContext';
import { getProducts, getCategories } from '../services/dataService';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Gallery3DSection } from '../components/Gallery3DSection';
import {
  MessageCircle,
  ArrowRight,
  Sparkles,
  Layers,
  Printer,
  ChevronRight,
  CheckCircle2,
  Factory,
  Star,
  Quote,
  HelpCircle,
  Box,
  Truck,
  Award,
  ShieldCheck,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { buildWhatsAppUrl, isWhatsAppConfigured } = useSettings();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');

  // Interactive Box Estimator State
  const [estType, setEstType] = useState('Rigid Magnetic Gift Box');
  const [estLength, setEstLength] = useState('8');
  const [estWidth, setEstWidth] = useState('6');
  const [estHeight, setEstHeight] = useState('3');
  const [estFinish, setEstFinish] = useState('Gold Foil Stamping + Matte');
  const [estQuantity, setEstQuantity] = useState('1,000');

  useEffect(() => {
    document.title = "KHAN&SON'S PRINTER & PACKAGES — Premium Custom Packaging & Printing Pakistan";
    Promise.all([getCategories(), getProducts()]).then(([cats, prods]) => {
      setCategories(cats.filter((c) => c.isPublished));
      setProducts(prods.filter((p) => p.isPublished));
    });
  }, []);

  const heroWaUrl = isWhatsAppConfigured
    ? buildWhatsAppUrl("Assalam-o-Alaikum! I saw your website and would like to inquire about custom packaging and commercial printing across Pakistan.")
    : 'https://wa.me/923108216304?text=Assalam-o-Alaikum!%20I%20would%20like%20to%20inquire%20about%20custom%20packaging.';

  // Build estimator WhatsApp message
  const estimatorMessage = `Assalam-o-Alaikum Khan & Son's! I configured custom packaging on your website and would like a price quotation:
- Packaging Type: ${estType}
- Dimensions: ${estLength} x ${estWidth} x ${estHeight} inches
- Premium Finish: ${estFinish}
- Estimated Quantity: ${estQuantity} units
- Destination: Pakistan
Please let me know the estimated cost, lead time, and sample availability. Thank you!`;

  const estimatorWaUrl = isWhatsAppConfigured
    ? buildWhatsAppUrl(estimatorMessage, false)
    : `https://wa.me/923108216304?text=${encodeURIComponent(estimatorMessage)}`;

  const mainCategories = categories.filter((c) => !c.parentCategoryId);

  // Filter products for the showcase (matches direct categoryId or subcategory's parent)
  const displayedProducts = selectedCatFilter === 'all'
    ? products.slice(0, 8)
    : products.filter((p) => {
        if (p.categoryId === selectedCatFilter) return true;
        const sub = categories.find((c) => c.id === p.subcategoryId);
        return sub?.parentCategoryId === selectedCatFilter;
      });

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E1B18] font-sans w-full max-w-full overflow-hidden">
      {/* ============================================================== */}
      {/* 1. HERO SECTION - LUMÉVERE LUXURY EDITORIAL ATMOSPHERE          */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden pt-14 pb-16 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-24 bg-[#1F070E] text-[#FAF7F2] border-b border-[#2C0C14] w-full max-w-full">
        {/* Subtle radial lighting for deep wine luxury atmosphere */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_35%,rgba(90,18,36,0.45)_0%,rgba(31,7,14,0.95)_75%)] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center min-w-0">
          {/* Top Pill Tag: KHANANDSON'S PRINTING & PACKAGES - Made responsive to avoid horizontal overflow */}
          <div className="inline-flex max-w-full items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 rounded-full border border-[#D4AF37]/40 bg-[#2D0B15]/80 text-[#E8D4B0] text-[10px] sm:text-xs font-semibold tracking-[0.1em] sm:tracking-[0.2em] uppercase shadow-xs mb-6 sm:mb-8 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span className="truncate">KHANANDSON'S PRINTING & PACKAGES</span>
          </div>

          {/* Headline: Custom Printing & Packaging Solutions */}
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-[1.15] max-w-4xl mx-auto mb-5 sm:mb-6 break-words">
            Custom Printing &{' '}
            <br className="hidden sm:inline" />
            <span className="italic font-normal text-[#D2AB66]">Packaging Solutions</span>
          </h1>

          {/* Subtitle Paragraph */}
          <p className="text-xs sm:text-base md:text-lg text-[#C8BCB8] leading-relaxed max-w-3xl mx-auto font-light mb-8 sm:mb-10 px-2 break-words">
            Manufacturers of luxury rigid boxes, bakery cake trays, pastry carriers, folding cartons, sweet boxes, boutique paper bags, pizza & burger cartons, soap boxes, mango export crates, and royal wedding invitations.
          </p>

          {/* 3 Action Buttons in Horizontal Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 w-full max-w-full">
            <Link
              to="/shop"
              className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 bg-[#D2AB66] hover:bg-[#C29B56] text-[#1E1B18] text-xs font-bold uppercase tracking-wider sm:tracking-[0.15em] rounded-xs transition-colors shadow-md text-center cursor-pointer min-w-0"
            >
              EXPLORE 10 CATEGORIES
            </Link>

            <Link
              to="/category/cake-bakery-boxes"
              className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 bg-[#230710]/60 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider sm:tracking-[0.15em] rounded-xs border border-[#D4AF37]/80 transition-colors shadow-xs text-center cursor-pointer min-w-0"
            >
              CAKE & PASTRY BOXES
            </Link>

            <Link
              to="/custom-packaging"
              className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 bg-[#5A1224] hover:bg-[#6D162C] text-white text-xs font-bold uppercase tracking-wider sm:tracking-[0.15em] rounded-xs transition-colors shadow-md flex items-center justify-center gap-2 text-center cursor-pointer min-w-0"
            >
              <span>REQUEST QUOTE</span>
              <ArrowRight className="w-4 h-4 text-white shrink-0" />
            </Link>
          </div>

          {/* Bottom 4 Stats Columns - min-w-0 added to prevent grid column overflow */}
          <div className="pt-8 sm:pt-10 border-t border-[#3B121D] max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center min-w-0">
            <div className="min-w-0 p-1">
              <span className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-normal block truncate">
                1200+ GSM
              </span>
              <span className="text-[9px] sm:text-xs text-[#A89895] tracking-wider sm:tracking-[0.15em] uppercase font-sans mt-1.5 block font-medium break-words">
                RIGID STRUCTURE BOARD
              </span>
            </div>

            <div className="min-w-0 p-1">
              <span className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-normal block truncate">
                24K Foil
              </span>
              <span className="text-[9px] sm:text-xs text-[#A89895] tracking-wider sm:tracking-[0.15em] uppercase font-sans mt-1.5 block font-medium break-words">
                HOT-STAMP DEBOSSING
              </span>
            </div>

            <div className="min-w-0 p-1">
              <span className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-normal block truncate">
                500 Units
              </span>
              <span className="text-[9px] sm:text-xs text-[#A89895] tracking-wider sm:tracking-[0.15em] uppercase font-sans mt-1.5 block font-medium break-words">
                LOW ACCESSIBLE MOQ
              </span>
            </div>

            <div className="min-w-0 p-1">
              <span className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-normal block truncate">
                All Pakistan
              </span>
              <span className="text-[9px] sm:text-xs text-[#A89895] tracking-wider sm:tracking-[0.15em] uppercase font-sans mt-1.5 block font-medium break-words">
                DIRECT DOORSTEP FREIGHT
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. PACKAGING CATALOG BY CATEGORY - 2 IN 1 ROW ON MOBILE       */}
      {/* ============================================================== */}
      <section className="py-14 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 md:mb-12 border-b border-[#E8E2D8] pb-4 md:pb-6 gap-3 min-w-0">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8C6D3B] block mb-1">
              Manufacturing Catalog
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1E1B18]">
              Packaging Categories
            </h2>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#1E1B18] hover:text-[#8C6D3B] transition-colors shrink-0"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 2 in 1 row on mobile (grid-cols-2), 3 on tablet, 5 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-5 min-w-0">
          {mainCategories.map((cat, idx) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative bg-white border border-[#E8E2D8] hover:border-[#8C6D3B] transition-all duration-300 overflow-hidden flex flex-col shadow-xs hover:shadow-md rounded-xs min-w-0 max-w-full"
            >
              <div className="aspect-[4/3] bg-[#EFE9DF] overflow-hidden relative">
                <img
                  src={cat.imageUrl}
                  alt={`Custom ${cat.name} packaging mockup`}
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                />
                <span className="absolute top-2 left-2 bg-[#1E1B18]/85 text-[#FAF7F2] text-[9px] sm:text-[10px] font-sans px-1.5 sm:px-2 py-0.5 uppercase tracking-wider rounded-xs">
                  0{idx + 1}
                </span>
              </div>
              <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between min-w-0">
                <div className="min-w-0">
                  <h3 className="font-serif text-xs sm:text-base font-semibold text-[#1E1B18] group-hover:text-[#8C6D3B] transition-colors line-clamp-1 truncate">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#7A7266] mt-1 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-[#F0ECE4] flex items-center justify-between text-[10px] sm:text-[11px] text-[#8C6D3B] font-semibold uppercase tracking-wider">
                  <span>Explore</span>
                  <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. LUMÉVERE-INSPIRED FEATURED PRODUCTS & WHATSAPP ORDERING     */}
      {/* ============================================================== */}
      <section className="py-14 md:py-20 bg-[#F7F3EB] border-y border-[#E8E2D8] w-full max-w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#DDD6C9] gap-4 min-w-0">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8C6D3B] block mb-1">
                Curated Packaging Showcase
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1E1B18]">
                Featured Packaging Collections
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6357] mt-1.5 max-w-xl">
                Ready for custom dimensions, corporate branding, and direct WhatsApp ordering.
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSelectedCatFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shrink-0 cursor-pointer ${
                  selectedCatFilter === 'all'
                    ? 'bg-[#1E1B18] text-[#D4AF37]'
                    : 'bg-white border border-[#DDD6C9] text-[#4A433A] hover:bg-[#EFE9DF]'
                }`}
              >
                All Collections
              </button>
              {mainCategories.slice(0, 5).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCatFilter(c.id)}
                  className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shrink-0 cursor-pointer ${
                    selectedCatFilter === c.id
                      ? 'bg-[#1E1B18] text-[#D4AF37]'
                      : 'bg-white border border-[#DDD6C9] text-[#4A433A] hover:bg-[#EFE9DF]'
                  }`}
                >
                  {c.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid: 2 per row on mobile (grid-cols-2), 3 on tablet, 4 on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 min-w-0">
            {displayedProducts.map((prod) => (
              <div key={prod.id} className="min-w-0 max-w-full">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 bg-[#1E1B18] hover:bg-[#2C2723] text-white text-xs font-semibold uppercase tracking-wider sm:tracking-[0.15em] rounded-xs shadow-md transition-colors w-full sm:w-auto"
            >
              <span>Explore Complete Packaging Catalog</span>
              <ArrowRight className="w-4 h-4 text-[#D4AF37] shrink-0" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. 3D PACKAGING GALLERY (ARRANGEMENT SWITCHER)                  */}
      {/* ============================================================== */}
      <Gallery3DSection />

      {/* ============================================================== */}
      {/* 5. INDUSTRIAL MANUFACTURING FACILITY & MACHINERY (B2B TRUST)   */}
      {/* ============================================================== */}
      <section className="py-14 md:py-20 bg-[#181512] text-[#FAF7F2] border-y border-[#2C2723] w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold block mb-2">
              Industrial Plant • Multan, Pakistan
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-white">
              Our Machinery & Printing Technology
            </h2>
            <p className="text-xs sm:text-sm text-[#B5ADA1] mt-2 font-light px-2">
              Direct factory manufacturing equipped with high-speed offset lithography, automatic die-cutting platens, and foil stamping systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 min-w-0">
            {[
              {
                icon: Printer,
                title: "Heidelberg Offset Litho",
                spec: "4-Color & 5-Color CMYK + Spot Pantone",
                desc: "High-resolution commercial lithography delivering razor-sharp text, vibrant brand hues, and microscopic dot precision.",
              },
              {
                icon: Layers,
                title: "Automatic Die-Cutting",
                spec: "Platen Creasing & Laser Die-Lines",
                desc: "Millimeter-precise folding lines, window aperture cutouts, and self-locking tabs with clean, burr-free box edges.",
              },
              {
                icon: Sparkles,
                title: "Thermal Foil Stamping",
                spec: "Metallic Gold, Silver & Spot UV",
                desc: "Precision hot-stamp debossing, high-gloss UV contrast, and blind embossing that transforms plain cartons into luxury assets.",
              },
              {
                icon: Factory,
                title: "Corrugated Flute Board",
                spec: "E-Flute, B-Flute & 5-Ply Stitched",
                desc: "High ECT crush-resistant corrugation tailored for fruit exports, pizza delivery, and domestic courier shipping networks.",
              },
            ].map((mach, i) => (
              <div
                key={i}
                className="p-5 sm:p-6 bg-[#221D18] border border-[#3A332C] hover:border-[#D4AF37]/50 transition-colors rounded-xs flex flex-col justify-between min-w-0"
              >
                <div>
                  <mach.icon className="w-6 h-6 text-[#D4AF37] mb-3" />
                  <span className="text-[10px] text-[#A89F91] uppercase tracking-wider font-mono block mb-1">
                    {mach.spec}
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-semibold text-white mb-2">
                    {mach.title}
                  </h3>
                  <p className="text-xs text-[#9E9587] leading-relaxed">
                    {mach.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#332B23] flex items-center gap-1.5 text-[11px] text-[#D4AF37]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                  <span>Factory Direct Quality Control</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. INTERACTIVE STEP-BY-STEP BOX ESTIMATOR & WHATSAPP GENERATOR  */}
      {/* ============================================================== */}
      <section className="py-14 md:py-20 bg-[#F5F0E8] border-b border-[#E8E2D8] w-full max-w-full overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8C6D3B] block mb-2">
              Instant Price Estimator
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1E1B18]">
              Configure Your Custom Box & Get a Quote
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6357] mt-2 px-2">
              Select your specifications below to generate a formatted quotation ready for instant review on WhatsApp.
            </p>
          </div>

          <div className="bg-white border border-[#DDD6C9] p-4 sm:p-8 rounded-xs shadow-xs space-y-6 min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-0">
              {/* Box Type */}
              <div className="min-w-0">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                  1. Box Style
                </label>
                <select
                  value={estType}
                  onChange={(e) => setEstType(e.target.value)}
                  className="w-full py-2.5 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] rounded-xs cursor-pointer min-w-0"
                >
                  <option value="Rigid Magnetic Gift Box">Rigid Magnetic Box (Luxury)</option>
                  <option value="Cake & Bakery Box">Cake & Bakery Box (Greaseproof)</option>
                  <option value="Corrugated Mango Export Carton">Mango Export Carton (5-Ply)</option>
                  <option value="Pizza & Takeaway Box">Pizza / Fast Food Box</option>
                  <option value="Luxury Rope Paper Bag">Luxury Rope Paper Bag</option>
                  <option value="Mithai & Sweet Gift Box">Mithai / Confectionery Box</option>
                  <option value="Cosmetics & Perfume Box">Cosmetics Tuck Box</option>
                </select>
              </div>

              {/* Dimensions */}
              <div className="min-w-0">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                  2. Dimensions (L × W × H in inches)
                </label>
                <div className="grid grid-cols-3 gap-1.5 min-w-0">
                  <input
                    type="number"
                    value={estLength}
                    onChange={(e) => setEstLength(e.target.value)}
                    placeholder="L"
                    className="w-full py-2 px-2 text-xs text-center bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] rounded-xs min-w-0"
                  />
                  <input
                    type="number"
                    value={estWidth}
                    onChange={(e) => setEstWidth(e.target.value)}
                    placeholder="W"
                    className="w-full py-2 px-2 text-xs text-center bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] rounded-xs min-w-0"
                  />
                  <input
                    type="number"
                    value={estHeight}
                    onChange={(e) => setEstHeight(e.target.value)}
                    placeholder="H"
                    className="w-full py-2 px-2 text-xs text-center bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] rounded-xs min-w-0"
                  />
                </div>
              </div>

              {/* Finish */}
              <div className="min-w-0">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                  3. Premium Finishes
                </label>
                <select
                  value={estFinish}
                  onChange={(e) => setEstFinish(e.target.value)}
                  className="w-full py-2.5 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] rounded-xs cursor-pointer min-w-0"
                >
                  <option value="Gold Foil Stamping + Matte">Gold Foil Stamping + Matte</option>
                  <option value="Spot UV + Soft Touch">Spot UV + Soft Touch Lamination</option>
                  <option value="Standard 4-Color CMYK">Standard 4-Color CMYK Print</option>
                  <option value="Embossed Brand Logo">Embossed Brand Logo</option>
                  <option value="Plain Unprinted (Kraft)">Plain Unprinted Kraft</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-[#F0ECE4] min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#5A534A] min-w-0">
                <span className="font-semibold text-[#1E1B18] shrink-0">Target Quantity:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['500', '1,000', '2,500', '5,000+'].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setEstQuantity(q)}
                      className={`px-2.5 py-1 text-xs rounded-xs cursor-pointer border ${
                        estQuantity === q
                          ? 'bg-[#1E1B18] text-[#D4AF37] border-[#1E1B18]'
                          : 'bg-[#FAF7F2] text-[#4A433A] border-[#DDD6C9] hover:bg-[#EFE9DF]'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimator WhatsApp CTA - Wraps safely on mobile screens */}
              <a
                href={estimatorWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex flex-wrap items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md rounded-xs text-center min-w-0"
              >
                <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                <span className="text-center break-words">Send Specification to WhatsApp (0310 8216304)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. VERIFIED CLIENT REVIEWS & SECTOR SOCIAL PROOF               */}
      {/* ============================================================== */}
      <section className="py-14 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8C6D3B] block mb-2">
            Client Trust & Reputation
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1E1B18]">
            Trusted Across Pakistan
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6357] mt-2">
            Supplying premium packaging to top bakeries, fruit exporters, and fashion brands nationwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-0">
          {[
            {
              quote: "Khan & Son's engineered our bakery cake boxes with greaseproof food-grade card and crisp gold foil embossing. They delivered 5,000 units on schedule with exceptional finishing.",
              author: "Tahir Mahmood",
              business: "Gourmet Confectionery • Lahore",
              rating: 5,
            },
            {
              quote: "Our Chaunsa mango shipments to Dubai and the UK require extreme durability. Khan & Son's 5-ply corrugated ventilated boxes survived air transit without a single collapsed carton.",
              author: "Malik Shahzad",
              business: "Agri-Export Orchards • Multan",
              rating: 5,
            },
            {
              quote: "The boutique shopping bags with twisted rope handles and matte black soft-touch coating elevated our retail store's unboxing experience completely. Highly recommended.",
              author: "Ayesha Karim",
              business: "Luxe Fashion Apparel • Karachi",
              rating: 5,
            },
          ].map((rev, i) => (
            <div
              key={i}
              className="p-5 sm:p-6 bg-white border border-[#E8E2D8] rounded-xs shadow-xs flex flex-col justify-between space-y-4 min-w-0"
            >
              <div>
                <div className="flex items-center gap-1 text-[#D4AF37] mb-3">
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Star key={idx} className="w-3.5 h-3.5 fill-[#D4AF37]" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-[#D5CDBD] mb-2" />
                <p className="text-xs sm:text-sm text-[#4A433A] leading-relaxed italic">
                  "{rev.quote}"
                </p>
              </div>
              <div className="pt-3 border-t border-[#F0ECE4]">
                <h4 className="font-serif text-sm font-semibold text-[#1E1B18]">
                  {rev.author}
                </h4>
                <span className="text-[11px] text-[#8C6D3B]">
                  {rev.business}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 8. FREQUENTLY ASKED QUESTIONS                                   */}
      {/* ============================================================== */}
      <section className="py-14 md:py-20 bg-white border-t border-[#E8E2D8] w-full max-w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
          <div className="text-center mb-10 md:mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8C6D3B] block mb-2">
              Common Questions
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1E1B18]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6357] mt-2">
              Learn about our custom box sizing, plate proofs, minimum quantities, and nationwide dispatch.
            </p>
          </div>

          <div className="space-y-3.5 sm:space-y-4 min-w-0">
            {[
              {
                q: "Can I order custom-sized packaging with my brand logo?",
                a: "Yes, 100%. We manufacture custom die-lines and dimensions tailored around your product. We offer multi-color offset litho printing, metallic foil stamping, and spot UV finishing.",
              },
              {
                q: "How can I obtain a price quotation?",
                a: "Since pricing depends on dimensions (LxWxH), board caliper (GSM/flute), and printing plates, simply reach out to our specialists on WhatsApp (0310 8216304 / 0318 1718476). We provide prompt itemized quotes.",
              },
              {
                q: "What is your typical production turnaround time?",
                a: "Standard custom packaging orders typically complete production in 7 to 12 business days following artwork sign-off. Bulk corrugated runs are scheduled on our industrial press lines.",
              },
              {
                q: "Do you deliver across Pakistan?",
                a: "Yes. From our central printing facility in Multan, we dispatch orders nationwide to Lahore, Karachi, Islamabad, Faisalabad, Rawalpindi, Peshawar, and Quetta via trusted cargo logistics networks.",
              },
            ].map((faq, i) => (
              <div key={i} className="p-4 sm:p-5 bg-[#FAF7F2] border border-[#E8E2D8] rounded-xs min-w-0">
                <h3 className="font-serif text-sm sm:text-base font-semibold text-[#1E1B18] flex items-start gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-[#8C6D3B] shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#5A534A] leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-10 p-5 sm:p-6 bg-[#F5F0E8] border border-[#DDD6C9] text-center rounded-xs min-w-0">
            <p className="text-xs sm:text-sm text-[#5A534A]">
              Have a bespoke inquiry or technical dimension requirement?
            </p>
            {/* FAQ WhatsApp link - wraps safely on mobile */}
            <a
              href={heroWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-3 text-xs font-semibold uppercase tracking-wider text-[#1E1B18] hover:text-[#8C6D3B] text-center max-w-full"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
              <span>Connect on WhatsApp</span>
              <span className="text-[#8C6D3B] font-mono">(0310 8216304 / 0318 1718476)</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 9. FINAL LUXURY PARTNERSHIP CTA                                 */}
      {/* ============================================================== */}
      <section className="py-14 md:py-20 bg-[#181512] text-[#FAF7F2] border-t border-[#2C2723] w-full max-w-full overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-5 min-w-0">
          <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold block">
            Direct Packaging Partnership
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-semibold leading-tight break-words">
            Let's Engineer Packaging for Your Brand.
          </h2>
          <p className="text-xs sm:text-base text-[#B5ADA1] max-w-xl mx-auto font-light leading-relaxed px-2">
            Elevate your customer unboxing experience with bespoke packaging engineered in Multan, Pakistan. Connect with our printing experts today.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3.5 w-full max-w-full">
            <Link
              to="/shop"
              className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 bg-transparent hover:bg-white text-white hover:text-[#1E1B18] text-xs font-semibold uppercase tracking-wider sm:tracking-[0.15em] border border-[#C2B7A5] transition-colors rounded-xs text-center"
            >
              Packaging Catalog
            </Link>
            <a
              href="https://wa.me/923108216304?text=Assalam-o-Alaikum!%20I%20would%20like%20to%20order%20or%20inquire%20about%20packaging."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex flex-wrap items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-semibold uppercase tracking-wider sm:tracking-[0.15em] transition-colors shadow-lg rounded-xs text-center"
            >
              <MessageCircle className="w-4 h-4 fill-white shrink-0" />
              <span>WhatsApp: 0310 8216304 / 0318 1718476</span>
            </a>
          </div>

          <div className="pt-3 text-xs text-[#A89F91] flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            <span>
              Email:{' '}
              <a href="mailto:nasirkhanprinting@gmail.com" className="text-[#D4AF37] hover:underline">
                nasirkhanprinting@gmail.com
              </a>
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Multan, Punjab, Pakistan</span>
          </div>
        </div>
      </section>
    </div>
  );
};
