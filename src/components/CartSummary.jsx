import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CartSummary = ({ cart, onRemoveItem, onClearCart, onSaveToHistory }) => {
  const parseNum = (val) => {
    if (val === undefined || val === null) return 0;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? 0 : num;
  };

  // Add this function to save cart items to history
const saveCartToHistory = () => {
  if (cart.length === 0) {
    alert('Cart is empty');
    return;
  }
  
  if (onSaveToHistory) {
    let savedCount = 0;
    cart.forEach(item => {
      const result = item.result || item;
      if (result && !result.error && result.hs_code) {
        console.log('Saving to history from cart button:', result.hs_code);
        onSaveToHistory(result);
        savedCount++;
      }
    });
    alert(`${savedCount} item(s) saved to history!`);
  } else {
    alert('Save to history function not available');
  }
};

  const formatCurrency = (amount) => {
    const num = parseNum(amount);
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const totalGrand = cart.reduce((sum, item) => {
    const total = parseNum(item.result?.total_payable || item.total_payable || 0);
    return sum + total;
  }, 0);

  const exportCombinedPDF = () => {
    if (cart.length === 0) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const leftMargin = 14;
    const rightMargin = pageWidth - 14;
    const col1Width = 105;
    const col2Width = 75;
    const col2Start = leftMargin + col1Width;
    const tableWidth = col1Width + col2Width;
    
    const formatAmount = (amount) => {
      const num = parseNum(amount);
      return num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    
    const formatRate = (amount) => {
      const num = parseNum(amount);
      return num.toLocaleString('en-NG');
    };
    
    const drawTableHeader = (y, title1, title2) => {
      doc.setFillColor(5, 150, 105);
      doc.rect(leftMargin, y, col1Width, 9, 'F');
      doc.rect(col2Start, y, col2Width, 9, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(title1, leftMargin + 4, y + 6);
      doc.text(title2, col2Start + col2Width - 4, y + 6, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      return y + 9;
    };
    
    const drawDataRow = (y, label, value) => {
      doc.setFontSize(10);
      doc.text(label, leftMargin + 4, y + 5);
      doc.text(value, col2Start + col2Width - 4, y + 5, { align: 'right' });
      return y + 8;
    };
    
    // Header
    doc.setFontSize(17);
    doc.setTextColor(40, 40, 40);
    doc.text('COMBINED DUTY CALCULATION REPORT', pageWidth / 2, 21, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });
    doc.text(`Total Items: ${cart.length}`, pageWidth / 2, 37, { align: 'center' });
    
    doc.setDrawColor(5, 150, 105);
    doc.line(leftMargin, 38, rightMargin, 38);
    
    let currentY = 52;
    
    for (let idx = 0; idx < cart.length; idx++) {
      const item = cart[idx];
      const result = item.result || item;
      
      const hsCode = item.cetCode || result.hs_code || 'N/A';
      const description = result.tariff_description || 'No description';
      const dutyRate = parseNum(result.duty_rate);
      
      const fobRate = parseNum(result.fob_rate || 1);
      const fobValue = parseNum(result.fob_value);
      const fobNGN = fobValue * fobRate;
      const cifNGN = parseNum(result.cif_ngn);
      const importDuty = parseNum(result.import_duty);
      const surcharge = parseNum(result.surcharge);
      const fcs = parseNum(result.fcs);
      const etls = parseNum(result.etls);
      const levy = parseNum(result.levy);
      const vatBase = parseNum(result.vat_base);
      const vat = parseNum(result.vat);
      const totalPayable = parseNum(result.total_payable);
      const vatExempt = result.vat_exempt === true;
      const originalCurrency = result.fob_currency || 'USD';
      
      // Check for new page
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
        doc.setDrawColor(5, 150, 105);
        doc.line(leftMargin, 38, rightMargin, 38);
      }
      
      // Item Header
      doc.setFontSize(12);
      doc.setTextColor(5, 150, 105);
      doc.text(`ITEM ${idx + 1}: ${hsCode}`, leftMargin, currentY);
      currentY += 6;
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const descLines = doc.splitTextToSize(description, pageWidth - 30);
      doc.text(descLines, leftMargin, currentY);
      currentY += (descLines.length * 5) + 4;
      
      doc.text(`Duty Rate: ${formatRate(dutyRate)}%`, leftMargin, currentY);
      currentY += 10;
      
      // VALUE COMPONENTS
      doc.setFontSize(12);
      doc.setTextColor(5, 150, 105);
      doc.text('VALUE COMPONENTS', leftMargin, currentY);
      currentY += 4;
      
      currentY = drawTableHeader(currentY, 'Component', 'Amount (NGN)');
      currentY = drawDataRow(currentY, 'FOB Value', formatAmount(fobNGN));
      currentY = drawDataRow(currentY, 'CIF Value', formatAmount(cifNGN));
      currentY = drawDataRow(currentY, 'Exchange Rate', `${formatRate(fobRate)} / ${originalCurrency}`);
      currentY += 10;
      
      // DUTY BREAKDOWN
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
      
      // VAT CALCULATION
      doc.setFontSize(12);
      doc.setTextColor(5, 150, 105);
      doc.text('VAT CALCULATION', leftMargin, currentY);
      currentY += 4;
      
      currentY = drawTableHeader(currentY, 'Component', 'Amount (NGN)');
      currentY = drawDataRow(currentY, 'VAT Base', formatAmount(vatBase));
      currentY = drawDataRow(currentY, 'VAT Rate', vatExempt ? 'Exempt' : '7.5%');
      currentY = drawDataRow(currentY, 'VAT Amount', vatExempt ? 'EXEMPT' : formatAmount(vat));
      currentY += 10;
      
      // TOTAL PAYABLE BOX for this item
      const boxHeight = 32;
      doc.setFillColor(5, 150, 105);
      doc.rect(leftMargin, currentY, tableWidth, boxHeight, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.text(`TOTAL PAYABLE FOR ITEM ${idx + 1}`, leftMargin + 5, currentY + 12);
      
      doc.setFontSize(13);
      doc.text(formatAmount(totalPayable), leftMargin + tableWidth - 4, currentY + 12, { align: 'right' });
      
      currentY += boxHeight + 10;
      
      // Separator between items
      if (idx < cart.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.line(leftMargin, currentY, rightMargin, currentY);
        currentY += 8;
      }
    }
    
    // GRAND TOTAL BOX
    const grandBoxHeight = 35;
    doc.setFillColor(5, 150, 105);
    doc.rect(leftMargin, currentY, tableWidth, grandBoxHeight, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('GRAND TOTAL', leftMargin + 5, currentY + 14);
    
    doc.setFontSize(15);
    doc.text(formatAmount(totalGrand), leftMargin + tableWidth - 4, currentY + 14, { align: 'right' });
    
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 200);
    doc.text(`Total for ${cart.length} item(s)`, leftMargin + 5, currentY + 28);
    
    currentY += grandBoxHeight + 12;
    
    // Disclaimer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.text('Advisory only. Final assessment by Nigeria Customs Service may differ.', 
      pageWidth / 2, currentY, { align: 'center' });
    
    doc.save(`combined_duty_report_${Date.now()}.pdf`);
  };

  if (cart.length === 0) {
    return (
      <div className="cart-summary">
        <h3>🛒 Cart Summary</h3>
        <div className="cart-empty">No items added yet. Calculate multiple items above.</div>
      </div>
    );
  }

  return (
    <div className="cart-summary">
      <div className="cart-header">
        <h3>🛒 Cart Summary ({cart.length} items)</h3>
        <div className="cart-actions">
          <button onClick={saveCartToHistory} className="btn-save-history">
            💾 Save All to History
          </button>
          <button onClick={exportCombinedPDF} className="btn-checkout">
            📄 Export Combined PDF Report
          </button>
          <button onClick={onClearCart} className="btn-clear">Clear Cart</button>
        </div>
      </div>
      
      <div className="cart-items">
        {cart.map((item, index) => {
          const result = item.result || item;
          const totalPayable = parseNum(result.total_payable);
          const hsCode = item.cetCode || result.hs_code || 'N/A';
          const description = result.tariff_description || 'No description';
          
          return (
            <div key={index} className="cart-item">
              <div className="cart-item-info">
                <span className="cart-hs">{hsCode}</span>
                <span className="cart-desc">{description.substring(0, 50)}</span>
                <span className="cart-total">{formatCurrency(totalPayable)}</span>
              </div>
              <button onClick={() => onRemoveItem(index)} className="btn-remove-cart">✕</button>
            </div>
          );
        })}
      </div>
      
      <div className="cart-total">
        <span>GRAND TOTAL:</span>
        <span>{formatCurrency(totalGrand)}</span>
      </div>
    </div>
  );
};

export default CartSummary;