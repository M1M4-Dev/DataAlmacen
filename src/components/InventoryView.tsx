import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  Filter, 
  Scan, 
  Edit3, 
  Trash2, 
  SlidersHorizontal, 
  Printer, 
  X, 
  Check, 
  AlertCircle,
  AlertTriangle,
  ShoppingCart,
  MapPin,
  Barcode
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { Product } from '../types/warehouse';

interface InventoryViewProps {
  onOpenNewProduct: () => void;
  onOpenNewMovement: () => void;
  onNavigateToSettings?: () => void;
  onOpenOcrScanner?: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onOpenNewProduct,
  onNavigateToSettings,
  onOpenOcrScanner
}) => {
  const { 
    products, 
    updateProduct, 
    deleteProduct, 
    adjustStock, 
    suppliers, 
    currencySymbol,
    quickReorderProduct,
    activeAlerts 
  } = useWarehouse();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');

  // Scanner Simulator Modal State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [scanResult, setScanResult] = useState<Product | null>(null);

  // Quick Adjust Modal State
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustedStockValue, setAdjustedStockValue] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Conteo físico cíclico');

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Label Print Modal State
  const [labelProduct, setLabelProduct] = useState<Product | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category));
    return Array.from(set);
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.includes(searchTerm) ||
        p.location.aisle.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

      const matchesStatus = 
        selectedStatus === 'all' ||
        (selectedStatus === 'optimal' && p.stock > p.minStock) ||
        (selectedStatus === 'low_stock' && p.stock > 0 && p.stock <= p.minStock) ||
        (selectedStatus === 'out_of_stock' && p.stock === 0);

      const matchesZone = selectedZone === 'all' || p.location.zone === selectedZone;

      return matchesSearch && matchesCategory && matchesStatus && matchesZone;
    });
  }, [products, searchTerm, selectedCategory, selectedStatus, selectedZone]);

  // Quick Barcode Scan Handler
  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = products.find(p => p.barcode === scannedCode.trim() || p.sku.toLowerCase() === scannedCode.trim().toLowerCase());
    if (found) {
      setScanResult(found);
    } else {
      setScanResult(null);
      alert(`No se encontró ningún producto con el código o SKU "${scannedCode}"`);
    }
  };

  // CSV Export Handler
  const exportToCSV = () => {
    const headers = ['SKU', 'Codigo_Barras', 'Nombre', 'Categoria', 'Unidad', 'Stock_Actual', 'Stock_Minimo', 'Precio_Costo', 'Precio_Venta', 'Zona', 'Pasillo', 'Rack', 'Proveedor'];
    const rows = filteredProducts.map(p => [
      p.sku,
      p.barcode,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.unit,
      p.stock,
      p.minStock,
      p.purchasePrice,
      p.salePrice,
      p.location.zone,
      p.location.aisle,
      p.location.rack,
      `"${p.supplierName.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventario_almacen_pf_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header controls bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Catálogo de Existencias</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>{filteredProducts.length} productos listados</span>
            <span aria-hidden="true">·</span>
            <span>{products.reduce((acc, p) => acc + p.stock, 0)} unidades físicas totales</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onNavigateToSettings && (
            <button
              onClick={onNavigateToSettings}
              className="px-3 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-600" />
              <span>Umbrales por Categoría</span>
            </button>
          )}

          {onOpenOcrScanner && (
            <button
              onClick={onOpenOcrScanner}
              className="px-3 py-2 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-500 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Scan className="w-4 h-4" />
              <span>OCR Vision (client.textDetection)</span>
            </button>
          )}

          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-3 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Scan className="w-4 h-4 text-slate-600" />
            <span>Escanear Código</span>
          </button>

          <button
            onClick={exportToCSV}
            className="px-3 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onOpenNewProduct}
            className="px-3.5 py-2 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Text search */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU, código de barras o pasillo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs border border-slate-300 rounded bg-white text-slate-700 focus:outline-hidden focus:border-slate-500"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs border border-slate-300 rounded bg-white text-slate-700 focus:outline-hidden focus:border-slate-500"
            >
              <option value="all">Todos los estados de stock</option>
              <option value="optimal">Stock Óptimo (&gt; Mínimo)</option>
              <option value="low_stock">Stock Crítico (Bajo Mínimo)</option>
              <option value="out_of_stock">Agotado (0 unidades)</option>
            </select>
          </div>
        </div>

        {/* Zone quick filter buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium shrink-0">Zona de Almacén:</span>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {['all', 'A', 'B', 'C', 'D'].map(zone => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`px-2.5 py-1 rounded text-xs transition-colors shrink-0 ${
                  selectedZone === zone
                    ? 'bg-slate-900 text-white font-medium'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {zone === 'all' ? 'Todas las zonas' : `Zona ${zone}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold tracking-wider uppercase text-[11px]">
                <th className="py-3 px-4">Producto & SKU</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Ubicación Fís.</th>
                <th className="py-3 px-4 text-right">Existencia</th>
                <th className="py-3 px-4 text-right">Costo / Venta</th>
                <th className="py-3 px-4 text-right">Valor Total</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="font-medium text-sm">No se encontraron productos coincidentes</p>
                    <p className="text-xs text-slate-400 mt-1">Pruebe ajustando los filtros de búsqueda o registre un nuevo artículo.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const isOutOfStock = product.stock === 0;
                  const isLowStock = product.stock > 0 && product.stock <= product.minStock;
                  const stockPercentage = Math.min(100, Math.round((product.stock / product.maxStock) * 100));

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Product Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900">{product.name}</span>
                          {isOutOfStock && (
                            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded shrink-0">
                              Agotado
                            </span>
                          )}
                          {!isOutOfStock && isLowStock && (
                            <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded shrink-0">
                              Bajo Mínimo
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono">{product.sku}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-slate-400">{product.barcode}</span>
                          <span aria-hidden="true">·</span>
                          <span>{product.unit}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-600">
                        <span>{product.category}</span>
                      </td>

                      {/* Physical Location */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono font-medium">Zona {product.location.zone} · {product.location.aisle}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Rack {product.location.rack} · Niv {product.location.level} · Bin {product.location.bin}
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`font-mono text-sm font-bold tabular-nums ${
                            isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-700' : 'text-slate-900'
                          }`}>
                            {product.stock}
                          </span>
                          <span className="text-[11px] text-slate-400">/ min {product.minStock}</span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-24 ml-auto h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                          <div 
                            className={`h-full rounded-full ${
                              isOutOfStock ? 'bg-rose-500 w-0' : isLowStock ? 'bg-amber-500' : 'bg-emerald-600'
                            }`}
                            style={{ width: `${Math.max(4, stockPercentage)}%` }}
                          />
                        </div>
                      </td>

                      {/* Prices */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        <div className="text-slate-900 font-medium">
                          {currencySymbol}{product.salePrice.toFixed(2)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Costo: {currencySymbol}{product.purchasePrice.toFixed(2)}
                        </div>
                      </td>

                      {/* Total Inventory Value */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {currencySymbol}{(product.stock * product.purchasePrice).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {(isOutOfStock || isLowStock) && (
                            <button
                              onClick={() => quickReorderProduct(product.id)}
                              title="Reabastecer con 1-Clic (Generar Orden de Compra)"
                              className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded transition-colors"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setAdjustingProduct(product);
                              setAdjustedStockValue(product.stock);
                            }}
                            title="Ajuste Rápido de Stock"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setLabelProduct(product)}
                            title="Ver / Imprimir Etiqueta"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setEditingProduct(product)}
                            title="Editar Datos de Producto"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`¿Está seguro de eliminar el producto "${product.name}"?`)) {
                                deleteProduct(product.id);
                              }
                            }}
                            title="Eliminar del catálogo"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Barcode Scanner Simulator */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-slate-800" />
                <h3 className="text-sm font-bold text-slate-900">Escáner Óptico de Código de Barras</h3>
              </div>
              <button 
                onClick={() => { setIsScannerOpen(false); setScanResult(null); }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Simule la lectura de una pistola lectora láser o ingrese el código de barras o SKU manualmente:
            </p>

            <form onSubmit={handleScanSubmit} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: 7751234001018 o MOT-IND-042"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  autoFocus
                  className="flex-1 px-3 py-2 text-xs font-mono border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-slate-700"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors"
                >
                  Buscar
                </button>
              </div>

              {/* Quick sample barcodes pills */}
              <div className="text-[11px] text-slate-500 space-y-1">
                <span>Probar códigos de muestra:</span>
                <div className="flex flex-wrap gap-1">
                  {products.slice(0, 4).map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setScannedCode(p.barcode)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono text-[10px]"
                    >
                      {p.barcode} ({p.sku})
                    </button>
                  ))}
                </div>
              </div>

              {onOpenOcrScanner && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsScannerOpen(false);
                      onOpenOcrScanner();
                    }}
                    className="w-full py-2 px-3 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Scan className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Lector Óptico OCR con client.textDetection()</span>
                  </button>
                </div>
              )}
            </form>

            {/* Scan Result Card */}
            {scanResult && (
              <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{scanResult.name}</span>
                  <span className="font-mono text-emerald-700 font-bold">{scanResult.stock} {scanResult.unit}</span>
                </div>
                <div className="text-slate-600 grid grid-cols-2 gap-2 text-[11px]">
                  <div>SKU: <span className="font-mono font-medium">{scanResult.sku}</span></div>
                  <div>Ubicación: <span className="font-mono font-medium">Zona {scanResult.location.zone} - {scanResult.location.aisle}</span></div>
                  <div>Precio Venta: <span className="font-mono font-medium">{currencySymbol}{scanResult.salePrice.toFixed(2)}</span></div>
                  <div>Precio Costo: <span className="font-mono font-medium">{currencySymbol}{scanResult.purchasePrice.toFixed(2)}</span></div>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setAdjustingProduct(scanResult);
                      setAdjustedStockValue(scanResult.stock);
                      setIsScannerOpen(false);
                    }}
                    className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                  >
                    Ajustar Stock
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Quick Stock Adjust */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Ajuste de Existencia en Almacén</h3>
              <button onClick={() => setAdjustingProduct(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-1">
              <p className="font-semibold text-slate-900">{adjustingProduct.name}</p>
              <div className="flex items-center gap-2 text-slate-500 font-mono">
                <span>SKU: {adjustingProduct.sku}</span>
                <span aria-hidden="true">·</span>
                <span>Stock Actual: <strong>{adjustingProduct.stock} {adjustingProduct.unit}</strong></span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nueva Existencia Física Real:</label>
                <input
                  type="number"
                  min="0"
                  value={adjustedStockValue}
                  onChange={(e) => setAdjustedStockValue(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Motivo / Justificación:</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-700"
                >
                  <option value="Conteo físico cíclico">Conteo físico cíclico / Cuadre de inventario</option>
                  <option value="Merma o rotura por manipulación">Merma o rotura por manipulación interna</option>
                  <option value="Devolución no registrada">Devolución técnica de cliente</option>
                  <option value="Diferencia de bultos proveedor">Diferencia de bultos del proveedor</option>
                  <option value="Corrección de digitalización">Corrección de digitalización de documento</option>
                </select>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 flex items-center justify-between">
                <span>Variación de inventario:</span>
                <span className={`font-mono font-bold ${
                  adjustedStockValue - adjustingProduct.stock >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {adjustedStockValue - adjustingProduct.stock >= 0 ? '+' : ''}{adjustedStockValue - adjustingProduct.stock} {adjustingProduct.unit}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setAdjustingProduct(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  adjustStock(adjustingProduct.id, adjustedStockValue, adjustReason);
                  setAdjustingProduct(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800"
              >
                Guardar Ajuste en Kárdex
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Print Barcode Label Preview */}
      {labelProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Etiqueta de Almacén (Sticker)</h3>
              <button onClick={() => setLabelProduct(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thermal sticker preview */}
            <div className="border-2 border-dashed border-slate-400 bg-white p-4 rounded text-slate-950 text-center space-y-2">
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">ALMACÉN CENTRAL PF</div>
              <div className="text-xs font-bold leading-tight line-clamp-2">{labelProduct.name}</div>
              
              {/* Simulated barcode representation */}
              <div className="py-2 flex flex-col items-center">
                <div className="h-12 w-48 flex items-center justify-center gap-0.5 bg-slate-100 px-2 rounded">
                  {/* barcode stripes */}
                  <div className="h-10 w-1 bg-black"></div>
                  <div className="h-10 w-0.5 bg-black"></div>
                  <div className="h-10 w-2 bg-black"></div>
                  <div className="h-10 w-1 bg-black"></div>
                  <div className="h-10 w-3 bg-black"></div>
                  <div className="h-10 w-0.5 bg-black"></div>
                  <div className="h-10 w-1 bg-black"></div>
                  <div className="h-10 w-2 bg-black"></div>
                  <div className="h-10 w-0.5 bg-black"></div>
                  <div className="h-10 w-2 bg-black"></div>
                  <div className="h-10 w-1 bg-black"></div>
                  <div className="h-10 w-0.5 bg-black"></div>
                  <div className="h-10 w-3 bg-black"></div>
                  <div className="h-10 w-1 bg-black"></div>
                  <div className="h-10 w-2 bg-black"></div>
                  <div className="h-10 w-1 bg-black"></div>
                </div>
                <div className="text-[11px] font-mono tracking-widest mt-1">{labelProduct.barcode}</div>
              </div>

              <div className="grid grid-cols-2 text-left text-[11px] border-t border-slate-200 pt-2 font-mono">
                <div>SKU: <strong>{labelProduct.sku}</strong></div>
                <div>UBIC: <strong>Z{labelProduct.location.zone}-{labelProduct.location.aisle}</strong></div>
                <div>RACK: {labelProduct.location.rack}</div>
                <div>BIN: {labelProduct.location.bin}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setLabelProduct(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Etiqueta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Product Details */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Editar Datos de Producto</h3>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nombre Comercial:</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">SKU:</label>
                  <input
                    type="text"
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Código de Barras:</label>
                  <input
                    type="text"
                    value={editingProduct.barcode}
                    onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                    className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Descripción:</label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Stock Mínimo:</label>
                  <input
                    type="number"
                    min="1"
                    value={editingProduct.minStock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, minStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Precio Costo ({currencySymbol}):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.purchasePrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Precio Venta ({currencySymbol}):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.salePrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Pasillo:</label>
                  <input
                    type="text"
                    value={editingProduct.location.aisle}
                    onChange={(e) => setEditingProduct({ 
                      ...editingProduct, 
                      location: { ...editingProduct.location, aisle: e.target.value } 
                    })}
                    className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Rack & Bin:</label>
                  <input
                    type="text"
                    value={`${editingProduct.location.rack} / ${editingProduct.location.bin}`}
                    onChange={(e) => {
                      const [r, b] = e.target.value.split('/');
                      setEditingProduct({ 
                        ...editingProduct, 
                        location: { ...editingProduct.location, rack: (r || '').trim(), bin: (b || '').trim() } 
                      });
                    }}
                    placeholder="R-01 / B1"
                    className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  updateProduct(editingProduct.id, editingProduct);
                  setEditingProduct(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
