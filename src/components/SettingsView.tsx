import React, { useState } from 'react';
import { 
  Sliders, 
  Settings, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  DollarSign, 
  Volume2, 
  VolumeX, 
  Warehouse, 
  Save, 
  RotateCcw, 
  AlertTriangle,
  Info,
  Package
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { Product } from '../types/warehouse';

export const SettingsView: React.FC = () => {
  const { 
    categoryThresholds, 
    updateCategoryThreshold, 
    applyCategoryThresholdsToAllProducts, 
    resetCategoryThresholds,
    products, 
    activeAlerts,
    currencySymbol, 
    setCurrencySymbol,
    activeWarehouse, 
    setActiveWarehouse,
    soundEnabled, 
    toggleSound,
    resetToDemoData
  } = useWarehouse();

  // Local draft state for threshold inputs to provide smooth typing
  const [draftThresholds, setDraftThresholds] = useState(() => 
    categoryThresholds.map(t => ({ ...t }))
  );

  const [savedCategoryId, setSavedCategoryId] = useState<string | null>(null);
  const [applyResultBanner, setApplyResultBanner] = useState<{
    message: string;
    affected: number;
    alertsCount: number;
  } | null>(null);

  // Sync draft if external context categoryThresholds change
  React.useEffect(() => {
    setDraftThresholds(categoryThresholds.map(t => ({ ...t })));
  }, [categoryThresholds]);

  const handleDraftChange = (category: Product['category'], field: 'defaultMinStock' | 'defaultMaxStock' | 'safetyBufferDays' | 'autoApplyToNew' | 'notes', value: any) => {
    setDraftThresholds(prev => prev.map(item => {
      if (item.category === category) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSaveThreshold = (cat: Product['category']) => {
    const draft = draftThresholds.find(d => d.category === cat);
    if (!draft) return;

    updateCategoryThreshold(
      draft.category,
      Number(draft.defaultMinStock) || 1,
      Number(draft.defaultMaxStock) || 10,
      draft.autoApplyToNew,
      draft.notes
    );

    setSavedCategoryId(cat);
    setTimeout(() => setSavedCategoryId(null), 2500);
  };

  const handleApplySingleCategory = (cat: Product['category']) => {
    // First save any unsaved changes
    handleSaveThreshold(cat);
    const result = applyCategoryThresholdsToAllProducts(cat);
    setApplyResultBanner({
      message: `Se actualizaron los umbrales para los productos de "${cat}".`,
      affected: result.affectedCount,
      alertsCount: result.newAlertsCount
    });
    setTimeout(() => setApplyResultBanner(null), 6000);
  };

  const handleApplyAllCategories = () => {
    // Save all drafts first
    draftThresholds.forEach(draft => {
      updateCategoryThreshold(
        draft.category,
        Number(draft.defaultMinStock) || 1,
        Number(draft.defaultMaxStock) || 10,
        draft.autoApplyToNew,
        draft.notes
      );
    });

    const result = applyCategoryThresholdsToAllProducts();
    setApplyResultBanner({
      message: 'Se actualizaron los umbrales de stock en todo el catálogo de inventario.',
      affected: result.affectedCount,
      alertsCount: result.newAlertsCount
    });
    setTimeout(() => setApplyResultBanner(null), 6000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('¿Restablecer los umbrales de stock a los valores predeterminados de fábrica?')) {
      resetCategoryThresholds();
      setApplyResultBanner({
        message: 'Umbrales restablecidos a los valores estándar de fábrica.',
        affected: 0,
        alertsCount: activeAlerts.length
      });
      setTimeout(() => setApplyResultBanner(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Configuración & Políticas de Inventario</h2>
          <p className="text-xs text-slate-500">Definición centralizada de umbrales de stock mínimo/máximo por categoría y automatización de alertas</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>Valores Predeterminados</span>
          </button>

          <button
            onClick={handleApplyAllCategories}
            className="px-3.5 py-1.5 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Aplicar a Todo el Catálogo ({products.length} SKUs)</span>
          </button>
        </div>
      </div>

      {/* Result Notification Banner */}
      {applyResultBanner && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-900 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold">{applyResultBanner.message}</p>
              <p className="text-emerald-700 text-[11px] mt-0.5 font-mono">
                {applyResultBanner.affected} productos actualizados · {applyResultBanner.alertsCount} productos actualmente en alerta de reposición.
              </p>
            </div>
          </div>
          <button
            onClick={() => setApplyResultBanner(null)}
            className="text-xs text-emerald-800 hover:text-emerald-950 font-medium"
          >
            Entendido
          </button>
        </div>
      )}

      {/* SECTION 1: Category Thresholds Configuration */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-5 space-y-4">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">Umbrales de Stock por Categoría Técnica</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Al modificar el stock mínimo, el motor de alertas recalcula automáticamente el estado de existencia de cada artículo.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded">
            <span>Alertas activas ahora:</span>
            <strong className="text-amber-800">{activeAlerts.length}</strong>
          </div>
        </div>

        {/* Categories Thresholds Grid */}
        <div className="space-y-3">
          {draftThresholds.map((threshold) => {
            const categoryProducts = products.filter(p => p.category === threshold.category);
            const totalStockInCategory = categoryProducts.reduce((acc, p) => acc + p.stock, 0);
            const lowStockCount = categoryProducts.filter(p => p.stock <= p.minStock).length;
            const isSaved = savedCategoryId === threshold.category;

            return (
              <div 
                key={threshold.category}
                className="p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{threshold.category}</h4>
                      <span className="text-[11px] font-mono px-2 py-0.2 bg-slate-100 text-slate-700 rounded font-semibold">
                        {categoryProducts.length} SKUs catalogados
                      </span>
                      {lowStockCount > 0 && (
                        <span className="text-[11px] font-mono px-2 py-0.2 bg-amber-100 text-amber-800 rounded font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-700" />
                          {lowStockCount} en alerta
                        </span>
                      )}
                    </div>
                    {threshold.notes && (
                      <p className="text-xs text-slate-500 mt-0.5">{threshold.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSaveThreshold(threshold.category)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs ${
                        isSaved 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {isSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                      <span>{isSaved ? 'Guardado' : 'Guardar Regla'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplySingleCategory(threshold.category)}
                      title={`Actualizar los ${categoryProducts.length} productos de esta categoría`}
                      className="px-3 py-1.5 rounded text-xs font-semibold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                      Aplicar a {categoryProducts.length} SKUs
                    </button>
                  </div>
                </div>

                {/* Threshold Input Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
                  {/* Min Stock */}
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Stock Mínimo (Disparador de Alerta):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={threshold.defaultMinStock}
                        onChange={(e) => handleDraftChange(threshold.category, 'defaultMinStock', Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-2.5 py-1.5 font-mono font-bold text-slate-900 border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
                        und
                      </span>
                    </div>
                  </div>

                  {/* Max Stock */}
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Stock Máximo (Capacidad Óptima):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={threshold.defaultMinStock + 1}
                        value={threshold.defaultMaxStock}
                        onChange={(e) => handleDraftChange(threshold.category, 'defaultMaxStock', Math.max(threshold.defaultMinStock + 1, parseInt(e.target.value) || 10))}
                        className="w-full px-2.5 py-1.5 font-mono font-bold text-slate-900 border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
                        und
                      </span>
                    </div>
                  </div>

                  {/* Safety Buffer Days */}
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Buffer de Seguridad (Lead Time):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={threshold.safetyBufferDays}
                        onChange={(e) => handleDraftChange(threshold.category, 'safetyBufferDays', Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
                        días
                      </span>
                    </div>
                  </div>

                  {/* Auto Apply to new checkbox */}
                  <div className="flex flex-col justify-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
                      <input
                        type="checkbox"
                        checked={threshold.autoApplyToNew}
                        onChange={(e) => handleDraftChange(threshold.category, 'autoApplyToNew', e.target.checked)}
                        className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-500"
                      />
                      <span className="text-[11px] font-medium leading-tight">
                        Asignar por defecto al crear nuevos artículos
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: General Warehouse System Settings */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-5 space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Parámetros Operativos del Almacén</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Sede Principal</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Facility Name */}
          <div>
            <label className="block text-slate-700 font-medium mb-1">Nombre de la Sede / Centro Logístico:</label>
            <div className="relative">
              <Warehouse className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={activeWarehouse}
                onChange={(e) => setActiveWarehouse(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Aparece en guías, vales de salida y documentos PDF de auditoría.</p>
          </div>

          {/* Currency Symbol */}
          <div>
            <label className="block text-slate-700 font-medium mb-1">Moneda del Sistema:</label>
            <div className="relative">
              <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <select
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded bg-white text-slate-900 font-mono"
              >
                <option value="$">Dólar Estadounidense ($ USD)</option>
                <option value="S/.">Sol Peruano (S/. PEN)</option>
                <option value="€">Euro (€ EUR)</option>
                <option value="MXN $">Peso Mexicano (MXN $)</option>
                <option value="COP $">Peso Colombiano (COP $)</option>
              </select>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Símbolo monetario aplicado en kárdex, valorizaciones y compras.</p>
          </div>

          {/* Sound Notification Alert */}
          <div>
            <label className="block text-slate-700 font-medium mb-1">Alertas Sonoras (Web Audio):</label>
            <button
              type="button"
              onClick={toggleSound}
              className={`w-full py-1.5 px-3 rounded border font-medium flex items-center justify-between transition-colors ${
                soundEnabled 
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900' 
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              <span className="flex items-center gap-2">
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                <span>{soundEnabled ? 'Avisos Sonoros Activados' : 'Avisos Sonoros Silenciados'}</span>
              </span>
              <span className="font-mono text-[11px] font-bold">
                {soundEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
            <p className="text-[10px] text-slate-400 mt-1">Emite un tono audible al registrar salidas que vulneren el stock mínimo.</p>
          </div>
        </div>

        {/* Demo reset card */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded text-xs">
          <div>
            <p className="font-semibold text-slate-800">Restablecer Base de Datos de Prueba</p>
            <p className="text-[11px] text-slate-500">Recarga los artículos iniciales, proveedores y movimientos de demostración.</p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('¿Desea restablecer completamente el sistema con los datos de prueba?')) {
                resetToDemoData();
              }
            }}
            className="px-3 py-1.5 text-xs text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded font-medium transition-colors whitespace-nowrap shadow-2xs"
          >
            Restablecer Todo a Modo Demo
          </button>
        </div>
      </div>
    </div>
  );
};
