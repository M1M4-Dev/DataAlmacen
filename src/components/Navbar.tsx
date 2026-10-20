import React from 'react';
import { 
  Plus, 
  RefreshCw, 
  Warehouse,
  Scan
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { StockNotificationBell } from './StockNotificationBell';

export type NavTab = 'dashboard' | 'inventory' | 'movements' | 'dispatch' | 'suppliers' | 'zones' | 'reports' | 'settings';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenNewProduct: () => void;
  onOpenNewMovement: () => void;
  onOpenOcrScanner?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewMovement,
  onOpenOcrScanner
}) => {
  const { products, resetToDemoData } = useWarehouse();
  const criticalItems = products.filter(p => p.stock <= p.minStock).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white font-bold text-sm tracking-wider">
              PF
            </div>
            <a 
              href="#dashboard" 
              onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }} 
              className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-slate-700 transition-colors"
            >
              Almacén PF
            </a>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'inventory'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Inventario
              {criticalItems > 0 && (
                <span className="text-[11px] font-mono font-semibold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                  {criticalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('movements')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeTab === 'movements'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Movimientos
            </button>

            <button
              onClick={() => setActiveTab('dispatch')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeTab === 'dispatch'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Despacho & Ventas
            </button>

            <button
              onClick={() => setActiveTab('suppliers')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeTab === 'suppliers'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Proveedores
            </button>

            <button
              onClick={() => setActiveTab('zones')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeTab === 'zones'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Zonas & Racks
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeTab === 'reports'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Reportes
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Configuración
            </button>
          </nav>

          {/* Zone 3: Actions & utilities */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Stock Alerts Bell */}
            <StockNotificationBell
              onNavigateToInventory={() => setActiveTab('inventory')}
              onNavigateToOrders={() => setActiveTab('suppliers')}
              onNavigateToSettings={() => setActiveTab('settings')}
            />

            {/* OCR Vision Scanner */}
            {onOpenOcrScanner && (
              <button
                type="button"
                onClick={onOpenOcrScanner}
                title="Lector OCR de etiquetas y guías de almacén (client.textDetection)"
                className="px-2.5 py-1.5 rounded text-xs text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Scan className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold hidden sm:inline">OCR Vision</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('settings')}
              title="Configuración y políticas de stock por categoría"
              className={`p-2 rounded text-xs transition-colors ${
                activeTab === 'settings'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="sr-only">Configuración</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <button
              onClick={() => {
                if (window.confirm('¿Desea restablecer todos los datos a la demostración inicial?')) {
                  resetToDemoData();
                }
              }}
              title="Restablecer datos de prueba"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors border border-slate-200 rounded hover:bg-slate-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Prueba</span>
            </button>

            <button
              onClick={onOpenNewMovement}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Registrar</span> Movimiento
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sub-navigation for small screens */}
      <div className="md:hidden border-t border-slate-200 overflow-x-auto px-4 py-2 flex items-center gap-4 text-xs font-medium text-slate-600 bg-slate-50">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={activeTab === 'dashboard' ? 'text-slate-900 font-bold whitespace-nowrap' : 'whitespace-nowrap'}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('inventory')} 
          className={activeTab === 'inventory' ? 'text-slate-900 font-bold whitespace-nowrap' : 'whitespace-nowrap'}
        >
          Inventario
        </button>
        <button 
          onClick={() => setActiveTab('movements')} 
          className={activeTab === 'movements' ? 'text-slate-900 font-bold whitespace-nowrap' : 'whitespace-nowrap'}
        >
          Movimientos
        </button>
        <button 
          onClick={() => setActiveTab('dispatch')} 
          className={activeTab === 'dispatch' ? 'text-slate-900 font-bold whitespace-nowrap' : 'whitespace-nowrap'}
        >
          Despacho
        </button>
        <button 
          onClick={() => setActiveTab('suppliers')} 
          className={activeTab === 'suppliers' ? 'text-slate-900 font-bold whitespace-nowrap' : 'whitespace-nowrap'}
        >
          Proveedores
        </button>
        <button 
          onClick={() => setActiveTab('zones')} 
          className={activeTab === 'zones' ? 'text-slate-900 font-bold whitespace-nowrap' : 'whitespace-nowrap'}
        >
          Zonas
        </button>
        <button 
          onClick={() => setActiveTab('reports')} 
          className={activeTab === 'reports' ? 'text-slate-900 font-bold whitespace-nowrap' : 'whitespace-nowrap'}
        >
          Reportes
        </button>
        <button 
          onClick={() => setActiveTab('settings')} 
          className={activeTab === 'settings' ? 'text-slate-900 font-bold whitespace-nowrap' : 'whitespace-nowrap'}
        >
          Configuración
        </button>
      </div>
    </header>
  );
};
