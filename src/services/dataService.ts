import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { Product, Category, Inquiry, PortfolioItem, SiteSettings } from '../types';
import {
  DEFAULT_SITE_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_PORTFOLIO,
} from '../data/seedData';

// ---------------- LOCAL DELETION TRACKING ----------------
// Ensures initial catalog items can be deleted without reappearing,
// while preventing unedited items from disappearing when one item is edited.
const DELETED_PRODUCTS_KEY = 'kns_deleted_products_v1';
const DELETED_CATEGORIES_KEY = 'kns_deleted_categories_v1';
const DELETED_PORTFOLIO_KEY = 'kns_deleted_portfolio_v1';

function getDeletedIds(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function addDeletedId(key: string, id: string): void {
  try {
    const set = getDeletedIds(key);
    set.add(id);
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.warn(`Failed to track deletion for ${key}:`, err);
  }
}

function removeDeletedId(key: string, id: string): void {
  try {
    const set = getDeletedIds(key);
    if (set.delete(id)) {
      localStorage.setItem(key, JSON.stringify(Array.from(set)));
    }
  } catch (err) {
    console.warn(`Failed to untrack deletion for ${key}:`, err);
  }
}

// ---------------- SITE SETTINGS ----------------
// Publicly readable. Never performs automatic unauthenticated background writes.
export async function getSiteSettings(): Promise<SiteSettings> {
  const path = 'siteSettings';
  try {
    const docRef = doc(db, path, 'default');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as SiteSettings;
      // If legacy dummy numbers are present in the stored document, overlay with official contacts
      if (
        data.whatsappNumber === '923001234567' ||
        data.email === 'khansonspackages@gmail.com' ||
        !data.secondaryWhatsAppNumber
      ) {
        return {
          ...data,
          whatsappNumber: '923108216304',
          secondaryWhatsAppNumber: '923181718476',
          phoneNumber: '+92 310 8216304 / +92 318 1718476',
          email: 'nasirkhanprinting@gmail.com',
          announcementText: data.announcementText?.includes('0310')
            ? data.announcementText
            : '✨ Commercial & Custom Packaging Across Pakistan — WhatsApp: 0310 8216304 / 0318 1718476',
        };
      }
      return data;
    }
    return DEFAULT_SITE_SETTINGS;
  } catch (error) {
    console.warn('Using default site settings due to read error or offline state:', error);
    return DEFAULT_SITE_SETTINGS;
  }
}

// Admin only: saves settings to Firestore explicitly when requested in Admin Dashboard
export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  const path = 'siteSettings';
  try {
    const docRef = doc(db, path, 'default');
    const cleanSettings: Record<string, any> = {};
    for (const [key, val] of Object.entries(settings)) {
      if (val !== undefined) {
        cleanSettings[key] = val;
      }
    }
    cleanSettings.updatedAt = new Date().toISOString();
    await setDoc(docRef, cleanSettings, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/default`);
  }
}

// ---------------- CATEGORIES ----------------
// Seamless catalog merge: Live Firestore changes take priority.
// Preserves default categories so editing one does not make others vanish.
export async function getCategories(forAdmin = false): Promise<Category[]> {
  const path = 'categories';
  const deletedIds = getDeletedIds(DELETED_CATEGORIES_KEY);
  try {
    const q = forAdmin
      ? collection(db, path)
      : query(collection(db, path), where('isPublished', '==', true));
    const snap = await getDocs(q);

    const firestoreMap = new Map<string, Category>();
    snap.docs.forEach((d) => {
      firestoreMap.set(d.id, { id: d.id, ...d.data() } as Category);
    });

    // Merge baseline categories
    const mergedMap = new Map<string, Category>();

    for (const base of INITIAL_CATEGORIES) {
      if (deletedIds.has(base.id)) continue;
      if (firestoreMap.has(base.id)) {
        const live = firestoreMap.get(base.id)!;
        if (!live.isDeleted) {
          mergedMap.set(base.id, live);
        }
      } else {
        mergedMap.set(base.id, base);
      }
    }

    // Add any custom categories created in Firestore
    firestoreMap.forEach((cat, id) => {
      if (!deletedIds.has(id) && !cat.isDeleted && !mergedMap.has(id)) {
        mergedMap.set(id, cat);
      }
    });

    let result = Array.from(mergedMap.values());
    if (!forAdmin) {
      result = result.filter((c) => c.isPublished);
    }
    return result.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  } catch (error) {
    console.warn('Using initial categories due to read error or offline state:', error);
    let fallback = INITIAL_CATEGORIES.filter((c) => !deletedIds.has(c.id));
    if (!forAdmin) fallback = fallback.filter((c) => c.isPublished);
    return fallback.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }
}

export async function saveCategory(category: Category): Promise<void> {
  const path = 'categories';
  removeDeletedId(DELETED_CATEGORIES_KEY, category.id);
  try {
    const docRef = doc(db, path, category.id);
    const cleanCategory: Record<string, any> = {};
    for (const [key, val] of Object.entries(category)) {
      if (val !== undefined && val !== null) {
        cleanCategory[key] = val;
      }
    }
    // Explicitly write parentCategoryId as string or null to ensure Firestore clears old parents
    if (category.parentCategoryId && category.parentCategoryId.trim()) {
      cleanCategory.parentCategoryId = category.parentCategoryId.trim();
    } else {
      cleanCategory.parentCategoryId = null;
    }
    cleanCategory.isDeleted = false;
    cleanCategory.updatedAt = new Date().toISOString();
    await setDoc(docRef, cleanCategory, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${category.id}`);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const path = 'categories';
  addDeletedId(DELETED_CATEGORIES_KEY, id);
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
  }
}

