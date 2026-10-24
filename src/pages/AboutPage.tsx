import React from 'react';
import { Link } from '../router/Router';
import { useSettings } from '../context/SettingsContext';
import { MapPin, MessageCircle, Layers, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { settings, buildWhatsAppUrl, isWhatsAppConfigured } = useSettings();

  const waUrl = isWhatsAppConfigured
    ? buildWhatsAppUrl("Assalam-o-Alaikum! I'm interested in learning more about Khan & Son's printing capabilities.")
    : '#';

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
        {/* Breadcrumb */}
        <nav className="text-xs text-[#7A7266] uppercase tracking-wider mb-6">
          <Link to="/" className="hover:text-[#1E1B18]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[#1E1B18] font-semibold">About Us</span>
        </nav>

        {/* Hero Banner */}
        <div className="border-b border-[#E8E2D8] pb-12 mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8C6D3B] block mb-2">
            Our Heritage & Craft
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1E1B18] max-w-3xl leading-tight">
            Printing & Packaging Rooted in Precision, Built for Pakistan.
          </h1>
          <p className="text-base sm:text-lg text-[#5A534A] mt-4 max-w-2xl font-light leading-relaxed">
            Headquartered in Multan, Punjab, KHAN&SON'S PRINTER & PACKAGES manufactures bespoke boxes, corrugated cartons, shopping bags, and branded commercial packaging for businesses across Pakistan.
          </p>
        </div>

        {/* Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-6 space-y-5 text-xs sm:text-sm text-[#4A433A] leading-relaxed">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E1B18]">
              From Local Roots to Nationwide Packaging Solutions
            </h2>
            <p>
              Based in the vibrant industrial heart of Multan, our facility provides end-to-end commercial printing and structural packaging production. From the seasonal demand for heavy-duty ventilated mango cartons that withstand long-haul transit, to boutique bakery boxes with clear windows and luxury gold-foiled rigid hampers, we engineer each design around your functional requirements.
            </p>
            <p>
              Unlike mass commodity producers who enforce rigid standard sizes, we collaborate with our clients to customize die-lines, evaluate board grammage (GSM), test crush resistance, and refine surface treatments such as thermal foil stamping and soft-touch lamination.
            </p>

            <div className="p-4 bg-[#F5F0E8] border border-[#DDD6C9] rounded-sm space-y-2">
              <strong className="text-[#1E1B18] font-medium block">
                Why WhatsApp-Centered Ordering?
              </strong>
              <p className="text-xs text-[#6B6357]">
                Packaging is inherently bespoke: box dimensions, paper caliper, color registrations, and delivery cities alter pricing significantly. By connecting directly on WhatsApp, our customers get personalized quotations, fast digital proof approvals, and direct communication with our production supervisors.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="aspect-[4/3] bg-[#EFE9DF] border border-[#D5CDBD] shadow-md overflow-hidden rounded-sm">
              <img
                src="https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=1000&auto=format&fit=crop"
                alt="Khan & Son's Printing Production"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>

        {/* Core Principles */}
        <div className="bg-white border border-[#E8E2D8] p-8 md:p-12 mb-16 rounded-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8C6D3B] block mb-1">
              Operational Standards
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E1B18]">
              What Defines Our Work
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <span className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#8C6D3B] text-[#8C6D3B] font-serif font-bold flex items-center justify-center text-sm">
                1
              </span>
              <h4 className="font-serif text-lg font-semibold text-[#1E1B18]">
                Material Integrity
              </h4>
              <p className="text-xs text-[#6B6357] leading-relaxed">
                We select genuine food-grade bleached virgin boards, high-burst strength corrugated flutes, and premium imported art papers that hold shape and protect contents.
              </p>
            </div>

            <div className="space-y-2">
              <span className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#8C6D3B] text-[#8C6D3B] font-serif font-bold flex items-center justify-center text-sm">
                2
              </span>
              <h4 className="font-serif text-lg font-semibold text-[#1E1B18]">
                Offset Print Precision
              </h4>
              <p className="text-xs text-[#6B6357] leading-relaxed">
                Fine halftone screens, tight ink register, and Pantone color formulation ensure your brand logos appear vibrant and consistent across repeat manufacturing batches.
              </p>
            </div>

            <div className="space-y-2">
              <span className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#8C6D3B] text-[#8C6D3B] font-serif font-bold flex items-center justify-center text-sm">
                3
              </span>
              <h4 className="font-serif text-lg font-semibold text-[#1E1B18]">
                Nationwide Dispatch
              </h4>
              <p className="text-xs text-[#6B6357] leading-relaxed">
                Situated centrally in Multan, we coordinate safe bulk shipments to Lahore, Karachi, Rawalpindi, Islamabad, Faisalabad, Peshawar, and regional hubs across Pakistan.
              </p>
            </div>
          </div>
        </div>

        {/* Location & CTA */}
        <div className="bg-[#1E1B18] text-[#FAF7F2] p-8 md:p-12 border border-[#3A332C] rounded-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[11px] text-[#D4AF37] uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              <span>Location: {settings.city}</span>
            </span>
            <h3 className="font-serif text-2xl font-semibold">
              Ready to create your brand's packaging?
            </h3>
            <p className="text-xs text-[#A89F91] max-w-md">
              Speak directly with our team to obtain quotes, sample options, and technical packaging recommendations.
            </p>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 shadow-lg"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Connect on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
