import { Product, StockMovement, Supplier, WarehouseZone, DispatchReceipt, PurchaseOrder } from '../types/warehouse';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    sku: 'MOT-IND-042',
    barcode: '7751234001018',
    name: 'Motor Eléctrico Trifásico 5.5 HP 1750 RPM',
    description: 'Motor de inducción con carcasa de hierro fundido, protección IP55 para trabajo pesado continuo en plantas industriales.',
    category: 'Herramientas & Maquinaria',
    unit: 'UND',
    stock: 14,
    minStock: 5,
    maxStock: 30,
    purchasePrice: 380.00,
    salePrice: 590.00,
    location: { zone: 'B', aisle: 'B-02', rack: 'R-04', level: 'N-01', bin: 'B1' },
    supplierId: 'sup-01',
    supplierName: 'ElectroMecánica Continental S.A.C.',
    lastRestocked: '2026-10-12',
    weightKg: 28.5
  },
  {
    id: 'prod-02',
    sku: 'ROD-SKF-6205',
    barcode: '7751234001025',
    name: 'Rodamiento Rígido de Bolas 6205-2RSH',
    description: 'Rodamiento de precisión con sellos de caucho nitrilo en ambos lados, lubricado de por vida con grasa térmica.',
    category: 'Repuestos Mecánicos',
    unit: 'UND',
    stock: 84,
    minStock: 25,
    maxStock: 200,
    purchasePrice: 12.50,
    salePrice: 22.80,
    location: { zone: 'B', aisle: 'B-01', rack: 'R-02', level: 'N-03', bin: 'A4' },
    supplierId: 'sup-02',
    supplierName: 'Distribuidora Industrial Rodatec',
    lastRestocked: '2026-10-15',
    weightKg: 0.13
  },
  {
    id: 'prod-03',
    sku: 'SEG-CAS-VGY',
    barcode: '7751234001032',
    name: 'Casco de Seguridad Industrial Tipo 1 Clase E',
    description: 'Casco dieléctrico de polietileno de alta densidad con arnés de 4 puntos y suspensión ratchet ajustable.',
    category: 'Seguridad Industrial',
    unit: 'UND',
    stock: 4,
    minStock: 15,
    maxStock: 80,
    purchasePrice: 14.20,
    salePrice: 26.50,
    location: { zone: 'A', aisle: 'A-01', rack: 'R-01', level: 'N-02', bin: 'C2' },
    supplierId: 'sup-03',
    supplierName: 'Equipos & Protección 360',
    lastRestocked: '2026-09-28',
    weightKg: 0.42
  },
  {
    id: 'prod-04',
    sku: 'LOG-CAJ-M40',
    barcode: '7751234001049',
    name: 'Caja Cartón Corrugado Doble Onda 40x30x30 cm',
    description: 'Cajas de embalaje reforzadas aptas para apilamiento vertical y envíos de paquetería de media resistencia.',
    category: 'Embalaje & Logística',
    unit: 'PACK',
    stock: 120,
    minStock: 30,
    maxStock: 300,
    purchasePrice: 18.00,
    salePrice: 32.00,
    location: { zone: 'D', aisle: 'D-01', rack: 'R-01', level: 'N-01', bin: 'P1' },
    supplierId: 'sup-04',
    supplierName: 'Cartones del Pacífico',
    lastRestocked: '2026-10-18',
    weightKg: 5.2
  },
  {
    id: 'prod-05',
    sku: 'ELE-INT-TER',
    barcode: '7751234001056',
    name: 'Interruptor Termomagnético 3x63A Curva C',
    description: 'Disyuntor modular para riel DIN, capacidad de corte 10kA a 400V, certificado IEC 60947-2.',
    category: 'Electricidad & Iluminación',
    unit: 'UND',
    stock: 0,
    minStock: 10,
    maxStock: 50,
    purchasePrice: 45.00,
    salePrice: 79.90,
    location: { zone: 'B', aisle: 'B-03', rack: 'R-05', level: 'N-02', bin: 'B2' },
    supplierId: 'sup-01',
    supplierName: 'ElectroMecánica Continental S.A.C.',
    lastRestocked: '2026-09-10',
    weightKg: 0.38
  },
  {
    id: 'prod-06',
    sku: 'FER-DIS-COR',
    barcode: '7751234001063',
    name: 'Disco de Corte Fino para Acero Inox 4-1/2" x 1.0 mm',
    description: 'Disco abrasivo de óxido de aluminio sin hierro, sulfuro ni cloro. Máxima velocidad periférica 80 m/s.',
    category: 'Ferretería & Construcción',
    unit: 'CAJA',
    stock: 35,
    minStock: 10,
    maxStock: 80,
    purchasePrice: 28.50,
    salePrice: 48.00,
    location: { zone: 'A', aisle: 'A-02', rack: 'R-03', level: 'N-04', bin: 'D1' },
    supplierId: 'sup-05',
    supplierName: 'Abrasivos & Soldaduras Industriales',
    lastRestocked: '2026-10-05',
    weightKg: 1.8
  },
  {
    id: 'prod-07',
    sku: 'LOG-FIL-STR',
    barcode: '7751234001070',
    name: 'Film Stretch Manual Calibre 20 micras x 500m',
    description: 'Rollo de film estirable transparente para paletizado y aseguramiento de cargas de bodega.',
    category: 'Embalaje & Logística',
    unit: 'ROLLO',
    stock: 68,
    minStock: 20,
    maxStock: 150,
    purchasePrice: 9.80,
    salePrice: 17.50,
    location: { zone: 'D', aisle: 'D-02', rack: 'R-02', level: 'N-01', bin: 'P2' },
    supplierId: 'sup-04',
    supplierName: 'Cartones del Pacífico',
    lastRestocked: '2026-10-16',
    weightKg: 2.1
  },
  {
    id: 'prod-08',
    sku: 'SEG-GUA-NIT',
    barcode: '7751234001087',
    name: 'Guantes de Nitrilo Verde Antisolventes Talla 9 (L)',
    description: 'Guantes de protección química con interior floculado de algodón y acabado en relieve diamantado.',
    category: 'Seguridad Industrial',
    unit: 'PAR',
    stock: 9,
    minStock: 25,
    maxStock: 120,
    purchasePrice: 3.20,
    salePrice: 6.80,
    location: { zone: 'A', aisle: 'A-01', rack: 'R-02', level: 'N-02', bin: 'A1' },
    supplierId: 'sup-03',
    supplierName: 'Equipos & Protección 360',
    lastRestocked: '2026-09-20',
    weightKg: 0.08
  },
  {
    id: 'prod-09',
    sku: 'ELE-REF-LED',
    barcode: '7751234001094',
    name: 'Reflector LED Industrial 150W 6500K IP66 18000Lm',
    description: 'Luminaria de alta eficiencia lumínica con cuerpo de aluminio inyectado y driver anti-sobretensiones.',
    category: 'Electricidad & Iluminación',
    unit: 'UND',
    stock: 22,
    minStock: 8,
    maxStock: 60,
    purchasePrice: 55.00,
    salePrice: 98.00,
    location: { zone: 'C', aisle: 'C-01', rack: 'R-01', level: 'N-02', bin: 'L1' },
    supplierId: 'sup-01',
    supplierName: 'ElectroMecánica Continental S.A.C.',
    lastRestocked: '2026-10-09',
    weightKg: 3.1
  },
  {
    id: 'prod-10',
    sku: 'REP-FAJ-B52',
    barcode: '7751234001100',
    name: 'Correa Trapezoidal Clásica Perfil B Sección 52"',
    description: 'Faja industrial con núcleo de cuerdas de poliéster de alta tenacidad y cubierta textil impregnada con neopreno.',
    category: 'Repuestos Mecánicos',
    unit: 'UND',
    stock: 45,
    minStock: 15,
    maxStock: 90,
    purchasePrice: 8.70,
    salePrice: 16.20,
    location: { zone: 'B', aisle: 'B-02', rack: 'R-03', level: 'N-03', bin: 'F2' },
    supplierId: 'sup-02',
    supplierName: 'Distribuidora Industrial Rodatec',
    lastRestocked: '2026-10-14',
    weightKg: 0.25
  }
];

