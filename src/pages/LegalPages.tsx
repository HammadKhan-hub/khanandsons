import React from 'react';
import { Link } from '../router/Router';
import { useSettings } from '../context/SettingsContext';

export const PrivacyPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 border border-[#E8E2D8] rounded-sm shadow-xs space-y-6 text-xs sm:text-sm text-[#4A433A] leading-relaxed">
        <h1 className="font-serif text-3xl font-semibold text-[#1E1B18] border-b border-[#F0ECE4] pb-4">
          Privacy Policy
        </h1>
        <p className="text-[11px] text-[#7A7266]">
          Last updated: {new Date().toLocaleDateString('en-GB')}
        </p>

        <section className="space-y-2">
          <h2 className="font-serif text-base font-semibold text-[#1E1B18]">1. Introduction</h2>
          <p>
            {settings.businessName} (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), operating from {settings.city}, Pakistan, is committed to respecting the privacy of our visitors and clients. This Privacy Policy outlines our practices regarding data collection and inquiries.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base font-semibold text-[#1E1B18]">2. No Online Payment Processing</h2>
          <p>
            We do not collect credit cards, debit cards, bank credentials, or process financial payments directly through this website. All orders, commercial discussions, quotations, and banking transfers are coordinated directly through our authorized WhatsApp business channel and verified bank accounts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base font-semibold text-[#1E1B18]">3. Information You Provide Voluntarily</h2>
          <p>
            When you choose to submit a custom packaging specification form or save an inquiry for follow-up, you may share your name, brand name, telephone/WhatsApp number, city, and packaging criteria. This information is stored securely in our private administrative database solely to provide you with tailored packaging quotations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base font-semibold text-[#1E1B18]">4. Artwork & Intellectual Property</h2>
          <p>
            Customer brand logos, dielines, and printing artwork shared with us are treated with strict commercial confidentiality and are never shared with unauthorized third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base font-semibold text-[#1E1B18]">5. Contact Us</h2>
          <p>
            For privacy inquiries or data requests, please contact us at {settings.email} or message us via WhatsApp at +{settings.whatsappNumber}.
          </p>
        </section>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 border border-[#E8E2D8] rounded-sm shadow-xs space-y-6 text-xs sm:text-sm text-[#4A433A] leading-relaxed">
        <h1 className="font-serif text-3xl font-semibold text-[#1E1B18] border-b border-[#F0ECE4] pb-4">
          Terms & Conditions
        </h1>
        <p className="text-[11px] text-[#7A7266]">
          Last updated: {new Date().toLocaleDateString('en-GB')}
        </p>

        <section className="space-y-2">
          <h2 className="font-serif text-base font-semibold text-[#1E1B18]">1. Ordering & Quotation Protocol</h2>
          <p>
            KHAN&SON'S PRINTER & PACKAGES conducts all packaging orders through direct communication via WhatsApp and direct commercial confirmation. Clicking a button on this website generates a prefilled message draft and does NOT constitute a confirmed, legally binding, or executed purchase order until formally accepted by both parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base font-semibold text-[#1E1B18]">2. Indicative Pricing & Quotations</h2>
          <p>
            Any prices displayed on the website are strictly indicative or marked as &quot;Price on Request&quot;. Final unit prices depend upon fluctuating paperboard commodity costs, required GSM, custom die-line tooling, print color separations, specialty foil stamping, and order volume.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base font-semibold text-[#1E1B18]">3. Proofing & Artwork Approvals</h2>
          <p>
            Prior to full mass production, customers are provided with digital dieline proofs. The customer is solely responsible for proofreading text, spelling, barcodes, and graphical alignments before giving final print approval.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base font-semibold text-[#1E1B18]">4. Production & Delivery Across Pakistan</h2>
          <p>
            Delivery schedules and freight transit times are estimated in good faith. We coordinate transport across Pakistan via recognized freight channels and courier services.
          </p>
        </section>
      </div>
    </div>
  );
};
