import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from '../router/Router';
import { useSettings } from '../context/SettingsContext';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageCircle,
  Layers,
  Grid3X3,
  SlidersHorizontal,
  Compass,
  X,
  ArrowRight,
  Maximize2,
} from 'lucide-react';

export interface GalleryItem3D {
  id: string;
  title: string;
  category: string;
  categorySlug: string;
  imageUrl: string;
  dimensions: string;
  material: string;
  finish: string;
  moq: string;
  description: string;
}

const GALLERY_ITEMS: GalleryItem3D[] = [
  {
    id: 'gal-1',
    title: 'Imperial Gold-Foiled Mithai & Rigid Box',
    category: 'Rigid & Magnetic Boxes',
    categorySlug: 'sweets-mithai-boxes',
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1200&auto=format&fit=crop',
    dimensions: '10 x 8 x 2.5 inches',
    material: '1200 GSM Kappa Board + Silk Paper',
    finish: 'Thermal Metallic Gold Foil Stamping',
    moq: '250 Pcs',
    description: 'Precision handcrafted rigid box with magnetic concealed flap and velvet partition insert for luxury confectionery and corporate gifting.',
  },
  {
    id: 'gal-2',
    title: 'Food-Grade Crystal Window Cake Carrier',
    category: 'Cake & Bakery Boxes',
    categorySlug: 'cake-bakery-boxes',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1200&auto=format&fit=crop',
    dimensions: '8 x 8 x 5 inches',
    material: '350 GSM Virgin Bleached Board',
    finish: 'Anti-Grease Matte Barrier + Clear PET Window',
    moq: '500 Pcs',
    description: 'Heavyweight pastry and customized tier cake box engineered with fog-resistant transparent window and sturdy lock corners.',
  },
  {
    id: 'gal-3',
    title: 'Multan Chaunsa Ventilated Mango Carton',
    category: 'Fruit Cartons & Export',
    categorySlug: 'mango-fruit-packaging',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop',
    dimensions: '18 x 12 x 5 inches (5 KG & 10 KG)',
    material: '5-Ply Heavy Kraft B/C Flute (250/150/250)',
    finish: 'Moisture Barrier Varnish + Die-Cut Vents',
    moq: '1,000 Pcs',
    description: 'Export-certified fruit carton manufactured in Multan with high burst strength and air-circulation die cuts to keep mangoes fresh during transit.',
  },
  {
    id: 'gal-4',
    title: 'Heat-Retaining E-Flute Pizza Delivery Box',
    category: 'Pizza & Fast Food',
    categorySlug: 'pizza-fastfood-boxes',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop',
    dimensions: '12 x 12 x 1.75 inches (Large)',
    material: 'E-Flute Corrugated Food Liner',
    finish: '4-Color CMYK Offset Print + Steam Release Vents',
    moq: '1,000 Pcs',
    description: 'Rigid corrugated pizza box designed to retain crispness and heat while preventing box sagging during bike courier deliveries.',
  },
  {
    id: 'gal-5',
    title: 'Twisted Rope Kraft Luxury Retail Bag',
    category: 'Shopping & Retail Bags',
    categorySlug: 'shopping-retail-bags',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop',
    dimensions: '14 x 10 x 4.5 inches',
    material: '210 GSM Imported Ribbed Kraft Paper',
    finish: 'Hot Gold Foil Logo + Reinforced Base Card',
    moq: '500 Pcs',
    description: 'High-end boutique shopping bag with reinforced turn-top rims and pure cotton rope handles, supporting retail weights up to 6 KG.',
  },
  {
    id: 'gal-6',
    title: 'Tactile Soft-Touch Botanical Cosmetics Box',
    category: 'Soap & Cosmetics',
    categorySlug: 'soap-cosmetic-boxes',
    imageUrl: 'https://images.unsplash.com/photo-1608248597359-25143a5796a5?q=80&w=1200&auto=format&fit=crop',
    dimensions: '3.5 x 3.5 x 1.5 inches',
    material: '350 GSM Ivory Art Board',
    finish: 'Velvet Soft-Touch Lamination + Raised Spot UV',
    moq: '500 Pcs',
    description: 'Premium tuck-end retail box with velvet matte coating and glossy embossed brand accents for organic skincare and serum bottles.',
  },
];

