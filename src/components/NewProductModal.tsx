import React, { useState } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { Product } from '../types/warehouse';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({ isOpen, onClose }) => {
  const { addProduct, suppliers, currencySymbol, categoryThresholds } = useWarehouse();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Product['category']>('Herramientas & Maquinaria');
  const [unit, setUnit] = useState<Product['unit']>('UND');
  const [stock, setStock] = useState<number>(10);

  // Initialize threshold values based on category settings
  const initialCategoryThreshold = categoryThresholds.find(t => t.category === 'Herramientas & Maquinaria');
  const [minStock, setMinStock] = useState<number>(initialCategoryThreshold?.defaultMinStock ?? 5);
  const [maxStock, setMaxStock] = useState<number>(initialCategoryThreshold?.defaultMaxStock ?? 50);

  const [purchasePrice, setPurchasePrice] = useState<number>(25.00);
  const [salePrice, setSalePrice] = useState<number>(45.00);
  const [zone, setZone] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [aisle, setAisle] = useState('A-01');
  const [rack, setRack] = useState('R-01');
  const [level, setLevel] = useState('N-01');
  const [bin, setBin] = useState('B1');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');

  const handleCategoryChange = (newCat: Product['category']) => {
    setCategory(newCat);
    const matched = categoryThresholds.find(t => t.category === newCat);
    if (matched && matched.autoApplyToNew) {
      setMinStock(matched.defaultMinStock);
      setMaxStock(matched.defaultMaxStock);
    }
  };

  if (!isOpen) return null;

  // Auto-generate realistic SKU and Barcode
  const handleAutoGenerateCodes = () => {
    const prefixes: Record<string, string> = {
      'Herramientas & Maquinaria': 'MAQ',
      'Repuestos Mecánicos': 'REP',
      'Seguridad Industrial': 'SEG',
      'Embalaje & Logística': 'LOG',
      'Electricidad & Iluminación': 'ELE',
      'Ferretería & Construcción': 'FER'
    };
    const prefix = prefixes[category] || 'GEN';
    const randomCode = Math.floor(100 + Math.random() * 900);
    const newSku = `${prefix}-MOD-${randomCode}`;
    const newBarcode = `775${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    setSku(newSku);
    setBarcode(newBarcode);
  };

  const margin = purchasePrice > 0 ? (((salePrice - purchasePrice) / purchasePrice) * 100).toFixed(1) : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Ingrese el nombre del producto.');
      return;
    }

    const assignedSupplier = suppliers.find(s => s.id === supplierId);

    addProduct({
      name: name.trim(),
      sku: sku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      barcode: barcode.trim() || `775${Date.now().toString().slice(-10)}`,
      description: description.trim() || 'Sin descripción adicional.',
      category,
      unit,
      stock: Number(stock) || 0,
      minStock: Number(minStock) || 1,
      maxStock: Number(maxStock) || 50,
      purchasePrice: Number(purchasePrice) || 0,
      salePrice: Number(salePrice) || 0,
      location: {
        zone,
        aisle,
        rack,
        level,
        bin
      },
      supplierId: supplierId || 'sup-01',
      supplierName: assignedSupplier?.name || 'Proveedor General S.A.'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Alta de Nuevo Producto en Almacén</h3>
            <p className="text-xs text-slate-500">Registro en catálogo maestro con ubicación física y kárdex inicial</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Name & Category */}
          <div className="space-y-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Nombre / Denominación del Artículo:</label>
              <input
                type="text"
                required
                placeholder="Ej: Electrobomba Centrífuga 2 HP Monofásica"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-hidden focus:border-slate-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Categoría Técnica:</label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as Product['category'])}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-700 text-xs"
                >
                  <option value="Herramientas & Maquinaria">Herramientas & Maquinaria</option>
                  <option value="Repuestos Mecánicos">Repuestos Mecánicos</option>
                  <option value="Seguridad Industrial">Seguridad Industrial</option>
                  <option value="Embalaje & Logística">Embalaje & Logística</option>
                  <option value="Electricidad & Iluminación">Electricidad & Iluminación</option>
                  <option value="Ferretería & Construcción">Ferretería & Construcción</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Unidad de Medida:</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as Product['unit'])}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-700 text-xs"
                >
                  <option value="UND">Unidad (UND)</option>
                  <option value="CAJA">Caja (CAJA)</option>
                  <option value="PACK">Paquete (PACK)</option>
                  <option value="KG">Kilogramos (KG)</option>
                  <option value="ROLLO">Rollo (ROLLO)</option>
                  <option value="PAR">Par (PAR)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SKU & Barcode with auto-generation */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Codificación & Trazabilidad</span>
              <button
                type="button"
                onClick={handleAutoGenerateCodes}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Generar SKU & Código</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Código SKU:</label>
                <input
                  type="text"
                  placeholder="MAQ-MOD-101"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-2.5 py-1.5 font-mono text-xs border border-slate-300 rounded bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Código de Barras (EAN-13):</label>
                <input
                  type="text"
                  placeholder="7751234001018"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full px-2.5 py-1.5 font-mono text-xs border border-slate-300 rounded bg-white"
                />
              </div>
            </div>
          </div>

          {/* Quantities & Limits */}
          <div className="space-y-1">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Stock Inicial:</label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 font-mono font-bold border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Stock Mínimo (Alerta):</label>
                <input
                  type="number"
                  min="1"
                  value={minStock}
                  onChange={(e) => setMinStock(parseInt(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Stock Máximo:</label>
                <input
                  type="number"
                  min="1"
                  value={maxStock}
                  onChange={(e) => setMaxStock(parseInt(e.target.value) || 50)}
                  className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              * Umbrales sugeridos automáticamente según la política de categoría configurada.
            </p>
          </div>

          {/* Pricing & Margin Calculation */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Precio Costo ({currencySymbol}):</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Precio Venta ({currencySymbol}):</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={salePrice}
                onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Margen Bruto:</label>
              <div className="px-2.5 py-1.5 font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded text-center">
                +{margin}%
              </div>
            </div>
          </div>

          {/* Physical Location */}
          <div className="space-y-1">
            <label className="block font-medium text-slate-700">Ubicación Física en Almacén:</label>
            <div className="grid grid-cols-5 gap-2">
              <div>
                <span className="text-[10px] text-slate-500">Zona</span>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value as 'A' | 'B' | 'C' | 'D')}
                  className="w-full px-1.5 py-1 border border-slate-300 rounded bg-white text-xs"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Pasillo</span>
                <input
                  type="text"
                  value={aisle}
                  onChange={(e) => setAisle(e.target.value)}
                  className="w-full px-1.5 py-1 font-mono text-xs border border-slate-300 rounded"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Rack</span>
                <input
                  type="text"
                  value={rack}
                  onChange={(e) => setRack(e.target.value)}
                  className="w-full px-1.5 py-1 font-mono text-xs border border-slate-300 rounded"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Nivel</span>
                <input
                  type="text"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-1.5 py-1 font-mono text-xs border border-slate-300 rounded"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Bin</span>
                <input
                  type="text"
                  value={bin}
                  onChange={(e) => setBin(e.target.value)}
                  className="w-full px-1.5 py-1 font-mono text-xs border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Proveedor Principal:</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-700 text-xs"
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.taxId})</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Descripción / Ficha Técnica Resumida:</label>
            <textarea
              rows={2}
              placeholder="Especificaciones clave, materiales, normas técnicas o precauciones de estiba..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 shadow-sm"
            >
              Guardar en Catálogo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
