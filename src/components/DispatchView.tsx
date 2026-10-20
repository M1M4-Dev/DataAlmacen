import React, { useState } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Search, 
  Trash2, 
  Printer, 
  CheckCircle, 
  FileText, 
  User, 
  Building, 
  CreditCard,
  Plus,
  Minus,
  X
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { Product, DispatchReceipt } from '../types/warehouse';

export const DispatchView: React.FC = () => {
  const { products, dispatches, createDispatch, currencySymbol } = useWarehouse();

  // Search & filter for products in dispatch
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Dispatch Cart state
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientDoc, setClientDoc] = useState('');
  const [destination, setDestination] = useState('');
  const [paymentType, setPaymentType] = useState('Transferencia BANCARIA (30 días)');

  // Completed receipt to preview & print
  const [activeReceipt, setActiveReceipt] = useState<DispatchReceipt | null>(null);
  const [historyTab, setHistoryTab] = useState<'create' | 'history'>('create');

  // Filter products that have stock > 0
  const availableProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Cart calculations
  const cartItemsWithDetails = cart.map(item => {
    const prod = products.find(p => p.id === item.productId)!;
    return {
      product: prod,
      quantity: item.quantity,
      subtotal: (prod?.salePrice || 0) * item.quantity
    };
  }).filter(item => item.product !== undefined);

  const subtotal = cartItemsWithDetails.reduce((acc, item) => acc + item.subtotal, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`No se pueden despachar más de ${product.stock} unidades disponibles.`);
          return prev;
        }
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        return [...prev, { productId: product.id, quantity: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (productId: string, newQty: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    if (newQty > prod.stock) {
      alert(`Stock insuficiente: sólo quedan ${prod.stock} unidades en almacén.`);
      return;
    }

    setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: newQty } : i));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const handleSubmitDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Agregue al menos un producto al pedido de despacho.');
      return;
    }
    if (!clientName.trim() || !clientDoc.trim()) {
      alert('Por favor complete el nombre del cliente y el documento RUC/DNI.');
      return;
    }

    const receipt = createDispatch({
      clientName: clientName.trim(),
      clientDoc: clientDoc.trim(),
      destination: destination.trim() || 'Despacho directo en mostrador',
      paymentType,
      items: cart
    });

    if (receipt) {
      setActiveReceipt(receipt);
      setCart([]);
      setClientName('');
      setClientDoc('');
      setDestination('');
    } else {
      alert('Error: Verifique que haya suficiente stock disponible para todos los ítems.');
    }
  };

  return (
    <div className="space-y-5">
      {/* View Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Punto de Despacho & Emisión de Vales</h2>
          <p className="text-xs text-slate-500">Salidas por venta, transferencias de obra o suministros internos con deducción inmediata de stock</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 text-xs font-medium">
            <button
              onClick={() => setHistoryTab('create')}
              className={`px-3 py-1.5 rounded transition-colors ${
                historyTab === 'create' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nuevo Despacho
            </button>
            <button
              onClick={() => setHistoryTab('history')}
              className={`px-3 py-1.5 rounded transition-colors ${
                historyTab === 'history' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Historial de Vales ({dispatches.length})
            </button>
          </div>
        </div>
      </div>

      {historyTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Product Selection Grid */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar producto a despachar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="py-1.5 px-2.5 text-xs border border-slate-300 rounded bg-white text-slate-700"
                >
                  <option value="all">Todas las categorías</option>
                  <option value="Herramientas & Maquinaria">Herramientas & Maquinaria</option>
                  <option value="Repuestos Mecánicos">Repuestos Mecánicos</option>
                  <option value="Seguridad Industrial">Seguridad Industrial</option>
                  <option value="Embalaje & Logística">Embalaje & Logística</option>
                  <option value="Electricidad & Iluminación">Electricidad & Iluminación</option>
                  <option value="Ferretería & Construcción">Ferretería & Construcción</option>
                </select>
              </div>

              {/* Products Catalog Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[600px] overflow-y-auto pr-1">
                {availableProducts.map(product => {
                  const inCartItem = cart.find(c => c.productId === product.id);
                  const isOutOfStock = product.stock <= 0;

                  return (
                    <div 
                      key={product.id}
                      className={`p-3 rounded-lg border text-xs flex flex-col justify-between transition-all ${
                        isOutOfStock 
                          ? 'bg-slate-50 border-slate-200 opacity-60' 
                          : inCartItem 
                            ? 'bg-blue-50/50 border-blue-300 shadow-xs' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-semibold text-slate-900 line-clamp-1">{product.name}</span>
                          <span className="font-mono text-[10px] text-slate-400 shrink-0">{product.sku}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          Ubicación: Zona {product.location.zone} · {product.location.aisle}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="font-mono text-sm font-bold text-slate-900">
                            {currencySymbol}{product.salePrice.toFixed(2)}
                          </div>
                          <div className={`text-[11px] font-mono ${isOutOfStock ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                            Stock: {product.stock} {product.unit}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => handleAddToCart(product)}
                          className={`px-2.5 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1 ${
                            isOutOfStock 
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : inCartItem
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{inCartItem ? `(${inCartItem.quantity}) Añadir` : 'Añadir'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Dispatch Cart & Ticket Form */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-slate-800" />
                  <h3 className="text-sm font-bold text-slate-900">Orden de Despacho</h3>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                  {cart.length} ítems
                </span>
              </div>

              {/* Client and Destination Inputs */}
              <form onSubmit={handleSubmitDispatch} className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Cliente / Destinatario:</label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Empresa o Persona Receptora"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">RUC / DNI:</label>
                    <input
                      type="text"
                      required
                      placeholder="20554910283"
                      value={clientDoc}
                      onChange={(e) => setClientDoc(e.target.value)}
                      className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Modalidad de Pago:</label>
                    <select
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-slate-700"
                    >
                      <option value="Transferencia BANCARIA (30 días)">Transferencia (30d)</option>
                      <option value="Efectivo contra entrega">Efectivo</option>
                      <option value="Crédito Comercial 60d">Crédito 60d</option>
                      <option value="Guía Interna de Consumo">Vale Interno</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Destino / Proyecto / Dirección:</label>
                  <input
                    type="text"
                    placeholder="Obra Minera o Sede Central..."
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                  />
                </div>

                {/* Items in Cart Table */}
                <div className="pt-2">
                  <div className="text-xs font-semibold text-slate-700 mb-1.5">Artículos a Despachar:</div>
                  {cart.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded">
                      <p>Seleccione artículos del catálogo para añadirlos al despacho</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto border border-slate-200 rounded bg-slate-50/50">
                      {cartItemsWithDetails.map(({ product, quantity, subtotal: itemSub }) => (
                        <div key={product.id} className="p-2.5 flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{product.name}</p>
                            <p className="text-[11px] font-mono text-slate-400">
                              {product.sku} · {currencySymbol}{product.salePrice.toFixed(2)} c/u
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(product.id, quantity - 1)}
                              className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-100"
                            >
                              <Minus className="w-3 h-3 text-slate-600" />
                            </button>
                            <span className="font-mono font-bold text-xs w-6 text-center tabular-nums">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(product.id, quantity + 1)}
                              className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-100"
                            >
                              <Plus className="w-3 h-3 text-slate-600" />
                            </button>
                          </div>

                          <div className="text-right shrink-0 w-16">
                            <div className="font-mono font-semibold text-slate-900">
                              {currencySymbol}{itemSub.toFixed(2)}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(product.id)}
                              className="text-[10px] text-rose-500 hover:text-rose-700"
                            >
                              Quitar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subtotal & Total calculations */}
                <div className="pt-2 border-t border-slate-100 space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Base:</span>
                    <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>IGV / IVA (18%):</span>
                    <span>{currencySymbol}{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total a Facturar:</span>
                    <span>{currencySymbol}{total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cart.length === 0}
                  className={`w-full py-2.5 rounded font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm ${
                    cart.length === 0 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Emitir Vale y Despachar Mercadería</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* History of Dispatches */
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold tracking-wider uppercase text-[11px]">
                  <th className="py-3 px-4">N° Vale / Código</th>
                  <th className="py-3 px-4">Fecha & Hora</th>
                  <th className="py-3 px-4">Cliente / RUC</th>
                  <th className="py-3 px-4">Destino</th>
                  <th className="py-3 px-4 text-center">Ítems</th>
                  <th className="py-3 px-4 text-right">Total Facturado</th>
                  <th className="py-3 px-4 text-center">Comprobante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dispatches.map(disp => (
                  <tr key={disp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {disp.code}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {disp.date}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{disp.clientName}</div>
                      <div className="text-[11px] font-mono text-slate-500">RUC: {disp.clientDoc}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {disp.destination}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium">
                      {disp.items.reduce((acc, i) => acc + i.quantity, 0)} und
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {currencySymbol}{disp.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setActiveReceipt(disp)}
                        className="px-2.5 py-1 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-medium inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Ver Vale</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Dispatch Voucher / Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-slate-900 text-white rounded flex items-center justify-center font-bold text-xs">
                  PF
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">GUÍA DE SALIDA Y VALE DE DESPACHO</h3>
                  <p className="text-[11px] font-mono text-slate-500">{activeReceipt.code}</p>
                </div>
              </div>
              <button onClick={() => setActiveReceipt(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Official printable document layout */}
            <div className="border border-slate-200 rounded p-4 space-y-4 text-xs bg-white text-slate-900">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <p className="font-extrabold text-slate-900 text-sm">ALMACÉN CENTRAL PF S.A.C.</p>
                  <p className="text-[11px] text-slate-500">RUC: 20608821941 · Sector Industrial Logístico</p>
                  <p className="text-[11px] text-slate-500">Av. Las Industrias 402, Muelle 2</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded">
                    {activeReceipt.code}
                  </span>
                  <p className="text-[11px] font-mono text-slate-500 mt-1">Fecha: {activeReceipt.date}</p>
                </div>
              </div>

              {/* Client Info Grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded text-[11px]">
                <div>
                  <span className="text-slate-500 font-medium">Destinatario / Razón Social:</span>
                  <p className="font-bold text-slate-900">{activeReceipt.clientName}</p>
                  <p className="font-mono text-slate-600">RUC/DNI: {activeReceipt.clientDoc}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Punto de Entrega:</span>
                  <p className="font-semibold text-slate-900">{activeReceipt.destination}</p>
                  <p className="text-slate-600">Modalidad: {activeReceipt.paymentType}</p>
                </div>
              </div>

              {/* Dispatched products table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                    <th className="py-1.5">SKU</th>
                    <th className="py-1.5">Descripción de Mercadería</th>
                    <th className="py-1.5 text-center">Cant.</th>
                    <th className="py-1.5 text-right">P. Unit</th>
                    <th className="py-1.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeReceipt.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2 font-mono text-[11px] text-slate-500">{item.sku}</td>
                      <td className="py-2 font-medium text-slate-900">{item.name}</td>
                      <td className="py-2 text-center font-mono font-bold">{item.quantity}</td>
                      <td className="py-2 text-right font-mono tabular-nums">{currencySymbol}{item.unitPrice.toFixed(2)}</td>
                      <td className="py-2 text-right font-mono font-bold tabular-nums">{currencySymbol}{item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t border-slate-200 pt-2 flex justify-end">
                <div className="w-48 space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>{currencySymbol}{activeReceipt.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>IGV (18%):</span>
                    <span>{currencySymbol}{activeReceipt.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-200 pt-1">
                    <span>TOTAL:</span>
                    <span>{currencySymbol}{activeReceipt.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-500 border-t border-slate-100">
                <div>
                  <div className="border-b border-slate-300 w-36 mx-auto mb-1"></div>
                  <p className="font-semibold text-slate-700">{activeReceipt.operator}</p>
                  <p>Despacho y Control de Almacén</p>
                </div>
                <div>
                  <div className="border-b border-slate-300 w-36 mx-auto mb-1"></div>
                  <p className="font-semibold text-slate-700">Firma y Sello de Recepción</p>
                  <p>Recibido Conforme por Cliente</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveReceipt(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Comprobante Oficial</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