export const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-101',
    date: '2026-10-20 08:45',
    type: 'OUT',
    concept: 'Venta / Despacho a Obra Minera',
    productId: 'prod-01',
    productName: 'Motor Eléctrico Trifásico 5.5 HP 1750 RPM',
    sku: 'MOT-IND-042',
    quantity: 2,
    unitCost: 380.00,
    totalValue: 760.00,
    previousStock: 16,
    newStock: 14,
    referenceDoc: 'VAL-2026-0891',
    operator: 'Carlos M. Mendoza (Operador 01)',
    notes: 'Despacho verificado para contratista Consorcio Mantaro'
  },
  {
    id: 'mov-102',
    date: '2026-10-19 16:30',
    type: 'IN',
    concept: 'Ingreso por Orden de Compra #OC-4421',
    productId: 'prod-04',
    productName: 'Caja Cartón Corrugado Doble Onda 40x30x30 cm',
    sku: 'LOG-CAJ-M40',
    quantity: 50,
    unitCost: 18.00,
    totalValue: 900.00,
    previousStock: 70,
    newStock: 120,
    referenceDoc: 'GR-2026-1184',
    operator: 'Carlos M. Mendoza (Operador 01)',
    notes: 'Recepción conforme en muelle de descarga 2'
  },
  {
    id: 'mov-103',
    date: '2026-10-19 14:15',
    type: 'OUT',
    concept: 'Despacho a Planta Procesadora',
    productId: 'prod-02',
    productName: 'Rodamiento Rígido de Bolas 6205-2RSH',
    sku: 'ROD-SKF-6205',
    quantity: 12,
    unitCost: 12.50,
    totalValue: 150.00,
    previousStock: 96,
    newStock: 84,
    referenceDoc: 'FAC-2026-0348',
    operator: 'Elena R. Vargas (Jefa de Almacén)',
    notes: 'Urgencia de mantenimiento línea 3'
  },
  {
    id: 'mov-104',
    date: '2026-10-18 11:20',
    type: 'ADJUST',
    concept: 'Ajuste de inventario físico cíclico',
    productId: 'prod-05',
    productName: 'Interruptor Termomagnético 3x63A Curva C',
    sku: 'ELE-INT-TER',
    quantity: -2,
    unitCost: 45.00,
    totalValue: -90.00,
    previousStock: 2,
    newStock: 0,
    referenceDoc: 'AUD-2026-Q4-01',
    operator: 'Elena R. Vargas (Jefa de Almacén)',
    notes: 'Merma por daño en borne durante traslado interno'
  },
  {
    id: 'mov-105',
    date: '2026-10-17 09:10',
    type: 'TRANSFER',
    concept: 'Reubicación de Pasillo A-01 a D-02',
    productId: 'prod-07',
    productName: 'Film Stretch Manual Calibre 20 micras x 500m',
    sku: 'LOG-FIL-STR',
    quantity: 30,
    unitCost: 9.80,
    totalValue: 294.00,
    previousStock: 68,
    newStock: 68,
    referenceDoc: 'TRF-00912',
    operator: 'Carlos M. Mendoza (Operador 01)',
    notes: 'Optimización de flujo en zona de embalaje'
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-01',
    name: 'ElectroMecánica Continental S.A.C.',
    taxId: '20489102941',
    contactPerson: 'Ing. Rodrigo Salinas',
    email: 'ventas@electromecanicacontinental.com',
    phone: '+51 984 210 941',
    address: 'Av. Argentina 2840, Zona Industrial',
    category: 'Motores, Cuadros y Conectividad',
    leadTimeDays: 4,
    activeOrders: 2
  },
  {
    id: 'sup-02',
    name: 'Distribuidora Industrial Rodatec',
    taxId: '20512847291',
    contactPerson: 'Mariana Gomez P.',
    email: 'mgomez@rodatec-industrial.com',
    phone: '+51 991 384 102',
    address: 'Calle Los Calderos 190, Urb. El Artesano',
    category: 'Rodamientos, Fajas y Transmisión',
    leadTimeDays: 2,
    activeOrders: 1
  },
  {
    id: 'sup-03',
    name: 'Equipos & Protección 360',
    taxId: '20601928301',
    contactPerson: 'Javier Castillo',
    email: 'pedidos@proteccion360.com',
    phone: '+51 977 401 229',
    address: 'Av. Colonial 1450, Módulo C',
    category: 'EPPs, Cascos, Calzado y Guantes',
    leadTimeDays: 3,
    activeOrders: 1
  },
  {
    id: 'sup-04',
    name: 'Cartones del Pacífico',
    taxId: '20194820194',
    contactPerson: 'Carla Morales',
    email: 'atencion@cartonesdelpacifico.pe',
    phone: '+51 988 512 004',
    address: 'Carretera Central Km 14.5',
    category: 'Cajas, Films y Flejes de Embalaje',
    leadTimeDays: 2,
    activeOrders: 0
  },
  {
    id: 'sup-05',
    name: 'Abrasivos & Soldaduras Industriales',
    taxId: '20384910291',
    contactPerson: 'Hernán Quiroz',
    email: 'hquiroz@abrasivos-peru.com',
    phone: '+51 954 112 890',
    address: 'Av. Maquinarias 812',
    category: 'Discos, Electrodos y Consumibles',
    leadTimeDays: 1,
    activeOrders: 0
  }
];

