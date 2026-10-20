import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Check, 
  Clock, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Building2, 
  PackageCheck,
  X,
  ChevronRight
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { Supplier, PurchaseOrder } from '../types/warehouse';

export const SuppliersView: React.FC = () => {
  const { 
    suppliers, 
    purchaseOrders, 
    products, 
    receivePurchaseOrder, 
    createPurchaseOrder, 
    addSupplier,
    currencySymbol 
  } = useWarehouse();

  const [activeTab, setActiveTab] = useState<'orders' | 'directory'>('orders');

  // Modal states
  const [isNewPOOpen, setIsNewPOOpen] = useState(false);
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);

  // New PO form state
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [poItems, setPoItems] = useState<{ productId: string; quantity: number; unitCost: number }[]>([
    { productId: products[0]?.id || '', quantity: 10, unitCost: products[0]?.purchasePrice || 10 }
  ]);
  const [expectedDate, setExpectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [poNotes, setPoNotes] = useState('');

  // New Supplier form state
  const [newSuppName, setNewSuppName] = useState('');
  const [newSuppTaxId, setNewSuppTaxId] = useState('');
  const [newSuppContact, setNewSuppContact] = useState('');
  const [newSuppEmail, setNewSuppEmail] = useState('');
  const [newSuppPhone, setNewSuppPhone] = useState('');
  const [newSuppAddress, setNewSuppAddress] = useState('');
  const [newSuppCategory, setNewSuppCategory] = useState('');
  const [newSuppLeadTime, setNewSuppLeadTime] = useState(3);

  const handleAddPoItem = () => {
    setPoItems(prev => [...prev, { productId: products[0]?.id || '', quantity: 10, unitCost: products[0]?.purchasePrice || 10 }]);
  };

  const handleRemovePoItem = (index: number) => {
    setPoItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdatePoItem = (index: number, field: 'productId' | 'quantity' | 'unitCost', value: any) => {
    setPoItems(prev => {
      const updated = [...prev];
      if (field === 'productId') {
        const prod = products.find(p => p.id === value);
        updated[index] = {
          ...updated[index],
          productId: value,
          unitCost: prod?.purchasePrice || updated[index].unitCost
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const handleSubmitPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || poItems.length === 0) return;

    createPurchaseOrder({
      supplierId: selectedSupplierId,
      items: poItems,
      expectedDate,
      notes: poNotes
    });

    setIsNewPOOpen(false);
    setPoNotes('');
  };

  const handleSubmitSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuppName || !newSuppTaxId) return;

    addSupplier({
      name: newSuppName,
      taxId: newSuppTaxId,
      contactPerson: newSuppContact,
      email: newSuppEmail,
      phone: newSuppPhone,
      address: newSuppAddress,
      category: newSuppCategory,
      leadTimeDays: Number(newSuppLeadTime) || 3
    });

    setIsNewSupplierOpen(false);
    setNewSuppName('');
    setNewSuppTaxId('');
    setNewSuppContact('');
    setNewSuppEmail('');
    setNewSuppPhone('');
    setNewSuppAddress('');
    setNewSuppCategory('');
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Gestión de Abastecimiento & Proveedores</h2>
          <p className="text-xs text-slate-500">Control de órdenes de compra, plazos de entrega y recepción automática en almacén</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'orders' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Órdenes de Compra ({purchaseOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'directory' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Directorio Proveedores ({suppliers.length})
            </button>
          </div>

          {activeTab === 'orders' ? (
            <button
              onClick={() => setIsNewPOOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Orden de Compra</span>
            </button>
          ) : (
            <button
              onClick={() => setIsNewSupplierOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Proveedor</span>
            </button>
          )}
        </div>
      </div>

      {/* View: Purchase Orders */}
      {activeTab === 'orders' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {purchaseOrders.map(po => {
              const isReceived = po.status === 'RECIBIDO';
              const isPending = po.status === 'PENDIENTE';

              return (
                <div key={po.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-900">{po.code}</span>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">Emitida: {po.date}</p>
                      </div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        isReceived ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {po.status}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">{po.supplierName}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Entrega estimada: {po.expectedDate}</span>
                      </p>
                    </div>

                    {/* Items brief */}
                    <div className="mt-3 bg-slate-50 p-2.5 rounded text-[11px] space-y-1">
                      <p className="font-semibold text-slate-700">Ítems solicitados ({po.items.length}):</p>
                      {po.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-slate-600">
                          <span className="truncate max-w-[180px]">{item.productName}</span>
                          <span className="font-mono font-medium">{item.quantity} und</span>
                        </div>
                      ))}
                    </div>

                    {po.notes && (
                      <p className="mt-2 text-[11px] text-slate-400 italic line-clamp-1">
                        Nota: {po.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Importe Total</span>
                      <p className="text-sm font-mono font-bold text-slate-900">
                        {currencySymbol}{po.totalCost.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    {isPending ? (
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Confirmar recepción física de mercadería de ${po.code}? Se actualizará automáticamente el inventario y se registrará la entrada en el Kárdex.`)) {
                            receivePurchaseOrder(po.id);
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 rounded transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Recibir en Almacén</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        <span>Ingresado a Stock</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* View: Suppliers Directory */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map(supp => (
            <div key={supp.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{supp.name}</h3>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">RUC / Identificación: {supp.taxId}</p>
                </div>
                <div className="p-2 bg-slate-100 text-slate-700 rounded shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Categoría:</span>
                  <span className="font-medium text-slate-800">{supp.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Contacto:</span>
                  <span>{supp.contactPerson}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{supp.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{supp.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{supp.address}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Tiempo de Entrega (Lead Time):</span>
                <span className="font-mono font-bold text-slate-800">{supp.leadTimeDays} días</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Nueva Orden de Compra */}
      {isNewPOOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Crear Orden de Compra (Abastecimiento)</h3>
              <button onClick={() => setIsNewPOOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPO} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Proveedor Autorizado:</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-700"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.taxId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Fecha Estimada de Llegada:</label>
                <input
                  type="date"
                  required
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-slate-700">Productos a Pedir:</label>
                  <button
                    type="button"
                    onClick={handleAddPoItem}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Añadir otro producto
                  </button>
                </div>

                {poItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <select
                        value={item.productId}
                        onChange={(e) => handleUpdatePoItem(idx, 'productId', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.sku} - {p.name.slice(0, 20)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        min="1"
                        placeholder="Cant."
                        value={item.quantity}
                        onChange={(e) => handleUpdatePoItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-center font-mono"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Costo"
                        value={item.unitCost}
                        onChange={(e) => handleUpdatePoItem(idx, 'unitCost', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-right font-mono"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      {poItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePoItem(idx)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Notas de Logística:</label>
                <input
                  type="text"
                  placeholder="Ej: Embalaje especial para viaje largo"
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewPOOpen(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold bg-slate-900 text-white rounded hover:bg-slate-800"
                >
                  Generar Orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Registrar Proveedor */}
      {isNewSupplierOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Registrar Nuevo Proveedor</h3>
              <button onClick={() => setIsNewSupplierOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Razón Social / Nombre:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Metales y Tubos del Norte S.A.C."
                  value={newSuppName}
                  onChange={(e) => setNewSuppName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">RUC / NIF:</label>
                  <input
                    type="text"
                    required
                    placeholder="20601928391"
                    value={newSuppTaxId}
                    onChange={(e) => setNewSuppTaxId(e.target.value)}
                    className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Lead Time (Días):</label>
                  <input
                    type="number"
                    min="1"
                    value={newSuppLeadTime}
                    onChange={(e) => setNewSuppLeadTime(parseInt(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Persona de Contacto:</label>
                <input
                  type="text"
                  placeholder="Ing. Juan Pérez"
                  value={newSuppContact}
                  onChange={(e) => setNewSuppContact(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email:</label>
                  <input
                    type="email"
                    placeholder="ventas@proveedor.pe"
                    value={newSuppEmail}
                    onChange={(e) => setNewSuppEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Teléfono:</label>
                  <input
                    type="text"
                    placeholder="+51 987 654 321"
                    value={newSuppPhone}
                    onChange={(e) => setNewSuppPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Categoría / Rubro:</label>
                <input
                  type="text"
                  placeholder="Válvulas, Conexiones y Tuberías"
                  value={newSuppCategory}
                  onChange={(e) => setNewSuppCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Dirección del Almacén Proveedor:</label>
                <input
                  type="text"
                  placeholder="Av. Industrial 800"
                  value={newSuppAddress}
                  onChange={(e) => setNewSuppAddress(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewSupplierOpen(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold bg-slate-900 text-white rounded hover:bg-slate-800"
                >
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
