import React, { useState } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, AlertTriangle, Layers, Scan, Sparkles, Loader2, Check } from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { MovementType } from '../types/warehouse';
import { client } from '../services/visionClient';

interface NewMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewMovementModal: React.FC<NewMovementModalProps> = ({ isOpen, onClose }) => {
  const { products, registerMovement, currencySymbol } = useWarehouse();

  const [type, setType] = useState<MovementType>('IN');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(10);
  const [unitCost, setUnitCost] = useState<number>(products[0]?.purchasePrice || 0);
  const [concept, setConcept] = useState('Ingreso por orden de compra');
  const [referenceDoc, setReferenceDoc] = useState(`GR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [notes, setNotes] = useState('');

  // OCR state with client.textDetection()
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetProduct = products.find(p => p.id === selectedProductId);

  const handleProductChange = (id: string) => {
    setSelectedProductId(id);
    const prod = products.find(p => p.id === id);
    if (prod) {
      setUnitCost(prod.purchasePrice);
    }
  };

  const handleTypeChange = (newType: MovementType) => {
    setType(newType);
    if (newType === 'IN') {
      setConcept('Ingreso por orden de compra o recepción de proveedor');
      setReferenceDoc(`GR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    } else if (newType === 'OUT') {
      setConcept('Despacho a cliente / Requerimiento de obra');
      setReferenceDoc(`VAL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    } else if (newType === 'ADJUST') {
      setConcept('Ajuste por recuento físico cíclico o merma');
      setReferenceDoc(`AUD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    } else {
      setConcept('Traslado entre racks o zonas de preparación');
      setReferenceDoc(`TRF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity === 0) return;

    if (type === 'OUT' && targetProduct && quantity > targetProduct.stock) {
      alert(`No es posible despachar ${quantity} unidades. Stock disponible: ${targetProduct.stock} unidades.`);
      return;
    }

    registerMovement({
      type,
      concept: concept.trim(),
      productId: selectedProductId,
      quantity: Math.abs(quantity),
      unitCost: Number(unitCost) || targetProduct?.purchasePrice || 0,
      referenceDoc: referenceDoc.trim() || 'SIN-DOC',
      notes: notes.trim()
    });

    onClose();
  };

  // OCR Document scanner integration via client.textDetection()
  const handleRunOcrTextDetection = async (sampleId: string) => {
    setIsScanningOcr(true);
    setOcrSuccessMsg(null);

    try {
      // Direct call to client.textDetection()
      const [result] = await client.textDetection(sampleId);

      if (result.extractedEntities) {
        const { sku, referenceDoc: detectedDoc, quantity: detectedQty } = result.extractedEntities;

        if (detectedDoc) {
          setReferenceDoc(detectedDoc);
        }
        if (detectedQty && detectedQty > 0) {
          setQuantity(detectedQty);
        }
        if (sku) {
          const matched = products.find(p => p.sku.toLowerCase() === sku.toLowerCase());
          if (matched) {
            setSelectedProductId(matched.id);
            setUnitCost(matched.purchasePrice);
            setOcrSuccessMsg(`client.textDetection() reconoció doc ${detectedDoc || ''} y SKU ${sku} (${matched.name.slice(0, 30)}...)`);
          } else {
            setOcrSuccessMsg(`client.textDetection() reconoció doc ${detectedDoc || ''} y cantidad ${detectedQty || 10} und.`);
          }
        } else {
          setOcrSuccessMsg(`client.textDetection() completado con éxito.`);
        }

        setTimeout(() => setOcrSuccessMsg(null), 5000);
      }
    } catch (err) {
      console.error('Error in textDetection OCR:', err);
    } finally {
      setIsScanningOcr(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Registrar Movimiento en Kárdex</h3>
            <p className="text-xs text-slate-500">Asiento contable y físico con actualización en vivo de existencia</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OCR Document Auto-Fill Ribbon */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
              <Scan className="w-3.5 h-3.5 text-emerald-700" />
              <span>Autocompletar asiento con OCR (<code className="font-mono text-[10px] text-emerald-800">client.textDetection()</code>)</span>
            </span>
            {isScanningOcr && (
              <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                <span>Leyendo documento...</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              disabled={isScanningOcr}
              onClick={() => handleRunOcrTextDetection('sample-guia')}
              className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-900 rounded border border-emerald-300 text-[11px] font-medium transition-colors shadow-2xs"
            >
              Escanear Guía #GR-2026-0891 (50 unds)
            </button>

            <button
              type="button"
              disabled={isScanningOcr}
              onClick={() => handleRunOcrTextDetection('sample-invoice')}
              className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-900 rounded border border-emerald-300 text-[11px] font-medium transition-colors shadow-2xs"
            >
              Escanear Factura #FC-2026-0041 (120 unds)
            </button>

            <button
              type="button"
              disabled={isScanningOcr}
              onClick={() => handleRunOcrTextDetection('sample-motor')}
              className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-900 rounded border border-emerald-300 text-[11px] font-medium transition-colors shadow-2xs"
            >
              Etiqueta Motor Trifásico (MOT-IND-042)
            </button>
          </div>

          {ocrSuccessMsg && (
            <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-mono pt-1">
              <Check className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">{ocrSuccessMsg}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Operation Type Switcher */}
          <div>
            <label className="block font-medium text-slate-700 mb-1.5">Tipo de Operación:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('IN')}
                className={`p-2 rounded border text-left flex items-center gap-1.5 transition-all ${
                  type === 'IN' 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold' 
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Entrada (IN)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('OUT')}
                className={`p-2 rounded border text-left flex items-center gap-1.5 transition-all ${
                  type === 'OUT' 
                    ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold' 
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Salida (OUT)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('ADJUST')}
                className={`p-2 rounded border text-left flex items-center gap-1.5 transition-all ${
                  type === 'ADJUST' 
                    ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold' 
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Ajuste</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('TRANSFER')}
                className={`p-2 rounded border text-left flex items-center gap-1.5 transition-all ${
                  type === 'TRANSFER' 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold' 
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Traslado</span>
              </button>
            </div>
          </div>

          {/* Product selector with live stock readout */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-slate-700">Producto a Movilizar:</label>
              {targetProduct && (
                <span className="font-mono text-slate-500 font-medium">
                  Stock actual: <strong>{targetProduct.stock} {targetProduct.unit}</strong>
                </span>
              )}
            </div>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-900 text-xs"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.sku} · {p.name} (Stock: {p.stock})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Unit Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Cantidad de Unidades:</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 font-mono font-bold border border-slate-300 rounded text-sm"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Costo Unitario ({currencySymbol}):</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={unitCost}
                onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded text-sm"
              />
            </div>
          </div>

          {/* Concept & Document */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">N° Documento Sustentatorio:</label>
              <input
                type="text"
                required
                placeholder="GR-2026-0042 o FAC-991"
                value={referenceDoc}
                onChange={(e) => setReferenceDoc(e.target.value)}
                className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Concepto / Glosa:</label>
              <input
                type="text"
                required
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
              />
            </div>
          </div>

          {/* Impact preview */}
          {targetProduct && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between font-mono text-xs">
              <span className="text-slate-600">Saldo proyectado tras operación:</span>
              <span className="font-bold text-slate-900">
                {type === 'IN' 
                  ? `${targetProduct.stock + quantity} ${targetProduct.unit}` 
                  : type === 'OUT' 
                    ? `${Math.max(0, targetProduct.stock - quantity)} ${targetProduct.unit}`
                    : `${targetProduct.stock} ${targetProduct.unit}`}
              </span>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Observaciones / Inspector:</label>
            <input
              type="text"
              placeholder="Ej: Embalaje verificado sin anomalías por Elena R. Vargas"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
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
              Confirmar y Asentar Kárdex
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
