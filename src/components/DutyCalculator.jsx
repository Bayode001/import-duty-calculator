import React, { useState, useEffect, useRef } from 'react';
import { calculateDuty } from '../services/api';
import ResultCard from './ResultCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';

const DutyCalculator = ({ onCalculate }) => {
  const [formData, setFormData] = useState({
    cetCode: '',
    fobAmount: '',
    currency: 'USD',
    freightAmount: '',
    insuranceAmount: '',
    levyBasis: 'FOB',
    userId: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use a ref to track if event listener is set
  const listenerSet = useRef(false);

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' }
  ];

  // Event listener for loading from history - set up once
  useEffect(() => {
    if (listenerSet.current) return;
    listenerSet.current = true;
    
    //console.log('🔍 DEBUG - Setting up persistent event listener');
    
    const handleLoadCalculation = (event) => {
      //console.log('🔍 DEBUG - loadCalculation event received!', event);
      const item = event.detail;
      //console.log('🔍 DEBUG - Item detail:', item);
      
      if (item) {
        console.log('🔍 DEBUG - Setting form data with:', {
          cetCode: item.hs_code,
          fobAmount: item.fob_value,
          currency: item.fob_currency,
          freightAmount: item.freight_cost,
          insuranceAmount: item.insurance_cost
        });
        
        setFormData({
          cetCode: item.hs_code || '',
          fobAmount: item.fob_value?.toString() || '',
          currency: item.fob_currency || 'USD',
          freightAmount: item.freight_cost?.toString() || '',
          insuranceAmount: item.insurance_cost?.toString() || '',
          levyBasis: 'FOB',
          userId: item.user_id || ''
        });
        
        setResult(item);
        
        setTimeout(() => {
          document.querySelector('.result-panel')?.scrollIntoView({ behavior: 'smooth' });
        }, 200);
      }
    };

    window.addEventListener('loadCalculation', handleLoadCalculation);
    
    return () => {
      window.removeEventListener('loadCalculation', handleLoadCalculation);
      listenerSet.current = false;
    };
  }, []); // Empty dependency array - only runs once

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setResult(null);

  const payload = {
    cetCode: formData.cetCode.trim(),
    fobAmount: parseFloat(formData.fobAmount),
    currency: formData.currency,
    freightAmount: parseFloat(formData.freightAmount) || 0,
    insuranceAmount: parseFloat(formData.insuranceAmount) || 0,
    levyBasis: formData.levyBasis,
    user_id: formData.userId || null
  };

  if (!payload.cetCode) {
    setError('Please enter an HS/CET Code');
    setLoading(false);
    return;
  }

  if (isNaN(payload.fobAmount) || payload.fobAmount <= 0) {
    setError('Please enter a valid FOB Value');
    setLoading(false);
    return;
  }

  try {
    let response;
    
    if (onCalculate) {
      const resultData = await onCalculate(payload);
      if (resultData) {
        setResult(resultData);
      } else {
        setError('Calculation failed. Please try again.');
      }
    } else {
      response = await calculateDuty(payload);
      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.error || 'Calculation failed. Please try again.');
      }
    }
  } catch (error) {
    console.error('Calculation error:', error);
    setError('An unexpected error occurred');
  }
  
  setLoading(false);
};

  
  const handleReset = () => {
    setFormData({
      cetCode: '',
      fobAmount: '',
      currency: 'USD',
      freightAmount: '',
      insuranceAmount: '',
      levyBasis: 'FOB',
      userId: ''
    });
    setResult(null);
    setError(null);
  };

  const exportToPDF = (data, currency) => {
    const parseNum = (val) => {
      if (val === undefined || val === null) return 0;
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return isNaN(num) ? 0 : num;
    };

    const fobNGN = parseNum(data.fob_value) * parseNum(data.fob_rate);
    const totalPayable = parseNum(data.total_payable);
    
    const report = `=== IMPORT DUTY CALCULATION REPORT ===
Date: ${new Date().toLocaleString()}
HS Code: ${data.hs_code || data.cetCode}
Description: ${data.tariff_description || 'N/A'}
Duty Rate: ${parseNum(data.duty_rate)}%

=== VALUE COMPONENTS (NGN) ===
FOB Value: ₦${fobNGN.toLocaleString()}
CIF Value: ₦${parseNum(data.cif_ngn).toLocaleString()}
Exchange Rate: ₦${parseNum(data.fob_rate).toLocaleString()} / ${currency}

=== DUTY BREAKDOWN ===
Import Duty: ₦${parseNum(data.import_duty).toLocaleString()}
Surcharge (7% of Duty): ₦${parseNum(data.surcharge).toLocaleString()}
FCS (4% of FOB): ₦${parseNum(data.fcs).toLocaleString()}
ETLS (0.5% of FOB): ₦${parseNum(data.etls).toLocaleString()}
Additional Levy: ₦${parseNum(data.levy).toLocaleString()}

=== VAT CALCULATION ===
VAT Base: ₦${parseNum(data.vat_base).toLocaleString()}
VAT Rate: ${data.vat_exempt ? 'Exempt' : '7.5%'}
VAT Amount: ${data.vat_exempt ? 'EXEMPT' : `₦${parseNum(data.vat).toLocaleString()}`}

=== TOTAL PAYABLE ===
In Nigerian Naira (NGN): ₦${totalPayable.toLocaleString()}
In Original Currency (${currency}): ${(totalPayable / parseNum(data.fob_rate)).toLocaleString()} ${currency}

Advisory only. Final assessment by Nigeria Customs Service may differ.
${'='.repeat(50)}`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `duty_calculation_${data.hs_code || data.cetCode}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="calculator-container">
      <div className="form-panel">
        <h2>Import Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cetCode">HS Code (CET Code) *</label>
            <input
              type="text"
              id="cetCode"
              name="cetCode"
              value={formData.cetCode}
              onChange={handleChange}
              placeholder="e.g., 7311000000"
              required
            />
            <small>Enter the 10-digit HS/CET classification code</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fobAmount">FOB Value *</label>
              <input
                type="number"
                id="fobAmount"
                name="fobAmount"
                value={formData.fobAmount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="currency">Currency *</label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                required
              >
                {currencies.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="freightAmount">Freight Cost</label>
              <input
                type="number"
                id="freightAmount"
                name="freightAmount"
                value={formData.freightAmount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label htmlFor="insuranceAmount">Insurance Cost</label>
              <input
                type="number"
                id="insuranceAmount"
                name="insuranceAmount"
                value={formData.insuranceAmount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="levyBasis">Levy Basis</label>
              <select
                id="levyBasis"
                name="levyBasis"
                value={formData.levyBasis}
                onChange={handleChange}
              >
                <option value="FOB">FOB (Free on Board)</option>
                <option value="CIF">CIF (Cost, Insurance, Freight)</option>
              </select>
              <small>How additional levy should be calculated</small>
            </div>
            <div className="form-group">
              <label htmlFor="userId">User ID (Optional)</label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="Your reference"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Calculating...' : 'Calculate Duty'}
            </button>
            <button type="button" className="btn-secondary" onClick={handleReset}>
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className="result-panel">
        {loading && <LoadingSpinner />}
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
        {result && <ResultCard data={result} originalCurrency={formData.currency} onExportPDF={exportToPDF} />}
        
        {!loading && !error && !result && (
          <div className="placeholder">
            <p>📋 Enter import details and click "Calculate Duty" to see results</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DutyCalculator;