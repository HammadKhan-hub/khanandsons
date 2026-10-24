import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { submitInquiry } from '../services/dataService';
import { INITIAL_CATEGORIES } from '../data/seedData';
import {
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  BookmarkCheck,
  Package,
  Layers,
  Sparkles,
  Info,
  Box,
  Truck,
  Check,
  Upload,
} from 'lucide-react';

export const CustomPackagingPage: React.FC = () => {
  const { buildWhatsAppUrl, buildCustomPackagingMessage, isWhatsAppConfigured } = useSettings();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState(INITIAL_CATEGORIES[0]?.name || 'Cake & Bakery Boxes');
  const [lengthVal, setLengthVal] = useState('10');
  const [widthVal, setWidthVal] = useState('8');
  const [heightVal, setHeightVal] = useState('4');
  const [dimensionUnit, setDimensionUnit] = useState<'inches' | 'cm'>('inches');
  const [quantity, setQuantity] = useState('1000');
  const [customQuantity, setCustomQuantity] = useState('');
  const [material, setMaterial] = useState('350 GSM Bleached Food-Grade Board');
  const [printing, setPrinting] = useState('4-Color CMYK Full Offset');
  const [finishing, setFinishing] = useState('Matte Lamination + Gold Foil');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  // UI Flow States
  const [targetLine, setTargetLine] = useState<'0310' | '0318'>('0310');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [savedInquiryId, setSavedInquiryId] = useState<string | null>(null);
  const [savingInquiry, setSavingInquiry] = useState(false);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState(false);

  useEffect(() => {
    document.title = "Custom Packaging & Printing Quote — KHAN&SON'S PRINTER & PACKAGES";
  }, []);

  // Validate Pakistani Phone number (e.g. 03xx-xxxxxxx or 923xxxxxxxxx or 03xxxxxxxxx)
  const validatePhone = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    return cleaned.length >= 10 && cleaned.length <= 13;
  };

  const effectiveDimensions = `${lengthVal} x ${widthVal} x ${heightVal} ${dimensionUnit}`;
  const effectiveQuantity = customQuantity.trim() ? customQuantity.trim() : quantity;

  // Build the prefilled WhatsApp inquiry message
  const waInquiryMessage = buildCustomPackagingMessage({
    customerName: customerName.trim() || 'Valued Customer',
    businessName: businessName.trim() || undefined,
    phone: phone.trim() || 'Pakistani Client',
    city: city.trim() || 'Pakistan',
    category,
    dimensions: effectiveDimensions,
    quantity: `${effectiveQuantity} pcs`,
    material,
    printing,
    finishing,
    budget: budget.trim() || undefined,
    deadline: deadline.trim() || undefined,
    description: description.trim() || 'Custom manufacturing quotation requested.',
  });

  const generatedWaUrl = isWhatsAppConfigured
    ? buildWhatsAppUrl(waInquiryMessage, targetLine === '0318')
    : `https://wa.me/${targetLine === '0318' ? '923181718476' : '923108216304'}?text=${encodeURIComponent(waInquiryMessage)}`;

  const handleGenerateWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!customerName.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }
    if (!validatePhone(phone)) {
      setValidationError('Please enter a valid Pakistani mobile/WhatsApp number (e.g., 0300 1234567).');
      return;
    }
    if (!city.trim()) {
      setValidationError('Please specify your city in Pakistan (e.g. Multan, Lahore, Karachi, Islamabad).');
      return;
    }
    if (!description.trim()) {
      setValidationError('Please provide a brief description of what product goes into the packaging.');
      return;
    }

    // Open WhatsApp in new tab
    if (typeof window !== 'undefined') {
      window.open(generatedWaUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSaveForFollowUp = async () => {
    setValidationError(null);

    if (!customerName.trim() || !validatePhone(phone) || !city.trim() || !description.trim()) {
      setValidationError('Please complete the required fields (Name, Phone, City, Description) before saving.');
      return;
    }

    setSavingInquiry(true);
    try {
      const id = await submitInquiry({
        customerName: customerName.trim(),
        businessName: businessName.trim() || undefined,
        phone: phone.trim(),
        email: email.trim() || undefined,
        city: city.trim(),
        category,
        dimensions: effectiveDimensions,
        quantity: effectiveQuantity,
        material,
        printing,
        finishing,
        budget: budget.trim() || undefined,
        deadline: deadline.trim() || undefined,
        description: `${description.trim()}${selectedFileName ? ` [Artwork file planned: ${selectedFileName}]` : ''}`,
      });

      setSavedInquiryId(id);
      setSavedSuccessMessage(true);
      setSavingInquiry(false);
    } catch (err) {
      console.error(err);
      setValidationError('Unable to record inquiry in database. Please reach out to us via WhatsApp.');
      setSavingInquiry(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#D4AF37]/40 bg-[#2D0B15]/10 text-[#8C6D3B] text-[10px] font-semibold tracking-[0.2em] uppercase mb-2">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span>Bespoke Box Configurator & Quotations</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1E1B18]">
            Custom Packaging Quote Form
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6357] mt-2.5 max-w-xl mx-auto leading-relaxed">
            Configure your custom box dimensions, paper board, and luxury printing finishes below. We format your specifications into an instant WhatsApp quotation.
          </p>
        </div>

        {/* Notice Card on WhatsApp Ordering */}
        <div className="bg-[#1E1B18] text-[#F5F0E8] p-4 sm:p-5 border border-[#3A332C] mb-8 rounded-xs shadow-xs flex items-start gap-3 text-xs leading-relaxed">
          <Info className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block font-serif text-sm">
              Direct B2B WhatsApp Communication Across Pakistan
            </strong>
            <span className="text-[#C5BDB2]">
              All custom quotes, die-line templates, and plate proofing are confirmed directly with our production specialists on WhatsApp. Review your specifications and press Send when WhatsApp opens.
            </span>
          </div>
        </div>

        {/* Main Form Container */}
        <div className="bg-white border border-[#E8E2D8] p-5 sm:p-8 md:p-10 shadow-xs rounded-xs">
          {validationError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2 rounded-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {savedSuccessMessage && (
            <div className="mb-6 p-4 bg-[#F2F7F2] border border-[#A3D9A5] text-xs text-[#205D25] rounded-xs space-y-1">
              <p className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                <span>Inquiry Recorded in System! Reference: {savedInquiryId}</span>
              </p>
              <p>
                Our production team at Khan & Son's will review your requirements. You can also chat directly on WhatsApp: 0310 8216304.
              </p>
            </div>
          )}

          <form onSubmit={handleGenerateWhatsApp} className="space-y-8">
            {/* Step 1: Packaging Style & Category */}
            <div>
              <div className="flex items-center gap-2 border-b border-[#F0ECE4] pb-2 mb-4">
                <span className="w-5 h-5 rounded-full bg-[#1E1B18] text-[#D4AF37] text-xs flex items-center justify-center font-bold">1</span>
                <h3 className="font-serif text-base sm:text-lg font-semibold text-[#1E1B18]">
                  Packaging Category & Box Style
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {INITIAL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`py-2 px-2.5 text-xs text-left border rounded-xs transition-all cursor-pointer truncate ${
                      category === cat.name
                        ? 'border-[#8C6D3B] bg-[#F5F0E8] text-[#1E1B18] font-semibold ring-1 ring-[#8C6D3B]/30'
                        : 'border-[#DDD6C9] bg-[#FAF7F2] text-[#4A433A] hover:bg-[#EFE9DF]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Dimensions & Quantity */}
            <div>
              <div className="flex items-center gap-2 border-b border-[#F0ECE4] pb-2 mb-4">
                <span className="w-5 h-5 rounded-full bg-[#1E1B18] text-[#D4AF37] text-xs flex items-center justify-center font-bold">2</span>
                <h3 className="font-serif text-base sm:text-lg font-semibold text-[#1E1B18]">
                  Dimensions & Estimated Quantity
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 3D Box Dimensions */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#4A433A]">
                      Box Dimensions (L × W × H)
                    </label>
                    <div className="flex gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setDimensionUnit('inches')}
                        className={`px-2 py-0.5 rounded-xs cursor-pointer ${
                          dimensionUnit === 'inches'
                            ? 'bg-[#1E1B18] text-white font-bold'
                            : 'bg-[#FAF7F2] text-[#6B6357]'
                        }`}
                      >
                        Inches
                      </button>
                      <button
                        type="button"
                        onClick={() => setDimensionUnit('cm')}
                        className={`px-2 py-0.5 rounded-xs cursor-pointer ${
                          dimensionUnit === 'cm'
                            ? 'bg-[#1E1B18] text-white font-bold'
                            : 'bg-[#FAF7F2] text-[#6B6357]'
                        }`}
                      >
                        CM
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-[#7A7266] block mb-0.5">Length</span>
                      <input
                        type="number"
                        step="0.1"
                        value={lengthVal}
                        onChange={(e) => setLengthVal(e.target.value)}
                        placeholder="Length"
                        className="w-full py-2 px-2 text-xs text-center bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18] rounded-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7A7266] block mb-0.5">Width</span>
                      <input
                        type="number"
                        step="0.1"
                        value={widthVal}
                        onChange={(e) => setWidthVal(e.target.value)}
                        placeholder="Width"
                        className="w-full py-2 px-2 text-xs text-center bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18] rounded-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7A7266] block mb-0.5">Height</span>
                      <input
                        type="number"
                        step="0.1"
                        value={heightVal}
                        onChange={(e) => setHeightVal(e.target.value)}
                        placeholder="Height"
                        className="w-full py-2 px-2 text-xs text-center bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18] rounded-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                    Estimated Production Quantity *
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    {['500', '1,000', '2,500', '5,000'].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => {
                          setQuantity(q);
                          setCustomQuantity('');
                        }}
                        className={`py-2 text-xs font-medium border text-center transition-all cursor-pointer rounded-xs ${
                          quantity === q && !customQuantity
                            ? 'border-[#1E1B18] bg-[#1E1B18] text-[#D4AF37] font-bold shadow-2xs'
                            : 'border-[#DDD6C9] bg-[#FAF7F2] text-[#2E2924] hover:bg-[#EFE9DF]'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Or custom quantity (e.g. 10,000 pcs, 25,000 pcs)"
                    value={customQuantity}
                    onChange={(e) => setCustomQuantity(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18] rounded-xs"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Material, Printing & Embellishments */}
            <div>
              <div className="flex items-center gap-2 border-b border-[#F0ECE4] pb-2 mb-4">
                <span className="w-5 h-5 rounded-full bg-[#1E1B18] text-[#D4AF37] text-xs flex items-center justify-center font-bold">3</span>
                <h3 className="font-serif text-base sm:text-lg font-semibold text-[#1E1B18]">
                  Paper Board, Printing & Embellishments
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                    Material Preference
                  </label>
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full py-2.5 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18] rounded-xs cursor-pointer"
                  >
                    <option value="350 GSM Bleached Food-Grade Board">350 GSM Bleached Food-Grade Board</option>
                    <option value="Virgin Kraft Natural Board (Unbleached)">Virgin Kraft Natural Board</option>
                    <option value="1200 GSM Rigid Greyboard + Wrapped Paper">1200 GSM Rigid Greyboard (Luxury)</option>
                    <option value="3-Ply Corrugated E-Flute (Pizza / Mailers)">3-Ply Corrugated E-Flute</option>
                    <option value="5-Ply Heavy Corrugated Carton (Export)">5-Ply Heavy Corrugated (Export)</option>
                    <option value="250 GSM Coated Art Card (Shopping Bags)">250 GSM Coated Art Card</option>
                    <option value="Recommend Best Material for My Product">Recommend Best Material for My Product</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                    Printing Style
                  </label>
                  <select
                    value={printing}
                    onChange={(e) => setPrinting(e.target.value)}
                    className="w-full py-2.5 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18] rounded-xs cursor-pointer"
                  >
                    <option value="4-Color CMYK Full Offset">4-Color CMYK Full Offset</option>
                    <option value="Single Color Minimalist Screen Print">Single Color Minimalist Screen</option>
                    <option value="2-Color Spot Offset">2-Color Spot Offset</option>
                    <option value="Pantone Color Matching">Pantone Color Matching</option>
                    <option value="No Printing (Plain Blank Boxes)">No Printing (Plain Blank Boxes)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                    Finishing Options
                  </label>
                  <select
                    value={finishing}
                    onChange={(e) => setFinishing(e.target.value)}
                    className="w-full py-2.5 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18] rounded-xs cursor-pointer"
                  >
                    <option value="Matte Lamination + Gold Foil">Matte Lamination + Gold Foil</option>
                    <option value="Soft-Touch Velvet Lamination">Soft-Touch Velvet Lamination</option>
                    <option value="Gloss Lamination">Gloss Lamination</option>
                    <option value="Spot UV Gloss Varnish on Logo">Spot UV Gloss Varnish on Logo</option>
                    <option value="Embossed / Debossed 3D Logo">Embossed / Debossed 3D Logo</option>
                    <option value="Die-Cut Clear Window">Die-Cut Clear Window</option>
                    <option value="Standard Natural Matte">Standard Natural Matte</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 4: Contact & Location */}
            <div>
              <div className="flex items-center gap-2 border-b border-[#F0ECE4] pb-2 mb-4">
                <span className="w-5 h-5 rounded-full bg-[#1E1B18] text-[#D4AF37] text-xs flex items-center justify-center font-bold">4</span>
                <h3 className="font-serif text-base sm:text-lg font-semibold text-[#1E1B18]">
                  Contact & Delivery Destination in Pakistan
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Usman"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18] rounded-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                    Business / Brand Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Sweets & Bakers"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18] rounded-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                    Pakistani WhatsApp / Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18] rounded-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                    Destination City in Pakistan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Multan, Lahore, Karachi, Islamabad"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18] rounded-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                    Packaging Description & Product Usage *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe your product, required weight capacity, inner divider needs, or branding preferences..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18] rounded-xs"
                  />
                </div>
              </div>
            </div>

            {/* Step 5: Optional Artwork & Target Line */}
            <div>
              <div className="flex items-center gap-2 border-b border-[#F0ECE4] pb-2 mb-4">
                <span className="w-5 h-5 rounded-full bg-[#1E1B18] text-[#D4AF37] text-xs flex items-center justify-center font-bold">5</span>
                <h3 className="font-serif text-base sm:text-lg font-semibold text-[#1E1B18]">
                  Optional Artwork Files & WhatsApp Line Selection
                </h3>
              </div>

              {/* Optional Artwork Note */}
              <div className="p-4 bg-[#FAF7F2] border border-[#E8E2D8] rounded-xs mb-4 min-w-0 max-w-full">
                <div className="flex items-start gap-3 min-w-0">
                  <Paperclip className="w-4 h-4 text-[#8C6D3B] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#5A534A] space-y-1 min-w-0 flex-1">
                    <strong className="text-[#1E1B18] block font-medium">
                      Have reference artwork, logos, or dieline files?
                    </strong>
                    <p className="leading-relaxed">
                      You can select your reference file below to confirm readiness, and then <strong>attach your image/PDF directly when WhatsApp opens</strong>.
                    </p>
                    <input
                      type="file"
                      accept="image/*,.pdf,.ai,.eps,.cdr"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setSelectedFileName(file.name);
                      }}
                      className="w-full max-w-full text-xs text-[#7A7266] file:mr-3 file:py-1 file:px-2.5 file:border file:border-[#C2B7A5] file:text-xs file:bg-white file:text-[#1E1B18] file:cursor-pointer mt-2"
                    />
                    {selectedFileName && (
                      <span className="text-[11px] text-[#25D366] font-medium block mt-1 break-all">
                        ✓ Ready to attach in WhatsApp: {selectedFileName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Target Line Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#FAF7F2] border border-[#EDE6DC] rounded-xs text-xs min-w-0">
                <span className="font-medium text-[#1E1B18] shrink-0">Select WhatsApp Contact Line:</span>
                <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setTargetLine('0310')}
                    className={`px-2.5 py-1.5 rounded-xs transition-colors cursor-pointer text-center truncate ${
                      targetLine === '0310'
                        ? 'bg-[#25D366] text-white font-bold'
                        : 'bg-white border border-[#DDD6C9] text-[#4A433A]'
                    }`}
                  >
                    Line 1: 0310 8216304
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetLine('0318')}
                    className={`px-2.5 py-1.5 rounded-xs transition-colors cursor-pointer text-center truncate ${
                      targetLine === '0318'
                        ? 'bg-[#25D366] text-white font-bold'
                        : 'bg-white border border-[#DDD6C9] text-[#4A433A]'
                    }`}
                  >
                    Line 2: 0318 1718476
                  </button>
                </div>
              </div>

              {/* Live Preview */}
              <div className="mt-4">
                <details className="text-xs text-[#7A7266] bg-[#FAF7F2] p-3 rounded-xs border border-[#EDE6DC]">
                  <summary className="cursor-pointer font-medium text-[#1E1B18] hover:text-[#8C6D3B]">
                    Preview prefilled WhatsApp message
                  </summary>
                  <pre className="mt-2 text-[11px] text-[#4A433A] whitespace-pre-wrap font-sans bg-white p-2.5 border border-[#DDD6C9] rounded-xs leading-relaxed">
                    {waInquiryMessage}
                  </pre>
                </details>
              </div>
            </div>

            {/* Actions: Send to WhatsApp + Save for Follow-up */}
            <div className="pt-4 border-t border-[#F0ECE4] space-y-3">
              <button
                type="submit"
                className="w-full flex flex-wrap items-center justify-center gap-2 py-3.5 sm:py-4 px-4 sm:px-6 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg rounded-xs cursor-pointer text-center"
              >
                <MessageCircle className="w-5 h-5 fill-white shrink-0" />
                <span className="text-center break-words">Send Specification to WhatsApp ({targetLine === '0318' ? '0318 1718476' : '0310 8216304'})</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSaveForFollowUp}
                  disabled={savingInquiry}
                  className="text-xs font-semibold text-[#8C6D3B] hover:text-[#1E1B18] hover:underline inline-flex items-center gap-1.5 cursor-pointer py-1 disabled:opacity-50"
                >
                  <BookmarkCheck className="w-4 h-4 text-[#8C6D3B]" />
                  <span>{savingInquiry ? 'Saving to Database...' : 'Save Specification in Database for Sales Callback'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
