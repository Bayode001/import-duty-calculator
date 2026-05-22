/* eslint-disable no-unused-vars */
import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ResultCard = ({ data, originalCurrency, onExportPDF }) => {
  // Helper to safely parse numeric values
  const parseNum = (val) => {
    if (val === undefined || val === null) return 0;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? 0 : num;
  };

  const formatCurrency = (amount, currency = 'NGN') => {
    const num = parseNum(amount);
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatNumber = (num) => {
    const val = parseNum(num);
    return new Intl.NumberFormat('en-NG').format(Math.round(val));
  };

  // Calculate values
  const fobRate = parseNum(data.fob_rate || 1);
  const fobValue = parseNum(data.fob_value);
  const fobNGN = fobValue * fobRate;
  const cifNGN = parseNum(data.cif_ngn);
  const dutyRate = parseNum(data.duty_rate);
  const importDuty = parseNum(data.import_duty);
  const surcharge = parseNum(data.surcharge);
  const fcs = parseNum(data.fcs);
  const etls = parseNum(data.etls);
  const levy = parseNum(data.levy);
  const vatBase = parseNum(data.vat_base);
  const vat = parseNum(data.vat);
  const totalPayable = parseNum(data.total_payable);
  const totalPayableOriginal = totalPayable / (fobRate || 1);
  const vatExempt = data.vat_exempt === true;

 // PDF Export Function - Fixed alignment
const exportToPDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const leftMargin = 14;
  const rightMargin = pageWidth - 14;
  const col1Width = 105;   // Component column width
  const col2Width = 75;   // Amount column width
  const col2Start = leftMargin + col1Width;
  const tableWidth = col1Width + col2Width;

  
  // Format numbers without currency symbol
  const formatAmount = (amount) => {
    const num = parseNum(amount);
    return num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  const formatRate = (amount) => {
    const num = parseNum(amount);
    return num.toLocaleString('en-NG');
  };
  
  // Draw table header with Amount (NGN) right-aligned
  const drawTableHeader = (y, title1, title2) => {
    doc.setFillColor(5, 150, 105);
    doc.rect(leftMargin, y, col1Width, 9, 'F');
    doc.rect(col2Start, y, col2Width, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(title1, leftMargin + 4, y + 6);
    // Right-align the header text within the Amount column
    doc.text(title2, col2Start + col2Width - 4, y + 6, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    return y + 9;
  };
  
  // Draw a data row with right-aligned amount
  const drawDataRow = (y, label, value) => {
    doc.setFontSize(10);
    doc.text(label, leftMargin + 4, y + 5);
    // Right-align the value within the Amount column
    doc.text(value, col2Start + col2Width - 4, y + 5, { align: 'right' });
    return y + 8;
  };
  
  // Header
  doc.setFontSize(17);
  doc.setTextColor(40, 40, 40);
  doc.text('IMPORT DUTY CALCULATION REPORT', pageWidth / 2, 21, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });
  
  doc.setDrawColor(5, 150, 105);
  doc.line(leftMargin, 38, rightMargin, 38);
  
  // Section 1: Tariff Information
  doc.setFontSize(12);
  doc.setTextColor(5, 150, 105);
  doc.text('TARIFF INFORMATION', leftMargin, 52);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`HS Code: ${data.hs_code || data.cetCode || 'N/A'}`, leftMargin, 63);
  doc.text(`Description: ${(data.tariff_description || 'N/A').substring(0, 65)}`, leftMargin, 72);
  doc.text(`Duty Rate: ${formatRate(dutyRate)}%`, leftMargin, 81);
  
  let currentY = 98;
  
  // Section 2: Value Components
  doc.setFontSize(12);
  doc.setTextColor(5, 150, 105);
  doc.text('VALUE COMPONENTS', leftMargin, currentY);
  currentY += 4;
  
  currentY = drawTableHeader(currentY, 'Component', 'Amount (NGN)');
  currentY = drawDataRow(currentY, 'FOB Value', formatAmount(fobNGN));
  currentY = drawDataRow(currentY, 'CIF Value', formatAmount(cifNGN));
  currentY = drawDataRow(currentY, 'Exchange Rate', `${formatRate(fobRate)} / ${originalCurrency}`);
  currentY += 10;
  
  // Section 3: Duty Breakdown
  doc.setFontSize(12);
  doc.setTextColor(5, 150, 105);
  doc.text('DUTY BREAKDOWN', leftMargin, currentY);
  currentY += 4;
  
  currentY = drawTableHeader(currentY, 'Component', 'Amount (NGN)');
  currentY = drawDataRow(currentY, 'Import Duty', formatAmount(importDuty));
  currentY = drawDataRow(currentY, 'Surcharge (7% of Duty)', formatAmount(surcharge));
  currentY = drawDataRow(currentY, 'FCS (4% of FOB)', formatAmount(fcs));
  currentY = drawDataRow(currentY, 'ETLS (0.5% of FOB)', formatAmount(etls));
  if (levy > 0) {
    currentY = drawDataRow(currentY, 'Additional Levy', formatAmount(levy));
  }
  currentY += 10;
  
  // Section 4: VAT Calculation
  doc.setFontSize(12);
  doc.setTextColor(5, 150, 105);
  doc.text('VAT CALCULATION', leftMargin, currentY);
  currentY += 4;
  
  currentY = drawTableHeader(currentY, 'Component', 'Amount (NGN)');
  currentY = drawDataRow(currentY, 'VAT Base', formatAmount(vatBase));
  currentY = drawDataRow(currentY, 'VAT Rate', vatExempt ? 'Exempt' : '7.5%');
  currentY = drawDataRow(currentY, 'VAT Amount', vatExempt ? 'EXEMPT' : formatAmount(vat));
  currentY += 10;
  
  // TOTAL PAYABLE Box - same width as tables, right-aligned
  const boxHeight = 32;
  // eslint-disable-next-line no-unused-vars
  const boxWidth = col1Width + col2Width;  // Same as table width
  doc.setFillColor(5, 150, 105);
  // Use the same left margin and total width as the tables
  doc.rect(leftMargin, currentY, tableWidth, boxHeight, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text('TOTAL PAYABLE', leftMargin + 5, currentY + 12);
  
  doc.setFontSize(13);
  // Right-align the amount at the same position as the table amounts
  doc.text(formatAmount(totalPayable), leftMargin + tableWidth - 4, currentY + 12, { align: 'right' });
  
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 200);
  doc.text(`In Original Currency (${originalCurrency}): ${formatRate(totalPayableOriginal)} ${originalCurrency}`, 
    leftMargin + (tableWidth / 2), currentY + 25, { align: 'center' });
  
  currentY += boxHeight + 10;
  
  // Disclaimer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.text('Advisory only. Final assessment by Nigeria Customs Service may differ.', 
    pageWidth / 2, currentY, { align: 'center' });
  
  // Save PDF
  doc.save(`duty_calculation_${data.hs_code || data.cetCode}_${Date.now()}.pdf`);
};


  return (
    <div className="result-card">
      <div className="result-header">
        <h3>📊 Calculation Results</h3>
        <button onClick={exportToPDF} className="btn-pdf-export">
          📄 Export PDF
        </button>
      </div>

      <div className="result-section">
        <h4>📦 Tariff Information</h4>
        <div className="result-row">
          <span className="label">HS Code:</span>
          <span className="value">{data.hs_code || data.cetCode || 'N/A'}</span>
        </div>
        <div className="result-row">
          <span className="label">Description:</span>
          <span className="value">{data.tariff_description || 'N/A'}</span>
        </div>
        <div className="result-row">
          <span className="label">Duty Rate:</span>
          <span className="value">{dutyRate}%</span>
        </div>
      </div>

      <div className="result-section">
        <h4>💰 Value Components (NGN)</h4>
        <div className="result-row">
          <span className="label">FOB Value:</span>
          <span className="value">{formatCurrency(fobNGN)}</span>
        </div>
        <div className="result-row">
          <span className="label">CIF Value:</span>
          <span className="value">{formatCurrency(cifNGN)}</span>
        </div>
        <div className="result-row">
          <span className="label">Exchange Rate:</span>
          <span className="value">₦{formatNumber(fobRate)} / {originalCurrency}</span>
        </div>
      </div>

      <div className="result-section">
        <h4>📋 Duty Breakdown</h4>
        <div className="result-row">
          <span className="label">Import Duty ({dutyRate}% of CIF):</span>
          <span className="value">{formatCurrency(importDuty)}</span>
        </div>
        <div className="result-row">
          <span className="label">Surcharge (7% of Duty):</span>
          <span className="value">{formatCurrency(surcharge)}</span>
        </div>
        <div className="result-row">
          <span className="label">FCS (4% of FOB):</span>
          <span className="value">{formatCurrency(fcs)}</span>
        </div>
        <div className="result-row">
          <span className="label">ETLS (0.5% of FOB):</span>
          <span className="value">{formatCurrency(etls)}</span>
        </div>
        {levy > 0 && (
          <div className="result-row highlight">
            <span className="label">Additional Levy:</span>
            <span className="value">{formatCurrency(levy)}</span>
          </div>
        )}
      </div>

      <div className="result-section">
        <h4>🧾 VAT Calculation</h4>
        <div className="result-row">
          <span className="label">VAT Base:</span>
          <span className="value">{formatCurrency(vatBase)}</span>
        </div>
        <div className="result-row">
          <span className="label">VAT Rate:</span>
          <span className="value">{vatExempt ? 'Exempt' : '7.5%'}</span>
        </div>
        <div className="result-row">
          <span className="label">VAT Amount:</span>
          <span className="value">{vatExempt ? 'EXEMPT' : formatCurrency(vat)}</span>
        </div>
      </div>

      <div className="total-section">
        <h4>💵 TOTAL PAYABLE</h4>
        <div className="result-row">
          <span className="label">In Nigerian Naira (NGN):</span>
          <span className="value total-value">{formatCurrency(totalPayable)}</span>
        </div>
        <div className="result-row">
          <span className="label">In Original Currency ({originalCurrency}):</span>
          <span className="value">{formatCurrency(totalPayableOriginal, originalCurrency)}</span>
        </div>
      </div>

      {data.disclaimer && (
        <div className="disclaimer">
          <small>{data.disclaimer}</small>
        </div>
      )}
    </div>
  );
};

export default ResultCard;