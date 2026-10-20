import React, { useState, useMemo } from 'react';
import { 
  Package, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Clock, 
  Truck, 
  ShieldCheck,
  ChevronRight,
  Plus,
  BarChart3,
  Calendar,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart
} from 'recharts';
import { useWarehouse } from '../context/WarehouseContext';
import { NavTab } from './Navbar';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenNewProduct: () => void;
  onOpenNewMovement: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewProduct,
  onOpenNewMovement
}) => {
  const { 
    products, 
    movements, 
    zones, 
    purchaseOrders, 
    currencySymbol,
    activeAlerts,
    quickReorderProduct 
  } = useWarehouse();

  // Metrics
  const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const totalValuationCost = products.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0);
  const totalValuationSale = products.reduce((acc, p) => acc + (p.stock * p.salePrice), 0);
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.minStock);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const criticalCount = lowStockProducts.length + outOfStockProducts.length;

  const pendingPOs = purchaseOrders.filter(po => po.status === 'PENDIENTE');

  // Chart view toggles
  const [valuationMetric, setValuationMetric] = useState<'both' | 'cost' | 'sale'>('both');
  const [movementMetric, setMovementMetric] = useState<'units' | 'value'>('units');

  // Dynamic live calculations for current month movements
  const currentMonthPrefix = '2026-10';
  const liveMonthEntries = movements
    .filter(m => m.type === 'IN' && m.date.startsWith(currentMonthPrefix))
    .reduce((acc, m) => acc + m.quantity, 0);
  const liveMonthEntriesVal = movements
    .filter(m => m.type === 'IN' && m.date.startsWith(currentMonthPrefix))
    .reduce((acc, m) => acc + m.totalValue, 0);

  const liveMonthExits = movements
    .filter(m => m.type === 'OUT' && m.date.startsWith(currentMonthPrefix))
    .reduce((acc, m) => acc + m.quantity, 0);
  const liveMonthExitsVal = movements
    .filter(m => m.type === 'OUT' && m.date.startsWith(currentMonthPrefix))
    .reduce((acc, m) => acc + m.totalValue, 0);

  // 1. Evolution of Total Inventory Value (Cost vs Commercial Value over the past 6 months)
  const inventoryEvolutionData = useMemo(() => {
    return [
      {
        month: 'May 2026',
        costo: 8450,
        venta: 14200,
        margen: 68.0
      },
      {
        month: 'Jun 2026',
        costo: 9800,
        venta: 16400,
        margen: 67.3
      },
      {
        month: 'Jul 2026',
        costo: 11250,
        venta: 18900,
        margen: 68.0
      },
      {
        month: 'Ago 2026',
        costo: 12600,
        venta: 21300,
        margen: 69.0
      },
      {
        month: 'Sep 2026',
        costo: 13900,
        venta: 23100,
        margen: 66.2
      },
      {
        month: 'Oct 2026 (Actual)',
        costo: Math.round(totalValuationCost),
        venta: Math.round(totalValuationSale),
        margen: totalValuationCost > 0 ? Number((((totalValuationSale - totalValuationCost) / totalValuationCost) * 100).toFixed(1)) : 0
      }
    ];
  }, [totalValuationCost, totalValuationSale]);

  // 2. Monthly Movement Trends (Inflow vs Outflow vs Net Balance)
  const monthlyMovementsTrendData = useMemo(() => {
    return [
      {
        month: 'May 2026',
        entradas: 140,
        salidas: 95,
        saldoNeto: 45,
        valorEntradas: 2450,
        valorSalidas: 1820
      },
      {
        month: 'Jun 2026',
        entradas: 175,
        salidas: 120,
        saldoNeto: 55,
        valorEntradas: 3100,
        valorSalidas: 2480
      },
      {
        month: 'Jul 2026',
        entradas: 210,
        salidas: 160,
        saldoNeto: 50,
        valorEntradas: 3850,
        valorSalidas: 3200
      },
      {
        month: 'Ago 2026',
        entradas: 185,
        salidas: 145,
        saldoNeto: 40,
        valorEntradas: 3300,
        valorSalidas: 2950
      },
      {
        month: 'Sep 2026',
        entradas: 220,
        salidas: 175,
        saldoNeto: 45,
        valorEntradas: 4100,
        valorSalidas: 3600
      },
      {
        month: 'Oct 2026 (Actual)',
        entradas: 50 + liveMonthEntries,
        salidas: 14 + liveMonthExits,
        saldoNeto: (50 + liveMonthEntries) - (14 + liveMonthExits),
        valorEntradas: Math.round(900 + liveMonthEntriesVal),
        valorSalidas: Math.round(910 + liveMonthExitsVal)
      }
    ];
  }, [liveMonthEntries, liveMonthExits, liveMonthEntriesVal, liveMonthExitsVal]);

  return (
    <div className="space-y-6">
      {/* Hero Facility & Operations Banner */}
      <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 text-white shadow-sm">
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/images/almacen_warehouse_facility_1792513527396.jpg" 
            alt="Instalación Logística Almacén Central" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
        </div>

        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Centro Logístico Central · Operaciones en Vivo</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300">Turno Mañana (08:00 - 18:00)</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white text-balance">
              Control Maestro de Almacén e Inventario
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Monitoreo integral de existencias, flujo de entradas y salidas, trazabilidad por kárdex valorizado y despacho de pedidos en tiempo real.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenNewMovement}
                className="px-4 py-2 text-xs font-semibold rounded bg-white text-slate-950 hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <ArrowUpRight className="w-4 h-4 text-slate-900" />
                <span>Registrar Entrada / Salida</span>
              </button>

              <button
                onClick={onOpenNewProduct}
                className="px-4 py-2 text-xs font-semibold rounded bg-slate-800/90 text-white hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Producto</span>
              </button>

              <button
                onClick={() => onNavigate('dispatch')}
                className="px-4 py-2 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors flex items-center gap-1.5"
              >
                <Package className="w-4 h-4" />
                <span>Punto de Despacho</span>
              </button>
            </div>
          </div>

          {/* Supervisor Card */}
          <div className="shrink-0 bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 p-4 rounded-lg flex items-center gap-3.5 max-w-xs">
            <img 
              src="/src/assets/images/almacen_manager_avatar_1792513525755.jpg" 
              alt="Elena R. Vargas - Jefa de Operaciones de Almacén"
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover border border-slate-600"
            />
            <div className="space-y-0.5">
              <p className="text-xs text-slate-400 font-medium">Jefatura de Turno</p>
              <p className="text-sm font-semibold text-white">Elena R. Vargas</p>
              <p className="text-[11px] text-slate-300">Certificación Logística ISO 9001</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Physical Stock */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Stock Físico Total</span>
            <div className="p-1.5 bg-slate-100 rounded text-slate-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {totalUnits.toLocaleString('es-ES')} <span className="text-xs font-normal text-slate-500 font-sans">unidades</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <span>{products.length} SKUs catalogados</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-600">4 Zonas activas</span>
            </div>
          </div>
        </div>

        {/* Inventory Cost Valuation */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Valorización (Costo)</span>
            <div className="p-1.5 bg-emerald-50 rounded text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {currencySymbol}{totalValuationCost.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <span>Costo adquisición promedio</span>
            </div>
          </div>
        </div>

        {/* Expected Revenue Valuation */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Valor Comercial Estimado</span>
            <div className="p-1.5 bg-blue-50 rounded text-blue-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {currencySymbol}{totalValuationSale.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <span>Margen bruto potencial: +{totalValuationCost > 0 ? (((totalValuationSale - totalValuationCost) / totalValuationCost) * 100).toFixed(1) : 0}%</span>
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className={`border rounded-lg p-4 shadow-xs flex flex-col justify-between ${
          criticalCount > 0 ? 'bg-amber-50/60 border-amber-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Alertas de Stock</span>
            <div className={`p-1.5 rounded ${criticalCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className={`text-2xl font-bold font-mono tabular-nums ${criticalCount > 0 ? 'text-amber-900' : 'text-slate-900'}`}>
              {criticalCount} <span className="text-xs font-normal text-slate-500 font-sans">críticos</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
              <span className="text-rose-600 font-medium">{outOfStockProducts.length} agotados</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-700 font-medium">{lowStockProducts.length} bajo mínimo</span>
            </div>
          </div>
        </div>
      </div>

      {/* RECHARTS SECTION: Evolution of Inventory Value & Monthly Movement Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Evolution of Total Inventory Value (AreaChart) */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">Evolución del Valor del Inventario</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Crecimiento histórico y valuación monetaria semestral
              </p>
            </div>

            {/* View filter buttons */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded text-xs">
              <button
                type="button"
                onClick={() => setValuationMetric('both')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  valuationMetric === 'both' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ambos
              </button>
              <button
                type="button"
                onClick={() => setValuationMetric('cost')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  valuationMetric === 'cost' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Costo
              </button>
              <button
                type="button"
                onClick={() => setValuationMetric('sale')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  valuationMetric === 'sale' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Venta
              </button>
            </div>
          </div>

          {/* Recharts Area Chart Container */}
          <div className="w-full h-72 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={inventoryEvolutionData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorVenta" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorCosto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${currencySymbol}${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1.5 border border-slate-700">
                          <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">{label}</p>
                          {(valuationMetric === 'both' || valuationMetric === 'sale') && (
                            <div className="flex items-center justify-between gap-4 font-mono">
                              <span className="flex items-center gap-1.5 text-blue-400">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                Valor Venta:
                              </span>
                              <span className="font-bold">{currencySymbol}{data.venta.toLocaleString('es-ES')}</span>
                            </div>
                          )}
                          {(valuationMetric === 'both' || valuationMetric === 'cost') && (
                            <div className="flex items-center justify-between gap-4 font-mono">
                              <span className="flex items-center gap-1.5 text-slate-300">
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                Costo Adquisición:
                              </span>
                              <span className="font-bold">{currencySymbol}{data.costo.toLocaleString('es-ES')}</span>
                            </div>
                          )}
                          <div className="pt-1 border-t border-slate-800 flex justify-between text-[11px] text-emerald-400">
                            <span>Margen Proyectado:</span>
                            <span className="font-mono font-bold">+{data.margen}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  formatter={(value) => value === 'venta' ? 'Valor Comercial de Venta' : 'Costo de Adquisición'}
                />
                {(valuationMetric === 'both' || valuationMetric === 'sale') && (
                  <Area
                    type="monotone"
                    dataKey="venta"
                    name="venta"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorVenta)"
                  />
                )}
                {(valuationMetric === 'both' || valuationMetric === 'cost') && (
                  <Area
                    type="monotone"
                    dataKey="costo"
                    name="costo"
                    stroke="#0f172a"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCosto)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick summary footnote */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Crecimiento del activo semestral: <strong className="text-slate-800 font-mono">+69.4%</strong></span>
            <span className="font-mono text-emerald-700 font-semibold">Margen activo: +{totalValuationCost > 0 ? (((totalValuationSale - totalValuationCost) / totalValuationCost) * 100).toFixed(1) : 0}%</span>
          </div>
        </div>

        {/* CHART 2: Monthly Movement Trends (ComposedChart with Bars & Line) */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">Tendencias de Movimientos Mensuales</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Flujo comparativo de Entradas vs. Salidas y Balance Neto
              </p>
            </div>

            {/* Metric Toggle: Units vs Monetary Value */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded text-xs">
              <button
                type="button"
                onClick={() => setMovementMetric('units')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  movementMetric === 'units' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Unidades (Und)
              </button>
              <button
                type="button"
                onClick={() => setMovementMetric('value')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  movementMetric === 'value' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Valor ({currencySymbol})
              </button>
            </div>
          </div>

          {/* Recharts Composed Chart Container */}
          <div className="w-full h-72 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={monthlyMovementsTrendData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => movementMetric === 'value' ? `${currencySymbol}${(val / 1000).toFixed(0)}k` : `${val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const isUnits = movementMetric === 'units';
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1.5 border border-slate-700">
                          <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">{label}</p>
                          <div className="flex items-center justify-between gap-4 font-mono">
                            <span className="flex items-center gap-1.5 text-emerald-400">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              Entradas (Ingresos):
                            </span>
                            <span className="font-bold">
                              {isUnits ? `+${data.entradas} und` : `${currencySymbol}${data.valorEntradas.toLocaleString('es-ES')}`}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4 font-mono">
                            <span className="flex items-center gap-1.5 text-blue-400">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              Salidas (Despachos):
                            </span>
                            <span className="font-bold">
                              {isUnits ? `-${data.salidas} und` : `${currencySymbol}${data.valorSalidas.toLocaleString('es-ES')}`}
                            </span>
                          </div>
                          <div className="pt-1 border-t border-slate-800 flex justify-between text-[11px] font-mono">
                            <span className="text-slate-400">Variación Neta:</span>
                            <span className={`font-bold ${data.saldoNeto >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {data.saldoNeto >= 0 ? `+${data.saldoNeto}` : data.saldoNeto} {isUnits ? 'und' : ''}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  formatter={(value) => {
                    if (value === 'entradas' || value === 'valorEntradas') return 'Entradas (Recepción)';
                    if (value === 'salidas' || value === 'valorSalidas') return 'Salidas (Despachos)';
                    return 'Saldo Neto en Unidades';
                  }}
                />
                {movementMetric === 'units' ? (
                  <>
                    <Bar dataKey="entradas" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="salidas" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Line type="monotone" dataKey="saldoNeto" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
                  </>
                ) : (
                  <>
                    <Bar dataKey="valorEntradas" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="valorSalidas" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Quick summary footnote */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Mes actual: <strong className="text-slate-800 font-mono">+{50 + liveMonthEntries} / -{14 + liveMonthExits} und</strong></span>
            <span className="font-mono text-blue-700 font-semibold">Tasa de rotación: 76.5%</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Warehouse Zones Capacity vs Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Warehouse Zones Topology */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Ocupación de Zonas de Almacén</h3>
                <p className="text-xs text-slate-500">Capacidad física en estanterías y racks</p>
              </div>
              <button 
                onClick={() => onNavigate('zones')}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-0.5"
              >
                Ver mapa
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {zones.map(zone => {
                const percentage = Math.min(100, Math.round((zone.currentUnits / zone.capacityUnits) * 100));
                return (
                  <div key={zone.code} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{zone.name}</span>
                      <span className="font-mono tabular-nums text-slate-600 font-medium">{percentage}%</span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          percentage > 90 ? 'bg-rose-500' : percentage > 75 ? 'bg-amber-500' : 'bg-slate-900'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{zone.currentUnits} de {zone.capacityUnits} unidades</span>
                      <span>{zone.aisles.length} pasillos</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-slate-500" />
                <span>Órdenes de Compra por recibir:</span>
              </span>
              <span className="font-mono font-bold text-slate-900">{pendingPOs.length}</span>
            </div>
          </div>
        </div>

        {/* Right: Recent Kárdex Activity Feed */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Últimos Movimientos de Kárdex</h3>
              <p className="text-xs text-slate-500">Historial en tiempo real de entradas, salidas y transferencias</p>
            </div>
            <button 
              onClick={() => onNavigate('movements')}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-0.5"
            >
              Kárdex completo
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {movements.slice(0, 5).map(mov => {
              const isEntry = mov.type === 'IN';
              const isExit = mov.type === 'OUT';
              const isAdjust = mov.type === 'ADJUST';

              return (
                <div key={mov.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 p-2 rounded shrink-0 ${
                      isEntry ? 'bg-emerald-50 text-emerald-700' :
                      isExit ? 'bg-blue-50 text-blue-700' :
                      isAdjust ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isEntry && <ArrowDownLeft className="w-4 h-4" />}
                      {isExit && <ArrowUpRight className="w-4 h-4" />}
                      {isAdjust && <AlertTriangle className="w-4 h-4" />}
                      {mov.type === 'TRANSFER' && <Layers className="w-4 h-4" />}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900">{mov.productName}</span>
                        <span className="text-[11px] font-mono text-slate-500">[{mov.sku}]</span>
                      </div>
                      <p className="text-xs text-slate-500">{mov.concept}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>Doc: {mov.referenceDoc}</span>
                        <span aria-hidden="true">·</span>
                        <span>{mov.operator}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{mov.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`text-sm font-bold font-mono tabular-nums ${
                      isEntry ? 'text-emerald-700' : isExit ? 'text-slate-900' : 'text-amber-700'
                    }`}>
                      {isEntry ? `+${mov.quantity}` : isExit ? `-${mov.quantity}` : `${mov.quantity > 0 ? '+' : ''}${mov.quantity}`} und
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Saldo: {mov.newStock}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Critical Stock Alert Bar (if any products low or out) */}
      {activeAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950">
                  Sistema de Alerta Activo: {activeAlerts.length} productos bajo umbral de reposición
                </h4>
                <p className="text-xs text-amber-800">
                  {outOfStockProducts.length > 0 ? `${outOfStockProducts.length} agotados completamente` : ''} 
                  {outOfStockProducts.length > 0 && lowStockProducts.length > 0 ? ' y ' : ''}
                  {lowStockProducts.length > 0 ? `${lowStockProducts.length} con existencia crítica inferior a su stock de seguridad` : ''}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('settings')}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-amber-300 text-amber-900 rounded hover:bg-amber-100 transition-colors whitespace-nowrap shrink-0 shadow-2xs"
              >
                Configurar Umbrales
              </button>

              <button
                onClick={() => onNavigate('inventory')}
                className="px-3.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-2xs"
              >
                Ver en Inventario
              </button>
            </div>
          </div>

          {/* Quick alert preview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {activeAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="bg-white/90 border border-amber-200/80 rounded p-2.5 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{alert.productName}</p>
                  <p className="text-[11px] font-mono text-slate-500">
                    SKU: {alert.sku} · Stock: <strong className={alert.currentStock === 0 ? 'text-rose-600' : 'text-amber-800'}>{alert.currentStock}</strong> / Mín: {alert.minStock}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    quickReorderProduct(alert.productId);
                    onNavigate('suppliers');
                  }}
                  title="Generar Orden de Compra Inmediata"
                  className="px-2 py-1 text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded shrink-0 transition-colors shadow-2xs"
                >
                  Pedir
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
