import React, { useState, useEffect, useMemo, memo } from 'react';
import { UploadCloud, ArrowUpCircle, ArrowDownCircle, Activity, Filter, Plus, Trash2, Printer, Users, Download, Upload, Calendar, PieChart, User, DollarSign, ArrowLeft, Settings } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { parseTransactionPDF } from './utils/pdfParser';
import { supabase } from './supabaseClient';
import './App.css';

const categories = ["General", "Food", "Rent", "Utilities", "Salary", "Paid", "Shopping", "Entertainment", "Investment", "FB Ads", "Capital / Investment"];

const TransactionRow = memo(({ t, isSelected, onSelect, onDelete, onUpdate }) => {
  const [category, setCategory] = useState(t.category || 'General');
  const [customdata, setCustomData] = useState(t.customdata || '');
  
  const [editDate, setEditDate] = useState(() => {
    if (t.date && t.date.includes('/')) {
      const [d, m, y] = t.date.split('/');
      return `${y}-${m}-${d}`;
    }
    return t.date;
  });

  const handleBlur = () => {
    const updates = {};
    if (category !== t.category) updates.category = category;
    if (customdata !== t.customdata) updates.customdata = customdata;
    
    const [y, m, d] = editDate.split('-');
    const newFormattedDate = `${d}/${m}/${y}`;
    if (newFormattedDate !== t.date && editDate.length === 10) {
      updates.date = newFormattedDate;
      updates.timestamp = new Date(`${editDate}T${t.time || '00:00:00'}`).getTime();
    }

    if (Object.keys(updates).length > 0) {
      onUpdate(t.id, updates);
    }
  };

  useEffect(() => {
    setCategory(t.category || 'General');
    setCustomData(t.customdata || '');
    if (t.date && t.date.includes('/')) {
      const [d, m, y] = t.date.split('/');
      setEditDate(`${y}-${m}-${d}`);
    }
  }, [t.category, t.customdata, t.date]);

  return (
    <tr>
      <td style={{ width: '40px', textAlign: 'center' }}>
        <input type="checkbox" checked={isSelected} onChange={() => onSelect(t.id)} />
      </td>
      <td>
        <input 
          type="date" 
          className="input" 
          value={editDate} 
          onChange={(e) => setEditDate(e.target.value)} 
          onBlur={handleBlur}
          style={{ padding: '0.25rem', fontSize: '0.75rem', fontWeight: 600, border: 'none', background: 'transparent' }}
        />
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginLeft: '0.25rem' }}>{t.time}</div>
      </td>
      <td>
        <div style={{ fontWeight: 500, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {t.receiver.includes('null') ? t.sender.split('@')[0] : t.receiver.split('@')[0]}
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {t.bankname} • {t.cr_dr === 'CR' ? 'Received' : 'Sent'}
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input 
            list="category-suggestions"
            className="input" 
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: '120px' }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onBlur={handleBlur}
            placeholder="Category..."
          />
        </div>
      </td>
      <td>
        <input 
          type="text"
          className="input" 
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: '140px' }}
          value={customdata}
          onChange={(e) => setCustomData(e.target.value)}
          onBlur={handleBlur}
          placeholder="Add custom notes..."
        />
      </td>
      <td>
        <span className={`badge ${t.status?.toUpperCase() === 'SUCCESS' ? 'badgeSuccess' : 'badgeFailure'}`}>
          {t.status?.toUpperCase() || 'SUCCESS'}
        </span>
      </td>
      <td style={{ textAlign: 'right', fontWeight: 600, color: t.cr_dr === 'CR' ? 'var(--success)' : 'var(--text-primary)' }}>
        {t.cr_dr === 'CR' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </td>
      <td style={{ textAlign: 'center' }}>
        <button 
          className="button button-danger"
          style={{ padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', marginLeft: 'auto' }} 
          onClick={() => onDelete(t.id)}
          title="Delete Record"
        >
          <Trash2 size={12} /> Delete
        </button>
      </td>
    </tr>
  );
});

