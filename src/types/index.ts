export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName?: string;
  subcategoryId?: string | null;
  subcategoryName?: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  gallery?: string[];
  availableDimensions?: string[];
  materialOptions?: string[];
  printingOptions?: string[];
  finishingOptions?: string[];
  minOrderQuantity?: string;
  pricingMode: 'quote_only' | 'indicative';
  indicativePrice?: string;
  isFeatured: boolean;
  isPublished: boolean;
  isDeleted?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentCategoryId?: string | null;
  description: string;
  imageUrl: string;
  displayOrder: number;
  isPublished: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type InquiryStatus =
  | 'New'
  | 'Contacted'
  | 'Quoted'
  | 'Quotation Sent'
  | 'In Discussion'
  | 'Confirmed'
  | 'In Production'
  | 'Dispatched'
  | 'Completed'
  | 'Cancelled'
  | 'Closed';

export interface Inquiry {
  id: string;
  customerName: string;
  businessName?: string;
  phone: string;
  email?: string;
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
  attachmentUrl?: string;
  status: InquiryStatus;
  internalNotes?: string;
  quotedPrice?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  clientName?: string;
  displayOrder: number;
  isPublished: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SiteSettings {
  businessName: string;
  whatsappNumber: string; // E.g. "923108216304"
  secondaryWhatsAppNumber?: string; // E.g. "923181718476"
  phoneNumber: string;
  email: string;
  city: string; // E.g. "Multan, Punjab, Pakistan"
  address: string;
  businessDescription: string;
  logoUrl?: string;
  announcementText: string;
  announcementEnabled: boolean;
  socialInstagram?: string;
  socialFacebook?: string;
  socialLinkedin?: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  storagePath?: string;
  size?: number;
  contentType?: string;
  uploadedAt: string;
  dimensions?: string;
}