// ---------------- CATEGORY HIERARCHY HELPERS ----------------

export interface CategoryWithChildren extends Category {
  subcategories: Category[];
  totalProductCount: number;
  directProductCount: number;
}

/**
 * Organizes a flat list of categories into a 2-tier tree (Main Categories -> Subcategories)
 */
export function buildCategoryTree(categories: Category[], products: Product[] = []): CategoryWithChildren[] {
  const mainCategories = categories.filter((c) => !c.parentCategoryId || c.parentCategoryId.trim() === '');
  const subcategories = categories.filter((c) => c.parentCategoryId && c.parentCategoryId.trim() !== '');

  return mainCategories
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((main) => {
      const children = subcategories
        .filter((sub) => sub.parentCategoryId === main.id)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

      const directProductCount = products.filter(
        (p) => p.categoryId === main.id || p.categoryId === main.slug
      ).length;

      const childIds = new Set(children.map((c) => c.id));
      const subcategoryProductCount = products.filter(
        (p) => p.subcategoryId && childIds.has(p.subcategoryId)
      ).length;

      return {
        ...main,
        subcategories: children,
        directProductCount,
        totalProductCount: directProductCount + subcategoryProductCount,
      };
    });
}

/**
 * Validates whether a category can be safely deleted without breaking child subcategories or assigned products.
 */
export function canDeleteCategorySafely(
  category: Category,
  allCategories: Category[],
  allProducts: Product[]
): {
  canDelete: boolean;
  reasons: string[];
  childSubcategories: Category[];
  assignedProducts: Product[];
} {
  const childSubcategories = allCategories.filter((c) => c.parentCategoryId === category.id);
  const assignedProducts = allProducts.filter(
    (p) =>
      p.categoryId === category.id ||
      p.categoryId === category.slug ||
      p.subcategoryId === category.id ||
      (p.categoryName && p.categoryName.toLowerCase() === category.name.toLowerCase())
  );

  const reasons: string[] = [];
  if (childSubcategories.length > 0) {
    reasons.push(
      `Category has ${childSubcategories.length} active subcategories (${childSubcategories
        .map((s) => s.name)
        .slice(0, 3)
        .join(', ')}${childSubcategories.length > 3 ? '...' : ''}). Reassign or delete them first.`
    );
  }
  if (assignedProducts.length > 0) {
    reasons.push(
      `Category is assigned to ${assignedProducts.length} product(s) (${assignedProducts
        .map((p) => p.name)
        .slice(0, 3)
        .join(', ')}${assignedProducts.length > 3 ? '...' : ''}). Reassign or remove these products first.`
    );
  }

  return {
    canDelete: reasons.length === 0,
    reasons,
    childSubcategories,
    assignedProducts,
  };
}

// ---------------- PRODUCTS ----------------
// Seamless catalog merge: Resolves the issue where editing 1 product caused others to vanish.
// Authoritative Firestore docs take priority; unedited base catalog products are preserved;
// explicitly deleted products are never resurrected.
export async function getProducts(forAdmin = false): Promise<Product[]> {
  const path = 'products';
  const deletedIds = getDeletedIds(DELETED_PRODUCTS_KEY);
  try {
    const q = forAdmin
      ? collection(db, path)
      : query(collection(db, path), where('isPublished', '==', true));
    const snap = await getDocs(q);

    const firestoreMap = new Map<string, Product>();
    snap.docs.forEach((d) => {
      firestoreMap.set(d.id, { id: d.id, ...d.data() } as Product);
    });

    const mergedMap = new Map<string, Product>();

    // Baseline catalog products
    for (const base of INITIAL_PRODUCTS) {
      if (deletedIds.has(base.id)) continue;
      if (firestoreMap.has(base.id)) {
        const live = firestoreMap.get(base.id)!;
        if (!live.isDeleted) {
          mergedMap.set(base.id, live);
        }
      } else {
        mergedMap.set(base.id, base);
      }
    }

    // Add any additional products created directly in Firestore
    firestoreMap.forEach((prod, id) => {
      if (!deletedIds.has(id) && !prod.isDeleted && !mergedMap.has(id)) {
        mergedMap.set(id, prod);
      }
    });

    let result = Array.from(mergedMap.values());
    if (!forAdmin) {
      result = result.filter((p) => p.isPublished);
    }
    return result;
  } catch (error) {
    console.warn('Using baseline products due to read error or offline state:', error);
    let fallback = INITIAL_PRODUCTS.filter((p) => !deletedIds.has(p.id));
    if (!forAdmin) fallback = fallback.filter((p) => p.isPublished);
    return fallback;
  }
}

