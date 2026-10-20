import React, { useMemo, useState } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  AlertTriangle, 
  Download, 
  Printer, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  FileSpreadsheet,
  FileText,
  Calendar,
  Check,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { exportKardexValorizadoPDF, exportMovimientosMensualesPDF } from '../utils/pdfExport';

export const AuditReportsView: React.FC = () => {
  const { products, movements, suppliers, currencySymbol, activeWarehouse } = useWarehouse();

  // Export states
  const [isExportingKardex, setIsExportingKardex] = useState(false);
  const [isExportingMonthly, setIsExportingMonthly] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('2026-10');

  // Available months extracted from movements
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    set.add('2026-10');
    set.add('2026-09');
    for (const m of movements) {
      if (m.date) {
        set.add(m.date.slice(0, 7));
      }
    }
    return Array.from(set).sort().reverse();
  }, [movements]);

  // Category breakdown
  const categorySummary = useMemo(() => {
    const summary: Record<string, { count: number; units: number; totalCost: number; totalSale: number }> = {};
    
    for (const p of products) {
      if (!summary[p.category]) {
        summary[p.category] = { count: 0, units: 0, totalCost: 0, totalSale: 0 };
      }
      summary[p.category].count += 1;
      summary[p.category].units += p.stock;
      summary[p.category].totalCost += p.stock * p.purchasePrice;
      summary[p.category].totalSale += p.stock * p.salePrice;
    }

    return Object.entries(summary).map(([category, stats]) => ({
      category,
      ...stats,
      marginPercent: stats.totalCost > 0 ? ((stats.totalSale - stats.totalCost) / stats.totalCost) * 100 : 0
    }));
  }, [products]);

  // Replenishment candidates (stock <= minStock)
  const replenishmentList = useMemo(() => {
    return products
      .filter(p => p.stock <= p.minStock)
      .map(p => {
        const suggestedOrderQty = Math.max(0, p.maxStock - p.stock);
        const estimatedBudget = suggestedOrderQty * p.purchasePrice;
        return {
          ...p,
          suggestedOrderQty,
          estimatedBudget
        };
      })
      .sort((a, b) => (a.stock / a.minStock) - (b.stock / b.minStock));
  }, [products]);

  const totalReplenishmentBudget = replenishmentList.reduce((acc, i) => acc + i.estimatedBudget, 0);
  const totalInventoryCost = products.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0);
  const totalCommercialValue = products.reduce((acc, p) => acc + (p.stock * p.salePrice), 0);

  // Trigger PDF Downloads
  const handleDownloadKardexPDF = () => {
    setIsExportingKardex(true);
    setTimeout(() => {
      try {
        exportKardexValorizadoPDF({
          movements,
          products,
          currencySymbol,
          warehouseName: activeWarehouse
        });
      } catch (err) {
        console.error('Error generating Kardex PDF:', err);
        alert('Ocurrió un error al generar el PDF del Kárdex.');
      } finally {
        setIsExportingKardex(false);
      }
    }, 250);
  };

  const handleDownloadMonthlyPDF = () => {
    setIsExportingMonthly(true);
    setTimeout(() => {
      try {
        const monthNames: Record<string, string> = {
          '2026-10': 'Octubre 2026',
          '2026-09': 'Septiembre 2026',
          '2026-08': 'Agosto 2026',
          '2026-11': 'Noviembre 2026'
        };
        const formattedMonth = monthNames[selectedMonth] || selectedMonth;

        exportMovimientosMensualesPDF({
          movements,
          products,
          month: formattedMonth,
          currencySymbol,
          warehouseName: activeWarehouse
        });
      } catch (err) {
        console.error('Error generating Monthly PDF:', err);
        alert('Ocurrió un error al generar el PDF de movimientos.');
      } finally {
        setIsExportingMonthly(false);
      }
    }, 250);
  };

  // CSV Export for Audit
  const exportAuditCSV = () => {
    const headers = ['Categoria', 'Cantidad_SKUs', 'Unidades_En_Stock', 'Costo_Total', 'Valor_Comercial', 'Margen_Estimado_Pct'];
    const rows = categorySummary.map(c => [
      `"${c.category}"`,
      c.count,
      c.units,
      c.totalCost.toFixed(2),
      c.totalSale.toFixed(2),
      c.marginPercent.toFixed(1)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_almacen_pf_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Informes & Auditoría Valorizada</h2>
          <p className="text-xs text-slate-500">Valuación contable de inventario, kárdex descargable en PDF y flujo de movimientos mensuales</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadKardexPDF}
            disabled={isExportingKardex}
            className="px-3 py-2 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {isExportingKardex ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <FileText className="w-4 h-4 text-emerald-400" />
            )}
            <span>Descargar Kárdex PDF</span>
          </button>

          <button
            onClick={handleDownloadMonthlyPDF}
            disabled={isExportingMonthly}
            className="px-3 py-2 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {isExportingMonthly ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Calendar className="w-4 h-4 text-blue-200" />
            )}
            <span>Reporte Mensual PDF</span>
          </button>

          <button
            onClick={exportAuditCSV}
            className="px-3 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Featured PDF Download Hub Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-5 border border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Generador Oficial de Documentos Contables y Auditoría</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">Exportación Formal en PDF</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Descargue documentos oficiales formateados para presentación contable, fiscalización o informes de gerencia.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-slate-400 font-medium">Período Mensual:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-900 text-white font-mono border border-slate-600 rounded px-2 py-1 text-xs focus:outline-hidden"
            >
              {availableMonths.map(m => (
                <option key={m} value={m}>
                  {m === '2026-10' ? 'Octubre 2026 (Actual)' : m === '2026-09' ? 'Septiembre 2026' : m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {/* Format 1: Kardex Valorizado Horizontal */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Formato A4 Horizontal
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {movements.length} asientos
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1">Kárdex Permanente Valorizado</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Registro detallado de transacciones con número de Guía/Factura, código SKU, denominación, movimientos de entrada/salida a costo de adquisición y saldo físico valorizado.
              </p>
            </div>

            <button
              onClick={handleDownloadKardexPDF}
              disabled={isExportingKardex}
              className="w-full py-2 px-3 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isExportingKardex ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span>Descargar Kárdex Valorizado (PDF)</span>
            </button>
          </div>

          {/* Format 2: Reporte Mensual Vertical */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Formato A4 Vertical
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Cierre de Mes
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1">Reporte de Movimientos Mensuales</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Cuadro consolidado de compras vs. despachos en el período seleccionado, valorización monetaria de ingresos y salidas, incidencias de mermas y casillas de firma de auditoría.
              </p>
            </div>

            <button
              onClick={handleDownloadMonthlyPDF}
              disabled={isExportingMonthly}
              className="w-full py-2 px-3 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isExportingMonthly ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Calendar className="w-4 h-4" />
              )}
              <span>Descargar Reporte Mensual (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Costo Neto en Existencias</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {currencySymbol}{totalInventoryCost.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Calculado sobre {products.reduce((acc, p) => acc + p.stock, 0)} unidades físicas
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Valorización de Venta</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {currencySymbol}{totalCommercialValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            Margen bruto proyectado: +{totalInventoryCost > 0 ? (((totalCommercialValue - totalInventoryCost) / totalInventoryCost) * 100).toFixed(1) : 0}%
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Presupuesto Sugerido Reposición</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-900 mt-1">
            {currencySymbol}{totalReplenishmentBudget.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-amber-800 mt-1">
            Para abastecer los {replenishmentList.length} artículos críticos a su nivel óptimo
          </div>
        </div>
      </div>

      {/* Category Valuation Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-5 space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Distribución de Capital por Categoría</h3>
            <p className="text-xs text-slate-500">Concentración de activos e inventario en almacén</p>
          </div>
          <span className="text-xs font-mono text-slate-500 font-medium">
            {categorySummary.length} rubros activos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3">Categoría</th>
                <th className="py-2.5 px-3 text-center">SKUs</th>
                <th className="py-2.5 px-3 text-right">Unidades Físicas</th>
                <th className="py-2.5 px-3 text-right">Inversión Costo</th>
                <th className="py-2.5 px-3 text-right">Valor Venta</th>
                <th className="py-2.5 px-3 text-right">Margen Bruto</th>
                <th className="py-2.5 px-3 text-center">% del Capital</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categorySummary.map((cat, idx) => {
                const capitalShare = totalInventoryCost > 0 ? (cat.totalCost / totalInventoryCost) * 100 : 0;
                return (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{cat.category}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{cat.count}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">{cat.units} und</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900 font-medium">
                      {currencySymbol}{cat.totalCost.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                      {currencySymbol}{cat.totalSale.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-emerald-700">
                      +{cat.marginPercent.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-mono text-[11px] text-slate-600">{capitalShare.toFixed(1)}%</span>
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-slate-900 rounded-full" 
                            style={{ width: `${capitalShare}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Critical Replenishment Recommendations Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-5 space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Plan Maestro de Reposición Sugerida</h3>
          </div>
          <span className="text-xs text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded">
            {replenishmentList.length} ítems en alerta
          </span>
        </div>

        {replenishmentList.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">Todos los productos cuentan con niveles de stock óptimos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">SKU & Producto</th>
                  <th className="py-2.5 px-3 text-center">Stock Actual</th>
                  <th className="py-2.5 px-3 text-center">Stock Mín.</th>
                  <th className="py-2.5 px-3 text-center">Stock Máx.</th>
                  <th className="py-2.5 px-3 text-right">Pedido Sugerido</th>
                  <th className="py-2.5 px-3 text-right">Costo Unit.</th>
                  <th className="py-2.5 px-3 text-right">Presupuesto</th>
                  <th className="py-2.5 px-3">Proveedor Asignado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {replenishmentList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="font-mono text-[11px] text-slate-400">{item.sku}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-600">
                      {item.stock} {item.unit}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                      {item.minStock}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                      {item.maxStock}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      +{item.suggestedOrderQty} {item.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                      {currencySymbol}{item.purchasePrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-amber-900">
                      {currencySymbol}{item.estimatedBudget.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">
                      {item.supplierName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
