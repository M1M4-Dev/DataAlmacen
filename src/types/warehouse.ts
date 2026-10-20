export type ProductStatus = 'optimal' | 'low_stock' | 'out_of_stock';

export interface LocationCoordinates {
  zone: 'A' | 'B' | 'C' | 'D';
  aisle: string;
  rack: string;
  level: string;
  bin: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  category: 'Ferretería & Construcción' | 'Electricidad & Iluminación' | 'Seguridad Industrial' | 'Embalaje & Logística' | 'Herramientas & Maquinaria' | 'Repuestos Mecánicos';
  unit: 'UND' | 'CAJA' | 'PACK' | 'KG' | 'ROLLO' | 'PAR';
  stock: number;
  minStock: number;
  maxStock: number;
  purchasePrice: number;
  salePrice: number;
  location: LocationCoordinates;
  supplierId: string;
  supplierName: string;
  lastRestocked: string;
  weightKg?: number;
}

export type MovementType = 'IN' | 'OUT' | 'ADJUST' | 'TRANSFER';

export interface StockMovement {
  id: string;
  date: string;
  type: MovementType;
  concept: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  totalValue: number;
  previousStock: number;
  newStock: number;
  referenceDoc: string;
  operator: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  taxId: string; // RUC o NIF
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  leadTimeDays: number;
  activeOrders: number;
}

export interface WarehouseAisle {
  code: string;
  name: string;
  racksCount: number;
  totalSlots: number;
  occupiedSlots: number;
  zone: 'A' | 'B' | 'C' | 'D';
}

export interface WarehouseZone {
  code: 'A' | 'B' | 'C' | 'D';
  name: string;
  description: string;
  capacityUnits: number;
  currentUnits: number;
  tempControlled: boolean;
  color: string;
  aisles: WarehouseAisle[];
}

export interface DispatchItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  stockAvailable: number;
}

export interface DispatchReceipt {
  id: string;
  code: string;
  date: string;
  clientName: string;
  clientDoc: string;
  destination: string;
  items: DispatchItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentType: string;
  operator: string;
  status: 'Entregado' | 'En Proceso' | 'Anulado';
}

export interface PurchaseOrder {
  id: string;
  code: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitCost: number;
  }[];
  totalCost: number;
  status: 'BORRADOR' | 'PENDIENTE' | 'RECIBIDO' | 'CANCELADO';
  expectedDate: string;
  notes?: string;
}

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  supplierId: string;
  supplierName: string;
  purchasePrice: number;
  severity: 'out_of_stock' | 'critical' | 'warning';
  timestamp: string;
  read: boolean;
  dismissed: boolean;
  message: string;
}

export interface LiveNotificationToast {
  id: string;
  title: string;
  message: string;
  severity: 'out_of_stock' | 'critical' | 'warning';
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  minStock: number;
  suggestedReorder: number;
  timestamp: string;
}

export interface CategoryThreshold {
  category: Product['category'];
  defaultMinStock: number;
  defaultMaxStock: number;
  safetyBufferDays: number;
  autoApplyToNew: boolean;
  notes?: string;
}