type ArrangementMode = 'coverflow' | 'stack' | 'grid';

export const Gallery3DSection: React.FC = () => {
  const { buildWhatsAppUrl, isWhatsAppConfigured } = useSettings();
  const [mode, setMode] = useState<ArrangementMode>('coverflow');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [modalItem, setModalItem] = useState<GalleryItem3D | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const categories = ['All', 'Rigid & Magnetic Boxes', 'Cake & Bakery Boxes', 'Fruit Cartons & Export', 'Pizza & Fast Food', 'Shopping & Retail Bags'];

  const filteredItems = selectedCategory === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === selectedCategory);

  // Keep activeIndex within bounds when filter changes
  useEffect(() => {
    setActiveIndex(0);
  }, [selectedCategory]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const currentItem = filteredItems[activeIndex] || filteredItems[0];

  const getWaUrl = (item: GalleryItem3D) => {
    const msg = `Assalam-o-Alaikum! I am inquiring about the 3D Gallery showcase item: "${item.title}" (${item.category}). Dimensions: ${item.dimensions}.`;
    return isWhatsAppConfigured ? buildWhatsAppUrl(msg) : `https://wa.me/923108216304?text=${encodeURIComponent(msg)}`;
  };

  return (
    <section className="py-14 sm:py-20 bg-[#161412] text-[#FAF7F2] border-y border-[#2C2723] overflow-hidden relative font-sans w-full max-w-full">
      {/* Background ambient lighting - strictly constrained */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none max-w-full overflow-hidden"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-full min-w-0">
        {/* Section Header with Arrangement Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 sm:mb-10 pb-6 border-b border-[#2C2723] gap-6 min-w-0">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#25201B] border border-[#3A332C] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37] mb-3 rounded-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Interactive 3D Packaging Gallery</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight">
              3D Packaging Showcase
            </h2>
            <p className="text-xs sm:text-sm text-[#A89F91] mt-2 max-w-xl font-light">
              Explore bespoke packaging prototypes with dimensional depth and view specifications across different 3D arrangements.
            </p>
          </div>

          {/* Arrangement Switcher Controls (Coverflow 3D, Stack 3D, Grid) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="text-[11px] uppercase tracking-wider text-[#A89F91] font-semibold hidden sm:inline">
              Layout:
            </span>
            <div className="inline-flex p-1 bg-[#221D18] border border-[#3A332C] rounded-sm gap-1 max-w-full overflow-x-auto">
              <button
                onClick={() => setMode('coverflow')}
                className={`relative px-2.5 sm:px-3 py-1.5 rounded-xs text-xs font-medium tracking-wide flex items-center gap-1.5 transition-colors cursor-pointer ${
                  mode === 'coverflow' ? 'text-[#1E1B18]' : 'text-[#A89F91] hover:text-white'
                }`}
              >
                {mode === 'coverflow' && (
                  <motion.div
                    layoutId="activeArrangement"
                    className="absolute inset-0 bg-[#D4AF37] rounded-xs z-0"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Compass className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">3D Coverflow</span>
              </button>

              <button
                onClick={() => setMode('stack')}
                className={`relative px-2.5 sm:px-3 py-1.5 rounded-xs text-xs font-medium tracking-wide flex items-center gap-1.5 transition-colors cursor-pointer ${
                  mode === 'stack' ? 'text-[#1E1B18]' : 'text-[#A89F91] hover:text-white'
                }`}
              >
                {mode === 'stack' && (
                  <motion.div
                    layoutId="activeArrangement"
                    className="absolute inset-0 bg-[#D4AF37] rounded-xs z-0"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Layers className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">3D Stack</span>
              </button>

              <button
                onClick={() => setMode('grid')}
                className={`relative px-2.5 sm:px-3 py-1.5 rounded-xs text-xs font-medium tracking-wide flex items-center gap-1.5 transition-colors cursor-pointer ${
                  mode === 'grid' ? 'text-[#1E1B18]' : 'text-[#A89F91] hover:text-white'
                }`}
              >
                {mode === 'grid' && (
                  <motion.div
                    layoutId="activeArrangement"
                    className="absolute inset-0 bg-[#D4AF37] rounded-xs z-0"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Grid3X3 className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">3D Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Chips - constrained to container width */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 text-xs scrollbar-none w-full max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xs text-[11px] font-medium whitespace-nowrap transition-all border cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#D4AF37] text-[#1E1B18] border-[#D4AF37] font-semibold shadow-xs'
                  : 'bg-[#221D18] text-[#A89F91] border-[#3A332C] hover:border-[#D4AF37]/50 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ========================================================= */}
        {/* ARRANGEMENT VIEW 1: 3D COVERFLOW                          */}
        {/* ========================================================= */}
        {mode === 'coverflow' && (
          <div className="relative py-4 md:py-12 w-full max-w-full overflow-hidden">
            <div className="relative h-[390px] sm:h-[480px] flex items-center justify-center [perspective:1200px] w-full max-w-full overflow-hidden [contain:paint]">
              {filteredItems.map((item, idx) => {
                const diff = idx - activeIndex;
                const isActive = diff === 0;
                const isAdjacent = Math.abs(diff) === 1;
                // On mobile, only render adjacent (+/- 1) to keep strictly within screen bounds
                const maxDiff = isMobile ? 1 : 2;
                const isVisible = Math.abs(diff) <= maxDiff;

                if (!isVisible) return null;

                // 3D positioning calculations adjusted responsively
                let rotateY = diff * (isMobile ? -20 : -25);
                let translateZ = isActive ? (isMobile ? 50 : 100) : (isMobile ? -80 : -120) * Math.abs(diff);
                let translateX = diff * (isMobile ? 95 : 170);
                let opacity = isActive ? 1 : isAdjacent ? 0.7 : 0.25;
                let scale = isActive ? (isMobile ? 1.02 : 1.05) : (isMobile ? 0.85 : 0.88);

                return (
                  <motion.div
                    key={item.id}
                    className="absolute w-[220px] sm:w-[340px] max-w-[calc(100vw-3rem)] aspect-[3/4] cursor-pointer origin-center transition-all"
                    style={{
                      transformStyle: 'preserve-3d',
                      zIndex: 30 - Math.abs(diff) * 10,
                    }}
                    animate={{
                      rotateY,
                      x: translateX,
                      z: translateZ,
                      scale,
                      opacity,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 24,
                    }}
                    onClick={() => {
                      if (isActive) {
                        setModalItem(item);
                      } else {
                        setActiveIndex(idx);
                      }
                    }}
                  >
                    <div className="relative w-full h-full bg-[#1F1B17] border border-[#3A332C] rounded-sm overflow-hidden shadow-2xl flex flex-col group hover:border-[#D4AF37]/80 transition-colors">
                      {/* Image Area */}
                      <div className="relative h-[60%] sm:h-[62%] w-full overflow-hidden bg-[#181512]">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1F1B17] via-transparent to-transparent"></div>
                        <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-[#181512]/90 backdrop-blur-sm text-[#D4AF37] text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xs border border-[#3A332C] truncate max-w-[80%]">
                          {item.category}
                        </span>
                        {isActive && (
                          <span className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 bg-[#D4AF37] text-[#1E1B18] text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-xs shadow">
                            Active
                          </span>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between min-w-0">
                        <div className="min-w-0">
                          <h3 className="font-serif text-xs sm:text-base font-semibold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1 truncate">
                            {item.title}
                          </h3>
                          <p className="text-[10px] sm:text-[11px] text-[#A89F91] mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="pt-2 sm:pt-3 border-t border-[#3A332C] flex items-center justify-between text-xs min-w-0">
                          <span className="text-[9px] sm:text-[10px] font-mono text-[#D4AF37] truncate">
                            MOQ: {item.moq}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-[#E8E2D8] group-hover:text-[#D4AF37] font-medium shrink-0">
                            <span>Details</span>
                            <Maximize2 className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Navigation Arrows for Coverflow */}
            <div className="flex items-center justify-center gap-4 mt-6 sm:mt-8">
              <button
                onClick={handlePrev}
                className="p-2.5 sm:p-3 rounded-full bg-[#25201B] hover:bg-[#D4AF37] hover:text-[#1E1B18] text-[#C5BDB2] border border-[#3A332C] transition-all cursor-pointer shadow-lg"
                aria-label="Previous packaging item"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#221D18] rounded-xs border border-[#3A332C] text-xs font-mono text-[#D4AF37]">
                <span>{activeIndex + 1}</span>
                <span className="text-[#6B6357]">/</span>
                <span>{filteredItems.length}</span>
              </div>

              <button
                onClick={handleNext}
                className="p-2.5 sm:p-3 rounded-full bg-[#25201B] hover:bg-[#D4AF37] hover:text-[#1E1B18] text-[#C5BDB2] border border-[#3A332C] transition-all cursor-pointer shadow-lg"
                aria-label="Next packaging item"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ARRANGEMENT VIEW 2: 3D STACK                              */}
        {/* ========================================================= */}
        {mode === 'stack' && (
          <div className="py-6 sm:py-8 max-w-2xl mx-auto w-full max-w-full overflow-hidden">
            <div className="relative h-[390px] sm:h-[420px] flex items-center justify-center w-full max-w-full overflow-hidden [contain:paint]">
              {filteredItems.slice(0, 5).map((item, idx) => {
                const diff = (idx - activeIndex + filteredItems.length) % filteredItems.length;
                const isFront = diff === 0;

                return (
                  <motion.div
                    key={item.id}
                    className="absolute w-[260px] sm:w-[380px] max-w-[calc(100vw-3rem)] bg-[#1F1B17] border border-[#3A332C] rounded-sm shadow-2xl p-4 sm:p-5 cursor-pointer"
                    style={{
                      zIndex: 20 - diff,
                    }}
                    animate={{
                      y: diff * 15,
                      scale: 1 - diff * 0.05,
                      opacity: 1 - diff * 0.18,
                      rotateZ: diff === 0 ? 0 : diff % 2 === 0 ? diff * 2 : -diff * 2,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 280,
                      damping: 26,
                    }}
                    onClick={() => {
                      if (isFront) {
                        setModalItem(item);
                      } else {
                        setActiveIndex(idx);
                      }
                    }}
                  >
                    <div className="aspect-[16/10] bg-[#181512] rounded-xs overflow-hidden mb-3.5 relative">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-[#181512]/90 text-[#D4AF37] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-xs border border-[#3A332C]">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="font-serif text-sm sm:text-lg font-semibold text-white truncate">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#A89F91] mt-1 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-[#3A332C] flex items-center justify-between text-xs">
                      <span className="text-[10px] text-[#D4AF37] font-mono truncate">
                        Dim: {item.dimensions}
                      </span>
                      <span className="text-xs text-[#E8E2D8] font-semibold uppercase tracking-wider underline shrink-0">
                        Tap To Inspect
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={handlePrev}
                className="px-4 py-2 bg-[#25201B] hover:bg-[#D4AF37] hover:text-[#1E1B18] text-xs font-semibold uppercase tracking-wider rounded-xs border border-[#3A332C] transition-all cursor-pointer"
              >
                Previous Card
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-[#1E1B18] text-xs font-semibold uppercase tracking-wider rounded-xs transition-all cursor-pointer"
              >
                Next Card
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ARRANGEMENT VIEW 3: 3D PERSPECTIVE GRID (2-in-1 on mobile)*/}
        {/* ========================================================= */}
        {mode === 'grid' && (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 [perspective:1000px] min-w-0">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="group bg-[#1F1B17] border border-[#3A332C] hover:border-[#D4AF37]/80 rounded-xs overflow-hidden shadow-lg transition-all duration-300 flex flex-col justify-between hover:[transform:translateY(-4px)_rotateX(2deg)] min-w-0 max-w-full"
              >
                <div className="aspect-[4/3] bg-[#181512] relative overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500"
                  />
                  <span className="absolute top-2 left-2 bg-[#181512]/90 text-[#D4AF37] text-[8px] sm:text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-xs border border-[#3A332C] truncate max-w-[85%]">
                    {item.category}
                  </span>
                </div>

                <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between min-w-0">
                  <div className="min-w-0">
                    <h3 className="font-serif text-xs sm:text-base font-semibold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1 truncate">
                      {item.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-[#A89F91] mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#3A332C] flex items-center justify-between text-[10px] sm:text-xs min-w-0">
                    <button
                      onClick={() => setModalItem(item)}
                      className="text-[#D4AF37] hover:underline font-medium"
                    >
                      View Specs
                    </button>
                    <a
                      href={getWaUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#25D366] hover:underline"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Inquire</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Bottom CTA for Custom Orders */}
        <div className="mt-10 sm:mt-12 p-5 sm:p-8 bg-[#221D18] border border-[#3A332C] rounded-sm text-center min-w-0">
          <h3 className="font-serif text-xl sm:text-2xl font-semibold text-white">
            Need a Custom Sized Packaging Run?
          </h3>
          <p className="text-xs sm:text-sm text-[#A89F91] mt-1 max-w-xl mx-auto px-2">
            Our Multan manufacturing facility crafts bespoke die-lines for any dimension, weight, and board specification.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-full">
            <Link
              to="/custom-packaging"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-[#1E1B18] text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors text-center"
            >
              Request Custom Dimensions
            </Link>
            <a
              href="https://wa.me/923108216304?text=Assalam-o-Alaikum!%20I%20saw%20your%203D%20Packaging%20Gallery%20and%20want%20to%20discuss%20a%20custom%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex flex-wrap items-center justify-center gap-2 px-5 sm:px-6 py-2.5 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors text-center"
            >
              <MessageCircle className="w-4 h-4 fill-white shrink-0" />
              <span>WhatsApp: 0310 8216304 / 0318 1718476</span>
            </a>
          </div>
        </div>
      </div>

      {/* Detail Inspection Modal for Active 3D Item */}
      <AnimatePresence>
        {modalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1C1814] text-[#FAF7F2] border border-[#D4AF37]/50 rounded-sm shadow-2xl max-w-2xl w-full overflow-hidden relative max-h-[92vh] overflow-y-auto"
            >
              <button
                onClick={() => setModalItem(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[#A89F91] hover:text-white p-1 rounded-xs bg-[#25201B] border border-[#3A332C] z-20 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 sm:gap-6 p-5 sm:p-8">
                <div className="sm:col-span-5 aspect-[4/3] sm:aspect-[3/4] bg-[#141210] rounded-xs overflow-hidden border border-[#3A332C]">
                  <img
                    src={modalItem.imageUrl}
                    alt={modalItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="sm:col-span-7 flex flex-col justify-between space-y-4 min-w-0">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold bg-[#25201B] px-2.5 py-1 rounded-xs border border-[#3A332C] inline-block mb-2">
                      {modalItem.category}
                    </span>
                    <h3 className="font-serif text-lg sm:text-2xl font-semibold text-white">
                      {modalItem.title}
                    </h3>
                    <p className="text-xs text-[#B5ADA1] mt-2 leading-relaxed">
                      {modalItem.description}
                    </p>
                  </div>

                  {/* Technical Specs List */}
                  <div className="space-y-2 text-xs bg-[#221D18] p-3 rounded-xs border border-[#3A332C] min-w-0">
                    <div className="flex justify-between gap-2">
                      <span className="text-[#8C8275] shrink-0">Dimensions:</span>
                      <span className="text-white font-mono font-medium truncate text-right">{modalItem.dimensions}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-[#8C8275] shrink-0">Material:</span>
                      <span className="text-white font-medium truncate text-right">{modalItem.material}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-[#8C8275] shrink-0">Finishing:</span>
                      <span className="text-white font-medium truncate text-right">{modalItem.finish}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-[#8C8275] shrink-0">MOQ:</span>
                      <span className="text-[#D4AF37] font-mono font-semibold">{modalItem.moq}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                    <a
                      href={getWaUrl(modalItem)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                      <span>Order on WhatsApp</span>
                    </a>
                    <Link
                      to="/custom-packaging"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-[#1E1B18] text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors"
                      onClick={() => setModalItem(null)}
                    >
                      <span>Custom Quote</span>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