export async function saveProduct(product: Product): Promise<void> {
  const path = 'products';
  removeDeletedId(DELETED_PRODUCTS_KEY, product.id);
  try {
    const docRef = doc(db, path, product.id);
    const cleanProduct: Record<string, any> = {};
    for (const [key, val] of Object.entries(product)) {
      if (val !== undefined && val !== null) {
        cleanProduct[key] = val;
      }
    }
    // Explicitly write subcategoryId and subcategoryName as string or null
    if (product.subcategoryId && product.subcategoryId.trim()) {
      cleanProduct.subcategoryId = product.subcategoryId.trim();
      cleanProduct.subcategoryName = product.subcategoryName?.trim() || null;
    } else {
      cleanProduct.subcategoryId = null;
      cleanProduct.subcategoryName = null;
    }
    cleanProduct.isDeleted = false;
    cleanProduct.updatedAt = new Date().toISOString();
    await setDoc(docRef, cleanProduct, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${product.id}`);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const path = 'products';
  addDeletedId(DELETED_PRODUCTS_KEY, id);
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
  }
}

// ---------------- PORTFOLIO ----------------
export async function getPortfolioItems(forAdmin = false): Promise<PortfolioItem[]> {
  const path = 'portfolio';
  const deletedIds = getDeletedIds(DELETED_PORTFOLIO_KEY);
  try {
    const q = forAdmin
      ? collection(db, path)
      : query(collection(db, path), where('isPublished', '==', true));
    const snap = await getDocs(q);

    const firestoreMap = new Map<string, PortfolioItem>();
    snap.docs.forEach((d) => {
      firestoreMap.set(d.id, { id: d.id, ...d.data() } as PortfolioItem);
    });

    const mergedMap = new Map<string, PortfolioItem>();

    for (const base of INITIAL_PORTFOLIO) {
      if (deletedIds.has(base.id)) continue;
      if (firestoreMap.has(base.id)) {
        const live = firestoreMap.get(base.id)!;
        if (!live.isDeleted) {
          mergedMap.set(base.id, live);
        }
      } else {
        mergedMap.set(base.id, base);
      }
    }

    firestoreMap.forEach((item, id) => {
      if (!deletedIds.has(id) && !item.isDeleted && !mergedMap.has(id)) {
        mergedMap.set(id, item);
      }
    });

    let result = Array.from(mergedMap.values());
    if (!forAdmin) {
      result = result.filter((p) => p.isPublished);
    }
    return result.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  } catch (error) {
    console.warn('Using initial portfolio items:', error);
    let fallback = INITIAL_PORTFOLIO.filter((p) => !deletedIds.has(p.id));
    if (!forAdmin) fallback = fallback.filter((p) => p.isPublished);
    return fallback.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }
}

export async function savePortfolioItem(item: PortfolioItem): Promise<void> {
  const path = 'portfolio';
  removeDeletedId(DELETED_PORTFOLIO_KEY, item.id);
  try {
    const docRef = doc(db, path, item.id);
    const cleanItem: Record<string, any> = {};
    for (const [key, val] of Object.entries(item)) {
      if (val !== undefined && val !== null) {
        cleanItem[key] = val;
      }
    }
    cleanItem.isDeleted = false;
    cleanItem.updatedAt = new Date().toISOString();
    await setDoc(docRef, cleanItem, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${item.id}`);
  }
}

export async function deletePortfolioItem(id: string): Promise<void> {
  const path = 'portfolio';
  addDeletedId(DELETED_PORTFOLIO_KEY, id);
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
  }
}

