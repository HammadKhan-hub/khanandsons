import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, Link } from '../router/Router';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import {
  getProducts,
  saveProduct,
  deleteProduct,
  getCategories,
  saveCategory,
  deleteCategory,
  buildCategoryTree,
  canDeleteCategorySafely,
  CategoryWithChildren,
  getAdminInquiries,
  createAdminInquiry,
  updateInquiryStatusAndNotes,
  deleteInquiry,
  getPortfolioItems,
  savePortfolioItem,
  deletePortfolioItem,
} from '../services/dataService';
import {
  uploadImageToStorage,
  getStoredMediaItems,
  saveMediaItem,
  deleteMediaItem,
} from '../services/storageService';
import { Product, Category, Inquiry, PortfolioItem, SiteSettings, InquiryStatus, MediaItem } from '../types';
import { ImageUploadDropzone } from '../components/ImageUploadDropzone';
import {
  ShieldCheck,
  LogOut,
  Package,
  Layers,
  Inbox,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  Search,
  Eye,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Copy,
  UploadCloud,
  Check,
  Phone,
  Filter,
  SlidersHorizontal,
  X,
  FileText,
  Clock,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  FolderTree,
  CornerDownRight,
  AlertTriangle,
} from 'lucide-react';

type AdminTab = 'overview' | 'products' | 'categories' | 'inquiries' | 'media' | 'portfolio' | 'settings';