const FbAdRow = memo(({ item, onDelete, onUpdate }) => {
  const [details, setDetails] = useState(item.details);
  const [baseamount, setBaseAmount] = useState(item.baseamount);
  const [date, setDate] = useState(() => {
    if (item.date && item.date.includes('/')) {
      const [d, m, y] = item.date.split('/');
      return `${y}-${m}-${d}`;
    }
    return item.date;
  });

  const handleBlur = () => {
    const updates = {};
    if (details !== item.details) updates.details = details;
    
    const parsedAmount = parseFloat(baseamount);
    if (!isNaN(parsedAmount) && parsedAmount !== item.baseamount) updates.baseamount = parsedAmount;

    const [y, m, d] = date.split('-');
    const newFormattedDate = `${d}/${m}/${y}`;
    if (newFormattedDate !== item.date && date.length === 10) {
      updates.date = newFormattedDate;
    }

    if (Object.keys(updates).length > 0) {
      onUpdate(item.id, updates);
    }
  };

  useEffect(() => {
    setDetails(item.details);
    setBaseAmount(item.baseamount);
    if (item.date && item.date.includes('/')) {
      const [d, m, y] = item.date.split('/');
      setDate(`${y}-${m}-${d}`);
    } else {
      setDate(item.date);
    }
  }, [item.details, item.baseamount, item.date]);

  return (
    <tr>
      <td>
        <input 
          type="date" 
          className="input" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          onBlur={handleBlur}
          style={{ padding: '0.25rem', fontSize: '0.875rem', fontWeight: 500, border: '1px solid transparent', background: 'transparent', cursor: 'text' }}
        />
      </td>
      <td>
        <input 
          type="text" 
          className="input" 
          value={details} 
          onChange={(e) => setDetails(e.target.value)} 
          onBlur={handleBlur}
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', width: '100%', border: '1px solid transparent', background: 'transparent' }}
        />
      </td>
      <td style={{ textAlign: 'right' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
          <span style={{color: 'var(--text-secondary)'}}>₹</span>
          <input 
            type="number" 
            step="0.01"
            className="input" 
            value={baseamount} 
            onChange={(e) => setBaseAmount(e.target.value)} 
            onBlur={handleBlur}
            style={{ padding: '0.25rem', fontSize: '0.875rem', width: '100px', textAlign: 'right', border: '1px solid transparent', background: 'transparent', fontWeight: 500 }}
          />
        </div>
      </td>
      <td style={{ textAlign: 'right', color: 'var(--danger)' }}>₹{(item.baseamount * 0.18).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{(item.baseamount * 1.18).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      <td style={{ textAlign: 'right' }}>
        <button className="button" style={{ padding: '0.25rem 0.5rem', background: 'transparent', color: 'var(--danger)' }} onClick={() => onDelete(item.id)}>
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
});

function App() {
  const [viewState, setViewState] = useState('HOME');
  const [activeTab, setActiveTab] = useState('Overview');
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [manualFbAdsList, setManualFbAdsList] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [userInvestments, setUserInvestments] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setDbLoading(true);
      try {
        const [txs, ads, invs, invests] = await Promise.all([
          supabase.from('transactions').select('*'),
          supabase.from('fb_ads').select('*'),
          supabase.from('investors').select('*'),
          supabase.from('user_investments').select('*')
        ]);
        
        if (txs.error) console.error("Transactions Error:", txs.error.message);
        if (ads.error) console.error("FB Ads Error:", ads.error.message);
        if (invs.error) console.error("Investors Error:", invs.error.message);
        if (invests.error) console.error("Investments Error:", invests.error.message);
        
        if (txs.error || ads.error || invs.error || invests.error) {
          alert("Database Error: Make sure you ran the latest SQL script in Supabase! See console for details.");
        }
        
        if (txs.data) setTransactions(txs.data.sort((a, b) => b.timestamp - a.timestamp));
        if (ads.data) setManualFbAdsList(ads.data);
        if (invests.data) setUserInvestments(invests.data);
        if (invs.data && invs.data.length > 0) {
          setInvestors(invs.data);
        } else {
          const defaults = [
            { id: 'inv_1', name: 'User 1' },
            { id: 'inv_2', name: 'User 2' }
          ];
          setInvestors(defaults);
          await supabase.from('investors').upsert(defaults);
        }
      } catch (err) {
        console.error("Error fetching data from Supabase:", err);
      }
      setDbLoading(false);
    };
    fetchData();
  }, []);
  
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filters
  const [filterType, setFilterType] = useState('ALL');
  const [filterMonth, setFilterMonth] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkCategory, setBulkCategory] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState(null); // stores { investorId, type: 'investment'|'withdrawal' }
  const [showFbAdsModal, setShowFbAdsModal] = useState(false);  
  const getLocalDateString = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const [newTx, setNewTx] = useState({
    date: getLocalDateString(), amount: '', cr_dr: 'DR', details: '', category: 'General', customdata: ''
  });
  const [newInvest, setNewInvest] = useState({
    date: getLocalDateString(), amount: '', details: ''
  });
  const [newFbAd, setNewFbAd] = useState({
    date: getLocalDateString(), baseamount: '', details: ''
  });
  const handleOpenInvestModal = (invId, type = 'investment') => {
    let defaultDate = getLocalDateString();
    
    if (filterMonth !== 'ALL') {
      if (filterMonth.match(/^\d{4}$/)) {
        defaultDate = `${filterMonth}-01-01`;
      } else {
        const d = new Date(`1 ${filterMonth}`); 
        if (!isNaN(d.getTime())) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          defaultDate = `${y}-${m}-01`;
        }
      }
    }
    
    setNewInvest({ date: defaultDate, amount: '', details: '' });
    setShowInvestModal({ investorId: invId, type });
  };

  // Keep activeTab in sync if an investor is deleted
  useEffect(() => {
    if (activeTab.startsWith('inv_') && !investors.find(i => i.id === activeTab)) {
      setActiveTab('Overview');
    }
  }, [investors, activeTab]);

  // Database Backup / Restore Logic
  const handleExportBackup = () => {
    const data = { transactions, investors, manualFbAdsList };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spend_analytics_backup_${getLocalDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowSettings(false);
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.transactions) setTransactions(data.transactions);
        if (data.investors) setInvestors(data.investors.map(i => ({ id: i.id, name: i.name })));
        if (data.manualFbAdsList) setManualFbAdsList(data.manualFbAdsList);
        alert('Database restored successfully from backup!');
        setShowSettings(false);
      } catch(err) {
        alert('Invalid backup file. Could not restore.');
      }
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  const handleMigrateToSupabase = async () => {
    if (!window.confirm("Are you sure you want to push your local browser data to Supabase? This will merge local data into the cloud database.")) return;
    
    setLoading(true);
    try {
      const tx = localStorage.getItem('spendAnalytics_transactions');
      const ads = localStorage.getItem('spendAnalytics_fbAdsList');
      const invs = localStorage.getItem('spendAnalytics_investors');
      
      let pushed = 0;
      if (tx) {
        const parsedTx = JSON.parse(tx);
        if (parsedTx.length > 0) {
          await supabase.from('transactions').upsert(parsedTx);
          pushed += parsedTx.length;
        }
      }
      if (ads) {
        const parsedAds = JSON.parse(ads);
        if (parsedAds.length > 0) {
          await supabase.from('fb_ads').upsert(parsedAds);
          pushed += parsedAds.length;
        }
      }
      if (invs) {
        const parsedInvs = JSON.parse(invs).map(i => ({ id: i.id, name: i.name }));
        if (parsedInvs.length > 0) {
          await supabase.from('investors').upsert(parsedInvs);
          pushed += parsedInvs.length;
        }
      }
      
      alert(`Successfully migrated ${pushed} records to Supabase! You can now safely use the app across devices.`);
      setShowSettings(false);
    } catch(err) {
      alert("Error migrating data: " + err.message);
    }
    setLoading(false);
  };

  // PDF Upload Logic
  const handleFileUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await parseTransactionPDF(file);
      if (!data || data.length === 0) {
        setError('No transactions found in this PDF. Make sure it is an SBI transaction statement.');
        return;
      }
      setTransactions(prev => {
        const combined = [...prev, ...data];
        const uniqueMap = new Map();
        combined.forEach(item => {
          if (!uniqueMap.has(item.id)) {
            uniqueMap.set(item.id, item);
          }
        });
        const unique = Array.from(uniqueMap.values());
        return unique.sort((a, b) => b.timestamp - a.timestamp);
      });
      // Push to Supabase
      const { error: upsertError } = await supabase.from('transactions').upsert(data);
      if (upsertError) {
        console.error('Supabase upsert error:', upsertError);
        setError('Data parsed but failed to save to database: ' + upsertError.message);
      }
    } catch (err) {
      console.error('PDF Parse Error:', err);
      setError(err.message || 'Error parsing PDF.');
    } finally {
      setLoading(false);
      // Reset all file inputs so the same file can be re-selected
      ['file-upload', 'file-upload-header'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = null;
      });
    }
  };

  const handleAddManualTransaction = async (e) => {
    e.preventDefault();
    if (!newTx.amount || !newTx.details || !newTx.date) {
      alert("Please ensure Date, Amount, and Details are filled out correctly.");
      return;
    }

    const [year, month, day] = newTx.date.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    const timestamp = new Date(`${year}-${month}-${day}T00:00:00`).getTime();

    const manualTx = {
      id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      date: formattedDate,
      time: '00:00:00',
      bankname: 'Manual Entry',
      account: 'N/A',
      sender: newTx.cr_dr === 'CR' ? newTx.details : 'Self',
      receiver: newTx.cr_dr === 'DR' ? newTx.details : 'Self',
      reference: `MANUAL-${Date.now()}`,
      type: newTx.cr_dr === 'CR' ? 'COLLECT' : 'PAY',
      amount: parseFloat(newTx.amount),
      cr_dr: newTx.cr_dr,
      status: 'SUCCESS',
      category: newTx.category,
      customdata: newTx.customdata,
      timestamp
    };

    setTransactions(prev => [...prev, manualTx].sort((a, b) => b.timestamp - a.timestamp));
    setShowModal(false);
    setNewTx({ date: getLocalDateString(), amount: '', cr_dr: 'DR', details: '', category: 'General', customdata: '' });
    
    // Push to Supabase
    const { error: insertError } = await supabase.from('transactions').insert([manualTx]);
    if (insertError) {
      console.error('Failed to save manual transaction:', insertError);
      alert('Record added locally but failed to save to database: ' + insertError.message);
    }
  };

  const handleAddInvestment = async (e) => {
    e.preventDefault();
    if (!newInvest.amount || !newInvest.date || !showInvestModal) return;
    
    const [year, month, day] = newInvest.date.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    const timestamp = new Date(`${year}-${month}-${day}T00:00:00`).getTime();
    const recordType = showInvestModal.type || 'investment';

    const invRecord = {
      id: `${recordType}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      investor_id: showInvestModal.investorId,
      date: formattedDate,
      amount: parseFloat(newInvest.amount),
      details: newInvest.details || (recordType === 'withdrawal' ? 'Withdrawal' : 'Investment'),
      type: recordType,
      timestamp
    };

    setUserInvestments(prev => [...prev, invRecord]);
    setShowInvestModal(null);
    setNewInvest({ date: getLocalDateString(), amount: '', details: '' });

    // Push to Supabase
    const { error: insertError } = await supabase.from('user_investments').insert([invRecord]);
    if (insertError) {
      console.error('Failed to save record:', insertError);
      alert('Record added locally but failed to save to database: ' + insertError.message);
    }
  };

  const handleDeleteInvestment = async (id) => {
    setUserInvestments(prev => prev.filter(inv => inv.id !== id));
    await supabase.from('user_investments').delete().eq('id', id);
  };
  const handleAddFbAd = async (e) => {
    e.preventDefault();
    if (!newFbAd.baseamount || !newFbAd.date) return;
    
    const [year, month, day] = newFbAd.date.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    
    const item = {
      id: `fbad_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      date: formattedDate,
      baseamount: parseFloat(newFbAd.baseamount),
      details: newFbAd.details || 'FB Ads Spend'
    };
    
    setManualFbAdsList(prev => [...prev, item]);
    setShowFbAdsModal(false);
    setNewFbAd({ date: getLocalDateString(), baseamount: '', details: '' });
    
    await supabase.from('fb_ads').insert([item]);
  };

  const handleDeleteFbAd = async (id) => {
    setManualFbAdsList(prev => prev.filter(item => item.id !== id));
    await supabase.from('fb_ads').delete().eq('id', id);
  };

  const handleUpdateFbAd = async (id, updates) => {
    setManualFbAdsList(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    await supabase.from('fb_ads').update(updates).eq('id', id);
  };
  
  const handleUpdateTransaction = async (id, updates) => {
    setTransactions(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      return updated.sort((a, b) => b.timestamp - a.timestamp);
    });
    await supabase.from('transactions').update(updates).eq('id', id);
  };

  const handleDelete = async (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    await supabase.from('transactions').delete().eq('id', id);
  };

  const clearAllData = async () => {
    if (window.confirm("Are you sure you want to clear ALL data? Make sure you have downloaded a backup first!")) {
      setTransactions([]);
      setSelectedIds(new Set());
      setShowSettings(false);
      
      // Clear Supabase Data (Wait, we should delete all records but there's no easy way to truncate via JS client without RLS bypassing. We can just delete where id is not null)
      await supabase.from('transactions').delete().neq('id', 'null');
      await supabase.from('fb_ads').delete().neq('id', 'null');
    }
  };

  const deleteAllFailed = async () => {
    if (window.confirm("Are you sure you want to delete all FAILURE records?")) {
      setTransactions(prev => prev.filter(t => t.status?.toUpperCase() !== 'FAILURE'));
      setSelectedIds(new Set());
      setShowSettings(false);
      
      await supabase.from('transactions').delete().eq('status', 'FAILURE');
    }
  };

  const handleExport = () => {
    window.print();
    setShowSettings(false);
  };

  // Bulk Selection Logic
  const handleSelectAll = (e, filteredList) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredList.map(t => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const applyBulkCategory = async () => {
    if(!bulkCategory) return;
    const idsToUpdate = Array.from(selectedIds);
    setTransactions(prev => prev.map(t => selectedIds.has(t.id) ? { ...t, category: bulkCategory } : t));
    setSelectedIds(new Set());
    setBulkCategory('');
    // Sync to Supabase
    for (const id of idsToUpdate) {
      await supabase.from('transactions').update({ category: bulkCategory }).eq('id', id);
    }
  };

  // Base Data Calculation
  const filteredTransactions = useMemo(() => {
    let startTimestamp = null;
    let endTimestamp = null;
    
    if (startDate) {
      const [y, m, d] = startDate.split('-');
      startTimestamp = new Date(`${y}-${m}-${d}T00:00:00`).getTime();
    }
    if (endDate) {
      const [y, m, d] = endDate.split('-');
      endTimestamp = new Date(`${y}-${m}-${d}T23:59:59`).getTime();
    }

    return transactions.filter(t => {
      if (filterType !== 'ALL' && t.cr_dr !== filterType) return false;
      if (filterStatus !== 'ALL' && t.status?.toUpperCase() !== filterStatus) return false;
      
      if (startTimestamp && t.timestamp < startTimestamp) return false;
      if (endTimestamp && t.timestamp > endTimestamp) return false;

      if (filterMonth !== 'ALL') {
        if (filterMonth.match(/^\d{4}$/)) {
          const year = new Date(t.timestamp).getFullYear().toString();
          if (year !== filterMonth) return false;
        } else {
          const monthYear = new Date(t.timestamp).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          if (monthYear !== filterMonth) return false;
        }
      }
      return true;
    });
  }, [transactions, filterType, filterMonth, filterStatus, startDate, endDate]);

  // Filter FB Ads by the same timeframe as transactions
  const filteredFbAds = useMemo(() => {
    if (filterMonth === 'ALL') return manualFbAdsList;
    return manualFbAdsList.filter(ad => {
      if (!ad.date) return true;
      // Parse DD/MM/YYYY to a timestamp
      const [d, m, y] = ad.date.split('/');
      const adTimestamp = new Date(`${y}-${m}-${d}T00:00:00`).getTime();
      if (filterMonth.match(/^\d{4}$/)) {
        return new Date(adTimestamp).getFullYear().toString() === filterMonth;
      } else {
        const adMonthYear = new Date(adTimestamp).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        return adMonthYear === filterMonth;
      }
    });
  }, [manualFbAdsList, filterMonth]);

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    
    filteredTransactions.forEach(t => {
      if (t.status?.toUpperCase() === 'SUCCESS') {
        if (t.cr_dr === 'CR') income += t.amount;
        if (t.cr_dr === 'DR') expense += t.amount;
      }
    });
    // Only deduct FB ads that fall within the current timeframe filter
    const totalFbAdsPaid = filteredFbAds.reduce((sum, item) => sum + (item.baseamount * 1.18), 0);
    expense += totalFbAdsPaid;

    return { income, expense, balance: income - expense };
  }, [filteredTransactions, filteredFbAds]);

  const chartData = useMemo(() => {
    const dailyData = {};
    filteredTransactions.forEach(t => {
      if (t.status?.toUpperCase() === 'SUCCESS') {
        if (!dailyData[t.date]) {
          dailyData[t.date] = { date: t.date, Income: 0, Expense: 0 };
        }
        if (t.cr_dr === 'CR') dailyData[t.date].Income += t.amount;
        if (t.cr_dr === 'DR') dailyData[t.date].Expense += t.amount;
      }
    });

    return Object.values(dailyData).sort((a, b) => {
      const dateA = a.date.split('/').reverse().join('');
      const dateB = b.date.split('/').reverse().join('');
      return dateA.localeCompare(dateB);
    });
  }, [filteredTransactions]);

  const monthlyBreakdown = useMemo(() => {
    const monthsData = {};
    transactions.forEach(t => {
      if (t.status?.toUpperCase() === 'SUCCESS') {
        const monthYear = new Date(t.timestamp).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        if (!monthsData[monthYear]) {
          monthsData[monthYear] = { month: monthYear, income: 0, expense: 0, net: 0, timestamp: new Date(t.timestamp).setDate(1) };
        }
        if (t.cr_dr === 'CR') {
          monthsData[monthYear].income += t.amount;
          monthsData[monthYear].net += t.amount;
        }
        if (t.cr_dr === 'DR') {
          monthsData[monthYear].expense += t.amount;
          monthsData[monthYear].net -= t.amount;
        }
      }
    });
    return Object.values(monthsData).sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions]);

  const availableMonths = useMemo(() => {
    return monthlyBreakdown.map(m => m.month);
  }, [monthlyBreakdown]);

  const yearlyBreakdown = useMemo(() => {
    const yearsData = {};
    transactions.forEach(t => {
      if (t.status?.toUpperCase() === 'SUCCESS') {
        const year = new Date(t.timestamp).getFullYear().toString();
        if (!yearsData[year]) {
          yearsData[year] = { year, income: 0, expense: 0, net: 0, timestamp: new Date(year, 0, 1).getTime() };
        }
        if (t.cr_dr === 'CR') {
          yearsData[year].income += t.amount;
          yearsData[year].net += t.amount;
        }
        if (t.cr_dr === 'DR') {
          yearsData[year].expense += t.amount;
          yearsData[year].net -= t.amount;
        }
      }
    });
    return Object.values(yearsData).sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions]);

  const availableYears = useMemo(() => {
    return yearlyBreakdown.map(y => y.year);
  }, [yearlyBreakdown]);
  const totalBaseFbAds = filteredFbAds.reduce((sum, item) => sum + item.baseamount, 0);
  const fbAdsTotal = totalBaseFbAds * 1.18;
  // Tab-Specific Logic (Investors)
  const addInvestor = async () => {
    const inv = { id: `inv_${Date.now()}`, name: `User ${investors.length + 1}` };
    setInvestors([...investors, inv]);
    await supabase.from('investors').insert([inv]);
  };

  const updateInvestor = async (id, field, value) => {
    setInvestors(investors.map(inv => inv.id === id ? { ...inv, [field]: value } : inv));
    await supabase.from('investors').update({ [field]: value }).eq('id', id);
  };

  const removeInvestor = async (id) => {
    if (window.confirm("Delete this user? Records tagged to them will remain in the master list.")) {
      setInvestors(investors.filter(inv => inv.id !== id));
      await supabase.from('investors').delete().eq('id', id);
    }
  };

  // Dynamic Investment Calculation - uses separate investments table
  const filteredInvestments = useMemo(() => {
    if (filterMonth === 'ALL') return userInvestments;
    return userInvestments.filter(inv => {
      if (!inv.date) return true;
      const [d, m, y] = inv.date.split('/');
      const ts = new Date(`${y}-${m}-${d}T00:00:00`).getTime();
      if (filterMonth.match(/^\d{4}$/)) {
        return new Date(ts).getFullYear().toString() === filterMonth;
      } else {
        const monthYear = new Date(ts).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        return monthYear === filterMonth;
      }
    });
  }, [userInvestments, filterMonth]);

  const splitData = useMemo(() => {
    if (investors.length === 0) return { splits: [], totalInvested: 0, totalWithdrawn: 0, totalProfit: summary.balance };
    
    const dynamicInvestors = investors.map(inv => {
      // Investments are filtered by timeframe
      const invested = filteredInvestments
        .filter(r => r.investor_id === inv.id && r.type !== 'withdrawal')
        .reduce((sum, r) => sum + r.amount, 0);
      // Withdrawals are ALWAYS all-time (not filtered by month)
      const withdrawn = userInvestments
        .filter(r => r.investor_id === inv.id && r.type === 'withdrawal')
        .reduce((sum, r) => sum + r.amount, 0);
      return { ...inv, invested, withdrawn, netInvested: invested - withdrawn };
    });

    const totalInvested = dynamicInvestors.reduce((sum, inv) => sum + inv.invested, 0);
    const totalWithdrawn = dynamicInvestors.reduce((sum, inv) => sum + inv.withdrawn, 0);
    
    // Net Profit = Total Balance - Total Investments (gross)
    const totalProfit = summary.balance - totalInvested; 
    const profitPerPerson = dynamicInvestors.length > 0 ? totalProfit / dynamicInvestors.length : 0;
    
    const splits = dynamicInvestors.map(inv => {
      const sharePercentage = 100 / dynamicInvestors.length;
      const profitShare = profitPerPerson;
      const totalPayout = inv.invested + profitShare; // Total they are entitled to
      const remainingPayout = totalPayout - inv.withdrawn; // What's left to pay them
      return {
        ...inv,
        sharePercentage,
        profitShare,
        totalPayout,
        remainingPayout
      };
    });

    return { splits, totalInvested, totalWithdrawn, totalProfit };
  }, [investors, filteredInvestments, userInvestments, summary.balance]);

  // Overall All-Time Calculation for Home Screen
  const allTimeSummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      if (t.status?.toUpperCase() === 'SUCCESS') {
        if (t.cr_dr === 'CR') income += t.amount;
        if (t.cr_dr === 'DR') expense += t.amount;
      }
    });
    const totalFbAdsPaid = manualFbAdsList.reduce((sum, item) => sum + (item.baseamount * 1.18), 0);
    expense += totalFbAdsPaid;

    return { income, expense, balance: income - expense };
  }, [transactions, manualFbAdsList]);

  const allTimeSplitData = useMemo(() => {
    if (investors.length === 0) return { splits: [], totalInvested: 0, totalWithdrawn: 0, totalProfit: allTimeSummary.balance };
    
    const dynamicInvestors = investors.map(inv => {
      const invested = userInvestments
        .filter(r => r.investor_id === inv.id && r.type !== 'withdrawal')
        .reduce((sum, r) => sum + r.amount, 0);
      const withdrawn = userInvestments
        .filter(r => r.investor_id === inv.id && r.type === 'withdrawal')
        .reduce((sum, r) => sum + r.amount, 0);
      return { ...inv, invested, withdrawn, netInvested: invested - withdrawn };
    });

    const totalInvested = dynamicInvestors.reduce((sum, inv) => sum + inv.invested, 0);
    const totalWithdrawn = dynamicInvestors.reduce((sum, inv) => sum + inv.withdrawn, 0);
    
    const totalProfit = allTimeSummary.balance - totalInvested; 
    const profitPerPerson = dynamicInvestors.length > 0 ? totalProfit / dynamicInvestors.length : 0;
    
    const splits = dynamicInvestors.map(inv => {
      const sharePercentage = 100 / dynamicInvestors.length;
      const profitShare = profitPerPerson;
      const totalPayout = inv.invested + profitShare;
      const remainingPayout = totalPayout - inv.withdrawn;
      return {
        ...inv,
        sharePercentage,
        profitShare,
        totalPayout,
        remainingPayout
      };
    });

    return { splits, totalInvested, totalWithdrawn, totalProfit };
  }, [investors, userInvestments, allTimeSummary.balance]);

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => { setIsDragging(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Reusable Table Component
  const TransactionTable = ({ list }) => (
    <div className="tableContainer">
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: '40px', textAlign: 'center' }}>
              <input 
                type="checkbox" 
                onChange={(e) => handleSelectAll(e, list)} 
                checked={list.length > 0 && Array.from(selectedIds).filter(id => list.find(t => t.id === id)).length === list.length} 
              />
            </th>
            <th>Date & Time</th>
            <th>Details</th>
            <th>Category</th>
            <th>Custom Data / Notes</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {list.map((t) => (
            <TransactionRow 
              key={t.id} 
              t={t} 
              isSelected={selectedIds.has(t.id)}
              onSelect={handleSelect}
              onDelete={handleDelete} 
              onUpdate={handleUpdateTransaction} 
            />
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="appContainer animate-fade-in">
      <datalist id="category-suggestions">
        {categories.map(c => <option key={c} value={c} />)}
      </datalist>

      <header className="header">
        <div className="title" style={{ cursor: 'pointer' }} onClick={() => setViewState('HOME')}>
          <Activity size={32} className="uploadIcon" style={{ marginBottom: 0 }} />
          SpendAnalytics
        </div>
        
        {/* Child-Friendly Simple Header Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {transactions.length > 0 && (
            <>
              <button className="button button-outline" onClick={() => setShowSettings(true)}>
                <Settings size={16} /> Data & Settings
              </button>
              <button className="button button-primary" onClick={() => setShowModal(true)}>
                <Plus size={16} /> Add Record
              </button>
            </>
          )}
          
          <button className="button button-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => document.getElementById('file-upload-header').click()}>
            <UploadCloud size={16} /> Add PDF
            <input 
              type="file" 
              id="file-upload-header" 
              className="hiddenInput" 
              accept="application/pdf"
              onChange={(e) => handleFileUpload(e.target.files[0])}
            />
          </button>
        </div>
      </header>

      {/* Settings Modal - Hiding the clutter! */}
      {showSettings && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '400px' }}>
            <h3 className="sectionTitle" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              Data Management 
              <button className="button" style={{ background: 'transparent', color: 'var(--text-secondary)' }} onClick={() => setShowSettings(false)}>X</button>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="button button-outline" onClick={() => document.getElementById('backup-upload').click()} style={{ justifyContent: 'center' }}>
                <Upload size={16} /> Import Backup
                <input type="file" id="backup-upload" className="hiddenInput" accept="application/json" onChange={handleImportBackup} />
              </button>
              
              <button className="button button-outline" onClick={handleExportBackup} style={{ justifyContent: 'center' }}>
                <Download size={16} /> Download JSON Backup
              </button>

              <button className="button button-outline" onClick={handleExport} style={{ justifyContent: 'center' }}>
                <Printer size={16} /> Print / Save as PDF
              </button>
              
              <button className="button button-primary" onClick={handleMigrateToSupabase} style={{ justifyContent: 'center', background: 'var(--accent-color)' }}>
                <UploadCloud size={16} /> Push Local Data to Supabase
              </button>

              <div style={{ borderTop: '1px solid var(--border-color)', margin: '1rem 0' }}></div>

              <button className="button button-outline" onClick={deleteAllFailed} style={{ color: 'var(--danger)', borderColor: 'var(--danger)', justifyContent: 'center' }}>
                <Trash2 size={16} /> Delete all Failed Records
              </button>
              <button className="button button-danger" onClick={clearAllData} style={{ justifyContent: 'center' }}>
                <Trash2 size={16} /> Erase All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="tab-navigation glass-panel">
          <button 
            className={`tab-button ${viewState === 'HOME' ? 'active' : ''}`} 
            onClick={() => setViewState('HOME')}
          >
            <Calendar size={16} /> Timeframe Menu
          </button>
          <button 
            className={`tab-button ${viewState === 'DASHBOARD' && activeTab === 'Overview' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('Overview'); setViewState('DASHBOARD'); }}
          >
            <Activity size={16} /> Overview
          </button>
          <button 
            className={`tab-button ${viewState === 'DASHBOARD' && activeTab === 'FB Ads' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('FB Ads'); setViewState('DASHBOARD'); }}
          >
            <PieChart size={16} /> FB Ads
          </button>
          {investors.map(inv => (
            <button 
              key={inv.id} 
              className={`tab-button ${viewState === 'DASHBOARD' && activeTab === inv.id ? 'active' : ''}`} 
              onClick={() => { setActiveTab(inv.id); setViewState('DASHBOARD'); }}
            >
              <User size={16} /> {inv.name}
            </button>
          ))}
          <button className="tab-button" onClick={addInvestor} style={{ border: '1px dashed var(--border-color)' }}>
            <Plus size={16} /> Add User
          </button>
        </div>
      )}

      {error && (
        <div className="glass-panel" style={{ padding: '1rem', color: 'var(--danger)', borderColor: 'var(--danger)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button className="button" style={{ background: 'transparent', color: 'var(--danger)', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} onClick={() => setError(null)}>✕ Dismiss</button>
        </div>
      )}

      {dbLoading ? (
        <div className="glass-panel uploadContainer">
          <Activity size={48} className="uploadIcon" style={{ animation: 'spin 1s linear infinite' }} />
          <h2 className="uploadTitle">Loading your data...</h2>
          <p className="uploadSubtitle">Connecting to database and fetching your records.</p>
        </div>
      ) : transactions.length === 0 ? (
        <div 
          className={`glass-panel uploadContainer ${isDragging ? 'dragActive' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => document.getElementById('file-upload').click()}
        >
          <UploadCloud size={64} className="uploadIcon" />
          <h2 className="uploadTitle">Upload your PDF Statement</h2>
          <p className="uploadSubtitle">Drag and drop your SBI PDF statement here. All data stays strictly on your device.</p>
          <input 
            type="file" 
            id="file-upload" 
            className="hiddenInput" 
            accept="application/pdf"
            onChange={(e) => handleFileUpload(e.target.files[0])}
          />
          {loading && <p style={{ marginTop: '1rem', color: 'var(--accent-color)' }}>Parsing document... please wait.</p>}
        </div>
      ) : viewState === 'HOME' ? (
        <div className="animate-fade-in">
          {/* Overall User Balances Section */}
          <div className="glass-panel section" style={{ marginBottom: '2.5rem', background: 'rgba(59, 130, 246, 0.03)', borderColor: 'var(--accent-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 className="sectionTitle" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={22} color="var(--accent-color)" /> Overall User Balances & Payouts
                </h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  All-time cumulative total investments, withdrawals, and remaining payouts for all users.
                </div>
              </div>
              <button className="button button-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowModal(true)}>
                <Plus size={16} /> Add Record
              </button>
            </div>

            <div className="dashboardGrid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              {allTimeSplitData.splits.map(split => (
                <div 
                  key={split.id} 
                  className="glass-panel" 
                  style={{ padding: '1.25rem', background: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{split.name}</span>
                    <button 
                      className="button button-outline" 
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => { setActiveTab(split.id); setViewState('DASHBOARD'); }}
                    >
                      View User Details →
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Invested:</span>
                    <span style={{ fontWeight: 600, color: 'var(--success)' }}>+₹{split.invested.toLocaleString('en-IN')}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Already Withdrawn:</span>
                    <span style={{ fontWeight: 600, color: 'var(--danger)' }}>-₹{split.withdrawn.toLocaleString('en-IN')}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Profit Share:</span>
                    <span style={{ fontWeight: 600, color: split.profitShare >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {split.profitShare >= 0 ? '+' : ''}₹{split.profitShare.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, paddingTop: '0.75rem', borderTop: '1px dashed var(--border-color)', color: 'var(--accent-color)' }}>
                    <span>Remaining Payout:</span>
                    <span>₹{split.remainingPayout.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <h2 className="sectionTitle" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Choose a Timeframe</h2>
          
          <h3 className="sectionTitle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <Calendar size={20} /> Yearly View
          </h3>
          <div className="home-grid">
            <div 
              className="home-card"
              onClick={() => { setFilterMonth('ALL'); setViewState('DASHBOARD'); }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>All Time History</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>View your entire financial history combined into one dashboard.</div>
            </div>
            {yearlyBreakdown.map(y => (
              <div 
                key={y.year} 
                className="home-card"
                onClick={() => { setFilterMonth(y.year); setViewState('DASHBOARD'); }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{y.year}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Income:</span>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>+₹{y.income.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Expense:</span>
                  <span style={{ color: 'var(--danger)', fontWeight: 600 }}>-₹{y.expense.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
                  <span>Net Profit:</span>
                  <span style={{ color: y.net >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {y.net >= 0 ? '+' : ''}₹{y.net.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <h3 className="sectionTitle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginTop: '3rem' }}>
            <Calendar size={20} /> Monthly View
          </h3>
          <div className="home-grid">
            {monthlyBreakdown.map(m => (
              <div 
                key={m.month} 
                className="home-card"
                onClick={() => { setFilterMonth(m.month); setViewState('DASHBOARD'); }}
              >
                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>{m.month}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Income:</span>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>+₹{m.income.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Expense:</span>
                  <span style={{ color: 'var(--danger)', fontWeight: 600 }}>-₹{m.expense.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
                  <span>Net Profit:</span>
                  <span style={{ color: m.net >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {m.net >= 0 ? '+' : ''}₹{m.net.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Progressive Disclosure: Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="button button-outline" onClick={() => setViewState('HOME')} style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <ArrowLeft size={18} /> Back to Menu
            </button>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="button button-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowFilters(!showFilters)}>
                <Filter size={16} /> Filter Data
              </button>
              <button className="button button-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowModal(true)}>
                <Plus size={16} /> Add Record
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(59, 130, 246, 0.03)', borderColor: 'var(--accent-color)' }}>
              <div style={{ fontWeight: 600, color: 'var(--accent-color)', fontSize: '0.875rem' }}>Advanced Data Filters</div>
              <div className="controls" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>From:</span>
                  <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>To:</span>
                  <input type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                
                <select className="select" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                  <option value="ALL">All Time</option>
                  <optgroup label="By Year">
                    {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </optgroup>
                  <optgroup label="By Month">
                    {availableMonths.map(m => <option key={m} value={m}>{m}</option>)}
                  </optgroup>
                </select>

                <select className="select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="ALL">All Record Types</option>
                  <option value="CR">Income Only (CR)</option>
                  <option value="DR">Expenses Only (DR)</option>
                </select>

                <select className="select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="ALL">All Statuses</option>
                  <option value="SUCCESS">Success Only</option>
                  <option value="FAILURE">Failed Only</option>
                </select>
              </div>
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === 'Overview' && (
            <div className="animate-fade-in">
              <div className="dashboardGrid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.5rem' }}>
                <div className="glass-panel summaryCard">
                  <div className="cardHeader">
                    <span>Total Income</span>
                    <ArrowDownCircle size={20} color="var(--success)" />
                  </div>
                  <div className="cardAmount amountSuccess">₹{summary.income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
                
                <div className="glass-panel summaryCard">
                  <div className="cardHeader">
                    <span>Total Expenses (Incl. Ads)</span>
                    <ArrowUpCircle size={20} color="var(--danger)" />
                  </div>
                  <div className="cardAmount amountDanger">₹{summary.expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>

                <div className="glass-panel summaryCard">
                  <div className="cardHeader">
                    <span>Net Profit / Balance</span>
                    <Activity size={20} color={summary.balance >= 0 ? "var(--success)" : "var(--danger)"} />
                  </div>
                  <div className={`cardAmount ${summary.balance >= 0 ? 'amountSuccess' : 'amountDanger'}`}>
                    {summary.balance >= 0 ? '+' : ''}₹{summary.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="glass-panel section">
                <h3 className="sectionTitle">Cash Flow Trend</h3>
                <div className="chartContainer">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--success)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="var(--danger)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                        itemStyle={{ color: 'var(--text-primary)' }}
                      />
                      <Area type="monotone" dataKey="Income" stroke="var(--success)" fillOpacity={1} fill="url(#colorIncome)" />
                      <Area type="monotone" dataKey="Expense" stroke="var(--danger)" fillOpacity={1} fill="url(#colorExpense)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel section">
                <h3 className="sectionTitle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <Users size={20} /> Business Profit Sharing 
                  <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>
                    (Filtered to: {filterMonth})
                  </span>
                </h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--panel-bg)', borderRadius: '12px', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Investments</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>₹{splitData.totalInvested.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Withdrawn</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--danger)' }}>-₹{splitData.totalWithdrawn.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Net Balance</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>₹{summary.balance.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Profit (Split Equally)</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: splitData.totalProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {splitData.totalProfit >= 0 ? '+' : ''}₹{splitData.totalProfit.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="dashboardGrid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                  {investors.map((inv) => {
                    const splitInfo = splitData.splits.find(s => s.id === inv.id);
                    return (
                      <div key={inv.id} className="glass-panel" style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.05)', background: 'var(--bg-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '1rem', fontWeight: 600 }}>{inv.name}</span>
                        </div>
                        {splitInfo && (
                          <div style={{ background: 'var(--panel-bg)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Invested</span>
                              <span style={{ color: 'var(--success)' }}>₹{(splitInfo.invested || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Withdrawn</span>
                              <span style={{ color: 'var(--danger)' }}>-₹{(splitInfo.withdrawn || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Profit Share</span>
                              <span style={{ color: splitInfo.profitShare >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                {splitInfo.profitShare >= 0 ? '+' : ''}₹{splitInfo.profitShare.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)', fontWeight: 600 }}>
                              <span>Remaining Payout</span>
                              <span>₹{splitInfo.remainingPayout.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Removing the huge Breakdown Tables from here, since they live on the Home screen now! */}

              <div className="glass-panel section" style={{ paddingBottom: selectedIds.size > 0 ? '5rem' : '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 className="sectionTitle" style={{ marginBottom: 0 }}>All Records</h3>
                  <span className="badge badgeSuccess" style={{ background: 'var(--bg-color)', color: 'var(--text-secondary)' }}>
                    {filteredTransactions.length} items
                  </span>
                </div>
                <TransactionTable list={filteredTransactions} />
              </div>
            </div>
          )}

          {/* FB ADS TAB */}
          {activeTab === 'FB Ads' && (() => {
            const allBaseFbAds = manualFbAdsList.reduce((sum, item) => sum + item.baseamount, 0);
            const allFbAdsTotal = allBaseFbAds * 1.18;
            const allGst = allFbAdsTotal - allBaseFbAds;
            return (
            <div className="animate-fade-in">
              <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'var(--panel-bg)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 className="sectionTitle" style={{ marginBottom: 0, color: 'var(--text-primary)' }}>FB Ads Spend</h3>
                  <button className="button button-primary" onClick={() => setShowFbAdsModal(true)}>
                    <Plus size={16} /> Add FB Ad Spend
                  </button>
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  FB Ads are deducted from the Net Balance based on the selected timeframe filter. This page shows all records.
                </div>
              </div>

              <div className="dashboardGrid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.5rem' }}>
                <div className="glass-panel summaryCard" style={{ background: 'rgba(59, 130, 246, 0.05)', borderColor: 'var(--accent-color)' }}>
                  <div className="cardHeader">
                    <span>Total Paid (Incl. 18% GST)</span>
                    <PieChart size={20} color="var(--accent-color)" />
                  </div>
                  <div className="cardAmount" style={{ color: 'var(--accent-color)' }}>
                    ₹{allFbAdsTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                
                <div className="glass-panel summaryCard">
                  <div className="cardHeader">
                    <span>Actual Ad Spend</span>
                    <Activity size={20} color="var(--success)" />
                  </div>
                  <div className="cardAmount amountSuccess">
                    ₹{allBaseFbAds.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="glass-panel summaryCard">
                  <div className="cardHeader">
                    <span>18% GST Paid</span>
                    <ArrowUpCircle size={20} color="var(--danger)" />
                  </div>
                  <div className="cardAmount amountDanger">
                    ₹{allGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '-0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                The total paid amount is automatically deducted from the business Net Balance before profit distribution.
              </div>

              <div className="glass-panel section" style={{ paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 className="sectionTitle" style={{ marginBottom: 0 }}>Ad Expense Records</h3>
                  <span className="badge badgeSuccess" style={{ background: 'var(--bg-color)', color: 'var(--text-secondary)' }}>
                    {manualFbAdsList.length} records found
                  </span>
                </div>
                <div className="tableContainer">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Details</th>
                        <th style={{ textAlign: 'right' }}>Base Spend</th>
                        <th style={{ textAlign: 'right' }}>GST (18%)</th>
                        <th style={{ textAlign: 'right' }}>Total Paid</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {manualFbAdsList.map(item => (
                        <FbAdRow 
                          key={item.id} 
                          item={item} 
                          onDelete={handleDeleteFbAd} 
                          onUpdate={handleUpdateFbAd} 
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            );
          })()}

          {/* DYNAMIC INVESTOR TABS */}
          {activeTab.startsWith('inv_') && (
            <div className="animate-fade-in">
              {investors.filter(inv => inv.id === activeTab).map(inv => {
                const splitInfo = splitData.splits.find(s => s.id === inv.id);
                const thisUserInvestments = filteredInvestments.filter(r => r.investor_id === inv.id && r.type !== 'withdrawal').sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                const thisUserWithdrawals = userInvestments.filter(r => r.investor_id === inv.id && r.type === 'withdrawal').sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                
                return (
                  <div key={inv.id}>
                    <div className="glass-panel section" style={{ marginTop: 0, marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <input 
                            type="text" 
                            className="input" 
                            value={inv.name} 
                            onChange={(e) => updateInvestor(inv.id, 'name', e.target.value)} 
                            style={{ fontSize: '2rem', fontWeight: 700, border: 'none', background: 'transparent', padding: 0, marginBottom: '0.5rem', color: 'var(--text-primary)' }}
                            placeholder="User Name"
                          />
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            Investments, withdrawals, and payout structure for the selected timeframe.
                          </div>
                        </div>
                        <button className="button button-danger" onClick={() => removeInvestor(inv.id)}>
                          <Trash2 size={16} /> Delete User
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button 
                          className="button button-primary" 
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', background: 'var(--success)', border: 'none', fontSize: '1rem' }}
                          onClick={() => handleOpenInvestModal(inv.id, 'investment')}
                        >
                          <ArrowDownCircle size={20} /> Add Investment
                        </button>
                        <button 
                          className="button button-primary" 
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', background: 'var(--danger)', border: 'none', fontSize: '1rem' }}
                          onClick={() => handleOpenInvestModal(inv.id, 'withdrawal')}
                        >
                          <ArrowUpCircle size={20} /> Add Withdrawal
                        </button>
                      </div>

                      {/* Stats Cards */}
                      <div className="dashboardGrid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginTop: '1.5rem' }}>
                        <div style={{ background: 'var(--panel-bg)', padding: '1.25rem', borderRadius: '12px' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Invested</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                            ₹{(splitInfo?.invested || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div style={{ background: 'var(--panel-bg)', padding: '1.25rem', borderRadius: '12px' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Already Withdrawn</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>
                            -₹{(splitInfo?.withdrawn || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div style={{ background: 'var(--panel-bg)', padding: '1.25rem', borderRadius: '12px' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Equal Profit Share</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: splitInfo?.profitShare >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {splitInfo?.profitShare >= 0 ? '+' : ''}₹{(splitInfo?.profitShare || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </div>
                        </div>
                        <div style={{ background: 'var(--accent-color)', padding: '1.25rem', borderRadius: '12px', color: 'white' }}>
                          <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.5rem' }}>Remaining Payout</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                            ₹{(splitInfo?.remainingPayout || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Investment & Withdrawal Log */}
                    <div className="glass-panel section" style={{ paddingBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                          <h3 className="sectionTitle" style={{ marginBottom: 0 }}>Transaction Log for {inv.name}</h3>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            Investments are per-timeframe. Withdrawals are all-time (always shown).
                          </div>
                        </div>
                        <span className="badge badgeSuccess" style={{ background: 'var(--bg-color)', color: 'var(--text-secondary)' }}>
                          {thisUserInvestments.length + thisUserWithdrawals.length} records
                        </span>
                      </div>
                      <div className="tableContainer">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Type</th>
                              <th>Details</th>
                              <th style={{ textAlign: 'right' }}>Amount</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {(thisUserInvestments.length + thisUserWithdrawals.length) === 0 ? (
                              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No records yet. Add an investment or withdrawal to start.</td></tr>
                            ) : [...thisUserInvestments, ...thisUserWithdrawals].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).map(r => (
                              <tr key={r.id}>
                                <td>{r.date}</td>
                                <td>
                                  <span className={`badge ${r.type === 'withdrawal' ? 'badgeFailure' : 'badgeSuccess'}`} style={{ fontSize: '0.7rem' }}>
                                    {r.type === 'withdrawal' ? 'WITHDRAWAL' : 'INVESTMENT'}
                                  </span>
                                </td>
                                <td>{r.details}</td>
                                <td style={{ textAlign: 'right', fontWeight: 600, color: r.type === 'withdrawal' ? 'var(--danger)' : 'var(--success)' }}>
                                  {r.type === 'withdrawal' ? '-' : '+'}₹{r.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  <button className="button" style={{ padding: '0.25rem 0.5rem', background: 'transparent', color: 'var(--danger)' }} onClick={() => handleDeleteInvestment(r.id)}>
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bulk Actions Bar */}
          {selectedIds.size > 0 && (
            <div className="bulk-actions">
              <span style={{ fontWeight: 600 }}>{selectedIds.size} Selected</span>
              
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
                <input 
                  list="category-suggestions"
                  className="input" 
                  value={bulkCategory}
                  onChange={e => setBulkCategory(e.target.value)}
                  placeholder="Type Category..."
                />
                <button className="button" onClick={applyBulkCategory}>Apply</button>
              </div>
              
              <button className="button button-danger" onClick={async () => {
                if(window.confirm(`Delete ${selectedIds.size} records?`)) {
                  const idsToDelete = Array.from(selectedIds);
                  setTransactions(prev => prev.filter(t => !selectedIds.has(t.id)));
                  setSelectedIds(new Set());
                  // Sync to Supabase
                  for (const id of idsToDelete) {
                    await supabase.from('transactions').delete().eq('id', id);
                  }
                }
              }}>
                Delete Selected
              </button>
            </div>
          )}

        </>
      )}

      {/* Add Manual Transaction Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in">
            <h3 className="sectionTitle">Add Custom Record</h3>
            <form onSubmit={handleAddManualTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Date</label>
                <input type="date" className="input" value={newTx.date} onChange={e => setNewTx({...newTx, date: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input type="number" step="0.01" className="input" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} placeholder="e.g. 500" required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select className="select" value={newTx.cr_dr} onChange={e => setNewTx({...newTx, cr_dr: e.target.value})}>
                  <option value="DR">Expense (Money Out)</option>
                  <option value="CR">Income (Money In)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Details / Name</label>
                <input type="text" className="input" value={newTx.details} onChange={e => setNewTx({...newTx, details: e.target.value})} placeholder="e.g. Grocery Store" required />
              </div>
              <div className="form-group">
                <label>Category (Type or Select)</label>
                <input list="category-suggestions" className="input" value={newTx.category} onChange={e => setNewTx({...newTx, category: e.target.value})} placeholder="e.g. Paid, FB Ads" />
              </div>
              <div className="form-group">
                <label>Custom Notes</label>
                <input type="text" className="input" value={newTx.customdata} onChange={e => setNewTx({...newTx, customdata: e.target.value})} placeholder="Any additional notes..." />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="button button-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="button">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Investment / Withdrawal Modal */}
      {showInvestModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in">
            <h3 className="sectionTitle">
              {showInvestModal.type === 'withdrawal' ? 'Log Withdrawal for' : 'Log Investment for'} {investors.find(i => i.id === showInvestModal.investorId)?.name}
            </h3>
            <form onSubmit={handleAddInvestment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Date</label>
                <input type="date" className="input" value={newInvest.date} onChange={e => setNewInvest({...newInvest, date: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input type="number" step="0.01" className="input" value={newInvest.amount} onChange={e => setNewInvest({...newInvest, amount: e.target.value})} placeholder="e.g. 1000" required />
              </div>
              <div className="form-group">
                <label>Details / Notes (Optional)</label>
                <input type="text" className="input" value={newInvest.details} onChange={e => setNewInvest({...newInvest, details: e.target.value})} placeholder={showInvestModal.type === 'withdrawal' ? 'e.g. Cash withdrawal, UPI transfer' : 'e.g. Wire Transfer, Cash, etc.'} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="button button-outline" onClick={() => setShowInvestModal(null)}>Cancel</button>
                <button type="submit" className="button button-primary" style={{ background: showInvestModal.type === 'withdrawal' ? 'var(--danger)' : 'var(--success)', border: 'none' }}>
                  {showInvestModal.type === 'withdrawal' ? 'Add Withdrawal' : 'Add Investment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD FB ADS MODAL */}
      {showFbAdsModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in">
            <h3 className="sectionTitle" style={{ marginBottom: '1.5rem' }}>Add Global FB Ads Spend</h3>
            <form onSubmit={handleAddFbAd} className="controls" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Date</label>
                  <input type="date" className="input" value={newFbAd.date} onChange={e => setNewFbAd({...newFbAd, date: e.target.value})} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Base Ad Spend (₹)</label>
                  <input type="number" step="0.01" className="input" value={newFbAd.baseamount} onChange={e => setNewFbAd({...newFbAd, baseamount: e.target.value})} placeholder="e.g. 5000" required />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Campaign / Details (Optional)</label>
                <input type="text" className="input" value={newFbAd.details} onChange={e => setNewFbAd({...newFbAd, details: e.target.value})} placeholder="e.g. Lead Gen July" />
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid var(--accent-color)', borderRadius: '8px', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Base Amount:</span>
                  <span>₹{parseFloat(newFbAd.baseamount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>+ 18% GST:</span>
                  <span style={{ color: 'var(--danger)' }}>₹{(parseFloat(newFbAd.baseamount || 0) * 0.18).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 600, borderTop: '1px dashed var(--border-color)', paddingTop: '0.25rem', marginTop: '0.25rem' }}>
                  <span>Total Paid:</span>
                  <span>₹{(parseFloat(newFbAd.baseamount || 0) * 1.18).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="button button-outline" onClick={() => setShowFbAdsModal(false)}>Cancel</button>
                <button type="submit" className="button button-primary">Add Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