// ---------------- INQUIRIES & ORDERS ----------------
// Publicly callable by customers saving an inquiry for follow-up.
// Strips undefined / null properties to prevent Firestore SDK validation errors.
// Excludes administrative internalNotes and forces initial status to 'New'.
export async function submitInquiry(
  inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>
): Promise<string> {
  const path = 'inquiries';
  const id = `inq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const cleanInquiry: Record<string, any> = {
    id,
    customerName: inquiry.customerName.trim(),
    phone: inquiry.phone.trim(),
    city: inquiry.city?.trim() || 'Pakistan',
    category: inquiry.category?.trim() || 'General Packaging Inquiry',
    quantity: inquiry.quantity?.trim() || 'Not specified',
    description: inquiry.description.trim(),
    status: 'New',
    createdAt: new Date().toISOString(),
  };

  const optionalFields: (keyof Omit<
    Inquiry,
    'id' | 'createdAt' | 'status' | 'customerName' | 'phone' | 'city' | 'category' | 'quantity' | 'description' | 'internalNotes'
  >)[] = [
    'businessName',
    'email',
    'dimensions',
    'material',
    'printing',
    'finishing',
    'budget',
    'deadline',
    'attachmentUrl',
  ];

  for (const field of optionalFields) {
    const val = inquiry[field];
    if (val !== undefined && val !== null && typeof val === 'string' && val.trim().length > 0) {
      cleanInquiry[field] = val.trim();
    }
  }

  try {
    const docRef = doc(db, path, id);
    await setDoc(docRef, cleanInquiry);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${id}`);
  }
}

// Admin only: create manual order/enquiry directly from Admin Dashboard
export async function createAdminInquiry(inquiry: Partial<Inquiry>): Promise<string> {
  const path = 'inquiries';
  const id = inquiry.id || `inq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const cleanPayload: Record<string, any> = {
    id,
    customerName: inquiry.customerName?.trim() || 'Direct WhatsApp Customer',
    phone: inquiry.phone?.trim() || '+92 300 0000000',
    city: inquiry.city?.trim() || 'Pakistan',
    category: inquiry.category?.trim() || 'Custom Packaging Order',
    quantity: inquiry.quantity?.trim() || '1,000 pcs',
    description: inquiry.description?.trim() || 'Direct WhatsApp enquiry / custom production order',
    status: inquiry.status || 'New',
    createdAt: inquiry.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (inquiry.businessName) cleanPayload.businessName = inquiry.businessName.trim();
  if (inquiry.email) cleanPayload.email = inquiry.email.trim();
  if (inquiry.dimensions) cleanPayload.dimensions = inquiry.dimensions.trim();
  if (inquiry.material) cleanPayload.material = inquiry.material.trim();
  if (inquiry.printing) cleanPayload.printing = inquiry.printing.trim();
  if (inquiry.finishing) cleanPayload.finishing = inquiry.finishing.trim();
  if (inquiry.quotedPrice) cleanPayload.quotedPrice = inquiry.quotedPrice.trim();
  if (inquiry.internalNotes) cleanPayload.internalNotes = inquiry.internalNotes.trim();

  try {
    const docRef = doc(db, path, id);
    await setDoc(docRef, cleanPayload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${id}`);
  }
}

// Admin only: list all inquiries and WhatsApp orders
export async function getAdminInquiries(): Promise<Inquiry[]> {
  const path = 'inquiries';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Inquiry))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Admin only: update inquiry status, quoted price, and internal notes
export async function updateInquiryStatusAndNotes(
  id: string,
  status: Inquiry['status'],
  internalNotes?: string,
  quotedPrice?: string
): Promise<void> {
  const path = 'inquiries';
  try {
    const docRef = doc(db, path, id);
    const payload: Partial<Inquiry> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (internalNotes !== undefined) {
      payload.internalNotes = internalNotes;
    }
    if (quotedPrice !== undefined) {
      payload.quotedPrice = quotedPrice;
    }
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${id}`);
  }
}

// Admin only: delete inquiry
export async function deleteInquiry(id: string): Promise<void> {
  const path = 'inquiries';
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
  }
}

// ---------------- ADMIN BOOTSTRAP / SEEDER ----------------
// Safe manual sync: Only used if explicitly requested in Admin Dashboard.
// Never called automatically in the background.
export async function seedInitialFirestoreData(): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Settings
    await setDoc(doc(db, 'siteSettings', 'default'), DEFAULT_SITE_SETTINGS);

    // 2. Categories
    for (const cat of INITIAL_CATEGORIES) {
      await setDoc(doc(db, 'categories', cat.id), cat);
    }

    // 3. Products
    for (const prod of INITIAL_PRODUCTS) {
      await setDoc(doc(db, 'products', prod.id), prod);
    }

    // 4. Portfolio
    for (const port of INITIAL_PORTFOLIO) {
      await setDoc(doc(db, 'portfolio', port.id), port);
    }

    return {
      success: true,
      message: 'Initial catalog synchronized to Firestore successfully.',
    };
  } catch (error) {
    console.error('Seed error:', error);
    return { success: false, message: error instanceof Error ? error.message : String(error) };
  }
}
