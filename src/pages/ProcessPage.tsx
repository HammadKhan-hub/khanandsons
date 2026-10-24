import React from 'react';
import { Link } from '../router/Router';
import { useSettings } from '../context/SettingsContext';
import { MessageCircle, ArrowRight, Check, Layers, Printer, Sparkles, Package, Truck } from 'lucide-react';

export const ProcessPage: React.FC = () => {
  const { buildWhatsAppUrl, isWhatsAppConfigured } = useSettings();

  const waUrl = isWhatsAppConfigured
    ? buildWhatsAppUrl("Assalam-o-Alaikum! I would like to discuss the production process and timeline for our packaging order.")
    : '#';

  const steps = [
    {
      num: "01",
      title: "Discovery & Requirement Definition",
      desc: "You share your product dimensions (Length x Width x Height), product weight, target aesthetics, and estimated quantity with our team on WhatsApp.",
      icon: Package,
    },
    {
      num: "02",
      title: "Die-Line Template & Artwork Proofing",
      desc: "Our pre-press technicians provide an accurate flat die-line template. You apply your logo and branding graphics, which we review for color traps, bleeds, and resolution.",
      icon: Layers,
    },
    {
      num: "03",
      title: "Quotation & Commercial Approval",
      desc: "We confirm the board specification (e.g. 350 GSM Bleached Kraft or E-flute Corrugated), print technique, finishing extras, unit pricing in PKR, and production schedule.",
      icon: Check,
    },
    {
      num: "04",
      title: "High-Precision Offset Printing",
      desc: "Your packaging run is fed through our modern commercial offset presses, calibrated for accurate CMYK and Pantone ink reproduction.",
      icon: Printer,
    },
    {
      num: "05",
      title: "Surface Finishing & Embellishment",
      desc: "Specialty post-press operations are applied: thermal metallic gold or silver foil stamping, matte soft-touch lamination, gloss coating, or 3D embossing.",
      icon: Sparkles,
    },
    {
      num: "06",
      title: "Die-Cutting, Folding & Delivery",
      desc: "Industrial steel-rule dies cut and crease each carton with razor precision. Items are folded, glued or flat-packed, and dispatched safely to your city across Pakistan.",
      icon: Truck,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
        {/* Breadcrumb */}
        <nav className="text-xs text-[#7A7266] uppercase tracking-wider mb-6">
          <Link to="/" className="hover:text-[#1E1B18]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[#1E1B18] font-semibold">Our Process</span>
        </nav>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8C6D3B] block mb-2">
            Step-by-Step Workflow
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1E1B18]">
            From Concept to Finished Packaging
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6357] mt-3 leading-relaxed">
            Understanding the production journey guarantees that your boxes fit like a glove, protect your merchandise, and showcase your brand identity.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E8E2D8] p-8 rounded-sm shadow-sm hover:border-[#8C6D3B] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-serif text-3xl font-bold text-[#8C6D3B]">
                    {step.num}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#DDD6C9] flex items-center justify-center text-[#1E1B18]">
                    <step.icon className="w-5 h-5 text-[#8C6D3B]" />
                  </div>
                </div>

                <h3 className="font-serif text-xl font-semibold text-[#1E1B18] mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-[#5A534A] leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-[#F0ECE4] text-[11px] text-[#8C6D3B] font-semibold uppercase tracking-wider">
                Phase {idx + 1} of 6
              </div>
            </div>
          ))}
        </div>

        {/* CTA Card */}
        <div className="bg-[#1E1B18] text-[#FAF7F2] p-8 md:p-12 border border-[#3A332C] rounded-sm text-center space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold block">
            Start Your Project
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold">
            Ready to Begin Step 1 on WhatsApp?
          </h2>
          <p className="text-xs sm:text-sm text-[#C5BDB2] max-w-xl mx-auto font-light leading-relaxed">
            Message us your dimensions and requirements. Our production team is on standby to guide you through materials and pricing.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-semibold uppercase tracking-wider shadow"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Initiate Order on WhatsApp</span>
            </a>
            <Link
              to="/custom-packaging"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent hover:bg-white/10 text-white text-xs font-semibold uppercase tracking-wider border border-[#5A5044]"
            >
              <span>Fill Detailed Spec Form</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
