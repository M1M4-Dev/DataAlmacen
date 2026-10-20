import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Product, 
  StockMovement, 
  Supplier, 
  WarehouseZone, 
  DispatchReceipt, 
  PurchaseOrder,
  StockAlert,
  LiveNotificationToast,
  CategoryThreshold
} from '../types/warehouse';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_MOVEMENTS, 
  INITIAL_SUPPLIERS, 
  INITIAL_ZONES, 
  INITIAL_DISPATCHES, 
  INITIAL_PURCHASE_ORDERS,
  INITIAL_CATEGORY_THRESHOLDS
} from '../data/mockData';

interface WarehouseContextType {
  products: Product[];
  movements: StockMovement[];
  suppliers: Supplier[];
  zones: WarehouseZone[];
  dispatches: DispatchReceipt[];
  purchaseOrders: PurchaseOrder[];
  currencySymbol: string;
  setCurrencySymbol: (curr: string) => void;
  activeWarehouse: string;
  setActiveWarehouse: (w: string) => void;
  
  // Stock Alerts System
  alerts: StockAlert[];
  activeAlerts: StockAlert[];
  unreadAlertsCount: number;
  liveToasts: LiveNotificationToast[];
  soundEnabled: boolean;
  toggleSound: () => void;
  markAlertAsRead: (alertId: string) => void;
  markAllAlertsAsRead: () => void;
  dismissAlert: (alertId: string) => void;
  dismissToast: (toastId: string) => void;
  quickReorderProduct: (productId: string) => void;

  // Category Thresholds & Automation
  categoryThresholds: CategoryThreshold[];
  updateCategoryThreshold: (category: Product['category'], minStock: number, maxStock: number, autoApplyToNew?: boolean, notes?: string) => void;
  applyCategoryThresholdsToAllProducts: (targetCategory?: Product['category']) => { affectedCount: number; newAlertsCount: number };
  resetCategoryThresholds: () => void;

  addProduct: (product: Omit<Product, 'id' | 'lastRestocked'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, newStock: number, reason: string, docRef?: string) => void;
  registerMovement: (data: {
    type: 'IN' | 'OUT' | 'ADJUST' | 'TRANSFER';
    concept: string;
    productId: string;
    quantity: number;
    unitCost?: number;
    referenceDoc: string;
    notes?: string;
  }) => void;
  createDispatch: (order: {
    clientName: string;
    clientDoc: string;
    destination: string;
    paymentType: string;
    items: { productId: string; quantity: number }[];
  }) => DispatchReceipt | null;
  createPurchaseOrder: (order: {
    supplierId: string;
    items: { productId: string; quantity: number; unitCost: number }[];
    expectedDate: string;
    notes?: string;
  }) => void;
  receivePurchaseOrder: (orderId: string) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'activeOrders'>) => void;
  resetToDemoData: () => void;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'almacenpf_products_v1',
  MOVEMENTS: 'almacenpf_movements_v1',
  SUPPLIERS: 'almacenpf_suppliers_v1',
  ZONES: 'almacenpf_zones_v1',
  DISPATCHES: 'almacenpf_dispatches_v1',
  PURCHASE_ORDERS: 'almacenpf_pos_v1',
  ALERTS: 'almacenpf_alerts_v1',
  CATEGORY_THRESHOLDS: 'almacenpf_cat_thresholds_v1',
  SOUND: 'almacenpf_sound_v1',
  CURRENCY: 'almacenpf_curr_v1',
};

