import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  AlertOctagon, 
  Check, 
  X, 
  ArrowUpRight, 
  ShoppingCart,
  Package,
  Sliders
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { NavTab } from './Navbar';

interface StockNotificationBellProps {
  onNavigateToInventory: () => void;
  onNavigateToOrders: () => void;
  onNavigateToSettings?: () => void;
}

export const StockNotificationBell: React.FC<StockNotificationBellProps> = ({
  onNavigateToInventory,
  onNavigateToOrders,
  onNavigateToSettings
}) => {
  const { 
    activeAlerts, 
    unreadAlertsCount, 
    markAlertAsRead, 
    markAllAlertsAsRead, 
    dismissAlert, 
    quickReorderProduct,
    soundEnabled,
    toggleSound,
    currencySymbol
  } = useWarehouse();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadAlertsCount > 0) {
            markAllAlertsAsRead();
          }
        }}
        title="Alertas automáticas de stock mínimo"
        className={`relative p-2 rounded transition-colors ${
          isOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Bell className="w-4 h-4" />
        {unreadAlertsCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-mono font-bold flex items-center justify-center animate-pulse">
            {unreadAlertsCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden text-xs">
          {/* Header */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Alertas de Reposición</span>
              <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded">
                {activeAlerts.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleSound}
                title={soundEnabled ? 'Silenciar alertas sonoras' : 'Activar alertas sonoras'}
                className="p-1 text-slate-500 hover:text-slate-800 rounded transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {unreadAlertsCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAlertsAsRead}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                >
                  Leídas
                </button>
              )}
            </div>
          </div>

          {/* Alerts List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {activeAlerts.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Check className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                <p className="font-semibold text-slate-700">Sin alertas pendientes</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Todos los artículos superan su stock mínimo de seguridad.</p>
              </div>
            ) : (
              activeAlerts.map(alert => {
                const isOutOfStock = alert.severity === 'out_of_stock';
                const suggestedQty = Math.max(1, alert.maxStock - alert.currentStock);

                return (
                  <div 
                    key={alert.id} 
                    className={`p-3 space-y-2 transition-colors ${
                      !alert.read ? 'bg-amber-50/40' : 'bg-white hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <div className={`p-1 rounded shrink-0 mt-0.5 ${
                          isOutOfStock ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {isOutOfStock ? <AlertOctagon className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 line-clamp-1">{alert.productName}</p>
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                            <span>{alert.sku}</span>
                            <span aria-hidden="true">·</span>
                            <span className={isOutOfStock ? 'text-rose-600 font-bold' : 'text-amber-800 font-bold'}>
                              Stock: {alert.currentStock} {alert.unit}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>Mín: {alert.minStock}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => dismissAlert(alert.id)}
                        title="Descartar alerta"
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-tight">
                      {alert.message}
                    </p>

                    {/* Quick Action buttons */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          quickReorderProduct(alert.productId);
                          setIsOpen(false);
                          onNavigateToOrders();
                        }}
                        className="px-2 py-1 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Generar OC (+{suggestedQty} {alert.unit})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          onNavigateToInventory();
                        }}
                        className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-0.5"
                      >
                        <span>Ver en catálogo</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
            {onNavigateToSettings && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToSettings();
                }}
                className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <span>Configurar Umbrales</span>
              </button>
            )}

            {activeAlerts.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToInventory();
                }}
                className="text-xs font-semibold text-slate-900 hover:text-blue-700 ml-auto"
              >
                Auditoría Completa →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
