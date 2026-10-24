import React, { useState, useEffect } from 'react';
import { Link } from '../router/Router';
import { getProducts, submitInquiry } from '../services/dataService';
import { Product } from '../types';
import { useSettings } from '../context/SettingsContext';
import {
  MessageCircle,
  Sparkles,
  Layers,
  Printer,
  Sliders,
  CheckCircle2,
  BookmarkCheck,
  ChevronRight,
  ArrowLeft,
  Info,
  ShieldAlert,
  Box,
  Truck,
  FileCheck,
  Check,
} from 'lucide-react';

interface ProductDetailPageProps {
  slug: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug }) => {
  const { buildWhatsAppUrl, buildProductWhatsAppMessage, isWhatsAppConfigured } = useSettings();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Interactive Specification Selectors (Pills & Custom Inputs)
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [customDimension, setCustomDimension] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<string>('1000');
  const [customQuantity, setCustomQuantity] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedPrinting, setSelectedPrinting] = useState<string>('');
  const [selectedFinishing, setSelectedFinishing] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');

  // Save Inquiry Modal / Form State
  const [showSaveInquiryModal, setShowSaveInquiryModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerBusiness, setCustomerBusiness] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveSubmitting, setSaveSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    getProducts().then((prods) => {
      const found = prods.find((p) => p.slug === slug);
      if (found) {
        setProduct(found);
        setSelectedImage(found.imageUrl);
        if (found.availableDimensions && found.availableDimensions.length > 0) {
          setSelectedDimension(found.availableDimensions[0]);
        }
        if (found.materialOptions && found.materialOptions.length > 0) {
          setSelectedMaterial(found.materialOptions[0]);
        }
        if (found.printingOptions && found.printingOptions.length > 0) {
          setSelectedPrinting(found.printingOptions[0]);
        }
        if (found.finishingOptions && found.finishingOptions.length > 0) {
          setSelectedFinishing(found.finishingOptions[0]);
        }
        // Dynamic SEO Page Title
        document.title = `${found.name} — KHAN&SON'S PRINTER & PACKAGES`;
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-12">
        <div className="text-center font-serif text-lg text-[#8C6D3B] animate-pulse flex items-center gap-2">
          <Box className="w-5 h-5 animate-spin" />
          <span>Loading packaging specifications...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] py-20 px-4">
        <div className="max-w-md mx-auto text-center bg-white p-8 border border-[#E8E2D8] shadow-sm rounded-xs">
          <Box className="w-12 h-12 text-[#8C6D3B] mx-auto mb-3" />
          <h2 className="font-serif text-2xl font-semibold text-[#1E1B18]">
            Product Not Found
          </h2>
          <p className="text-xs text-[#6B6357] mt-2 mb-6">
            The requested packaging product could not be located in our catalog.
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

  const effectiveDimension = customDimension.trim() ? customDimension.trim() : selectedDimension;
  const effectiveQuantity = customQuantity.trim() ? customQuantity.trim() : selectedQuantity;
  const currentProductUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Generate dynamic prefilled WhatsApp message with exact customer selections
  const waMessage = buildProductWhatsAppMessage({
    productName: product.name,
    productUrl: currentProductUrl,
    quantity: `${effectiveQuantity} pcs`,
    dimensions: effectiveDimension,
    material: selectedMaterial,
    printing: selectedPrinting,
    finishing: selectedFinishing,
    specialNotes: specialNotes.trim() ? specialNotes.trim() : undefined,
  });

  const waUrl1 = isWhatsAppConfigured ? buildWhatsAppUrl(waMessage, false) : `https://wa.me/923108216304?text=${encodeURIComponent(waMessage)}`;
  const waUrl2 = isWhatsAppConfigured ? buildWhatsAppUrl(waMessage, true) : `https://wa.me/923181718476?text=${encodeURIComponent(waMessage)}`;

  const priceDisplay = product.pricingMode === 'indicative' && product.indicativePrice
    ? product.indicativePrice
    : 'Price on Request';

  // Handle saving inquiry directly to Firestore backend
  const handleSaveInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !customerCity.trim()) {
      setSaveError('Please enter your name, Pakistani contact number, and destination city.');
      return;
    }

    setSaveSubmitting(true);
    setSaveError(null);

    try {
      await submitInquiry({
        customerName: customerName.trim(),
        businessName: customerBusiness.trim() || undefined,
        phone: customerPhone.trim(),
        city: customerCity.trim(),
        category: product.categoryName || 'Product Inquiry',
        dimensions: effectiveDimension || undefined,
        quantity: effectiveQuantity,
        material: selectedMaterial || undefined,
        printing: selectedPrinting || undefined,
        finishing: selectedFinishing || undefined,
        description: `Website inquiry for: ${product.name}. Selected Quantity: ${effectiveQuantity}. Notes: ${specialNotes || 'None'}.`,
      });

      setSaveSuccess(true);
      setSaveSubmitting(false);
    } catch (err: any) {
      console.error('Error saving inquiry:', err);
      setSaveError('Could not save inquiry to database. Please order directly on WhatsApp.');
      setSaveSubmitting(false);
    }
  };

  const allImages = [product.imageUrl, ...(product.gallery || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
        {/* Breadcrumb Navigation */}
        <nav className="text-xs text-[#7A7266] uppercase tracking-wider mb-6 sm:mb-8 flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-[#1E1B18] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#1E1B18] transition-colors">Packaging Catalog</Link>
          <span>/</span>
          {product.categoryId && (
            <>
              <Link to={`/category/${product.categoryId}`} className="hover:text-[#1E1B18] transition-colors">
                {product.categoryName || 'Category'}
              </Link>
              <span>/</span>
            </>
          )}
          {product.subcategoryId && (
            <>
              <Link to={`/category/${product.subcategoryId}`} className="hover:text-[#1E1B18] transition-colors">
                {product.subcategoryName || 'Subcategory'}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-[#1E1B18] font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image Gallery & Packaging Assurances */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-square bg-[#EFE9DF] border border-[#DDD6C9] overflow-hidden rounded-xs shadow-xs">
              <img
                src={selectedImage || product.imageUrl}
                alt={`Packaging mockup - ${product.name}`}
                className="w-full h-full object-cover object-center transition-all duration-300"
                loading="eager"
                decoding="async"
              />
              {product.isFeatured && (
                <span className="absolute top-3 left-3 bg-[#1E1B18]/90 text-[#D4AF37] text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 flex items-center gap-1 shadow-xs rounded-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Featured Collection</span>
                </span>
              )}
            </div>

            {/* Thumbnail Gallery Switcher */}
            {allImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {allImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-18 h-18 sm:w-20 sm:h-20 shrink-0 bg-[#EFE9DF] border overflow-hidden rounded-xs transition-all cursor-pointer ${
                      selectedImage === imgUrl
                        ? 'border-[#8C6D3B] ring-2 ring-[#8C6D3B]/40'
                        : 'border-[#DDD6C9] opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`Show image view ${idx + 1}`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Manufacturing Quality Guarantee */}
            <div className="p-4 sm:p-5 bg-white border border-[#E8E2D8] rounded-xs text-xs text-[#5A534A] space-y-2 mt-4">
              <h4 className="font-serif text-sm font-semibold text-[#1E1B18] uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D3B]" />
                <span>Manufacturing Standard & Proofing</span>
              </h4>
              <p className="leading-relaxed text-[11px] sm:text-xs">
                Manufactured using precision laser-cut dielines, calibrated Heidelberg lithography, high ECT crush-rated board, and digital artwork proofing prior to mass run.
              </p>
              <div className="pt-2 text-[10px] sm:text-[11px] text-[#7A7266] border-t border-[#F0ECE4] flex items-center justify-between flex-wrap gap-2">
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-[#8C6D3B]" />
                  <span>Nationwide Freight Across Pakistan</span>
                </span>
                <span className="font-semibold text-[#8C6D3B]">Central Plant: Multan, Pakistan</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Configurator & Clear Order on WhatsApp CTA */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8C6D3B] block mb-1">
                {product.categoryName || 'Custom Packaging'}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-[#1E1B18] leading-tight">
                {product.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#5A534A] mt-2.5 leading-relaxed">
                {product.description || product.shortDescription}
              </p>
            </div>

            {/* Price & MOQ Summary Ribbon */}
            <div className="p-3.5 sm:p-4 bg-white border border-[#E8E2D8] rounded-xs flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10px] text-[#8A8275] uppercase tracking-wider block font-medium">
                  Ordering Mode
                </span>
                <span className="font-serif text-lg sm:text-xl font-bold text-[#1E1B18]">
                  {priceDisplay}
                </span>
              </div>
              <div className="text-right text-[11px] text-[#6B6357]">
                <span className="block font-medium text-[#1E1B18]">Minimum Run:</span>
                <span>{product.minOrderQuantity || '500 units'}</span>
              </div>
            </div>

            {/* Interactive Specification Form with Luxury Tactile Pills */}
            <div className="bg-white p-5 sm:p-6 border border-[#E8E2D8] rounded-xs shadow-xs space-y-5">
              <div className="border-b border-[#F0ECE4] pb-3">
                <h3 className="font-serif text-base font-semibold text-[#1E1B18] uppercase tracking-wider">
                  Order Specifications Builder
                </h3>
                <p className="text-[11px] text-[#7A7266] mt-0.5">
                  Select your dimensions, material, and quantity to format your WhatsApp order.
                </p>
              </div>

              {/* 1. Quantity Selection with Volume Tier Pills */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                  1. Order Quantity
                </label>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-2">
                  {['500', '1000', '2500', '5000'].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => {
                        setSelectedQuantity(qty);
                        setCustomQuantity('');
                      }}
                      className={`py-2 text-xs font-medium border text-center transition-all cursor-pointer rounded-xs ${
                        selectedQuantity === qty && !customQuantity
                          ? 'border-[#1E1B18] bg-[#1E1B18] text-[#D4AF37] shadow-xs'
                          : 'border-[#DDD6C9] bg-[#FAF7F2] text-[#2E2924] hover:bg-[#EFE9DF]'
                      }`}
                    >
                      {qty} pcs
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or enter custom quantity (e.g. 10,000 pcs, 50,000 pcs)"
                  value={customQuantity}
                  onChange={(e) => setCustomQuantity(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18] rounded-xs"
                />
              </div>

              {/* 2. Dimensions Selector (Pills + Custom Dimension) */}
              {product.availableDimensions && product.availableDimensions.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                    2. Standard Sample Dimensions
                  </label>
                  <div className="space-y-1.5 mb-2">
                    {product.availableDimensions.map((dim, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSelectedDimension(dim);
                          setCustomDimension('');
                        }}
                        className={`w-full text-left py-2 px-3 text-xs border rounded-xs transition-all flex items-center justify-between cursor-pointer ${
                          selectedDimension === dim && !customDimension
                            ? 'border-[#8C6D3B] bg-[#F5F0E8] text-[#1E1B18] font-semibold'
                            : 'border-[#DDD6C9] bg-[#FAF7F2] text-[#4A433A] hover:bg-[#EFE9DF]'
                        }`}
                      >
                        <span>{dim}</span>
                        {selectedDimension === dim && !customDimension && (
                          <Check className="w-3.5 h-3.5 text-[#8C6D3B]" />
                        )}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Or enter bespoke box dimensions (L x W x H in inches/cm)"
                    value={customDimension}
                    onChange={(e) => setCustomDimension(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18] rounded-xs"
                  />
                </div>
              )}

              {/* 3. Material Options */}
              {product.materialOptions && product.materialOptions.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                    3. Board & Paper Material
                  </label>
                  <div className="space-y-1.5">
                    {product.materialOptions.map((mat, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedMaterial(mat)}
                        className={`w-full text-left py-2 px-3 text-xs border rounded-xs transition-all flex items-center justify-between cursor-pointer ${
                          selectedMaterial === mat
                            ? 'border-[#8C6D3B] bg-[#F5F0E8] text-[#1E1B18] font-semibold'
                            : 'border-[#DDD6C9] bg-[#FAF7F2] text-[#4A433A] hover:bg-[#EFE9DF]'
                        }`}
                      >
                        <span>{mat}</span>
                        {selectedMaterial === mat && <Check className="w-3.5 h-3.5 text-[#8C6D3B]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Printing & Finishing Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.printingOptions && product.printingOptions.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                      Printing Style
                    </label>
                    <select
                      value={selectedPrinting}
                      onChange={(e) => setSelectedPrinting(e.target.value)}
                      className="w-full py-2 px-2.5 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18] rounded-xs cursor-pointer"
                    >
                      {product.printingOptions.map((prt, i) => (
                        <option key={i} value={prt}>
                          {prt}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {product.finishingOptions && product.finishingOptions.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                      Finishing / Embellishment
                    </label>
                    <select
                      value={selectedFinishing}
                      onChange={(e) => setSelectedFinishing(e.target.value)}
                      className="w-full py-2 px-2.5 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18] rounded-xs cursor-pointer"
                    >
                      {product.finishingOptions.map((fin, i) => (
                        <option key={i} value={fin}>
                          {fin}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Special Instructions Input */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                  Destination City / Special Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Deliver to Karachi, require foil stamping on top lid"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18] rounded-xs"
                />
              </div>

              {/* Prefilled WhatsApp Message Live Preview */}
              <div className="pt-1">
                <details className="text-xs text-[#7A7266] bg-[#FAF7F2] p-3 rounded-xs border border-[#EDE6DC]">
                  <summary className="cursor-pointer font-medium text-[#1E1B18] hover:text-[#8C6D3B]">
                    Preview prefilled WhatsApp message
                  </summary>
                  <pre className="mt-2 text-[11px] text-[#4A433A] whitespace-pre-wrap font-sans bg-white p-2.5 border border-[#DDD6C9] rounded-xs leading-relaxed">
                    {waMessage}
                  </pre>
                </details>
              </div>

              {/* PRIMARY ACTION: Order on WhatsApp Button */}
              <div className="space-y-3 pt-2">
                <a
                  href={waUrl1}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex flex-wrap items-center justify-center gap-2 py-3.5 sm:py-4 px-4 bg-[#25D366] hover:bg-[#20BA5A] text-white font-sans font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg rounded-xs text-center"
                  title="Order on WhatsApp: 0310 8216304"
                >
                  <MessageCircle className="w-5 h-5 fill-white shrink-0" />
                  <span className="text-center break-words">Order on WhatsApp (0310 8216304)</span>
                </a>

                {/* Secondary WhatsApp Line */}
                <div className="flex items-center justify-center gap-2 text-xs text-[#6B6357]">
                  <span>Or connect on Line 2:</span>
                  <a
                    href={waUrl2}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#25D366] hover:underline font-semibold flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>0318 1718476</span>
                  </a>
                </div>

                {/* Secondary Option: Save Inquiry for Follow-up in Database */}
                <div className="pt-2 text-center border-t border-[#F0ECE4]">
                  <button
                    type="button"
                    onClick={() => setShowSaveInquiryModal(true)}
                    className="text-xs font-semibold text-[#8C6D3B] hover:text-[#1E1B18] hover:underline inline-flex items-center gap-1.5 cursor-pointer py-1"
                  >
                    <BookmarkCheck className="w-4 h-4 text-[#8C6D3B]" />
                    <span>Request Callback / Save Inquiry in System</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Inquiry Modal */}
      {showSaveInquiryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 rounded-xs shadow-xl border border-[#DDD6C9] max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-semibold text-[#1E1B18] mb-1">
              Save Inquiry for Production Team
            </h3>
            <p className="text-xs text-[#6B6357] mb-4">
              Leave your contact details and our team in Multan will review your specifications ({product.name}, {effectiveQuantity} pcs).
            </p>

            {saveSuccess ? (
              <div className="p-4 bg-green-50 border border-green-200 text-xs text-green-800 rounded-xs space-y-3">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Inquiry Recorded in System</span>
                </div>
                <p>
                  Thank you! Our representative will contact you via WhatsApp/phone. You can also chat directly on 0310 8216304.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveInquiryModal(false);
                    setSaveSuccess(false);
                  }}
                  className="px-4 py-2 bg-[#1E1B18] text-white text-xs font-semibold uppercase tracking-wider rounded-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveInquiry} className="space-y-3.5">
                {saveError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xs">
                    {saveError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] rounded-xs"
                    placeholder="e.g. Tahir Mahmood"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                    Business / Brand Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerBusiness}
                    onChange={(e) => setCustomerBusiness(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] rounded-xs"
                    placeholder="e.g. Gourmet Sweets"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                    Pakistani WhatsApp / Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] rounded-xs"
                    placeholder="0300 1234567"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                    City in Pakistan *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] rounded-xs"
                    placeholder="e.g. Lahore, Karachi, Multan, Islamabad"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSaveInquiryModal(false)}
                    className="px-4 py-2 border border-[#DDD6C9] text-xs font-semibold uppercase tracking-wider text-[#4A433A] hover:bg-[#FAF7F2] rounded-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveSubmitting}
                    className="px-5 py-2 bg-[#1E1B18] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#2C2723] rounded-xs disabled:opacity-50"
                  >
                    {saveSubmitting ? 'Saving...' : 'Submit Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
