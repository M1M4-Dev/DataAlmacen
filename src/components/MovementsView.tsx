import React, { useState, useMemo } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle, 
  Layers, 
  Search, 
  Plus, 
  Download, 
  Filter, 
  Calendar, 
  FileText
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { MovementType } from '../types/warehouse';
import { exportKardexValorizadoPDF } from '../utils/pdfExport';

interface MovementsViewProps {
  onOpenNewMovement: () => void;
}

export const MovementsView: React.FC<MovementsViewProps> = ({
  onOpenNewMovement
}) => {
  const { movements, products, currencySymbol, activeWarehouse } = useWarehouse();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');

  // Filtered movements
  const filteredMovements = useMemo(() => {
    return movements.filter(mov => {
      const matchesSearch = 
        mov.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.referenceDoc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.operator.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedType === 'all' || mov.type === selectedType;
      const matchesProduct = selectedProduct === 'all' || mov.productId === selectedProduct;

      return matchesSearch && matchesType && matchesProduct;
    });
  }, [movements, searchTerm, selectedType, selectedProduct]);

  // Aggregate statistics
  const totalEntries = filteredMovements.filter(m => m.type === 'IN').reduce((acc, m) => acc + m.quantity, 0);
  const totalEntriesValue = filteredMovements.filter(m => m.type === 'IN').reduce((acc, m) => acc + m.totalValue, 0);

  const totalExits = filteredMovements.filter(m => m.type === 'OUT').reduce((acc, m) => acc + m.quantity, 0);
  const totalExitsValue = filteredMovements.filter(m => m.type === 'OUT').reduce((acc, m) => acc + m.totalValue, 0);

  // CSV Export Handler
  const exportKardexCSV = () => {
    const headers = ['Fecha', 'Tipo', 'Documento', 'SKU', 'Producto', 'Concepto', 'Cantidad', 'Costo_Unitario', 'Valor_Total', 'Saldo_Stock', 'Operador'];
    const rows = filteredMovements.map(m => [
      `"${m.date}"`,
      m.type,
      `"${m.referenceDoc}"`,
      m.sku,
      `"${m.productName.replace(/"/g, '""')}"`,
      `"${m.concept.replace(/"/g, '""')}"`,
      m.quantity,
      m.unitCost,
      m.totalValue,
      m.newStock,
      `"${m.operator}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kardex_movimientos_almacen_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    exportKardexValorizadoPDF({
      movements: filteredMovements,
      products,
      currencySymbol,
      warehouseName: activeWarehouse
    });
  };

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Kárdex Valorizado de Almacén</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Registro oficial de transacciones de stock</span>
            <span aria-hidden="true">·</span>
            <span>Método de valoración: Costo Promedio Ponderado / FIFO</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            className="px-3 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-800 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Kárdex PDF</span>
          </button>

          <button
            onClick={exportKardexCSV}
            className="px-3 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>CSV</span>
          </button>

          <button
            onClick={onOpenNewMovement}
            className="px-3.5 py-2 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Movimiento</span>
          </button>
        </div>
      </div>

      {/* Movement stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Entradas Registradas</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
            +{totalEntries} <span className="text-xs font-normal text-slate-500 font-sans">unidades</span>
          </div>
          <div className="text-xs text-emerald-700 font-mono mt-1">
            Valor ingresado: {currencySymbol}{totalEntriesValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Salidas / Despachos</span>
            <div className="p-1.5 bg-blue-50 text-blue-700 rounded">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
            -{totalExits} <span className="text-xs font-normal text-slate-500 font-sans">unidades</span>
          </div>
          <div className="text-xs text-blue-700 font-mono mt-1">
            Valor despachado: {currencySymbol}{totalExitsValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Transacciones</span>
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
            {filteredMovements.length} <span className="text-xs font-normal text-slate-500 font-sans">asientos</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Trazabilidad documentaria completa
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por documento (GR/FAC/VAL), producto, concepto u operador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full md:w-44 py-1.5 px-2.5 text-xs border border-slate-300 rounded bg-white text-slate-700"
          >
            <option value="all">Todos los tipos</option>
            <option value="IN">Entradas (IN)</option>
            <option value="OUT">Salidas (OUT)</option>
            <option value="ADJUST">Ajustes de Inventario</option>
            <option value="TRANSFER">Transferencias</option>
          </select>

          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full md:w-56 py-1.5 px-2.5 text-xs border border-slate-300 rounded bg-white text-slate-700 truncate"
          >
            <option value="all">Todos los productos</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.sku} - {p.name.slice(0, 24)}...</option>
            ))}
          </select>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold tracking-wider uppercase text-[11px]">
                <th className="py-3 px-4">Fecha & Hora</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Documento Ref.</th>
                <th className="py-3 px-4">Producto & SKU</th>
                <th className="py-3 px-4">Concepto / Detalle</th>
                <th className="py-3 px-4 text-right">Movimiento</th>
                <th className="py-3 px-4 text-right">Costo Unit.</th>
                <th className="py-3 px-4 text-right">Saldo Final</th>
                <th className="py-3 px-4">Operador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <p className="font-medium text-sm">No hay movimientos registrados con los filtros seleccionados</p>
                  </td>
                </tr>
              ) : (
                filteredMovements.map(mov => {
                  const isEntry = mov.type === 'IN';
                  const isExit = mov.type === 'OUT';
                  const isAdjust = mov.type === 'ADJUST';

                  return (
                    <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Date */}
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {mov.date}
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isEntry ? 'bg-emerald-50 text-emerald-800' :
                          isExit ? 'bg-blue-50 text-blue-800' :
                          isAdjust ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {isEntry && <ArrowDownLeft className="w-3 h-3" />}
                          {isExit && <ArrowUpRight className="w-3 h-3" />}
                          {isAdjust && <AlertTriangle className="w-3 h-3" />}
                          {mov.type === 'TRANSFER' && <Layers className="w-3 h-3" />}
                          <span>{mov.type}</span>
                        </span>
                      </td>

                      {/* Reference Document */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {mov.referenceDoc}
                      </td>

                      {/* Product */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 max-w-xs truncate" title={mov.productName}>
                          {mov.productName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {mov.sku}
                        </div>
                      </td>

                      {/* Concept */}
                      <td className="py-3 px-4 text-slate-600 max-w-xs">
                        <div className="truncate" title={mov.concept}>{mov.concept}</div>
                        {mov.notes && (
                          <div className="text-[11px] text-slate-400 italic truncate">{mov.notes}</div>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                        <span className={`font-bold ${
                          isEntry ? 'text-emerald-700' : isExit ? 'text-blue-900' : 'text-amber-800'
                        }`}>
                          {isEntry ? `+${mov.quantity}` : isExit ? `-${mov.quantity}` : `${mov.quantity > 0 ? '+' : ''}${mov.quantity}`}
                        </span>
                      </td>

                      {/* Unit Cost */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {currencySymbol}{mov.unitCost.toFixed(2)}
                      </td>

                      {/* New Stock Balance */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                        {mov.newStock} und
                      </td>

                      {/* Operator */}
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                        {mov.operator}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