// Subtle Web Audio synthesizer chime for critical threshold breach
const playChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Ignore audio permission errors
  }
};

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
    } catch {
      return INITIAL_MOVEMENTS;
    }
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
    } catch {
      return INITIAL_SUPPLIERS;
    }
  });

  const [zones, setZones] = useState<WarehouseZone[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ZONES);
      return saved ? JSON.parse(saved) : INITIAL_ZONES;
    } catch {
      return INITIAL_ZONES;
    }
  });

  const [dispatches, setDispatches] = useState<DispatchReceipt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DISPATCHES);
      return saved ? JSON.parse(saved) : INITIAL_DISPATCHES;
    } catch {
      return INITIAL_DISPATCHES;
    }
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
    } catch {
      return INITIAL_PURCHASE_ORDERS;
    }
  });

  const [alerts, setAlerts] = useState<StockAlert[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALERTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [liveToasts, setLiveToasts] = useState<LiveNotificationToast[]>([]);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.SOUND) !== 'false';
  });

  const [currencySymbol, setCurrencySymbol] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENCY) || '$';
  });

  const [activeWarehouse, setActiveWarehouse] = useState<string>('Almacén Central Lima Norte');

  const [categoryThresholds, setCategoryThresholds] = useState<CategoryThreshold[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORY_THRESHOLDS);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORY_THRESHOLDS;
    } catch {
      return INITIAL_CATEGORY_THRESHOLDS;
    }
  });

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(zones));
  }, [zones]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DISPATCHES, JSON.stringify(dispatches));
  }, [dispatches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORY_THRESHOLDS, JSON.stringify(categoryThresholds));
  }, [categoryThresholds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND, soundEnabled ? 'true' : 'false');
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currencySymbol);
  }, [currencySymbol]);

  // Helper to trigger a live toast notification
  const triggerStockToast = useCallback((toast: Omit<LiveNotificationToast, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const fullToast: LiveNotificationToast = {
      ...toast,
      id,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };

    setLiveToasts(prev => [fullToast, ...prev].slice(0, 4));

    if (soundEnabled) {
      playChime();
    }

    // Auto-dismiss toast after 7 seconds
    setTimeout(() => {
      setLiveToasts(prev => prev.filter(t => t.id !== id));
    }, 7000);
  }, [soundEnabled]);

  // Evaluate and sync alerts based on current product state
  const syncAlertsForProducts = useCallback((currentProducts: Product[], previousProducts?: Product[]) => {
    setAlerts(prevAlerts => {
      const newAlertsMap = new Map<string, StockAlert>();

      // Keep existing alerts metadata if not dismissed
      for (const a of prevAlerts) {
        newAlertsMap.set(a.productId, a);
      }

      for (const prod of currentProducts) {
        const isBelowMin = prod.stock <= prod.minStock;
        const prevProd = previousProducts?.find(p => p.id === prod.id);

        if (isBelowMin) {
          const isOutOfStock = prod.stock === 0;
          const isExtremeCritical = prod.stock > 0 && prod.stock <= Math.ceil(prod.minStock / 2);
          const severity: StockAlert['severity'] = isOutOfStock 
            ? 'out_of_stock' 
            : isExtremeCritical 
              ? 'critical' 
              : 'warning';

          const message = isOutOfStock
            ? `¡Existencia agotada! Quedan 0 ${prod.unit} en almacén. Umbral mínimo: ${prod.minStock} ${prod.unit}.`
            : `Stock crítico: ${prod.stock} ${prod.unit} disponibles, por debajo del umbral mínimo de reposición (${prod.minStock} ${prod.unit}).`;

          const existing = newAlertsMap.get(prod.id);
          const wasAboveBefore = prevProd && prevProd.stock > prevProd.minStock;
          const wasNotZeroNowZero = prevProd && prevProd.stock > 0 && prod.stock === 0;

          // If stock transitioned to low or zero, mark unread and trigger live toast
          const shouldNotify = wasAboveBefore || wasNotZeroNowZero || !existing;

          const updatedAlert: StockAlert = {
            id: existing ? existing.id : `alert-${prod.id}`,
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            currentStock: prod.stock,
            minStock: prod.minStock,
            maxStock: prod.maxStock,
            unit: prod.unit,
            supplierId: prod.supplierId,
            supplierName: prod.supplierName,
            purchasePrice: prod.purchasePrice,
            severity,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            read: shouldNotify ? false : (existing ? existing.read : false),
            dismissed: false,
            message
          };

          newAlertsMap.set(prod.id, updatedAlert);

          if (shouldNotify) {
            triggerStockToast({
              title: isOutOfStock ? '¡Alerta de Stock Agotado!' : '¡Alerta de Stock Mínimo Alcanzado!',
              message,
              severity,
              productId: prod.id,
              productName: prod.name,
              sku: prod.sku,
              currentStock: prod.stock,
              minStock: prod.minStock,
              suggestedReorder: Math.max(1, prod.maxStock - prod.stock)
            });
          }
        } else {
          // Product is now above min stock -> remove or mark resolved
          newAlertsMap.delete(prod.id);
        }
      }

      return Array.from(newAlertsMap.values());
    });
  }, [triggerStockToast]);

  // Initial sync on mount
  useEffect(() => {
    syncAlertsForProducts(products);
  }, []);

  const dismissToast = (toastId: string) => {
    setLiveToasts(prev => prev.filter(t => t.id !== toastId));
  };

  const markAlertAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
  };

  const markAllAlertsAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, dismissed: true, read: true } : a));
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  // Quick 1-click Reorder from Stock Alert
  const quickReorderProduct = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const supp = suppliers.find(s => s.id === prod.supplierId) || suppliers[0];
    const orderQty = Math.max(1, prod.maxStock - prod.stock);
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + (supp?.leadTimeDays || 3));

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      code: `OC-${new Date().getFullYear()}-${String(purchaseOrders.length + 51).padStart(4, '0')}`,
      date: new Date().toISOString().split('T')[0],
      supplierId: supp.id,
      supplierName: supp.name,
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          quantity: orderQty,
          unitCost: prod.purchasePrice
        }
      ],
      totalCost: orderQty * prod.purchasePrice,
      status: 'PENDIENTE',
      expectedDate: expectedDate.toISOString().split('T')[0],
      notes: `Reabastecimiento automático disparado por Alerta de Stock Mínimo (Existencia: ${prod.stock} / Mín: ${prod.minStock})`
    };

    setPurchaseOrders(prev => [newPO, ...prev]);

    // Mark the alert as read
    markAlertAsRead(`alert-${prod.id}`);

    // Trigger confirmation toast
    triggerStockToast({
      title: 'Orden de Compra Generada',
      message: `Se ha emitido ${newPO.code} para reponer ${orderQty} ${prod.unit} con ${supp.name}.`,
      severity: 'warning',
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      currentStock: prod.stock,
      minStock: prod.minStock,
      suggestedReorder: orderQty
    });
  };

  // Active alerts are items currently in products that are <= minStock and not dismissed
  const activeAlerts = useMemo(() => {
    const productMap = new Map(products.map(p => [p.id, p]));
    return alerts.filter(a => {
      const prod = productMap.get(a.productId);
      return prod && prod.stock <= prod.minStock && !a.dismissed;
    });
  }, [alerts, products]);

  const unreadAlertsCount = useMemo(() => {
    return activeAlerts.filter(a => !a.read).length;
  }, [activeAlerts]);

  // Update Category Threshold rule
  const updateCategoryThreshold = (
    category: Product['category'],
    minStock: number,
    maxStock: number,
    autoApplyToNew: boolean = true,
    notes?: string
  ) => {
    setCategoryThresholds(prev => prev.map(t => {
      if (t.category === category) {
        return {
          ...t,
          defaultMinStock: Math.max(1, minStock),
          defaultMaxStock: Math.max(minStock + 1, maxStock),
          autoApplyToNew,
          notes: notes ?? t.notes
        };
      }
      return t;
    }));
  };

  // Batch apply category thresholds to existing products and trigger instant alert re-sync
  const applyCategoryThresholdsToAllProducts = (targetCategory?: Product['category']) => {
    let affectedCount = 0;
    const thresholdMap = new Map(categoryThresholds.map(t => [t.category, t]));

    const updated = products.map(prod => {
      if (!targetCategory || prod.category === targetCategory) {
        const rule = thresholdMap.get(prod.category);
        if (rule) {
          affectedCount++;
          return {
            ...prod,
            minStock: rule.defaultMinStock,
            maxStock: rule.defaultMaxStock
          };
        }
      }
      return prod;
    });

    setProducts(updated);
    syncAlertsForProducts(updated, products);

    const newAlertsCount = updated.filter(p => p.stock <= p.minStock).length;
    return { affectedCount, newAlertsCount };
  };

  const resetCategoryThresholds = () => {
    setCategoryThresholds(INITIAL_CATEGORY_THRESHOLDS);
  };

  const addProduct = (newProdData: Omit<Product, 'id' | 'lastRestocked'>) => {
    const id = `prod-${Date.now()}`;
    const categoryRule = categoryThresholds.find(t => t.category === newProdData.category);

    const minStockToUse = (newProdData.minStock && newProdData.minStock > 0)
      ? newProdData.minStock
      : (categoryRule?.autoApplyToNew ? categoryRule.defaultMinStock : 5);

    const maxStockToUse = (newProdData.maxStock && newProdData.maxStock > 0)
      ? newProdData.maxStock
      : (categoryRule?.autoApplyToNew ? categoryRule.defaultMaxStock : 50);

    const newProduct: Product = {
      ...newProdData,
      minStock: minStockToUse,
      maxStock: maxStockToUse,
      id,
      lastRestocked: new Date().toISOString().split('T')[0]
    };

    setProducts(prev => {
      const updated = [newProduct, ...prev];
      syncAlertsForProducts(updated, prev);
      return updated;
    });

    // If initial stock > 0, log an initial IN movement
    if (newProduct.stock > 0) {
      const initialMovement: StockMovement = {
        id: `mov-${Date.now()}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'IN',
        concept: 'Stock inicial por alta de producto',
        productId: newProduct.id,
        productName: newProduct.name,
        sku: newProduct.sku,
        quantity: newProduct.stock,
        unitCost: newProduct.purchasePrice,
        totalValue: newProduct.stock * newProduct.purchasePrice,
        previousStock: 0,
        newStock: newProduct.stock,
        referenceDoc: 'ALTA-INICIAL',
        operator: 'Elena R. Vargas'
      };
      setMovements(prev => [initialMovement, ...prev]);
    }
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updatedFields } : p);
      syncAlertsForProducts(updated, prev);
      return updated;
    });
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== id);
      setAlerts(al => al.filter(a => a.productId !== id));
      return updated;
    });
  };

  const adjustStock = (productId: string, newStock: number, reason: string, docRef?: string) => {
    const target = products.find(p => p.id === productId);
    if (!target) return;

    const diff = newStock - target.stock;
    const isIncrease = diff >= 0;

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'ADJUST',
      concept: `Ajuste manual: ${reason}`,
      productId: target.id,
      productName: target.name,
      sku: target.sku,
      quantity: diff,
      unitCost: target.purchasePrice,
      totalValue: Math.abs(diff) * target.purchasePrice * (isIncrease ? 1 : -1),
      previousStock: target.stock,
      newStock: newStock,
      referenceDoc: docRef || `AJUSTE-${Date.now().toString().slice(-4)}`,
      operator: 'Elena R. Vargas'
    };

    setProducts(prev => {
      const updated = prev.map(p => p.id === productId ? { ...p, stock: newStock } : p);
      syncAlertsForProducts(updated, prev);
      return updated;
    });

    setMovements(prev => [movement, ...prev]);
  };

  const registerMovement = (data: {
    type: 'IN' | 'OUT' | 'ADJUST' | 'TRANSFER';
    concept: string;
    productId: string;
    quantity: number;
    unitCost?: number;
    referenceDoc: string;
    notes?: string;
  }) => {
    const target = products.find(p => p.id === data.productId);
    if (!target) return;

    let newStock = target.stock;
    if (data.type === 'IN') {
      newStock += data.quantity;
    } else if (data.type === 'OUT') {
      newStock = Math.max(0, target.stock - data.quantity);
    } else if (data.type === 'ADJUST') {
      newStock = Math.max(0, target.stock + data.quantity);
    }

    const cost = data.unitCost ?? target.purchasePrice;
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: data.type,
      concept: data.concept,
      productId: target.id,
      productName: target.name,
      sku: target.sku,
      quantity: data.quantity,
      unitCost: cost,
      totalValue: data.quantity * cost,
      previousStock: target.stock,
      newStock: newStock,
      referenceDoc: data.referenceDoc,
      operator: 'Elena R. Vargas',
      notes: data.notes
    };

    setProducts(prev => {
      const updated = prev.map(p => p.id === data.productId ? { ...p, stock: newStock } : p);
      syncAlertsForProducts(updated, prev);
      return updated;
    });

    setMovements(prev => [movement, ...prev]);
  };

  const createDispatch = (order: {
    clientName: string;
    clientDoc: string;
    destination: string;
    paymentType: string;
    items: { productId: string; quantity: number }[];
  }): DispatchReceipt | null => {
    // Validate items and stock
    const dispatchItems: DispatchReceipt['items'] = [];
    let subtotal = 0;

    for (const item of order.items) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod || prod.stock < item.quantity) {
        return null;
      }
      const itemSubtotal = prod.salePrice * item.quantity;
      subtotal += itemSubtotal;
      dispatchItems.push({
        productId: prod.id,
        sku: prod.sku,
        name: prod.name,
        quantity: item.quantity,
        unitPrice: prod.salePrice,
        subtotal: itemSubtotal,
        stockAvailable: prod.stock
      });
    }

    const tax = subtotal * 0.18; // 18% standard IGV/IVA
    const total = subtotal + tax;
    const dispatchCode = `DSP-${new Date().getFullYear()}-${String(dispatches.length + 101).padStart(4, '0')}`;

    const receipt: DispatchReceipt = {
      id: `disp-${Date.now()}`,
      code: dispatchCode,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      clientName: order.clientName,
      clientDoc: order.clientDoc,
      destination: order.destination,
      items: dispatchItems,
      subtotal,
      tax,
      total,
      paymentType: order.paymentType,
      operator: 'Elena R. Vargas',
      status: 'Entregado'
    };

    // Deduct stock and register movements for each item
    const newMovements: StockMovement[] = [];
    setProducts(prev => {
      const updated = [...prev];
      for (const item of dispatchItems) {
        const idx = updated.findIndex(p => p.id === item.productId);
        if (idx !== -1) {
          const oldStock = updated[idx].stock;
          const afterStock = oldStock - item.quantity;
          updated[idx] = { ...updated[idx], stock: afterStock };

          newMovements.push({
            id: `mov-${Date.now()}-${item.productId}`,
            date: receipt.date,
            type: 'OUT',
            concept: `Despacho / Venta ${receipt.code} - ${order.clientName}`,
            productId: item.productId,
            productName: item.name,
            sku: item.sku,
            quantity: item.quantity,
            unitCost: updated[idx].purchasePrice,
            totalValue: item.quantity * updated[idx].purchasePrice,
            previousStock: oldStock,
            newStock: afterStock,
            referenceDoc: receipt.code,
            operator: 'Elena R. Vargas'
          });
        }
      }
      syncAlertsForProducts(updated, prev);
      return updated;
    });

    setMovements(prev => [...newMovements, ...prev]);
    setDispatches(prev => [receipt, ...prev]);
    return receipt;
  };

  const createPurchaseOrder = (order: {
    supplierId: string;
    items: { productId: string; quantity: number; unitCost: number }[];
    expectedDate: string;
    notes?: string;
  }) => {
    const supp = suppliers.find(s => s.id === order.supplierId);
    if (!supp) return;

    let total = 0;
    const poItems = order.items.map(item => {
      const prod = products.find(p => p.id === item.productId);
      const sub = item.quantity * item.unitCost;
      total += sub;
      return {
        productId: item.productId,
        productName: prod?.name || 'Producto',
        sku: prod?.sku || 'SKU',
        quantity: item.quantity,
        unitCost: item.unitCost
      };
    });

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      code: `OC-${new Date().getFullYear()}-${String(purchaseOrders.length + 51).padStart(4, '0')}`,
      date: new Date().toISOString().split('T')[0],
      supplierId: supp.id,
      supplierName: supp.name,
      items: poItems,
      totalCost: total,
      status: 'PENDIENTE',
      expectedDate: order.expectedDate,
      notes: order.notes
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
  };

  const receivePurchaseOrder = (orderId: string) => {
    const po = purchaseOrders.find(p => p.id === orderId);
    if (!po || po.status === 'RECIBIDO') return;

    // Add stock and log movements
    const newMovements: StockMovement[] = [];
    setProducts(prev => {
      const updated = [...prev];
      for (const item of po.items) {
        const idx = updated.findIndex(p => p.id === item.productId);
        if (idx !== -1) {
          const oldStock = updated[idx].stock;
          const afterStock = oldStock + item.quantity;
          updated[idx] = { 
            ...updated[idx], 
            stock: afterStock,
            lastRestocked: new Date().toISOString().split('T')[0],
            purchasePrice: item.unitCost
          };

          newMovements.push({
            id: `mov-${Date.now()}-${item.productId}`,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            type: 'IN',
            concept: `Ingreso por Orden de Compra ${po.code}`,
            productId: item.productId,
            productName: item.productName,
            sku: item.sku,
            quantity: item.quantity,
            unitCost: item.unitCost,
            totalValue: item.quantity * item.unitCost,
            previousStock: oldStock,
            newStock: afterStock,
            referenceDoc: po.code,
            operator: 'Elena R. Vargas',
            notes: `Proveedor: ${po.supplierName}`
          });
        }
      }
      syncAlertsForProducts(updated, prev);
      return updated;
    });

    setMovements(prev => [...newMovements, ...prev]);
    setPurchaseOrders(prev => prev.map(p => p.id === orderId ? { ...p, status: 'RECIBIDO' } : p));
  };

  const addSupplier = (suppData: Omit<Supplier, 'id' | 'activeOrders'>) => {
    const newSupplier: Supplier = {
      ...suppData,
      id: `sup-${Date.now()}`,
      activeOrders: 0
    };
    setSuppliers(prev => [...prev, newSupplier]);
  };

  const resetToDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setMovements(INITIAL_MOVEMENTS);
    setSuppliers(INITIAL_SUPPLIERS);
    setZones(INITIAL_ZONES);
    setDispatches(INITIAL_DISPATCHES);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setCategoryThresholds(INITIAL_CATEGORY_THRESHOLDS);
    setCurrencySymbol('$');
    localStorage.clear();
    syncAlertsForProducts(INITIAL_PRODUCTS);
  };

  return (
    <WarehouseContext.Provider value={{
      products,
      movements,
      suppliers,
      zones,
      dispatches,
      purchaseOrders,
      currencySymbol,
      setCurrencySymbol,
      activeWarehouse,
      setActiveWarehouse,
      alerts,
      activeAlerts,
      unreadAlertsCount,
      liveToasts,
      soundEnabled,
      toggleSound,
      markAlertAsRead,
      markAllAlertsAsRead,
      dismissAlert,
      dismissToast,
      quickReorderProduct,
      categoryThresholds,
      updateCategoryThreshold,
      applyCategoryThresholdsToAllProducts,
      resetCategoryThresholds,
      addProduct,
      updateProduct,
      deleteProduct,
      adjustStock,
      registerMovement,
      createDispatch,
      createPurchaseOrder,
      receivePurchaseOrder,
      addSupplier,
      resetToDemoData
    }}>
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
};
