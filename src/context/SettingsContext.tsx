import React, { createContext, useContext, useEffect, useState } from 'react';
import { SiteSettings } from '../types';
import { DEFAULT_SITE_SETTINGS } from '../data/seedData';
import { getSiteSettings, saveSiteSettings } from '../services/dataService';

interface SettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: SiteSettings) => Promise<void>;
  loading: boolean;
  cleanWhatsAppNumber: string;
  cleanSecondaryWhatsAppNumber: string;
  isWhatsAppConfigured: boolean;
  buildWhatsAppUrl: (message: string, useSecondary?: boolean) => string;
  buildProductWhatsAppMessage: (params: {
    productName: string;
    productUrl?: string;
    quantity?: string;
    dimensions?: string;
    material?: string;
    printing?: string;
    finishing?: string;
    specialNotes?: string;
  }) => string;
  buildCustomPackagingMessage: (params: {
    customerName: string;
    businessName?: string;
    phone: string;
    city: string;
    category: string;
    dimensions?: string;
    quantity: string;
    material?: string;
    printing?: string;
    finishing?: string;
    budget?: string;
    deadline?: string;
    description: string;
  }) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getSiteSettings().then((res) => {
      setSettings(res);
      setLoading(false);
    });
  }, []);

  const updateSettings = async (newSettings: SiteSettings) => {
    await saveSiteSettings(newSettings);
    setSettings(newSettings);
  };

  // Clean WhatsApp numbers: remove +, spaces, dashes
  const cleanWhatsAppNumber = (settings.whatsappNumber || '923108216304').replace(/[^0-9]/g, '');
  const cleanSecondaryWhatsAppNumber = (settings.secondaryWhatsAppNumber || '923181718476').replace(/[^0-9]/g, '');
  const isWhatsAppConfigured = Boolean(cleanWhatsAppNumber && cleanWhatsAppNumber.length >= 10);

  const buildWhatsAppUrl = (message: string, useSecondary: boolean = false): string => {
    const targetNumber = useSecondary && cleanSecondaryWhatsAppNumber ? cleanSecondaryWhatsAppNumber : cleanWhatsAppNumber;
    if (!targetNumber) return '#';
    return `https://wa.me/${targetNumber}?text=${encodeURIComponent(message.trim())}`;
  };

  const buildProductWhatsAppMessage = ({
    productName,
    productUrl,
    quantity,
    dimensions,
    material,
    printing,
    finishing,
    specialNotes,
  }: {
    productName: string;
    productUrl?: string;
    quantity?: string;
    dimensions?: string;
    material?: string;
    printing?: string;
    finishing?: string;
    specialNotes?: string;
  }): string => {
    const lines: string[] = [
      `Assalam-o-Alaikum! I am interested in ordering packaging from KHAN&SON'S PRINTER & PACKAGES.`,
      ``,
      `📦 Product: ${productName}`,
    ];

    if (productUrl) {
      lines.push(`🔗 Product Link: ${productUrl}`);
    }
    if (quantity) {
      lines.push(`🔢 Quantity Required: ${quantity}`);
    }
    if (dimensions) {
      lines.push(`📐 Dimensions: ${dimensions}`);
    }
    if (material) {
      lines.push(`📄 Material: ${material}`);
    }
    if (printing) {
      lines.push(`🎨 Printing: ${printing}`);
    }
    if (finishing) {
      lines.push(`✨ Finishing: ${finishing}`);
    }
    if (specialNotes) {
      lines.push(`📝 Special Notes: ${specialNotes}`);
    }

    lines.push(``);
    lines.push(`Please share the price, minimum order quantity, production time, and delivery details.`);

    return lines.join('\n');
  };

  const buildCustomPackagingMessage = ({
    customerName,
    businessName,
    phone,
    city,
    category,
    dimensions,
    quantity,
    material,
    printing,
    finishing,
    budget,
    deadline,
    description,
  }: {
    customerName: string;
    businessName?: string;
    phone: string;
    city: string;
    category: string;
    dimensions?: string;
    quantity: string;
    material?: string;
    printing?: string;
    finishing?: string;
    budget?: string;
    deadline?: string;
    description: string;
  }): string => {
    const lines: string[] = [
      `Assalam-o-Alaikum! I would like to request a custom packaging quote from KHAN&SON'S PRINTER & PACKAGES.`,
      ``,
      `👤 Customer Name: ${customerName}`,
    ];

    if (businessName) {
      lines.push(`🏢 Business / Brand: ${businessName}`);
    }
    lines.push(`📞 Contact Phone: ${phone}`);
    lines.push(`📍 City / Location: ${city}`);
    lines.push(`📦 Packaging Category: ${category}`);
    if (dimensions) {
      lines.push(`📐 Required Dimensions: ${dimensions}`);
    }
    lines.push(`🔢 Estimated Quantity: ${quantity}`);
    if (material) {
      lines.push(`📄 Material Preference: ${material}`);
    }
    if (printing) {
      lines.push(`🎨 Printing Requirements: ${printing}`);
    }
    if (finishing) {
      lines.push(`✨ Finishing Options: ${finishing}`);
    }
    if (budget) {
      lines.push(`💰 Target Budget: ${budget}`);
    }
    if (deadline) {
      lines.push(`⏳ Target Deadline: ${deadline}`);
    }
    lines.push(``);
    lines.push(`📋 Project Description:`);
    lines.push(description);
    lines.push(``);
    lines.push(`Kindly share your quotation, material samples, and lead time for our order.`);

    return lines.join('\n');
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        loading,
        cleanWhatsAppNumber,
        cleanSecondaryWhatsAppNumber,
        isWhatsAppConfigured,
        buildWhatsAppUrl,
        buildProductWhatsAppMessage,
        buildCustomPackagingMessage,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