export const INITIAL_ZONES: WarehouseZone[] = [
  {
    code: 'A',
    name: 'Zona A - Ferretería y Seguridad',
    description: 'Almacenamiento de equipos de protección personal, abrasivos y consumibles menudos en estanterías medias.',
    capacityUnits: 450,
    currentUnits: 312,
    tempControlled: false,
    color: '#0284c7',
    aisles: [
      { code: 'A-01', name: 'Pasillo EPPs & Cascos', racksCount: 4, totalSlots: 80, occupiedSlots: 54, zone: 'A' },
      { code: 'A-02', name: 'Pasillo Discos & Soldaduras', racksCount: 4, totalSlots: 80, occupiedSlots: 62, zone: 'A' },
      { code: 'A-03', name: 'Pasillo Herrajes & Tornillería', racksCount: 4, totalSlots: 80, occupiedSlots: 45, zone: 'A' }
    ]
  },
  {
    code: 'B',
    name: 'Zona B - Racks de Carga Pesada & Motores',
    description: 'Estructuras reforzadas tipo pallet rack para motores trifásicos, rodamientos, reductores y maquinaria pesada.',
    capacityUnits: 600,
    currentUnits: 490,
    tempControlled: false,
    color: '#4f46e5',
    aisles: [
      { code: 'B-01', name: 'Pasillo Transmisión & Rodajes', racksCount: 6, totalSlots: 120, occupiedSlots: 104, zone: 'B' },
      { code: 'B-02', name: 'Pasillo Motores & Bombas', racksCount: 6, totalSlots: 120, occupiedSlots: 98, zone: 'B' },
      { code: 'B-03', name: 'Pasillo Tableros & Disyuntores', racksCount: 6, totalSlots: 120, occupiedSlots: 86, zone: 'B' }
    ]
  },
  {
    code: 'C',
    name: 'Zona C - Almacén Técnico & Iluminación',
    description: 'Área climatizada para luminarias LED, sensores de automatización, instrumentación y electrónica delicada.',
    capacityUnits: 300,
    currentUnits: 145,
    tempControlled: true,
    color: '#059669',
    aisles: [
      { code: 'C-01', name: 'Pasillo Reflectores & Paneles', racksCount: 3, totalSlots: 60, occupiedSlots: 32, zone: 'C' },
      { code: 'C-02', name: 'Pasillo Sensores & PLCs', racksCount: 3, totalSlots: 60, occupiedSlots: 24, zone: 'C' }
    ]
  },
  {
    code: 'D',
    name: 'Zona D - Embalaje, Consolidación & Despacho',
    description: 'Área de alta rotación para cajas corrugadas, pallets terminados, rollos de film stretch y muelles de carga.',
    capacityUnits: 500,
    currentUnits: 388,
    tempControlled: false,
    color: '#d97706',
    aisles: [
      { code: 'D-01', name: 'Pasillo Cajas & Paquetería', racksCount: 4, totalSlots: 80, occupiedSlots: 71, zone: 'D' },
      { code: 'D-02', name: 'Pasillo Paletizado & Stretch', racksCount: 4, totalSlots: 80, occupiedSlots: 64, zone: 'D' }
    ]
  }
];

