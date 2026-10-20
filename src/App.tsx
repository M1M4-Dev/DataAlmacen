import React, { useState } from 'react';
import { WarehouseProvider } from './context/WarehouseContext';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { MovementsView } from './components/MovementsView';
import { DispatchView } from './components/DispatchView';
import { SuppliersView } from './components/SuppliersView';
import { WarehouseZonesView } from './components/WarehouseZonesView';
import { AuditReportsView } from './components/AuditReportsView';
import { SettingsView } from './components/SettingsView';
import { VisionOcrScannerModal } from './components/VisionOcrScannerModal';
import { NewProductModal } from './components/NewProductModal';
import { NewMovementModal } from './components/NewMovementModal';
import { StockNotificationToastContainer } from './components/StockNotificationToastContainer';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isNewMovementOpen, setIsNewMovementOpen] = useState(false);
  const [isOcrScannerOpen, setIsOcrScannerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Contract (1-line Brand, 4-5 concise nav links, 1 primary action) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewProduct={() => setIsNewProductOpen(true)}
        onOpenNewMovement={() => setIsNewMovementOpen(true)}
        onOpenOcrScanner={() => setIsOcrScannerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenNewProduct={() => setIsNewProductOpen(true)}
            onOpenNewMovement={() => setIsNewMovementOpen(true)}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            onOpenNewProduct={() => setIsNewProductOpen(true)}
            onOpenNewMovement={() => setIsNewMovementOpen(true)}
            onNavigateToSettings={() => setActiveTab('settings')}
            onOpenOcrScanner={() => setIsOcrScannerOpen(true)}
          />
        )}

        {activeTab === 'movements' && (
          <MovementsView
            onOpenNewMovement={() => setIsNewMovementOpen(true)}
          />
        )}

        {activeTab === 'dispatch' && (
          <DispatchView />
        )}

        {activeTab === 'suppliers' && (
          <SuppliersView />
        )}

        {activeTab === 'zones' && (
          <WarehouseZonesView />
        )}

        {activeTab === 'reports' && (
          <AuditReportsView />
        )}

        {activeTab === 'settings' && (
          <SettingsView />
        )}
      </main>

      {/* Clean quiet footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <p className="font-semibold text-slate-700">Almacén PF · Reinterpretación de Sistema de Gestión de Almacén</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Control de existencias, kárdex permanente valorizado, topología de racks y despacho logístico.</p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Muelle Central 02</span>
            <span aria-hidden="true">·</span>
            <span>Norma ISO 9001:2015</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">v2.4 Production</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <NewProductModal
        isOpen={isNewProductOpen}
        onClose={() => setIsNewProductOpen(false)}
      />

      <NewMovementModal
        isOpen={isNewMovementOpen}
        onClose={() => setIsNewMovementOpen(false)}
      />

      {/* Real-time automated stock alert toasts */}
      <StockNotificationToastContainer
        onNavigateToOrders={() => setActiveTab('suppliers')}
      />

      {/* Google Cloud Vision OCR Text Detection Modal */}
      <VisionOcrScannerModal
        isOpen={isOcrScannerOpen}
        onClose={() => setIsOcrScannerOpen(false)}
        onProductFound={() => setActiveTab('inventory')}
      />
    </div>
  );
};

export default function App() {
  return (
    <WarehouseProvider>
      <MainLayout />
    </WarehouseProvider>
  );
}
