import React from 'react';
import { AlertOctagon, AlertTriangle, X, ShoppingCart } from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';

interface StockNotificationToastContainerProps {
  onNavigateToOrders: () => void;
}

export const StockNotificationToastContainer: React.FC<StockNotificationToastContainerProps> = ({
  onNavigateToOrders
}) => {
  const { liveToasts, dismissToast, quickReorderProduct } = useWarehouse();

  if (liveToasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {liveToasts.map(toast => {
        const isOutOfStock = toast.severity === 'out_of_stock';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-lg border shadow-xl text-xs space-y-2 transition-all transform animate-in slide-in-from-bottom-3 duration-200 ${
              isOutOfStock 
                ? 'bg-rose-950 text-white border-rose-800' 
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className={`p-1.5 rounded shrink-0 mt-0.5 ${
                  isOutOfStock ? 'bg-rose-800 text-rose-200' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {isOutOfStock ? <AlertOctagon className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                </div>

                <div>
                  <h4 className="font-bold text-white text-xs">{toast.title}</h4>
                  <p className="font-semibold text-slate-200 mt-0.5">{toast.productName}</p>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    SKU: {toast.sku} · Stock actual: <strong className={isOutOfStock ? 'text-rose-300' : 'text-amber-300'}>{toast.currentStock}</strong> / Mínimo: {toast.minStock}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-300 leading-snug">
              {toast.message}
            </p>

            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">
                {toast.timestamp} · Almacén Central
              </span>

              <button
                type="button"
                onClick={() => {
                  quickReorderProduct(toast.productId);
                  dismissToast(toast.id);
                  onNavigateToOrders();
                }}
                className={`px-3 py-1.5 rounded font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs ${
                  isOutOfStock 
                    ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                    : 'bg-white hover:bg-slate-100 text-slate-900'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Generar OC (+{toast.suggestedReorder})</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