export const INITIAL_DISPATCHES: DispatchReceipt[] = [
  {
    id: 'disp-201',
    code: 'DSP-2026-0081',
    date: '2026-10-20 09:12',
    clientName: 'Constructora & Proyectos Andinos S.A.',
    clientDoc: '20554910283',
    destination: 'Obra Central Hidroeléctrica San Ramón',
    items: [
      { productId: 'prod-01', sku: 'MOT-IND-042', name: 'Motor Eléctrico Trifásico 5.5 HP 1750 RPM', quantity: 2, unitPrice: 590.00, subtotal: 1180.00, stockAvailable: 14 },
      { productId: 'prod-06', sku: 'FER-DIS-COR', name: 'Disco de Corte Fino para Acero Inox 4-1/2"', quantity: 4, unitPrice: 48.00, subtotal: 192.00, stockAvailable: 35 }
    ],
    subtotal: 1372.00,
    tax: 246.96,
    total: 1618.96,
    paymentType: 'Transferencia BANCARIA (30 días)',
    operator: 'Elena R. Vargas',
    status: 'Entregado'
  },
  {
    id: 'disp-202',
    code: 'DSP-2026-0080',
    date: '2026-10-19 15:40',
    clientName: 'Mantenimiento Mecánico Industrial Solari',
    clientDoc: '10482019482',
    destination: 'Taller de Rectificaciones Sur',
    items: [
      { productId: 'prod-02', sku: 'ROD-SKF-6205', name: 'Rodamiento Rígido de Bolas 6205-2RSH', quantity: 8, unitPrice: 22.80, subtotal: 182.40, stockAvailable: 84 },
      { productId: 'prod-10', sku: 'REP-FAJ-B52', name: 'Correa Trapezoidal Clásica Perfil B 52"', quantity: 3, unitPrice: 16.20, subtotal: 48.60, stockAvailable: 45 }
    ],
    subtotal: 231.00,
    tax: 41.58,
    total: 272.58,
    paymentType: 'Efectivo contra entrega',
    operator: 'Carlos M. Mendoza',
    status: 'Entregado'
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-301',
    code: 'OC-2026-0044',
    date: '2026-10-18',
    supplierId: 'sup-01',
    supplierName: 'ElectroMecánica Continental S.A.C.',
    items: [
      { productId: 'prod-05', productName: 'Interruptor Termomagnético 3x63A Curva C', sku: 'ELE-INT-TER', quantity: 20, unitCost: 45.00 },
      { productId: 'prod-09', productName: 'Reflector LED Industrial 150W 6500K', sku: 'ELE-REF-LED', quantity: 15, unitCost: 55.00 }
    ],
    totalCost: 1725.00,
    status: 'PENDIENTE',
    expectedDate: '2026-10-23',
    notes: 'Requerimiento prioritario para reposición de stock crítico de disyuntores'
  },
  {
    id: 'po-302',
    code: 'OC-2026-0043',
    date: '2026-10-15',
    supplierId: 'sup-03',
    supplierName: 'Equipos & Protección 360',
    items: [
      { productId: 'prod-03', productName: 'Casco de Seguridad Industrial Tipo 1', sku: 'SEG-CAS-VGY', quantity: 30, unitCost: 14.20 },
      { productId: 'prod-08', productName: 'Guantes de Nitrilo Verde Antisolventes', sku: 'SEG-GUA-NIT', quantity: 50, unitCost: 3.20 }
    ],
    totalCost: 586.00,
    status: 'PENDIENTE',
    expectedDate: '2026-10-21',
    notes: 'Solicitud con certificación ANSI Z89.1'
  }
];

