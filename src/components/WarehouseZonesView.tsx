import React, { useState } from 'react';
import { 
  Warehouse, 
  MapPin, 
  Thermometer, 
  Layers, 
  Package, 
  ArrowRight, 
  Boxes, 
  CheckCircle2,
  Info
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { WarehouseZone } from '../types/warehouse';

export const WarehouseZonesView: React.FC = () => {
  const { zones, products, updateProduct, registerMovement } = useWarehouse();

  const [selectedZoneCode, setSelectedZoneCode] = useState<'A' | 'B' | 'C' | 'D'>('B');
  const [selectedAisleCode, setSelectedAisleCode] = useState<string>('B-01');

  // Relocation modal state
  const [relocatingProduct, setRelocatingProduct] = useState<{
    id: string;
    name: string;
    sku: string;
    currentLocation: string;
  } | null>(null);
  const [newZone, setNewZone] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [newAisle, setNewAisle] = useState('A-01');
  const [newRack, setNewRack] = useState('R-01');
  const [newBin, setNewBin] = useState('B1');

  const selectedZone = zones.find(z => z.code === selectedZoneCode) || zones[0];

  // Products in selected zone
  const zoneProducts = products.filter(p => p.location.zone === selectedZoneCode);

  // Products in selected aisle
  const aisleProducts = products.filter(p => p.location.aisle === selectedAisleCode);

  const handleExecuteRelocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!relocatingProduct) return;

    updateProduct(relocatingProduct.id, {
      location: {
        zone: newZone,
        aisle: newAisle,
        rack: newRack,
        level: 'N-01',
        bin: newBin
      }
    });

    registerMovement({
      type: 'TRANSFER',
      concept: `Reubicación interna de ${relocatingProduct.currentLocation} hacia Zona ${newZone} ${newAisle} Rack ${newRack}`,
      productId: relocatingProduct.id,
      quantity: 0,
      referenceDoc: `TRF-${Date.now().toString().slice(-4)}`,
      notes: 'Traslado por optimización de espacio y rotación'
    });

    setRelocatingProduct(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Topología Física del Almacén</h2>
          <p className="text-xs text-slate-500">Distribución espacial de naves, pasillos de carga, estanterías dinámicas y bins de preparación</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1.5 rounded">
          <Warehouse className="w-4 h-4 text-slate-700" />
          <span>Almacén Central · 4 Naves · 10 Pasillos Activos</span>
        </div>
      </div>

      {/* Interactive Visual Blueprint Map */}
      <div className="bg-slate-950 text-white rounded-xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-slate-400">Plano General de Distribución en Planta</h3>
            <p className="text-xs text-slate-400">Haga clic en una zona para inspeccionar sus pasillos, racks y stock contenido</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded bg-sky-500"></span> <span className="text-slate-400">A</span>
            <span className="w-3 h-3 rounded bg-indigo-500 ml-2"></span> <span className="text-slate-400">B</span>
            <span className="w-3 h-3 rounded bg-emerald-500 ml-2"></span> <span className="text-slate-400">C</span>
            <span className="w-3 h-3 rounded bg-amber-500 ml-2"></span> <span className="text-slate-400">D</span>
          </div>
        </div>

        {/* Blueprint Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {zones.map(z => {
            const isSelected = z.code === selectedZoneCode;
            const occupancy = Math.round((z.currentUnits / z.capacityUnits) * 100);

            return (
              <button
                key={z.code}
                onClick={() => {
                  setSelectedZoneCode(z.code);
                  if (z.aisles[0]) setSelectedAisleCode(z.aisles[0].code);
                }}
                className={`text-left p-4 rounded-lg border transition-all relative ${
                  isSelected 
                    ? 'border-white bg-slate-800/90 shadow-md ring-1 ring-white/50' 
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: z.color }}
                    />
                    <span className="font-bold text-sm text-white">Zona {z.code}</span>
                  </div>
                  <span className="font-mono text-xs font-semibold tabular-nums text-slate-300">
                    {occupancy}%
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium mt-2 line-clamp-1">{z.name.replace(`Zona ${z.code} - `, '')}</p>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{z.description}</p>

                <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{z.currentUnits}/{z.capacityUnits} und</span>
                  {z.tempControlled ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Thermometer className="w-3 h-3" />
                      18°C Clima
                    </span>
                  ) : (
                    <span>Ambiente</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Zone Detail & Aisles View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Aisles of Selected Zone */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-900 text-white">
                Zona {selectedZone.code}
              </span>
              <h3 className="text-sm font-bold text-slate-900">{selectedZone.name}</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">{selectedZone.description}</p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pasillos Asignados:</span>
            <div className="space-y-2">
              {selectedZone.aisles.map(aisle => {
                const isAisleSelected = aisle.code === selectedAisleCode;
                const occ = Math.round((aisle.occupiedSlots / aisle.totalSlots) * 100);

                return (
                  <button
                    key={aisle.code}
                    onClick={() => setSelectedAisleCode(aisle.code)}
                    className={`w-full text-left p-3 rounded border transition-colors flex items-center justify-between ${
                      isAisleSelected 
                        ? 'border-slate-900 bg-slate-50' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">{aisle.code}</span>
                        <span className="text-xs text-slate-700">{aisle.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {aisle.racksCount} racks estructurales · {aisle.occupiedSlots}/{aisle.totalSlots} posiciones
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-slate-700 tabular-nums">{occ}%</span>
                      <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full bg-slate-900 rounded-full" 
                          style={{ width: `${occ}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Products currently in Selected Aisle */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Mercadería Almacenada en Pasillo {selectedAisleCode}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {aisleProducts.length} productos ubicados en este pasillo
              </p>
            </div>
          </div>

          {aisleProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-slate-50 rounded border border-dashed border-slate-200 text-xs">
              <p>No hay artículos asignados actualmente a este pasillo.</p>
              <p className="mt-1 text-[11px] text-slate-400">Puede reubicar productos desde la lista de existencias.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
              {aisleProducts.map(p => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{p.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                      <span>{p.sku}</span>
                      <span aria-hidden="true">·</span>
                      <span>Rack: {p.location.rack}</span>
                      <span aria-hidden="true">·</span>
                      <span>Nivel: {p.location.level}</span>
                      <span aria-hidden="true">·</span>
                      <span>Bin: {p.location.bin}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-slate-900">{p.stock} {p.unit}</div>
                    <button
                      onClick={() => {
                        setRelocatingProduct({
                          id: p.id,
                          name: p.name,
                          sku: p.sku,
                          currentLocation: `Zona ${p.location.zone} ${p.location.aisle} ${p.location.rack}`
                        });
                        setNewZone(p.location.zone);
                        setNewAisle(p.location.aisle);
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-medium underline mt-0.5 block"
                    >
                      Reubicar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Relocation Modal */}
      {relocatingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Reubicación Interna de Producto</h3>
            <div className="text-xs space-y-1">
              <p className="font-semibold text-slate-900">{relocatingProduct.name}</p>
              <p className="text-slate-500 font-mono">Ubicación actual: {relocatingProduct.currentLocation}</p>
            </div>

            <form onSubmit={handleExecuteRelocation} className="space-y-3 text-xs pt-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nueva Zona:</label>
                  <select
                    value={newZone}
                    onChange={(e) => {
                      const z = e.target.value as 'A' | 'B' | 'C' | 'D';
                      setNewZone(z);
                      const targetZ = zones.find(item => item.code === z);
                      if (targetZ && targetZ.aisles[0]) {
                        setNewAisle(targetZ.aisles[0].code);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-700"
                  >
                    <option value="A">Zona A (Ferretería & EPPs)</option>
                    <option value="B">Zona B (Carga Pesada & Racks)</option>
                    <option value="C">Zona C (Técnico Climatizado)</option>
                    <option value="D">Zona D (Embalaje & Despacho)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nuevo Pasillo:</label>
                  <select
                    value={newAisle}
                    onChange={(e) => setNewAisle(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-700 font-mono"
                  >
                    {zones.find(z => z.code === newZone)?.aisles.map(a => (
                      <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Rack:</label>
                  <input
                    type="text"
                    value={newRack}
                    onChange={(e) => setNewRack(e.target.value)}
                    className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Posición / Bin:</label>
                  <input
                    type="text"
                    value={newBin}
                    onChange={(e) => setNewBin(e.target.value)}
                    className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRelocatingProduct(null)}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold bg-slate-900 text-white rounded hover:bg-slate-800"
                >
                  Confirmar Traslado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