export const AdminDashboardPage: React.FC = () => {
  const { navigate } = useRouter();
  const { currentUser, isAdmin, loading: authLoading, logout } = useAuth();
  const { settings, updateSettings, buildWhatsAppUrl } = useSettings();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Product Management State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [productSortBy, setProductSortBy] = useState<'featured' | 'name-asc' | 'date-desc'>('featured');

  // Category Management State (Hierarchical 2-tier tree)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryModalLevel, setCategoryModalLevel] = useState<'main' | 'sub'>('main');
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryTypeFilter, setCategoryTypeFilter] = useState<'all' | 'main' | 'sub'>('all');
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const [categoryDeleteBlock, setCategoryDeleteBlock] = useState<{
    category: Category;
    reasons: string[];
    childSubcategories: Category[];
    assignedProducts: Product[];
  } | null>(null);

  // Media Library State
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'main' | 'gallery' | 'category' | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [mediaSearch, setMediaSearch] = useState('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaUploadProgress, setMediaUploadProgress] = useState(0);

  // Inquiry & WhatsApp Order State
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>('All');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState<Partial<Inquiry>>({
    customerName: '',
    phone: '',
    city: 'Multan, Pakistan',
    category: 'Cake & Bakery Boxes',
    quantity: '1,000 pcs',
    dimensions: '10 x 8 x 4 inches',
    material: '350 GSM Bleached Food-Grade Board',
    printing: '4-Color CMYK Offset',
    finishing: 'Matte Lamination + Gold Foil',
    quotedPrice: '',
    status: 'New',
    description: 'Custom packaging quotation requested via WhatsApp',
    internalNotes: '',
  });

  // Portfolio State
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioItem | null>(null);
  const [isCreatingPortfolio, setIsCreatingPortfolio] = useState(false);

  // Settings State
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings);

  // Route protection
  useEffect(() => {
    if (!authLoading && (!currentUser || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [currentUser, isAdmin, authLoading, navigate]);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  // Load all live data
  const loadData = async () => {
    setDataLoading(true);
    try {
      const [prods, cats, inqs, ports] = await Promise.all([
        getProducts(true),
        getCategories(true),
        getAdminInquiries().catch(() => []),
        getPortfolioItems(true),
      ]);
      setProducts(prods);
      setCategories(cats);
      setInquiries(inqs);
      setPortfolioItems(ports);

      // Refresh media library
      loadMediaLibrary(prods, cats);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const loadMediaLibrary = (currentProds: Product[], currentCats: Category[]) => {
    const stored = getStoredMediaItems();
    const mediaMap = new Map<string, MediaItem>();

    // Add stored uploads
    stored.forEach((item) => mediaMap.set(item.url, item));

    // Also populate from active product images
    currentProds.forEach((p) => {
      if (p.imageUrl && !mediaMap.has(p.imageUrl)) {
        mediaMap.set(p.imageUrl, {
          id: `prod-img-${p.id}`,
          name: `${p.name} (Main Mockup)`,
          url: p.imageUrl,
          uploadedAt: p.createdAt || new Date().toISOString(),
        });
      }
      p.gallery?.forEach((gUrl, idx) => {
        if (gUrl && !mediaMap.has(gUrl)) {
          mediaMap.set(gUrl, {
            id: `prod-gal-${p.id}-${idx}`,
            name: `${p.name} Gallery ${idx + 1}`,
            url: gUrl,
            uploadedAt: p.createdAt || new Date().toISOString(),
          });
        }
      });
    });

    // Populate from category images
    currentCats.forEach((c) => {
      if (c.imageUrl && !mediaMap.has(c.imageUrl)) {
        mediaMap.set(c.imageUrl, {
          id: `cat-img-${c.id}`,
          name: `${c.name} Header Image`,
          url: c.imageUrl,
          uploadedAt: c.createdAt || new Date().toISOString(),
        });
      }
    });

    setMediaItems(Array.from(mediaMap.values()));
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  // ---------------- PRODUCT HANDLERS ----------------
  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct || isSavingProduct) return;

    if (!editingProduct.name.trim()) {
      showFeedback('error', 'Product name is required.');
      return;
    }

    setIsSavingProduct(true);
    try {
      await saveProduct(editingProduct);
      showFeedback('success', `Product "${editingProduct.name}" saved successfully.`);
      setEditingProduct(null);
      setIsCreatingProduct(false);
      loadData();
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to save product.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      showFeedback('success', `Product "${name}" deleted.`);
      loadData();
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to delete product.');
    }
  };

  const handleDuplicateProduct = (prod: Product) => {
    const timestamp = Date.now();
    const newId = `prod-${timestamp}`;
    const slug = `${prod.slug}-copy-${timestamp.toString().slice(-4)}`;
    const copy: Product = {
      ...prod,
      id: newId,
      name: `${prod.name} (Copy)`,
      slug,
      isPublished: false, // Default to draft for administrator review
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingProduct(copy);
    setIsCreatingProduct(true);
    showFeedback('success', `Duplicated "${prod.name}". Adjust fields and save.`);
  };

  const handleToggleProductPublish = async (prod: Product) => {
    try {
      const updated = { ...prod, isPublished: !prod.isPublished };
      await saveProduct(updated);
      showFeedback('success', `Product ${updated.isPublished ? 'published to catalog' : 'moved to drafts'}.`);
      loadData();
    } catch (err: any) {
      showFeedback('error', 'Update failed.');
    }
  };

  const handleToggleProductFeatured = async (prod: Product) => {
    try {
      const updated = { ...prod, isFeatured: !prod.isFeatured };
      await saveProduct(updated);
      showFeedback('success', `Featured state updated for "${prod.name}".`);
      loadData();
    } catch (err: any) {
      showFeedback('error', 'Update failed.');
    }
  };

  // ---------------- CATEGORY HIERARCHY HANDLERS ----------------
  const handleOpenAddMainCategory = () => {
    setCategoryModalLevel('main');
    setEditingCategory({
      id: `cat-${Date.now()}`,
      name: '',
      slug: '',
      parentCategoryId: null,
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop',
      displayOrder: mainCategories.length + 1,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsCreatingCategory(true);
  };

  const handleOpenAddSubcategory = (targetParentId?: string) => {
    const parentId = targetParentId || mainCategories[0]?.id || '';
    setCategoryModalLevel('sub');
    setEditingCategory({
      id: `subcat-${Date.now()}`,
      name: '',
      slug: '',
      parentCategoryId: parentId,
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop',
      displayOrder: 1,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsCreatingCategory(true);
  };

  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCategory) return;

    const trimmedName = editingCategory.name.trim();
    if (!trimmedName) {
      showFeedback('error', 'Category name is required.');
      return;
    }

    const trimmedSlug = editingCategory.slug.trim().toLowerCase();
    if (!trimmedSlug) {
      showFeedback('error', 'URL Slug is required.');
      return;
    }

    // Slug format validation
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmedSlug)) {
      showFeedback('error', 'URL Slug must contain only lowercase letters, numbers, and hyphens (e.g. "window-cake-boxes").');
      return;
    }

    // Slug uniqueness check against all other categories
    const slugCollision = categories.some(
      (c) => c.id !== editingCategory.id && c.slug.toLowerCase() === trimmedSlug
    );
    if (slugCollision) {
      showFeedback('error', `The slug "${trimmedSlug}" is already in use by another category. Please choose a unique slug.`);
      return;
    }

    // Prevent self-parenting
    if (editingCategory.parentCategoryId === editingCategory.id) {
      showFeedback('error', 'A category cannot be its own parent.');
      return;
    }

    // Enforce 1-level limit: the chosen parent must NOT have a parent itself
    if (editingCategory.parentCategoryId) {
      const chosenParent = categories.find((c) => c.id === editingCategory.parentCategoryId);
      if (chosenParent && chosenParent.parentCategoryId) {
        showFeedback('error', 'Subcategories can only be nested under a Main Category. Deep multi-tier nesting is not allowed.');
        return;
      }
    }

    // Prevent demoting a category if it currently has active subcategories
    const hasActiveChildren = categories.some((c) => c.parentCategoryId === editingCategory.id);
    if (hasActiveChildren && editingCategory.parentCategoryId) {
      showFeedback(
        'error',
        `"${editingCategory.name}" currently has child subcategories. Reassign or delete those children before turning it into a subcategory.`
      );
      return;
    }

    try {
      await saveCategory({
        ...editingCategory,
        name: trimmedName,
        slug: trimmedSlug,
        parentCategoryId: editingCategory.parentCategoryId ? editingCategory.parentCategoryId.trim() : null,
      });
      showFeedback('success', `Category "${trimmedName}" saved successfully.`);
      setEditingCategory(null);
      setIsCreatingCategory(false);
      loadData();
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to save category.');
    }
  };

  const handleDeleteCategoryWithCheck = (cat: Category) => {
    const safetyCheck = canDeleteCategorySafely(cat, categories, products);
    if (!safetyCheck.canDelete) {
      setCategoryDeleteBlock({
        category: cat,
        reasons: safetyCheck.reasons,
        childSubcategories: safetyCheck.childSubcategories,
        assignedProducts: safetyCheck.assignedProducts,
      });
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete category "${cat.name}"?`)) {
      confirmDeleteCategory(cat.id, cat.name);
    }
  };

  const confirmDeleteCategory = async (id: string, name: string) => {
    try {
      await deleteCategory(id);
      showFeedback('success', `Category "${name}" deleted.`);
      setCategoryDeleteBlock(null);
      loadData();
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to delete category.');
    }
  };

  const handleAddProductFromCategory = (cat: Category) => {
    const isSub = Boolean(cat.parentCategoryId);
    let mainCatId = cat.id;
    let mainCatName = cat.name;
    let subCatId: string | null = null;
    let subCatName: string | undefined = undefined;

    if (isSub) {
      const parent = categories.find((c) => c.id === cat.parentCategoryId);
      mainCatId = parent?.id || cat.parentCategoryId!;
      mainCatName = parent?.name || 'Main Category';
      subCatId = cat.id;
      subCatName = cat.name;
    }

    setEditingProduct({
      id: `prod-${Date.now()}`,
      name: '',
      slug: '',
      categoryId: mainCatId,
      categoryName: mainCatName,
      subcategoryId: subCatId,
      subcategoryName: subCatName,
      shortDescription: '',
      description: '',
      imageUrl: cat.imageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop',
      gallery: [],
      availableDimensions: ['10 x 8 x 4 inches', 'Custom Dimensions on Request'],
      materialOptions: ['350 GSM Bleached Food-Grade Board', 'Virgin Kraft Board', 'Rigid Board'],
      printingOptions: ['4-Color CMYK Offset', 'Single Color Screen'],
      finishingOptions: ['Matte Lamination', 'Gold Foil Stamping'],
      minOrderQuantity: '500 pieces',
      pricingMode: 'quote_only',
      indicativePrice: 'Price on Request',
      isFeatured: false,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsCreatingProduct(true);
    setActiveTab('products');
  };

  const toggleParentExpand = (id: string) => {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedParents(new Set(mainCategories.map((c) => c.id)));
  };

  const handleCollapseAll = () => {
    setExpandedParents(new Set());
  };

  // ---------------- MEDIA LIBRARY HANDLERS ----------------
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploadingMedia(true);
    setMediaUploadProgress(0);

    try {
      const result = await uploadImageToStorage(file, 'media_library', (pct) => {
        setMediaUploadProgress(pct);
      });
      showFeedback('success', `Uploaded "${file.name}" to media library.`);
      loadData();
    } catch (err: any) {
      showFeedback('error', err?.message || 'Media upload failed.');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    showFeedback('success', 'Image URL copied to clipboard.');
    setTimeout(() => setCopiedUrl(null), 3000);
  };

  const handleDeleteMedia = async (item: MediaItem) => {
    // Check if in use
    const usedInProducts = products.filter(
      (p) => p.imageUrl === item.url || p.gallery?.includes(item.url)
    );
    const usedInCategories = categories.filter((c) => c.imageUrl === item.url);

    if (usedInProducts.length > 0 || usedInCategories.length > 0) {
      const msg = `This image is currently used in ${usedInProducts.length} product(s) and ${usedInCategories.length} category(ies). Are you certain you want to remove it?`;
      if (!window.confirm(msg)) return;
    } else {
      if (!window.confirm(`Delete image "${item.name}"?`)) return;
    }

    try {
      await deleteMediaItem(item);
      showFeedback('success', 'Image removed from library.');
      loadData();
    } catch (err: any) {
      showFeedback('error', 'Failed to delete image.');
    }
  };

  const handleSelectMediaForCurrentForm = (url: string) => {
    if (mediaPickerTarget === 'main' && editingProduct) {
      setEditingProduct({ ...editingProduct, imageUrl: url });
    } else if (mediaPickerTarget === 'gallery' && editingProduct) {
      const existing = editingProduct.gallery || [];
      if (!existing.includes(url)) {
        setEditingProduct({ ...editingProduct, gallery: [...existing, url] });
      }
    } else if (mediaPickerTarget === 'category' && editingCategory) {
      setEditingCategory({ ...editingCategory, imageUrl: url });
    }
    setMediaPickerTarget(null);
    showFeedback('success', 'Image selected from library.');
  };

  // ---------------- INQUIRY & ORDER HANDLERS ----------------
  const handleUpdateInquiryStatus = async (
    id: string,
    status: InquiryStatus,
    notes?: string,
    price?: string
  ) => {
    try {
      await updateInquiryStatusAndNotes(id, status, notes, price);
      showFeedback('success', 'Inquiry / Order updated successfully.');
      loadData();
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry((prev) =>
          prev ? { ...prev, status, internalNotes: notes, quotedPrice: price } : null
        );
      }
    } catch (err: any) {
      showFeedback('error', 'Failed to update order status.');
    }
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderForm.customerName || !newOrderForm.phone) {
      showFeedback('error', 'Customer name and phone number are required.');
      return;
    }

    try {
      await createAdminInquiry(newOrderForm);
      showFeedback('success', `Order for "${newOrderForm.customerName}" logged successfully.`);
      setShowNewOrderModal(false);
      setNewOrderForm({
        customerName: '',
        phone: '',
        city: 'Multan, Pakistan',
        category: 'Cake & Bakery Boxes',
        quantity: '1,000 pcs',
        dimensions: '10 x 8 x 4 inches',
        material: '350 GSM Bleached Food-Grade Board',
        printing: '4-Color CMYK Offset',
        finishing: 'Matte Lamination + Gold Foil',
        quotedPrice: '',
        status: 'New',
        description: 'Direct WhatsApp order logged by administrator',
        internalNotes: '',
      });
      loadData();
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to log order.');
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm('Delete this inquiry/order record permanently?')) return;
    try {
      await deleteInquiry(id);
      showFeedback('success', 'Order record deleted.');
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
      loadData();
    } catch (err: any) {
      showFeedback('error', 'Failed to delete order.');
    }
  };

  // ---------------- SETTINGS HANDLERS ----------------
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(settingsForm);
      showFeedback('success', 'Site settings & WhatsApp contact numbers updated.');
    } catch (err: any) {
      showFeedback('error', 'Failed to update settings.');
    }
  };

  // Hierarchy computations
  const mainCategories = useMemo(
    () => categories.filter((c) => !c.parentCategoryId || c.parentCategoryId.trim() === ''),
    [categories]
  );

  const subcategories = useMemo(
    () => categories.filter((c) => c.parentCategoryId && c.parentCategoryId.trim() !== ''),
    [categories]
  );

  const categoryTree = useMemo(
    () => buildCategoryTree(categories, products),
    [categories, products]
  );

  const availableSubcategoriesForSelectedMain = useMemo(() => {
    if (!editingProduct || !editingProduct.categoryId) return [];
    return categories.filter((c) => c.parentCategoryId === editingProduct.categoryId);
  }, [categories, editingProduct?.categoryId]);

  // Expand all main categories on initial load so the hierarchy is immediately clear
  useEffect(() => {
    if (categories.length > 0) {
      setExpandedParents((prev) => {
        if (prev.size === 0) {
          return new Set(categories.filter((c) => !c.parentCategoryId).map((c) => c.id));
        }
        return prev;
      });
    }
  }, [categories]);

  // Filtered & sorted category tree for the Category Management tab
  const filteredCategoryTree = useMemo(() => {
    const term = categorySearch.trim().toLowerCase();
    return categoryTree
      .map((main) => {
        const mainMatches =
          !term ||
          main.name.toLowerCase().includes(term) ||
          main.slug.toLowerCase().includes(term) ||
          main.description?.toLowerCase().includes(term);

        const matchingSubs = main.subcategories.filter((sub) => {
          return (
            !term ||
            sub.name.toLowerCase().includes(term) ||
            sub.slug.toLowerCase().includes(term) ||
            sub.description?.toLowerCase().includes(term)
          );
        });

        if (categoryTypeFilter === 'main') {
          return mainMatches ? { ...main, subcategories: [] } : null;
        }

        if (categoryTypeFilter === 'sub') {
          if (matchingSubs.length > 0) {
            return { ...main, subcategories: matchingSubs };
          }
          return null;
        }

        if (mainMatches || matchingSubs.length > 0) {
          return {
            ...main,
            subcategories: term ? matchingSubs : main.subcategories,
          };
        }

        return null;
      })
      .filter((c): c is CategoryWithChildren => c !== null);
  }, [categoryTree, categorySearch, categoryTypeFilter]);

  // Filtered & sorted products (supports both main category and subcategory filtering)
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
          p.shortDescription?.toLowerCase().includes(productSearch.toLowerCase()) ||
          p.categoryName?.toLowerCase().includes(productSearch.toLowerCase()) ||
          (p.subcategoryName && p.subcategoryName.toLowerCase().includes(productSearch.toLowerCase()));

        let matchesCategory = true;
        if (productCatFilter !== 'all') {
          if (productCatFilter.startsWith('sub:')) {
            const targetSubId = productCatFilter.slice(4);
            matchesCategory = p.subcategoryId === targetSubId || p.categoryId === targetSubId;
          } else {
            // Match if product belongs directly to this main category OR to any of its subcategories
            const childSubIds = new Set(
              categories.filter((c) => c.parentCategoryId === productCatFilter).map((c) => c.id)
            );
            matchesCategory =
              p.categoryId === productCatFilter ||
              (Boolean(p.subcategoryId) && childSubIds.has(p.subcategoryId!));
          }
        }

        const matchesStatus =
          productStatusFilter === 'all' ||
          (productStatusFilter === 'published' && p.isPublished) ||
          (productStatusFilter === 'draft' && !p.isPublished);
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (productSortBy === 'featured') {
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        }
        if (productSortBy === 'name-asc') {
          return a.name.localeCompare(b.name);
        }
        if (productSortBy === 'date-desc') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        return 0;
      });
  }, [products, categories, productSearch, productCatFilter, productStatusFilter, productSortBy]);

  // Filtered inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchesSearch =
        inq.customerName.toLowerCase().includes(inquirySearch.toLowerCase()) ||
        inq.phone.includes(inquirySearch) ||
        inq.city?.toLowerCase().includes(inquirySearch.toLowerCase()) ||
        inq.category?.toLowerCase().includes(inquirySearch.toLowerCase());
      const matchesStatus = inquiryStatusFilter === 'All' || inq.status === inquiryStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [inquiries, inquirySearch, inquiryStatusFilter]);

  // Filtered media items
  const filteredMedia = useMemo(() => {
    return mediaItems.filter((m) =>
      m.name.toLowerCase().includes(mediaSearch.toLowerCase()) || m.url.includes(mediaSearch)
    );
  }, [mediaItems, mediaSearch]);

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-8">
        <div className="text-center font-serif text-lg text-[#8C6D3B] flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Synchronizing Khan & Son's Admin Panel...</span>
        </div>
      </div>
    );
  }

  // Real statistics
  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.isPublished).length;
  const draftProducts = products.filter((p) => !p.isPublished).length;
  const totalCategories = categories.length;
  const mainCategoriesCount = mainCategories.length;
  const subcategoriesCount = subcategories.length;
  const totalInquiriesCount = inquiries.length;
  const activeOrdersCount = inquiries.filter(
    (i) => i.status === 'New' || i.status === 'Quoted' || i.status === 'In Production' || i.status === 'Confirmed'
  ).length;

  return (
    <div className="min-h-screen bg-[#F7F3EB] text-[#1E1B18] font-sans">
      {/* Top Banner & Header */}
      <header className="bg-[#1E1B18] text-[#FAF7F2] border-b border-[#2C0C14] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-[#8C6D3B]/20 border border-[#8C6D3B]/40 flex items-center justify-center text-[#D4AF37]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#FAF7F2]">
                  KHAN&SON'S
                </h1>
                <span className="text-[10px] bg-[#8C6D3B] text-white px-2 py-0.5 rounded-xs font-semibold tracking-wider uppercase">
                  Admin Panel
                </span>
              </div>
              <p className="text-[11px] text-[#A89F91]">
                Packaging & Commercial Printing Control Center • Multan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#FAF7F2]/80 hover:text-white border border-[#FAF7F2]/20 hover:border-[#8C6D3B] rounded-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Storefront</span>
            </Link>

            <button
              onClick={() => loadData()}
              className="p-1.5 text-[#FAF7F2]/70 hover:text-white hover:bg-white/10 rounded-xs transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-800/40 rounded-xs transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto border-t border-[#2C2723]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3.5 text-xs font-semibold tracking-wider uppercase border-b-2 transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-[#8C6D3B] text-white bg-white/5'
                : 'border-transparent text-[#A89F91] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-3.5 text-xs font-semibold tracking-wider uppercase border-b-2 transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'border-[#8C6D3B] text-white bg-white/5'
                : 'border-transparent text-[#A89F91] hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Products ({totalProducts})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-3.5 text-xs font-semibold tracking-wider uppercase border-b-2 transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'categories'
                ? 'border-[#8C6D3B] text-white bg-white/5'
                : 'border-transparent text-[#A89F91] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Categories ({totalCategories})</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`py-3 px-3.5 text-xs font-semibold tracking-wider uppercase border-b-2 transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'inquiries'
                ? 'border-[#8C6D3B] text-white bg-white/5'
                : 'border-transparent text-[#A89F91] hover:text-white'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Inquiries & Orders ({totalInquiriesCount})</span>
            {activeOrdersCount > 0 && (
              <span className="bg-[#8C6D3B] text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`py-3 px-3.5 text-xs font-semibold tracking-wider uppercase border-b-2 transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'media'
                ? 'border-[#8C6D3B] text-white bg-white/5'
                : 'border-transparent text-[#A89F91] hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Media Library</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`py-3 px-3.5 text-xs font-semibold tracking-wider uppercase border-b-2 transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'portfolio'
                ? 'border-[#8C6D3B] text-white bg-white/5'
                : 'border-transparent text-[#A89F91] hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Showcase ({portfolioItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3.5 text-xs font-semibold tracking-wider uppercase border-b-2 transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-[#8C6D3B] text-white bg-white/5'
                : 'border-transparent text-[#A89F91] hover:text-white'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Site Settings</span>
          </button>
        </div>
      </header>

      {/* Floating Feedback Notification */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`p-4 rounded-sm shadow-xl flex items-center gap-3 border text-xs font-medium max-w-md ${
              feedback.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : 'bg-red-900 text-white border-red-700'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-300 shrink-0" />
            )}
            <span className="flex-1">{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW & QUICK ACTIONS                           */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-5 rounded-xs border border-[#E8E2D8] shadow-xs">
                <div className="flex items-center justify-between text-[#8C6D3B] mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6357]">
                    Total Products
                  </span>
                  <Package className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1E1B18]">
                  {totalProducts}
                </div>
                <div className="mt-2 text-[11px] text-[#7A7266] flex items-center gap-2">
                  <span className="text-emerald-700 font-semibold">{publishedProducts} published</span>
                  <span>•</span>
                  <span>{draftProducts} draft</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xs border border-[#E8E2D8] shadow-xs">
                <div className="flex items-center justify-between text-[#8C6D3B] mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6357]">
                    Packaging Categories
                  </span>
                  <Layers className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1E1B18]">
                  {totalCategories}
                </div>
                <p className="mt-2 text-[11px] text-[#7A7266]">
                  Active collections in public store
                </p>
              </div>

              <div className="bg-white p-5 rounded-xs border border-[#E8E2D8] shadow-xs">
                <div className="flex items-center justify-between text-[#8C6D3B] mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6357]">
                    Inquiries & Orders
                  </span>
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1E1B18]">
                  {totalInquiriesCount}
                </div>
                <p className="mt-2 text-[11px] text-[#7A7266]">
                  {activeOrdersCount} require active follow-up
                </p>
              </div>

              <div className="bg-white p-5 rounded-xs border border-[#E8E2D8] shadow-xs">
                <div className="flex items-center justify-between text-[#8C6D3B] mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6357]">
                    Primary Contact
                  </span>
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-[#1E1B18] truncate">
                  {settings.whatsappNumber || '0310 8216304'}
                </div>
                <p className="mt-2 text-[11px] text-[#7A7266]">
                  WhatsApp dispatch direct line
                </p>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-[#1E1B18] text-[#FAF7F2] p-5 sm:p-6 rounded-xs border border-[#2C0C14] shadow-md">
              <h2 className="font-serif text-lg font-semibold text-[#FAF7F2] mb-3">
                Quick Administrative Actions
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    setEditingProduct({
                      id: `prod-${Date.now()}`,
                      name: '',
                      slug: '',
                      categoryId: categories[0]?.id || 'cat-cake-bakery',
                      categoryName: categories[0]?.name || 'Cake & Bakery Boxes',
                      shortDescription: '',
                      description: '',
                      imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop',
                      gallery: [],
                      availableDimensions: ['10 x 8 x 4 inches'],
                      materialOptions: ['350 GSM Bleached Food-Grade Board'],
                      printingOptions: ['4-Color CMYK Offset'],
                      finishingOptions: ['Matte Lamination', 'Gold Foil'],
                      minOrderQuantity: '1,000 pieces',
                      pricingMode: 'quote_only',
                      indicativePrice: 'Price on Request',
                      isFeatured: false,
                      isPublished: true,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    });
                    setIsCreatingProduct(true);
                    setActiveTab('products');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#8C6D3B] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#A38148] transition-colors rounded-xs shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>

                <button
                  onClick={() => {
                    handleOpenAddMainCategory();
                    setActiveTab('categories');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider transition-colors rounded-xs border border-white/20"
                >
                  <FolderPlus className="w-4 h-4 text-[#D4AF37]" />
                  <span>Add Main Category</span>
                </button>

                <button
                  onClick={() => {
                    handleOpenAddSubcategory();
                    setActiveTab('categories');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider transition-colors rounded-xs border border-white/20"
                >
                  <Plus className="w-4 h-4 text-[#D4AF37]" />
                  <span>Add Subcategory</span>
                </button>

                <button
                  onClick={() => setShowNewOrderModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider transition-colors rounded-xs border border-white/20"
                >
                  <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
                  <span>Log WhatsApp / Phone Order</span>
                </button>

                <button
                  onClick={() => setActiveTab('media')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider transition-colors rounded-xs border border-white/20"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Media Library</span>
                </button>

                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-transparent hover:bg-white/10 text-[#FAF7F2]/80 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors rounded-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Public Store</span>
                </Link>
              </div>
            </div>

            {/* Split Grid: Recent Products & Recent Inquiries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Products */}
              <div className="bg-white p-6 rounded-xs border border-[#E8E2D8] shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F0ECE4]">
                  <h3 className="font-serif text-lg font-semibold text-[#1E1B18] flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#8C6D3B]" />
                    <span>Recent Packaging Products</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="text-xs text-[#8C6D3B] hover:text-[#1E1B18] font-semibold uppercase tracking-wider flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-[#F0ECE4]">
                  {products.slice(0, 5).map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="w-10 h-10 object-cover rounded-xs border border-[#E8E2D8] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1E1B18] truncate">{p.name}</p>
                          <p className="text-[11px] text-[#7A7266] truncate">
                            {p.categoryName || 'General'} • {p.minOrderQuantity || 'Custom MOQ'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold ${
                            p.isPublished
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsCreatingProduct(false);
                            setActiveTab('products');
                          }}
                          className="p-1 text-[#6B6357] hover:text-[#1E1B18]"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent WhatsApp Enquiries & Orders */}
              <div className="bg-white p-6 rounded-xs border border-[#E8E2D8] shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F0ECE4]">
                  <h3 className="font-serif text-lg font-semibold text-[#1E1B18] flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#8C6D3B]" />
                    <span>Recent WhatsApp Enquiries & Orders</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('inquiries')}
                    className="text-xs text-[#8C6D3B] hover:text-[#1E1B18] font-semibold uppercase tracking-wider flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-[#F0ECE4]">
                  {inquiries.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#7A7266]">
                      No inquiries recorded yet. Customer submissions will appear here.
                    </div>
                  ) : (
                    inquiries.slice(0, 5).map((inq) => {
                      const cleanPhone = inq.phone.replace(/[^0-9]/g, '');
                      const waUrl = `https://wa.me/${cleanPhone}?text=Assalam-o-Alaikum%20${encodeURIComponent(
                        inq.customerName
                      )}!%20Khan%20%26%20Son's%20Printing%20here%20regarding%20your%20packaging%20order.`;

                      return (
                        <div key={inq.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#1E1B18]">{inq.customerName}</span>
                              <span className="text-[10px] text-[#7A7266]">({inq.city || 'Pakistan'})</span>
                            </div>
                            <p className="text-[11px] text-[#6B6357] truncate mt-0.5">
                              {inq.category} • {inq.quantity}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold ${
                                inq.status === 'New'
                                  ? 'bg-blue-100 text-blue-800'
                                  : inq.status === 'Quotation Sent' || inq.status === 'Quoted'
                                  ? 'bg-purple-100 text-purple-800'
                                  : inq.status === 'In Production'
                                  ? 'bg-amber-100 text-amber-800'
                                  : inq.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {inq.status}
                            </span>

                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-emerald-700 hover:text-emerald-900"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PRODUCT MANAGEMENT                                 */}
        {/* ========================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#1E1B18]">
                  Product Catalog ({products.length})
                </h2>
                <p className="text-xs text-[#6B6357]">
                  Manage custom boxes, cartons, gift packaging, specifications, and WhatsApp ordering.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct({
                    id: `prod-${Date.now()}`,
                    name: '',
                    slug: '',
                    categoryId: categories[0]?.id || 'cat-cake-bakery',
                    categoryName: categories[0]?.name || 'Cake & Bakery Boxes',
                    shortDescription: '',
                    description: '',
                    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop',
                    gallery: [],
                    availableDimensions: ['10 x 8 x 4 inches', '12 x 10 x 5 inches'],
                    materialOptions: ['350 GSM Bleached Food-Grade Board', 'Virgin Kraft Board'],
                    printingOptions: ['4-Color CMYK Offset', 'Single Color Screen'],
                    finishingOptions: ['Matte Lamination', 'Gold Foil Stamping'],
                    minOrderQuantity: '1,000 pieces',
                    pricingMode: 'quote_only',
                    indicativePrice: 'Price on Request',
                    isFeatured: false,
                    isPublished: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  });
                  setIsCreatingProduct(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1E1B18] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#2C2723] rounded-xs shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="bg-white p-4 rounded-xs border border-[#E8E2D8] flex flex-wrap items-center gap-3 text-xs">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8275]" />
                <input
                  type="text"
                  placeholder="Search products by name or specs..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs focus:outline-none focus:border-[#8C6D3B]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#8A8275]" />
                <select
                  value={productCatFilter}
                  onChange={(e) => setProductCatFilter(e.target.value)}
                  className="py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                >
                  <option value="all">All Categories ({totalProducts})</option>
                  {mainCategories.map((main) => {
                    const subs = categories.filter((c) => c.parentCategoryId === main.id);
                    return (
                      <React.Fragment key={main.id}>
                        <option value={main.id} className="font-semibold">
                          📁 {main.name} (All in Main)
                        </option>
                        {subs.map((s) => (
                          <option key={s.id} value={`sub:${s.id}`}>
                            &nbsp;&nbsp;&nbsp;&nbsp;↳ {s.name}
                          </option>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </select>

                <select
                  value={productStatusFilter}
                  onChange={(e) => setProductStatusFilter(e.target.value as any)}
                  className="py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts Only</option>
                </select>

                <select
                  value={productSortBy}
                  onChange={(e) => setProductSortBy(e.target.value as any)}
                  className="py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                >
                  <option value="featured">Featured First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="date-desc">Newest First</option>
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-[#E8E2D8] rounded-xs overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] border-b border-[#E8E2D8] text-[10px] uppercase tracking-wider text-[#6B6357]">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Category & Subcategory</th>
                      <th className="py-3 px-4">Pricing Mode</th>
                      <th className="py-3 px-4 text-center">Featured</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0ECE4]">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#7A7266]">
                          No products found matching your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.imageUrl}
                                alt=""
                                className="w-11 h-11 object-cover rounded-xs border border-[#DDD6C9] shrink-0"
                              />
                              <div>
                                <strong className="text-[#1E1B18] block font-medium">
                                  {p.name}
                                </strong>
                                <span className="text-[10px] text-[#7A7266]">
                                  /{p.slug}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#5A534A]">
                            <div className="font-medium text-[#1E1B18]">{p.categoryName || p.categoryId}</div>
                            {p.subcategoryName && (
                              <div className="text-[11px] text-[#8C6D3B] flex items-center gap-1 mt-0.5">
                                <CornerDownRight className="w-3 h-3 text-[#8C6D3B]/80" />
                                <span>{p.subcategoryName}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-[#1E1B18]">
                              {p.pricingMode === 'quote_only' ? 'Quotation on WhatsApp' : p.indicativePrice || 'Indicative'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleToggleProductFeatured(p)}
                              className={`p-1 rounded-xs transition-colors ${
                                p.isFeatured ? 'text-[#D4AF37]' : 'text-gray-300 hover:text-gray-500'
                              }`}
                              title={p.isFeatured ? 'Featured Product' : 'Mark as Featured'}
                            >
                              <Sparkles className="w-4 h-4 fill-current" />
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleToggleProductPublish(p)}
                              className={`text-[10px] px-2 py-0.5 rounded-xs font-semibold ${
                                p.isPublished
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {p.isPublished ? 'Published' : 'Draft'}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <Link
                              to={`/product/${p.slug}`}
                              className="p-1.5 text-gray-500 hover:text-[#1E1B18] inline-block"
                              title="View on Storefront"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => handleDuplicateProduct(p)}
                              className="p-1.5 text-[#8C6D3B] hover:text-[#A38148]"
                              title="Duplicate Product"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setEditingProduct({ ...p });
                                setIsCreatingProduct(false);
                              }}
                              className="p-1.5 text-blue-600 hover:text-blue-800"
                              title="Edit Product"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 text-red-600 hover:text-red-800"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Product Edit / Create Modal */}
            {editingProduct && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white border border-[#E8E2D8] max-w-2xl w-full p-6 sm:p-8 rounded-xs shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F0ECE4] pb-3">
                    <h3 className="font-serif text-xl font-semibold text-[#1E1B18]">
                      {isCreatingProduct ? 'Create Packaging Product' : `Edit: ${editingProduct.name}`}
                    </h3>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="text-[#8A8275] hover:text-[#1E1B18]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingProduct.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            const slug = name
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/(^-|-$)+/g, '');
                            setEditingProduct({
                              ...editingProduct,
                              name,
                              slug: isCreatingProduct ? slug : editingProduct.slug,
                            });
                          }}
                          className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                          URL Slug *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingProduct.slug}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, slug: e.target.value })
                          }
                          className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                          Main Category *
                        </label>
                        <select
                          value={editingProduct.categoryId}
                          onChange={(e) => {
                            const newMainCatId = e.target.value;
                            const cat = categories.find((c) => c.id === newMainCatId);
                            setEditingProduct({
                              ...editingProduct,
                              categoryId: newMainCatId,
                              categoryName: cat?.name || '',
                              // Auto-clear dependent subcategory when main category changes
                              subcategoryId: null,
                              subcategoryName: undefined,
                            });
                          }}
                          className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                        >
                          {mainCategories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1 flex items-center justify-between">
                          <span>Subcategory (Dependent)</span>
                          <span className="text-[10px] text-[#8C6D3B] font-normal lowercase">optional</span>
                        </label>
                        <select
                          value={editingProduct.subcategoryId || ''}
                          onChange={(e) => {
                            const subId = e.target.value;
                            if (!subId) {
                              setEditingProduct({
                                ...editingProduct,
                                subcategoryId: null,
                                subcategoryName: undefined,
                              });
                            } else {
                              const subCat = categories.find((c) => c.id === subId);
                              setEditingProduct({
                                ...editingProduct,
                                subcategoryId: subId,
                                subcategoryName: subCat?.name || '',
                              });
                            }
                          }}
                          className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                        >
                          <option value="">-- No Subcategory (General / Standalone) --</option>
                          {availableSubcategoriesForSelectedMain.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name}
                            </option>
                          ))}
                        </select>
                        {availableSubcategoriesForSelectedMain.length === 0 && (
                          <p className="text-[10px] text-[#8A8275] mt-1">
                            No subcategories under this main category. Add one in Category Management if needed.
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                        Minimum Order Quantity (MOQ)
                      </label>
                      <input
                        type="text"
                        value={editingProduct.minOrderQuantity || ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            minOrderQuantity: e.target.value,
                          })
                        }
                        placeholder="e.g. 500 pcs or Custom on Request"
                        className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                      />
                    </div>

                    {/* Main Image Upload Zone */}
                    <ImageUploadDropzone
                      value={editingProduct.imageUrl}
                      onChange={(url) => setEditingProduct({ ...editingProduct, imageUrl: url })}
                      label="Main Product Mockup Image"
                      folder="products"
                      onOpenMediaLibrary={() => setMediaPickerTarget('main')}
                    />

                    {/* Gallery Images */}
                    <div className="space-y-2 pt-2 border-t border-[#F0ECE4]">
                      <div className="flex items-center justify-between">
                        <label className="font-semibold uppercase tracking-wider text-[#4A433A]">
                          Additional Gallery Images ({editingProduct.gallery?.length || 0})
                        </label>
                        <button
                          type="button"
                          onClick={() => setMediaPickerTarget('gallery')}
                          className="text-[#8C6D3B] hover:text-[#1E1B18] font-semibold text-[11px] flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add From Media Library</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {editingProduct.gallery?.map((gUrl, idx) => (
                          <div key={idx} className="relative w-16 h-16 border border-[#DDD6C9] rounded-xs overflow-hidden group">
                            <img src={gUrl} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...(editingProduct.gallery || [])];
                                updated.splice(idx, 1);
                                setEditingProduct({ ...editingProduct, gallery: updated });
                              }}
                              className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-black text-white p-0.5 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                        Short Catchphrase / Summary *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProduct.shortDescription}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            shortDescription: e.target.value,
                          })
                        }
                        className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                        Detailed Description & Manufacturing Specifications *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={editingProduct.description}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            description: e.target.value,
                          })
                        }
                        className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                      />
                    </div>

                    {/* Pricing Mode */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                          Pricing Mode
                        </label>
                        <select
                          value={editingProduct.pricingMode}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              pricingMode: e.target.value as 'quote_only' | 'indicative',
                            })
                          }
                          className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                        >
                          <option value="quote_only">Quotation on Request (Recommended for Custom)</option>
                          <option value="indicative">Indicative Starting Price</option>
                        </select>
                      </div>

                      {editingProduct.pricingMode === 'indicative' && (
                        <div>
                          <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                            Indicative Price Label
                          </label>
                          <input
                            type="text"
                            value={editingProduct.indicativePrice || ''}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                indicativePrice: e.target.value,
                              })
                            }
                            placeholder="e.g. From PKR 120 / piece"
                            className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* Flags */}
                    <div className="flex items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingProduct.isPublished}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              isPublished: e.target.checked,
                            })
                          }
                        />
                        <span className="font-medium text-[#1E1B18]">Published on Storefront</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingProduct.isFeatured}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              isFeatured: e.target.checked,
                            })
                          }
                        />
                        <span className="font-medium text-[#1E1B18]">Featured on Homepage</span>
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0ECE4]">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="px-4 py-2 border border-[#DDD6C9] text-[#6B6357] hover:text-[#1E1B18] rounded-xs font-semibold uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingProduct}
                        className="px-6 py-2 bg-[#1E1B18] text-white rounded-xs font-semibold uppercase tracking-wider disabled:opacity-50 transition-opacity flex items-center gap-2"
                      >
                        {isSavingProduct && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        <span>{isSavingProduct ? 'Saving...' : 'Save Product'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: HIERARCHICAL CATEGORY & SUBCATEGORY MANAGEMENT      */}
        {/* ========================================================= */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Header & Primary Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D8] pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-2xl font-semibold text-[#1E1B18]">
                    Packaging Categories & Subcategories
                  </h2>
                  <span className="text-[10px] bg-[#8C6D3B] text-white px-2 py-0.5 rounded-xs font-semibold uppercase tracking-wider">
                    2-Tier Hierarchy
                  </span>
                </div>
                <p className="text-xs text-[#6B6357] mt-1">
                  Manage main packaging collections and nested subcategories. Products can be assigned to a main category or specific subcategory.
                </p>
                <div className="flex items-center gap-3 text-[11px] text-[#7A7266] mt-2">
                  <span><strong>{mainCategoriesCount}</strong> Main Categories</span>
                  <span>•</span>
                  <span><strong>{subcategoriesCount}</strong> Subcategories</span>
                  <span>•</span>
                  <span><strong>{totalCategories}</strong> Total Groups</span>
                </div>
              </div>

              {/* Separate Actions: Add Main Category & Add Subcategory */}
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <button
                  onClick={handleOpenAddMainCategory}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E1B18] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#2C2723] rounded-xs shadow-xs transition-colors cursor-pointer"
                  title="Create a new top-level category"
                >
                  <FolderPlus className="w-4 h-4 text-[#D4AF37]" />
                  <span>Add Main Category</span>
                </button>

                <button
                  onClick={() => handleOpenAddSubcategory()}
                  disabled={mainCategories.length === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8C6D3B] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#A38148] disabled:opacity-50 transition-colors rounded-xs shadow-xs cursor-pointer"
                  title="Create a nested subcategory under an existing main category"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Subcategory</span>
                </button>
              </div>
            </div>

            {/* Toolbar: Search, Type Filter & Expand/Collapse */}
            <div className="bg-white p-4 rounded-xs border border-[#E8E2D8] flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
                {/* Search */}
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8275]" />
                  <input
                    type="text"
                    placeholder="Search categories or subcategories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs focus:outline-none focus:border-[#8C6D3B]"
                  />
                  {categorySearch && (
                    <button
                      onClick={() => setCategorySearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 border border-[#DDD6C9] rounded-xs">
                  <button
                    onClick={() => setCategoryTypeFilter('all')}
                    className={`px-2.5 py-1 rounded-xs text-[11px] font-medium transition-colors ${
                      categoryTypeFilter === 'all'
                        ? 'bg-[#1E1B18] text-[#D4AF37]'
                        : 'text-[#6B6357] hover:text-[#1E1B18]'
                    }`}
                  >
                    All ({categories.length})
                  </button>
                  <button
                    onClick={() => setCategoryTypeFilter('main')}
                    className={`px-2.5 py-1 rounded-xs text-[11px] font-medium transition-colors ${
                      categoryTypeFilter === 'main'
                        ? 'bg-[#1E1B18] text-[#D4AF37]'
                        : 'text-[#6B6357] hover:text-[#1E1B18]'
                    }`}
                  >
                    Main Only ({mainCategories.length})
                  </button>
                  <button
                    onClick={() => setCategoryTypeFilter('sub')}
                    className={`px-2.5 py-1 rounded-xs text-[11px] font-medium transition-colors ${
                      categoryTypeFilter === 'sub'
                        ? 'bg-[#1E1B18] text-[#D4AF37]'
                        : 'text-[#6B6357] hover:text-[#1E1B18]'
                    }`}
                  >
                    Subcategories Only ({subcategories.length})
                  </button>
                </div>
              </div>

              {/* Expand / Collapse All Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExpandAll}
                  className="px-2.5 py-1.5 border border-[#DDD6C9] hover:bg-[#FAF7F2] text-[#4A433A] rounded-xs text-[11px] font-semibold"
                >
                  Expand All
                </button>
                <button
                  onClick={handleCollapseAll}
                  className="px-2.5 py-1.5 border border-[#DDD6C9] hover:bg-[#FAF7F2] text-[#4A433A] rounded-xs text-[11px] font-semibold"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Expandable Hierarchical Category Tree / List */}
            <div className="space-y-4">
              {filteredCategoryTree.length === 0 ? (
                <div className="bg-white border border-[#E8E2D8] p-8 text-center rounded-xs">
                  <Layers className="w-10 h-10 text-[#A89F91] mx-auto mb-2" />
                  <h3 className="font-serif text-base font-semibold text-[#1E1B18]">
                    No Categories Found
                  </h3>
                  <p className="text-xs text-[#7A7266] mt-1 mb-4">
                    {categorySearch ? 'No categories matched your search criteria.' : 'No packaging categories created yet.'}
                  </p>
                  {categorySearch ? (
                    <button
                      onClick={() => setCategorySearch('')}
                      className="px-3.5 py-1.5 bg-[#1E1B18] text-white text-xs rounded-xs"
                    >
                      Clear Search Filter
                    </button>
                  ) : (
                    <button
                      onClick={handleOpenAddMainCategory}
                      className="px-4 py-2 bg-[#8C6D3B] text-white text-xs font-semibold rounded-xs"
                    >
                      Create First Main Category
                    </button>
                  )}
                </div>
              ) : (
                filteredCategoryTree.map((main) => {
                  const isExpanded = expandedParents.has(main.id);
                  const subCount = main.subcategories.length;

                  return (
                    <div
                      key={main.id}
                      className="bg-white border border-[#E8E2D8] rounded-xs shadow-2xs overflow-hidden"
                    >
                      {/* Main Category Row */}
                      <div className="p-3.5 sm:p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#F0ECE4]">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Expand/Collapse Toggle Button */}
                          <button
                            type="button"
                            onClick={() => toggleParentExpand(main.id)}
                            className="p-1.5 text-[#8C6D3B] hover:bg-[#FAF7F2] rounded-xs transition-colors cursor-pointer"
                            title={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
                            aria-expanded={isExpanded}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>

                          {/* Image Thumbnail */}
                          <img
                            src={main.imageUrl}
                            alt={main.name}
                            className="w-11 h-11 object-cover rounded-xs border border-[#DDD6C9] shrink-0"
                          />

                          {/* Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-serif text-base font-bold text-[#1E1B18] truncate">
                                {main.name}
                              </span>
                              <span className="text-[9px] bg-[#1E1B18] text-[#D4AF37] px-2 py-0.2 rounded-xs font-semibold uppercase tracking-wider">
                                Main Category
                              </span>
                              <span
                                className={`text-[9px] px-2 py-0.2 rounded-xs font-semibold ${
                                  main.isPublished
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {main.isPublished ? 'Published' : 'Draft'}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-[#7A7266] mt-0.5 flex-wrap">
                              <span>Slug: <code className="bg-[#FAF7F2] px-1 rounded-2xs text-[#4A433A]">/{main.slug}</code></span>
                              <span>•</span>
                              <span>Display Order: #{main.displayOrder}</span>
                              <span>•</span>
                              <span className="text-[#8C6D3B] font-semibold">
                                {subCount} {subCount === 1 ? 'Subcategory' : 'Subcategories'}
                              </span>
                              <span>•</span>
                              <span className="font-medium text-[#1E1B18]">
                                {main.totalProductCount} Total Products ({main.directProductCount} direct, {main.totalProductCount - main.directProductCount} in subs)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions for Main Category */}
                        <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleOpenAddSubcategory(main.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#FAF7F2] hover:bg-[#EFE9DF] text-[#8C6D3B] border border-[#DDD6C9] text-xs font-semibold rounded-xs transition-colors"
                            title={`Add a nested subcategory under ${main.name}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Subcategory</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAddProductFromCategory(main)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#FAF7F2] hover:bg-[#EFE9DF] text-[#1E1B18] border border-[#DDD6C9] text-xs font-semibold rounded-xs transition-colors"
                            title={`Add a product directly under ${main.name}`}
                          >
                            <Package className="w-3.5 h-3.5 text-[#8C6D3B]" />
                            <span>Add Product</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCategoryModalLevel('main');
                              setEditingCategory({ ...main });
                              setIsCreatingCategory(false);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xs transition-colors"
                            title="Edit Main Category"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCategoryWithCheck(main)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-xs transition-colors"
                            title="Delete Main Category (Safeguarded)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expandable Subcategories Tree Container */}
                      {isExpanded && (
                        <div className="bg-[#FAF7F2]/60 p-3 sm:p-4 border-t border-[#F0ECE4]">
                          {main.subcategories.length > 0 ? (
                            <div className="space-y-2 border-l-2 border-[#8C6D3B]/40 ml-4 pl-3 sm:pl-4">
                              {main.subcategories.map((sub) => {
                                const subAssignedProds = products.filter(
                                  (p) => p.subcategoryId === sub.id || p.categoryId === sub.id
                                );

                                return (
                                  <div
                                    key={sub.id}
                                    className="bg-white border border-[#DDD6C9] rounded-xs p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-[#8C6D3B]/60 transition-colors"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <CornerDownRight className="w-4 h-4 text-[#8C6D3B] shrink-0" />
                                      <img
                                        src={sub.imageUrl}
                                        alt={sub.name}
                                        className="w-9 h-9 object-cover rounded-xs border border-[#E8E2D8] shrink-0"
                                      />
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-semibold text-xs text-[#1E1B18] truncate">
                                            {sub.name}
                                          </span>
                                          <span className="text-[9px] bg-[#EFE9DF] text-[#8C6D3B] px-1.5 py-0.2 rounded-xs font-semibold uppercase tracking-wider">
                                            Subcategory
                                          </span>
                                          <span
                                            className={`text-[9px] px-1.5 py-0.2 rounded-xs font-semibold ${
                                              sub.isPublished
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-amber-100 text-amber-800'
                                            }`}
                                          >
                                            {sub.isPublished ? 'Published' : 'Draft'}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-[#7A7266] mt-0.5 flex-wrap">
                                          <span>Slug: <code className="bg-[#FAF7F2] px-1 rounded-2xs text-[#4A433A]">/{sub.slug}</code></span>
                                          <span>•</span>
                                          <span>Order: #{sub.displayOrder}</span>
                                          <span>•</span>
                                          <span className="text-[#8C6D3B] font-semibold">
                                            {subAssignedProds.length} Products
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Subcategory Actions */}
                                    <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleAddProductFromCategory(sub)}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-[#FAF7F2] hover:bg-[#EFE9DF] text-[#8C6D3B] border border-[#DDD6C9] text-[11px] font-semibold rounded-xs transition-colors"
                                        title={`Add a product under ${main.name} › ${sub.name}`}
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>Add Product Here</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setCategoryModalLevel('sub');
                                          setEditingCategory({ ...sub });
                                          setIsCreatingCategory(false);
                                        }}
                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-xs transition-colors"
                                        title="Edit Subcategory / Move Parent"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleDeleteCategoryWithCheck(sub)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded-xs transition-colors"
                                        title="Delete Subcategory (Safeguarded)"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="border border-dashed border-[#DDD6C9] bg-white p-3 rounded-xs flex items-center justify-between text-xs text-[#7A7266]">
                              <span>No subcategories nested under "{main.name}" yet.</span>
                              <button
                                type="button"
                                onClick={() => handleOpenAddSubcategory(main.id)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8C6D3B] hover:text-[#1E1B18]"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add First Subcategory</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Hierarchical Category Modal (Edit / Create with Level & Parent Selector) */}
            {editingCategory && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white border border-[#E8E2D8] max-w-lg w-full p-6 sm:p-8 rounded-xs shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-[#F0ECE4] pb-3">
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-[#1E1B18]">
                        {isCreatingCategory
                          ? editingCategory.parentCategoryId
                            ? 'New Subcategory'
                            : 'New Main Category'
                          : `Edit Category: ${editingCategory.name}`}
                      </h3>
                      <p className="text-[11px] text-[#7A7266]">
                        {editingCategory.parentCategoryId
                          ? 'Configuring nested subcategory belonging to a parent collection.'
                          : 'Configuring top-level packaging category.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="text-[#8A8275] hover:text-[#1E1B18]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                    {/* Category Level Switcher (Main vs Subcategory) */}
                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                        Category Level *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryModalLevel('main');
                            setEditingCategory({
                              ...editingCategory,
                              parentCategoryId: null,
                            });
                          }}
                          className={`p-2.5 rounded-xs border text-left transition-all cursor-pointer ${
                            !editingCategory.parentCategoryId
                              ? 'border-[#8C6D3B] bg-[#FAF7F2] ring-1 ring-[#8C6D3B]'
                              : 'border-[#DDD6C9] bg-white hover:bg-[#FAF7F2]'
                          }`}
                        >
                          <div className="font-semibold text-[#1E1B18] flex items-center gap-1.5">
                            <FolderPlus className="w-3.5 h-3.5 text-[#8C6D3B]" />
                            <span>Main Category</span>
                          </div>
                          <div className="text-[10px] text-[#7A7266] mt-0.5">
                            Root level collection
                          </div>
                        </button>

                        <button
                          type="button"
                          disabled={
                            mainCategories.length === 0 ||
                            categories.some((c) => c.parentCategoryId === editingCategory.id)
                          }
                          onClick={() => {
                            setCategoryModalLevel('sub');
                            const fallbackParent =
                              mainCategories.find((c) => c.id !== editingCategory.id)?.id || '';
                            setEditingCategory({
                              ...editingCategory,
                              parentCategoryId: fallbackParent,
                            });
                          }}
                          className={`p-2.5 rounded-xs border text-left transition-all cursor-pointer ${
                            Boolean(editingCategory.parentCategoryId)
                              ? 'border-[#8C6D3B] bg-[#FAF7F2] ring-1 ring-[#8C6D3B]'
                              : 'border-[#DDD6C9] bg-white hover:bg-[#FAF7F2]'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <div className="font-semibold text-[#1E1B18] flex items-center gap-1.5">
                            <CornerDownRight className="w-3.5 h-3.5 text-[#8C6D3B]" />
                            <span>Subcategory</span>
                          </div>
                          <div className="text-[10px] text-[#7A7266] mt-0.5">
                            Nested under a parent
                          </div>
                        </button>
                      </div>

                      {categories.some((c) => c.parentCategoryId === editingCategory.id) && (
                        <p className="text-[10px] text-amber-700 mt-1">
                          Notice: This category already has child subcategories. It cannot be converted into a subcategory itself.
                        </p>
                      )}
                    </div>

                    {/* Parent Category Selector (When Subcategory is chosen) */}
                    {Boolean(editingCategory.parentCategoryId) && (
                      <div className="bg-[#FAF7F2] p-3 border border-[#DDD6C9] rounded-xs space-y-1">
                        <label className="block font-semibold uppercase tracking-wider text-[#4A433A]">
                          Parent Category *
                        </label>
                        <select
                          required
                          value={editingCategory.parentCategoryId || ''}
                          onChange={(e) =>
                            setEditingCategory({
                              ...editingCategory,
                              parentCategoryId: e.target.value,
                            })
                          }
                          className="w-full py-2 px-3 bg-white border border-[#DDD6C9] rounded-xs font-medium text-[#1E1B18]"
                        >
                          <option value="" disabled>
                            -- Select Parent Main Category --
                          </option>
                          {mainCategories
                            .filter((c) => c.id !== editingCategory.id)
                            .map((parent) => (
                              <option key={parent.id} value={parent.id}>
                                📁 {parent.name}
                              </option>
                            ))}
                        </select>
                        <p className="text-[10px] text-[#7A7266]">
                          Moving this subcategory will safely re-parent all products currently assigned to it.
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingCategory.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          const slug = name
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)+/g, '');
                          setEditingCategory({
                            ...editingCategory,
                            name,
                            slug: isCreatingCategory ? slug : editingCategory.slug,
                          });
                        }}
                        placeholder="e.g. Window Cake Boxes"
                        className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs focus:outline-none focus:border-[#8C6D3B]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1 flex items-center justify-between">
                        <span>URL Slug *</span>
                        <span className="text-[10px] text-[#7A7266] font-normal lowercase">lowercase, hyphens only</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingCategory.slug}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                          })
                        }
                        placeholder="e.g. window-cake-boxes"
                        className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs focus:outline-none focus:border-[#8C6D3B]"
                      />
                    </div>

                    {/* Image Upload Zone */}
                    <ImageUploadDropzone
                      value={editingCategory.imageUrl}
                      onChange={(url) => setEditingCategory({ ...editingCategory, imageUrl: url })}
                      label="Category Header / Representative Image"
                      folder="categories"
                      onOpenMediaLibrary={() => setMediaPickerTarget('category')}
                    />

                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                        Description *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={editingCategory.description}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            description: e.target.value,
                          })
                        }
                        placeholder="Detailed overview of packaging types in this group..."
                        className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs focus:outline-none focus:border-[#8C6D3B]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                          Display Order
                        </label>
                        <input
                          type="number"
                          value={editingCategory.displayOrder}
                          onChange={(e) =>
                            setEditingCategory({
                              ...editingCategory,
                              displayOrder: parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                        />
                      </div>
                      <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingCategory.isPublished}
                            onChange={(e) =>
                              setEditingCategory({
                                ...editingCategory,
                                isPublished: e.target.checked,
                              })
                            }
                          />
                          <span className="font-semibold text-[#1E1B18]">Published to Storefront</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0ECE4]">
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="px-4 py-2 border border-[#DDD6C9] text-[#6B6357] hover:text-[#1E1B18] rounded-xs font-semibold uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#1E1B18] text-white rounded-xs font-semibold uppercase tracking-wider hover:bg-[#2C2723] transition-colors"
                      >
                        {isCreatingCategory ? 'Create Category' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Safe Deletion Guard Block Modal */}
            {categoryDeleteBlock && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-white border border-[#E8E2D8] max-w-lg w-full p-6 sm:p-7 rounded-xs shadow-2xl space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#1E1B18]">
                        Cannot Delete Category
                      </h3>
                      <p className="text-xs text-[#7A7266] mt-0.5">
                        To protect your store catalog and product relationships, deletion is blocked.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs bg-[#FAF7F2] p-4 rounded-xs border border-[#DDD6C9]">
                    <div className="font-semibold text-[#1E1B18]">
                      Category: "{categoryDeleteBlock.category.name}"
                    </div>

                    <ul className="space-y-1.5 text-red-700">
                      {categoryDeleteBlock.reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-red-500 font-bold">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>

                    {categoryDeleteBlock.childSubcategories.length > 0 && (
                      <div className="pt-2 border-t border-[#DDD6C9]/60">
                        <span className="font-semibold text-[#4A433A] block mb-1">
                          Active Subcategories ({categoryDeleteBlock.childSubcategories.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {categoryDeleteBlock.childSubcategories.map((sub) => (
                            <span key={sub.id} className="bg-white px-2 py-0.5 rounded-2xs border text-[11px] text-[#4A433A]">
                              {sub.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {categoryDeleteBlock.assignedProducts.length > 0 && (
                      <div className="pt-2 border-t border-[#DDD6C9]/60">
                        <span className="font-semibold text-[#4A433A] block mb-1">
                          Assigned Products ({categoryDeleteBlock.assignedProducts.length}):
                        </span>
                        <ul className="space-y-0.5 max-h-32 overflow-y-auto">
                          {categoryDeleteBlock.assignedProducts.slice(0, 6).map((p) => (
                            <li key={p.id} className="text-[#6B6357] truncate">
                              • {p.name}
                            </li>
                          ))}
                          {categoryDeleteBlock.assignedProducts.length > 6 && (
                            <li className="text-[10px] text-[#8C6D3B] italic">
                              ...and {categoryDeleteBlock.assignedProducts.length - 6} more products
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-[#6B6357] leading-relaxed">
                    Action required: Please reassign or delete the products and subcategories listed above before deleting this category.
                  </p>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0ECE4]">
                    <button
                      type="button"
                      onClick={() => setCategoryDeleteBlock(null)}
                      className="px-5 py-2 bg-[#1E1B18] text-white rounded-xs font-semibold uppercase tracking-wider text-xs hover:bg-[#2C2723]"
                    >
                      Understood, Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: WHATSAPP ENQUIRY & ORDER REGISTER                  */}
        {/* ========================================================= */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#1E1B18]">
                  WhatsApp Enquiries & Orders ({inquiries.length})
                </h2>
                <p className="text-xs text-[#6B6357]">
                  Track quotations, custom packaging specs, customer contacts, production status, and direct WhatsApp links.
                </p>
              </div>

              <button
                onClick={() => setShowNewOrderModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1E1B18] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#2C2723] rounded-xs shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>Log WhatsApp / Phone Order</span>
              </button>
            </div>

            {/* Filter toolbar */}
            <div className="bg-white p-4 rounded-xs border border-[#E8E2D8] flex flex-wrap items-center gap-3 text-xs">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8275]" />
                <input
                  type="text"
                  placeholder="Search by customer name, phone, or city..."
                  value={inquirySearch}
                  onChange={(e) => setInquirySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#6B6357] font-medium">Status:</span>
                <select
                  value={inquiryStatusFilter}
                  onChange={(e) => setInquiryStatusFilter(e.target.value)}
                  className="py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                >
                  <option value="All">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Quotation Sent">Quotation Sent</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Production">In Production</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white border border-[#E8E2D8] rounded-xs overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] border-b border-[#E8E2D8] text-[10px] uppercase tracking-wider text-[#6B6357]">
                    <tr>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Packaging Specs</th>
                      <th className="py-3 px-4">Quoted Price</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0ECE4]">
                    {filteredInquiries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#7A7266]">
                          No inquiries or orders found.
                        </td>
                      </tr>
                    ) : (
                      filteredInquiries.map((inq) => {
                        const cleanPhone = inq.phone.replace(/[^0-9]/g, '');
                        const waUrl = `https://wa.me/${cleanPhone}?text=Assalam-o-Alaikum%20${encodeURIComponent(
                          inq.customerName
                        )}!%20Khan%20%26%20Son's%20here%20regarding%20your%20custom%20packaging%20order%20(${encodeURIComponent(
                          inq.category
                        )}).`;

                        return (
                          <tr key={inq.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-[#1E1B18]">{inq.customerName}</div>
                              <div className="text-[11px] text-[#7A7266] flex items-center gap-1.5 mt-0.5">
                                <Phone className="w-3 h-3 text-[#8C6D3B]" />
                                <span>{inq.phone}</span>
                                <span>•</span>
                                <span>{inq.city || 'Pakistan'}</span>
                              </div>
                            </td>

                            <td className="py-3 px-4 max-w-xs">
                              <div className="font-medium text-[#1E1B18]">{inq.category}</div>
                              <div className="text-[11px] text-[#6B6357] truncate mt-0.5">
                                Qty: {inq.quantity} {inq.dimensions && `• ${inq.dimensions}`}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-semibold text-[#8C6D3B]">
                                {inq.quotedPrice || 'Pending Quote'}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <select
                                value={inq.status}
                                onChange={(e) =>
                                  handleUpdateInquiryStatus(
                                    inq.id,
                                    e.target.value as InquiryStatus,
                                    inq.internalNotes,
                                    inq.quotedPrice
                                  )
                                }
                                className={`text-[10px] font-semibold px-2 py-1 rounded-xs border ${
                                  inq.status === 'New'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : inq.status === 'Quotation Sent'
                                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                                    : inq.status === 'Confirmed'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : inq.status === 'In Production'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : inq.status === 'Dispatched'
                                    ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                    : inq.status === 'Completed'
                                    ? 'bg-green-50 text-green-800 border-green-200'
                                    : 'bg-gray-100 text-gray-800 border-gray-300'
                                }`}
                              >
                                <option value="New">New</option>
                                <option value="Quotation Sent">Quotation Sent</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="In Production">In Production</option>
                                <option value="Dispatched">Dispatched</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>

                            <td className="py-3 px-4 text-[#7A7266] text-[11px] whitespace-nowrap">
                              {new Date(inq.createdAt).toLocaleDateString()}
                            </td>

                            <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xs text-[10px] font-semibold"
                                title="Chat with customer on WhatsApp"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>

                              <button
                                onClick={() => setSelectedInquiry(inq)}
                                className="p-1.5 text-blue-600 hover:text-blue-800"
                                title="View & Edit Notes"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteInquiry(inq.id)}
                                className="p-1.5 text-red-600 hover:text-red-800"
                                title="Delete Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal: View & Edit Inquiry Notes / Price */}
            {selectedInquiry && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-white border border-[#E8E2D8] max-w-lg w-full p-6 rounded-xs shadow-2xl space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-[#F0ECE4] pb-3">
                    <h3 className="font-serif text-lg font-semibold text-[#1E1B18]">
                      Order Details: {selectedInquiry.customerName}
                    </h3>
                    <button
                      onClick={() => setSelectedInquiry(null)}
                      className="text-[#8A8275] hover:text-[#1E1B18]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 bg-[#FAF7F2] p-4 rounded-xs border border-[#E8E2D8]">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[#7A7266] block">Phone:</span>
                        <strong className="text-[#1E1B18]">{selectedInquiry.phone}</strong>
                      </div>
                      <div>
                        <span className="text-[#7A7266] block">City:</span>
                        <strong className="text-[#1E1B18]">{selectedInquiry.city || 'Pakistan'}</strong>
                      </div>
                      <div>
                        <span className="text-[#7A7266] block">Category:</span>
                        <strong className="text-[#1E1B18]">{selectedInquiry.category}</strong>
                      </div>
                      <div>
                        <span className="text-[#7A7266] block">Quantity:</span>
                        <strong className="text-[#1E1B18]">{selectedInquiry.quantity}</strong>
                      </div>
                      {selectedInquiry.dimensions && (
                        <div>
                          <span className="text-[#7A7266] block">Dimensions:</span>
                          <strong className="text-[#1E1B18]">{selectedInquiry.dimensions}</strong>
                        </div>
                      )}
                      {selectedInquiry.material && (
                        <div>
                          <span className="text-[#7A7266] block">Material:</span>
                          <strong className="text-[#1E1B18]">{selectedInquiry.material}</strong>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-[#7A7266] block text-[11px] mb-1">Customer Description:</span>
                      <p className="text-[#1E1B18] leading-relaxed text-xs">
                        {selectedInquiry.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                        Quoted Price
                      </label>
                      <input
                        type="text"
                        value={selectedInquiry.quotedPrice || ''}
                        onChange={(e) =>
                          setSelectedInquiry({ ...selectedInquiry, quotedPrice: e.target.value })
                        }
                        placeholder="e.g. PKR 165 / box (Total: PKR 165,000)"
                        className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                        Internal Production Notes (Admin Only)
                      </label>
                      <textarea
                        rows={3}
                        value={selectedInquiry.internalNotes || ''}
                        onChange={(e) =>
                          setSelectedInquiry({ ...selectedInquiry, internalNotes: e.target.value })
                        }
                        placeholder="Enter die-cutting status, plate proofing details, delivery address, or client requests..."
                        className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                        Production Status
                      </label>
                      <select
                        value={selectedInquiry.status}
                        onChange={(e) =>
                          setSelectedInquiry({
                            ...selectedInquiry,
                            status: e.target.value as InquiryStatus,
                          })
                        }
                        className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                      >
                        <option value="New">New</option>
                        <option value="Quotation Sent">Quotation Sent</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="In Production">In Production</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0ECE4]">
                    <button
                      type="button"
                      onClick={() => setSelectedInquiry(null)}
                      className="px-4 py-2 border border-[#DDD6C9] text-[#6B6357] hover:text-[#1E1B18] rounded-xs font-semibold uppercase tracking-wider"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateInquiryStatus(
                          selectedInquiry.id,
                          selectedInquiry.status,
                          selectedInquiry.internalNotes,
                          selectedInquiry.quotedPrice
                        )
                      }
                      className="px-6 py-2 bg-[#1E1B18] text-white rounded-xs font-semibold uppercase tracking-wider"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Create Manual Order / Log WhatsApp Deal */}
            {showNewOrderModal && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white border border-[#E8E2D8] max-w-lg w-full p-6 sm:p-8 rounded-xs shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
                  <div className="flex items-center justify-between border-b border-[#F0ECE4] pb-3">
                    <h3 className="font-serif text-lg font-semibold text-[#1E1B18]">
                      Log WhatsApp / Phone Packaging Order
                    </h3>
                    <button
                      onClick={() => setShowNewOrderModal(false)}
                      className="text-[#8A8275] hover:text-[#1E1B18]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateManualOrder} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                          Customer Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={newOrderForm.customerName}
                          onChange={(e) =>
                            setNewOrderForm({ ...newOrderForm, customerName: e.target.value })
                          }
                          className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                          Phone Number (WhatsApp) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 03108216304"
                          value={newOrderForm.phone}
                          onChange={(e) =>
                            setNewOrderForm({ ...newOrderForm, phone: e.target.value })
                          }
                          className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                          Destination City
                        </label>
                        <input
                          type="text"
                          value={newOrderForm.city}
                          onChange={(e) =>
                            setNewOrderForm({ ...newOrderForm, city: e.target.value })
                          }
                          className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                          Packaging Category
                        </label>
                        <select
                          value={newOrderForm.category}
                          onChange={(e) =>
                            setNewOrderForm({ ...newOrderForm, category: e.target.value })
                          }
                          className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                          Order Quantity
                        </label>
                        <input
                          type="text"
                          value={newOrderForm.quantity}
                          onChange={(e) =>
                            setNewOrderForm({ ...newOrderForm, quantity: e.target.value })
                          }
                          placeholder="e.g. 1,000 pcs"
                          className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                          Dimensions
                        </label>
                        <input
                          type="text"
                          value={newOrderForm.dimensions}
                          onChange={(e) =>
                            setNewOrderForm({ ...newOrderForm, dimensions: e.target.value })
                          }
                          placeholder="e.g. 10 x 8 x 4 inches"
                          className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                          Material & Board
                        </label>
                        <input
                          type="text"
                          value={newOrderForm.material}
                          onChange={(e) =>
                            setNewOrderForm({ ...newOrderForm, material: e.target.value })
                          }
                          className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                          Printing & Finishing
                        </label>
                        <input
                          type="text"
                          value={newOrderForm.finishing}
                          onChange={(e) =>
                            setNewOrderForm({ ...newOrderForm, finishing: e.target.value })
                          }
                          className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                          Quoted Price
                        </label>
                        <input
                          type="text"
                          value={newOrderForm.quotedPrice}
                          onChange={(e) =>
                            setNewOrderForm({ ...newOrderForm, quotedPrice: e.target.value })
                          }
                          placeholder="e.g. PKR 150 / piece"
                          className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                          Initial Status
                        </label>
                        <select
                          value={newOrderForm.status}
                          onChange={(e) =>
                            setNewOrderForm({ ...newOrderForm, status: e.target.value as InquiryStatus })
                          }
                          className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                        >
                          <option value="New">New</option>
                          <option value="Quotation Sent">Quotation Sent</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="In Production">In Production</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                        Internal Notes & Instructions
                      </label>
                      <textarea
                        rows={2}
                        value={newOrderForm.internalNotes}
                        onChange={(e) =>
                          setNewOrderForm({ ...newOrderForm, internalNotes: e.target.value })
                        }
                        placeholder="Special client requirements, die-lines, paper mill delivery..."
                        className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0ECE4]">
                      <button
                        type="button"
                        onClick={() => setShowNewOrderModal(false)}
                        className="px-4 py-2 border border-[#DDD6C9] text-[#6B6357] hover:text-[#1E1B18] rounded-xs font-semibold uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#1E1B18] text-white rounded-xs font-semibold uppercase tracking-wider"
                      >
                        Log Order
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: MEDIA LIBRARY                                      */}
        {/* ========================================================= */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#1E1B18]">
                  Packaging Media Library ({mediaItems.length})
                </h2>
                <p className="text-xs text-[#6B6357]">
                  Upload, preview, and reuse product photographs, box die-cuts, and category mockups across your catalog.
                </p>
              </div>

              {/* Upload Button */}
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E1B18] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#2C2723] rounded-xs cursor-pointer shadow-xs">
                <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
                <span>Upload Images</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Upload Progress Indicator */}
            {isUploadingMedia && (
              <div className="bg-white p-4 rounded-xs border border-[#8C6D3B] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#1E1B18]">
                  <span>Uploading image to Firebase Storage...</span>
                  <span>{mediaUploadProgress}%</span>
                </div>
                <div className="w-full bg-[#EFE9DF] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#8C6D3B] h-full transition-all duration-200"
                    style={{ width: `${mediaUploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xs border border-[#E8E2D8] flex items-center gap-3 text-xs">
              <Search className="w-3.5 h-3.5 text-[#8A8275]" />
              <input
                type="text"
                placeholder="Search images by name or URL..."
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                className="w-full bg-transparent focus:outline-none"
              />
            </div>

            {/* Media Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMedia.map((m) => {
                const isCopied = copiedUrl === m.url;
                const usedInProds = products.filter(
                  (p) => p.imageUrl === m.url || p.gallery?.includes(m.url)
                );
                const usedInCats = categories.filter((c) => c.imageUrl === m.url);
                const usageCount = usedInProds.length + usedInCats.length;

                return (
                  <div
                    key={m.id}
                    className="bg-white border border-[#E8E2D8] rounded-xs overflow-hidden flex flex-col justify-between group shadow-xs hover:border-[#8C6D3B] transition-colors"
                  >
                    <div className="aspect-square bg-[#EFE9DF] relative overflow-hidden">
                      <img
                        src={m.url}
                        alt={m.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/300x300?text=Mockup';
                        }}
                      />
                      {usageCount > 0 && (
                        <span className="absolute top-1.5 left-1.5 bg-[#1E1B18]/85 text-[#FAF7F2] text-[9px] px-1.5 py-0.5 rounded-xs">
                          In {usageCount} items
                        </span>
                      )}
                    </div>

                    <div className="p-3 space-y-2">
                      <p className="font-medium text-[#1E1B18] text-[11px] truncate" title={m.name}>
                        {m.name}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-[#F0ECE4]">
                        <button
                          onClick={() => handleCopyUrl(m.url)}
                          className="inline-flex items-center gap-1 text-[10px] text-[#8C6D3B] hover:text-[#1E1B18] font-semibold"
                          title="Copy Image URL"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteMedia(m)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: PORTFOLIO SHOWCASE                                 */}
        {/* ========================================================= */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#1E1B18]">
                  Portfolio Showcase ({portfolioItems.length})
                </h2>
                <p className="text-xs text-[#6B6357]">
                  Highlight recent commercial print runs, luxury client packaging, and factory samples.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingPortfolio({
                    id: `port-${Date.now()}`,
                    title: '',
                    category: 'Cake & Bakery Boxes',
                    description: '',
                    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop',
                    clientName: 'Sample Showcase',
                    displayOrder: portfolioItems.length + 1,
                    isPublished: true,
                    createdAt: new Date().toISOString(),
                  });
                  setIsCreatingPortfolio(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1E1B18] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#2C2723] rounded-xs"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>Add Showcase Item</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#E8E2D8] rounded-xs overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div className="aspect-[4/3] bg-[#EFE9DF] relative overflow-hidden">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#8C6D3B] font-semibold">
                        {item.category}
                      </span>
                      <h4 className="font-serif text-lg font-semibold text-[#1E1B18] mt-0.5">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#6B6357] mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F0ECE4] flex items-center justify-between text-xs">
                      <span className="text-[11px] text-[#7A7266]">{item.clientName || 'Bespoke'}</span>
                      <div className="space-x-2">
                        <button
                          onClick={() => {
                            setEditingPortfolio({ ...item });
                            setIsCreatingPortfolio(false);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Delete "${item.title}"?`)) {
                              await deletePortfolioItem(item.id);
                              showFeedback('success', 'Showcase item deleted.');
                              loadData();
                            }
                          }}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Showcase Modal */}
            {editingPortfolio && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-white border border-[#E8E2D8] max-w-lg w-full p-6 sm:p-8 rounded-xs shadow-2xl space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-[#F0ECE4] pb-3">
                    <h3 className="font-serif text-lg font-semibold text-[#1E1B18]">
                      {isCreatingPortfolio ? 'New Showcase Item' : `Edit: ${editingPortfolio.title}`}
                    </h3>
                    <button
                      onClick={() => setEditingPortfolio(null)}
                      className="text-[#8A8275] hover:text-[#1E1B18]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        await savePortfolioItem(editingPortfolio);
                        showFeedback('success', `Showcase "${editingPortfolio.title}" saved.`);
                        setEditingPortfolio(null);
                        setIsCreatingPortfolio(false);
                        loadData();
                      } catch (err: any) {
                        showFeedback('error', 'Failed to save showcase item.');
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingPortfolio.title}
                        onChange={(e) =>
                          setEditingPortfolio({ ...editingPortfolio, title: e.target.value })
                        }
                        className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={editingPortfolio.category}
                        onChange={(e) =>
                          setEditingPortfolio({ ...editingPortfolio, category: e.target.value })
                        }
                        className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                      />
                    </div>

                    <ImageUploadDropzone
                      value={editingPortfolio.imageUrl}
                      onChange={(url) => setEditingPortfolio({ ...editingPortfolio, imageUrl: url })}
                      label="Showcase Photo"
                      folder="portfolio"
                    />

                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={editingPortfolio.description}
                        onChange={(e) =>
                          setEditingPortfolio({ ...editingPortfolio, description: e.target.value })
                        }
                        className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0ECE4]">
                      <button
                        type="button"
                        onClick={() => setEditingPortfolio(null)}
                        className="px-4 py-2 border border-[#DDD6C9] text-[#6B6357] hover:text-[#1E1B18] rounded-xs font-semibold uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#1E1B18] text-white rounded-xs font-semibold uppercase tracking-wider"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: SITE SETTINGS                                      */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-xs border border-[#E8E2D8] shadow-xs space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#1E1B18]">
                Site & WhatsApp Settings
              </h2>
              <p className="text-xs text-[#6B6357]">
                Configure official phone numbers, announcement headers, and location details used across the storefront.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                    Primary WhatsApp Number (No +) *
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.whatsappNumber}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })
                    }
                    placeholder="923108216304"
                    className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                  />
                  <span className="text-[10px] text-[#7A7266]">Format: Country code without + (e.g. 923108216304)</span>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                    Secondary WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={settingsForm.secondaryWhatsAppNumber || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, secondaryWhatsAppNumber: e.target.value })
                    }
                    placeholder="923181718476"
                    className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                    Display Phone Number
                  </label>
                  <input
                    type="text"
                    value={settingsForm.phoneNumber}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, phoneNumber: e.target.value })
                    }
                    className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, email: e.target.value })
                    }
                    className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                  City & Region
                </label>
                <input
                  type="text"
                  value={settingsForm.city}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, city: e.target.value })
                  }
                  className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                  Full Factory Address
                </label>
                <input
                  type="text"
                  value={settingsForm.address}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, address: e.target.value })
                  }
                  className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#4A433A] mb-1">
                  Announcement Marquee Text
                </label>
                <input
                  type="text"
                  value={settingsForm.announcementText}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, announcementText: e.target.value })
                  }
                  className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1E1B18] text-white rounded-xs font-semibold uppercase tracking-wider hover:bg-[#2C2723]"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* REUSABLE MEDIA PICKER MODAL (When selecting from forms)   */}
        {/* ========================================================= */}
        {mediaPickerTarget && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-[#E8E2D8] max-w-2xl w-full p-6 rounded-xs shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto text-xs">
              <div className="flex items-center justify-between border-b border-[#F0ECE4] pb-3">
                <h3 className="font-serif text-lg font-semibold text-[#1E1B18] flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#8C6D3B]" />
                  <span>Select Image from Media Library</span>
                </h3>
                <button
                  onClick={() => setMediaPickerTarget(null)}
                  className="text-[#8A8275] hover:text-[#1E1B18]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {mediaItems.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMediaForCurrentForm(m.url)}
                    className="border border-[#E8E2D8] hover:border-[#8C6D3B] rounded-xs overflow-hidden group text-left transition-colors"
                  >
                    <div className="aspect-square bg-[#EFE9DF]">
                      <img src={m.url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <p className="p-1.5 text-[10px] text-[#1E1B18] font-medium truncate">
                      {m.name}
                    </p>
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-3 border-t border-[#F0ECE4]">
                <button
                  type="button"
                  onClick={() => setMediaPickerTarget(null)}
                  className="px-4 py-2 border border-[#DDD6C9] text-[#6B6357] hover:text-[#1E1B18] rounded-xs font-semibold uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