export const INITIAL_CATEGORY_THRESHOLDS = [
  {
    category: 'Herramientas & Maquinaria' as const,
    defaultMinStock: 5,
    defaultMaxStock: 30,
    safetyBufferDays: 7,
    autoApplyToNew: true,
    notes: 'Equipos pesados de alto costo unitario y rotación moderada.'
  },
  {
    category: 'Repuestos Mecánicos' as const,
    defaultMinStock: 25,
    defaultMaxStock: 200,
    safetyBufferDays: 5,
    autoApplyToNew: true,
    notes: 'Rodamientos, fajas y retenes esenciales para mantenimiento continuo.'
  },
  {
    category: 'Seguridad Industrial' as const,
    defaultMinStock: 15,
    defaultMaxStock: 100,
    safetyBufferDays: 3,
    autoApplyToNew: true,
    notes: 'EPPs críticos para cumplimiento de normativas de seguridad laboral.'
  },
  {
    category: 'Embalaje & Logística' as const,
    defaultMinStock: 30,
    defaultMaxStock: 250,
    safetyBufferDays: 2,
    autoApplyToNew: true,
    notes: 'Cajas y consumibles de preparación con alta tasa de consumo diario.'
  },
  {
    category: 'Electricidad & Iluminación' as const,
    defaultMinStock: 10,
    defaultMaxStock: 60,
    safetyBufferDays: 4,
    autoApplyToNew: true,
    notes: 'Disyuntores y proyectores LED técnicos de recambio programado.'
  },
  {
    category: 'Ferretería & Construcción' as const,
    defaultMinStock: 15,
    defaultMaxStock: 90,
    safetyBufferDays: 3,
    autoApplyToNew: true,
    notes: 'Abrasivos, discos de corte y elementos de fijación metálica.'
  }
];
