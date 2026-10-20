import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product, StockMovement } from '../types/warehouse';

interface ExportKardexPDFOptions {
  movements: StockMovement[];
  products: Product[];
  currencySymbol: string;
  warehouseName: string;
}

interface ExportMonthlyReportPDFOptions {
  movements: StockMovement[];
  products: Product[];
  month: string; // e.g. "2026-10" or "Octubre 2026"
  currencySymbol: string;
  warehouseName: string;
}

export const exportKardexValorizadoPDF = ({
  movements,
  products,
  currencySymbol,
  warehouseName
}: ExportKardexPDFOptions) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const totalUnitsInStock = products.reduce((acc, p) => acc + p.stock, 0);
  const totalValuation = products.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0);
  const totalEntries = movements.filter(m => m.type === 'IN').reduce((acc, m) => acc + m.quantity, 0);
  const totalExits = movements.filter(m => m.type === 'OUT').reduce((acc, m) => acc + m.quantity, 0);

  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Top header banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 297, 24, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ALMACÉN CENTRAL PF — KÁRDEX VALORIZADO DE EXISTENCIAS', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`Sede: ${warehouseName}  ·  Valuación: Costo Promedio Ponderado (PMP)  ·  Emisión: ${currentDate}`, 14, 18);

  // Summary Metrics Strip
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, 28, 269, 16, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85); // slate-700
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  doc.text('RESUMEN DE SALDOS:', 18, 36);

  doc.setFont('helvetica', 'normal');
  doc.text(`Stock Físico Actual: ${totalUnitsInStock.toLocaleString('es-ES')} und`, 65, 36);
  doc.text(`Valorización Total: ${currencySymbol}${totalValuation.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 125, 36);
  doc.text(`Total Entradas: +${totalEntries.toLocaleString('es-ES')} und`, 195, 36);
  doc.text(`Total Salidas: -${totalExits.toLocaleString('es-ES')} und`, 240, 36);

  // Table Data mapping
  const tableRows = movements.map(m => [
    m.date,
    m.type,
    m.referenceDoc,
    m.sku,
    m.productName,
    m.concept,
    m.type === 'IN' ? `+${m.quantity}` : m.type === 'OUT' ? `-${m.quantity}` : `${m.quantity}`,
    `${currencySymbol}${m.unitCost.toFixed(2)}`,
    `${currencySymbol}${m.totalValue.toFixed(2)}`,
    `${m.newStock} und`,
    m.operator.split(' ')[0] + ' ' + (m.operator.split(' ')[1] || '')
  ]);

  autoTable(doc, {
    startY: 48,
    head: [[
      'Fecha/Hora',
      'Tipo',
      'Doc. Ref.',
      'SKU',
      'Descripción del Producto',
      'Concepto de Operación',
      'Cant.',
      'Costo U.',
      'Total ($)',
      'Saldo Stock',
      'Operador'
    ]],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [15, 23, 42],
      overflow: 'linebreak'
    },
    columnStyles: {
      0: { cellWidth: 26, halign: 'center' },
      1: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 24, halign: 'center' },
      3: { cellWidth: 24 },
      4: { cellWidth: 46 },
      5: { cellWidth: 44 },
      6: { cellWidth: 14, halign: 'right', fontStyle: 'bold' },
      7: { cellWidth: 16, halign: 'right' },
      8: { cellWidth: 18, halign: 'right' },
      9: { cellWidth: 18, halign: 'right', fontStyle: 'bold' },
      10: { cellWidth: 25 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    didDrawPage: (data) => {
      // Footer page numbering
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Página ${data.pageNumber} de ${pageCount} — Almacén PF Sistema Logístico Integrado`,
        14,
        202
      );
    }
  });

  // Save PDF
  doc.save(`Kardex_Valorizado_Almacen_PF_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportMovimientosMensualesPDF = ({
  movements,
  products,
  month,
  currencySymbol,
  warehouseName
}: ExportMonthlyReportPDFOptions) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Filter movements for the month if date matches, otherwise use all available
  const monthlyMovements = movements.filter(m => m.date.startsWith(month.slice(0, 7)));
  const dataset = monthlyMovements.length > 0 ? monthlyMovements : movements;

  const entries = dataset.filter(m => m.type === 'IN');
  const exits = dataset.filter(m => m.type === 'OUT');
  const adjustments = dataset.filter(m => m.type === 'ADJUST');
  const transfers = dataset.filter(m => m.type === 'TRANSFER');

  const unitsIn = entries.reduce((acc, m) => acc + m.quantity, 0);
  const unitsOut = exits.reduce((acc, m) => acc + m.quantity, 0);
  const valueIn = entries.reduce((acc, m) => acc + m.totalValue, 0);
  const valueOut = exits.reduce((acc, m) => acc + m.totalValue, 0);

  // Top header banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('REPORTE MENSUAL DE MOVIMIENTOS Y FLUJO DE ALMACÉN', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`Período Contable: ${month}  ·  Sede: ${warehouseName}`, 14, 19);
  doc.text(`Fecha de Cierre / Generación: ${currentDate}  ·  Norma Logística ISO 9001`, 14, 24);

  // KPI Grid (4 blocks)
  const blockW = 43;
  const blockH = 18;
  const startY = 33;

  // Block 1: Entradas
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(167, 243, 208); // emerald-200
  doc.roundedRect(14, startY, blockW, blockH, 2, 2, 'FD');
  doc.setTextColor(6, 95, 70); // emerald-800
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL ENTRADAS', 17, startY + 5);
  doc.setFontSize(11);
  doc.text(`+${unitsIn} und`, 17, startY + 11);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${currencySymbol}${valueIn.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, 17, startY + 15);

  // Block 2: Salidas
  doc.setFillColor(239, 246, 255); // blue-50
  doc.setDrawColor(191, 219, 254); // blue-200
  doc.roundedRect(61, startY, blockW, blockH, 2, 2, 'FD');
  doc.setTextColor(30, 64, 175); // blue-800
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL SALIDAS', 64, startY + 5);
  doc.setFontSize(11);
  doc.text(`-${unitsOut} und`, 64, startY + 11);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${currencySymbol}${valueOut.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, 64, startY + 15);

  // Block 3: Ajustes
  doc.setFillColor(254, 243, 199); // amber-50
  doc.setDrawColor(253, 230, 138); // amber-200
  doc.roundedRect(108, startY, blockW, blockH, 2, 2, 'FD');
  doc.setTextColor(146, 64, 14); // amber-800
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('AJUSTES Y MERMAS', 111, startY + 5);
  doc.setFontSize(11);
  doc.text(`${adjustments.length} eventos`, 111, startY + 11);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Cuadres cíclicos', 111, startY + 15);

  // Block 4: Transferencias
  doc.setFillColor(243, 244, 246); // slate-100
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(155, startY, blockW, blockH, 2, 2, 'FD');
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TRANSFERENCIAS', 158, startY + 5);
  doc.setFontSize(11);
  doc.text(`${transfers.length} traslados`, 158, startY + 11);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Reubicación interna', 158, startY + 15);

  // Detailed Transactions Table
  const tableRows = dataset.map(m => [
    m.date.split(' ')[0],
    m.type,
    m.referenceDoc,
    m.productName,
    m.concept,
    m.type === 'IN' ? `+${m.quantity}` : m.type === 'OUT' ? `-${m.quantity}` : `${m.quantity}`,
    `${currencySymbol}${m.totalValue.toFixed(2)}`,
    `${m.newStock} und`
  ]);

  autoTable(doc, {
    startY: 56,
    head: [[
      'Fecha',
      'Tipo',
      'Doc. Ref.',
      'Producto',
      'Concepto / Destino',
      'Cant.',
      'Total ($)',
      'Saldo'
    ]],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      halign: 'center'
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [15, 23, 42]
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 24, halign: 'center' },
      3: { cellWidth: 44 },
      4: { cellWidth: 40 },
      5: { cellWidth: 14, halign: 'right', fontStyle: 'bold' },
      6: { cellWidth: 18, halign: 'right' },
      7: { cellWidth: 14, halign: 'right' }
    },
    didDrawPage: (data) => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Página ${data.pageNumber} de ${pageCount} — Almacén PF Reporte Mensual Oficial`,
        14,
        290
      );
    }
  });

  // Add Signatures on last page if space permits
  const finalY = (doc as any).lastAutoTable?.finalY || 200;
  if (finalY < 240) {
    const signY = finalY + 22;
    doc.setDrawColor(203, 213, 225);
    doc.line(24, signY, 84, signY);
    doc.line(124, signY, 184, signY);

    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Elena R. Vargas — Jefa de Almacén', 30, signY + 5);
    doc.text('Firma y Sello de Auditoría Contable', 130, signY + 5);
  }

  doc.save(`Reporte_Movimientos_${month.replace(/\s+/g, '_')}_Almacen_PF.pdf`);
};
