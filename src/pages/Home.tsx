export {};
import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Dialog, IconButton, Paper, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, InputLabel, FormControl, Tabs, Tab } from '@mui/material';
import TableGrid from '../components/TableGrid';
import OrderPanel from '../components/OrderPanel';
import CloseIcon from '@mui/icons-material/Close';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { MenuItemType, OrderItem } from '../types';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
dayjs.extend(weekday);
dayjs.extend(localeData);

interface OrderHistoryItem {
  date: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  customerName?: string;
  isDebt?: boolean;
}

type OrdersState = {
  [tableNumber: number]: OrderItem[];
};
type OrderHistoryState = {
  [tableNumber: number]: OrderHistoryItem[];
};

const menuItems: MenuItemType[] = [
  // İçecekler
  { id: 1, name: 'Kola', price: 50, category: 'drink' },
  { id: 2, name: 'Fanta', price: 50, category: 'drink' },
  { id: 3, name: 'Ice Tea', price: 50, category: 'drink' },
  { id: 4, name: 'Meyve Suyu', price: 50, category: 'drink' },
  { id: 5, name: 'Meyveli Soda', price: 25, category: 'drink' },
  { id: 6, name: 'Sade Soda', price: 20, category: 'drink' },
  { id: 7, name: 'Ayran', price: 20, category: 'drink' },
  { id: 8, name: 'Su', price: 10, category: 'drink' },
  { id: 9, name: 'Çay', price: 15, category: 'drink' },
  { id: 10, name: 'Türk kahvesi', price: 50, category: 'drink' },
  { id: 11, name: 'Nescafe', price: 40, category: 'drink' },
  // Kahvaltı
  { id: 12, name: 'Kahvaltı Tabağı', price: 300, category: 'breakfast' },
  { id: 13, name: 'Serpme Kahvaltı', price: 600, category: 'breakfast' },
  // Çorba
  { id: 14, name: 'Kelle Paça', price: 200, category: 'soup' },
  { id: 15, name: 'İşkembe', price: 200, category: 'soup' },
  { id: 16, name: 'Mercimek', price: 100, category: 'soup' },
  { id: 17, name: 'Tavuk Çorbası', price: 150, category: 'soup' },
  // Yemek
  { id: 18, name: 'Köfte Ekmek', price: 180, category: 'food' },
  { id: 19, name: 'Köfte Porsiyon', price: 300, category: 'food' },
  { id: 20, name: 'Tavuk Pilav', price: 150, category: 'food' },
  { id: 21, name: 'Tavuk Şiş', price: 300, category: 'food' },
  { id: 22, name: 'Mantı', price: 300, category: 'food' },
  { id: 23, name: 'Kokoreç', price: 220, category: 'food' },
  { id: 24, name: 'Tost', price: 130, category: 'food' },
];

const USERS = [
  { username: 'garson', password: 'garson', role: 'garson', displayName: 'Garson' },
  { username: 'admin', password: 'olamaz123', role: 'admin', displayName: 'Yönetici' },
];

const Login: React.FC<{ onLogin: (user: string, role: string, displayName: string) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('garson');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = USERS.find(u => u.username === username && u.password === password && u.role === role);
    if (found) {
      onLogin(found.username, found.role, found.displayName);
    } else {
      setError('Kullanıcı adı, şifre veya rol hatalı!');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5dc' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 16px #0001', minWidth: 320 }}>
        <h2 style={{ textAlign: 'center', color: '#8B4513' }}>Giriş Yap</h2>
        <div style={{ marginBottom: 16 }}>
          <label>Kullanıcı Adı</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 4 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Şifre</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 4 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Rol</label>
          <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 4 }}>
            <option value="garson">Garson</option>
            <option value="admin">Yönetici</option>
          </select>
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: 10, background: '#8B4513', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600 }}>Giriş Yap</button>
      </form>
    </div>
  );
};

const sabitKategoriler = [
  { value: 'drink', label: 'İçecek' },
  { value: 'breakfast', label: 'Kahvaltı' },
  { value: 'soup', label: 'Çorba' },
  { value: 'food', label: 'Yemek' },
];

const Home: React.FC = () => {
  const [user, setUser] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [orders, setOrders] = useState<OrdersState>({});
  const [orderHistory, setOrderHistory] = useState<OrderHistoryState>(() => {
    const saved = localStorage.getItem('orderHistory');
    return saved ? JSON.parse(saved) : {};
  });
  const [reportOpen, setReportOpen] = useState(false);
  const [menuManageOpen, setMenuManageOpen] = useState(false);
  const [menuList, setMenuList] = useState<MenuItemType[]>(menuItems);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: sabitKategoriler[0].value });
  const [editId, setEditId] = useState<number|null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [menuManageTab, setMenuManageTab] = useState(0);
  const [statusOpen, setStatusOpen] = useState(false);
  const [debtOpen, setDebtOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<{ ad: string; kayitlar: { masa: number; tutar: number; tarih: string; index: number; urunler: string }[] } | null>(null);
  const [payDebtName, setPayDebtName] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<string>('');
  const [paymentHistoryOpen, setPaymentHistoryOpen] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Record<string, { amount: number; date: string }[]>>(() => {
    const saved = localStorage.getItem('paymentHistory');
    return saved ? JSON.parse(saved) : {};
  });
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState('');

  // orderHistory değişince localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
  }, [orderHistory]);

  // Ödeme geçmişi için state
  useEffect(() => {
    localStorage.setItem('paymentHistory', JSON.stringify(paymentHistory));
  }, [paymentHistory]);

  if (!user || !role || !displayName) {
    return <Login onLogin={(u, r, d) => { setUser(u); setRole(r); setDisplayName(d); }} />;
  }

  // Sipariş ekleme/çıkarma fonksiyonları
  const updateOrder = (tableNumber: number, newOrder: OrderItem[]) => {
    setOrders((prev) => ({ ...prev, [tableNumber]: newOrder }));
  };

  const getTableTotal = (tableNumber: number) => {
    const order = orders[tableNumber] || [];
    return order.reduce((total, item) => total + item.menuItem.price * item.quantity, 0);
  };

  const handleTableClick = (tableNumber: number) => {
    setSelectedTable(tableNumber);
  };

  const handleClosePanel = () => {
    setSelectedTable(null);
  };

  // Sipariş geçmişine kayıt ekle
  const addOrderHistory = (tableNumber: number, historyItem: OrderHistoryItem) => {
    setOrderHistory((prev) => ({
      ...prev,
      [tableNumber]: [...(prev[tableNumber] || []), historyItem],
    }));
  };

  // Profil alanı
  const handleLogout = () => {
    setUser(null);
    setRole(null);
    setDisplayName(null);
  };

  // Raporlama hesaplamaları
  const allHistory = Object.values(orderHistory).flat();
  const now = dayjs();

  // Günlük ciro
  const gunlukCiro = allHistory
    .filter(h => {
      const tarih = dayjs(h.date, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');
      const bugun = now.format('YYYY-MM-DD');
      return tarih === bugun;
    })
    .reduce((sum, h) => sum + (h.total || 0), 0);

  // Haftalık ciro (Pazartesi-Pazartesi)
  const startOfWeek = now.startOf('week').add(1, 'day'); // Pazartesi
  const endOfWeek = startOfWeek.add(6, 'day');
  const haftalikCiro = allHistory
    .filter(h => {
      const tarih = dayjs(h.date, 'YYYY-MM-DD HH:mm:ss');
      return (
        tarih.isAfter(startOfWeek, 'day') || tarih.isSame(startOfWeek, 'day')
      ) && (
        tarih.isBefore(endOfWeek, 'day') || tarih.isSame(endOfWeek, 'day')
      );
    })
    .reduce((sum, h) => sum + (h.total || 0), 0);

  // Aylık ciro (Ay başı-sonu, ay ismine göre)
  const startOfMonth = now.startOf('month');
  const endOfMonth = now.endOf('month');
  const aylikCiro = allHistory
    .filter(h => {
      const tarih = dayjs(h.date, 'YYYY-MM-DD HH:mm:ss');
      return (
        tarih.isAfter(startOfMonth, 'day') || tarih.isSame(startOfMonth, 'day')
      ) && (
        tarih.isBefore(endOfMonth, 'day') || tarih.isSame(endOfMonth, 'day')
      );
    })
    .reduce((sum, h) => sum + (h.total || 0), 0);
  const ayIsmi = now.locale('tr').format('MMMM');

  // En çok satılan ürünler kategorilere göre
  const kategoriMap: Record<string, { name: string; adet: number }[]> = {
    drink: [],
    breakfast: [],
    soup: [],
    food: [],
  };
  allHistory.forEach(h => {
    h.items.forEach((item: any) => {
      kategoriMap[item.menuItem.category] = kategoriMap[item.menuItem.category] || [];
      const mevcut = kategoriMap[item.menuItem.category].find(u => u.name === item.menuItem.name);
      if (mevcut) {
        mevcut.adet += item.quantity;
      } else {
        kategoriMap[item.menuItem.category].push({ name: item.menuItem.name, adet: item.quantity });
      }
    });
  });
  // Her kategoride en çok satılanları sırala
  Object.keys(kategoriMap).forEach(cat => {
    kategoriMap[cat] = kategoriMap[cat].sort((a, b) => b.adet - a.adet).slice(0, 5);
  });

  // Siparişi başka masaya aktarma fonksiyonu
  const handleTableChange = (oldTable: number, newTable: number, items: OrderItem[]) => {
    setOrders(prev => {
      const updated = { ...prev };
      updated[oldTable] = [];
      updated[newTable] = [...(prev[newTable] || []), ...items];
      return updated;
    });
  };

  // Ürün ekle
  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    setMenuList(prev => ([...prev, { id: Date.now(), name: newProduct.name, price: Number(newProduct.price), category: newProduct.category as MenuItemType["category"] }]));
    setNewProduct({ name: '', price: '', category: sabitKategoriler[0].value });
  };
  // Ürün sil
  const handleDeleteProduct = (id: number) => {
    setMenuList(prev => prev.filter(p => p.id !== id));
  };
  // Fiyat güncelle
  const handleEditPrice = (id: number) => {
    setMenuList(prev => prev.map(p => p.id === id ? { ...p, price: Number(editPrice) } : p));
    setEditId(null);
    setEditPrice('');
  };

  // Anlık durum için masa ve sipariş bilgileri
  const masaDurumlari = Array.from({ length: 16 }, (_, i) => {
    const total = getTableTotal(i + 1);
    return {
      id: i + 1,
      label: i + 1 === 13 ? 'Bahçe 1' : i + 1 === 14 ? 'Bahçe 2' : i + 1 === 15 ? 'Kapı 1' : i + 1 === 16 ? 'Kapı 2' : `Masa ${i + 1}`,
      dolu: total > 0,
      tutar: total
    };
  });
  const aktifSiparisler = masaDurumlari.filter(m => m.dolu);

  // Borçlu müşteri listesi (isim bazında birleştirilmiş)
  const borcGruplari: Record<string, { toplam: number; kayitlar: { masa: number; tutar: number; tarih: string; index: number; urunler: string }[] }> = {};
  Object.entries(orderHistory).forEach(([masa, history]) => {
    history.forEach((h, idx) => {
      if (h.isDebt && h.customerName) {
        const urunler = h.items.map((item: any) => `${item.quantity} ${item.menuItem.name}`).join(', ');
        if (!borcGruplari[h.customerName]) borcGruplari[h.customerName] = { toplam: 0, kayitlar: [] };
        borcGruplari[h.customerName].toplam += h.total;
        borcGruplari[h.customerName].kayitlar.push({ masa: Number(masa), tutar: h.total, tarih: h.date, index: idx, urunler });
      }
    });
  });
  const borclularList = Object.entries(borcGruplari);

  // Borç ödeme işlemi
  const handleDebtPay = (ad: string) => {
    setPayDebtName(ad);
    setPayAmount('');
  };
  const handleDebtPayConfirm = () => {
    if (!payDebtName) return;
    const odenecek = Number(payAmount);
    if (!odenecek || odenecek <= 0) return;
    setOrderHistory(prev => {
      const updated = { ...prev };
      let kalan = odenecek;
      const kayitlar = borcGruplari[payDebtName].kayitlar.slice().sort((a, b) => new Date(a.tarih).getTime() - new Date(b.tarih).getTime());
      kayitlar.forEach(k => {
        const h = updated[k.masa]?.[k.index];
        if (h && h.isDebt && kalan > 0) {
          if (h.total <= kalan) {
            kalan -= h.total;
            h.isDebt = false;
          } else {
            h.total -= kalan;
            kalan = 0;
          }
        }
      });
      return updated;
    });
    // Ödeme geçmişine ekle
    setPaymentHistory(prev => {
      const updated = { ...prev };
      if (!updated[payDebtName]) updated[payDebtName] = [];
      updated[payDebtName].push({ amount: odenecek, date: dayjs().format('YYYY-MM-DD HH:mm:ss') });
      return updated;
    });
    setPayDebtName(null);
    setPayAmount('');
  };

  // Kasa/Ödeme raporları için hesaplamalar
  const gunlukHistory = allHistory.filter(h => {
    const tarih = dayjs(h.date, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');
    const bugun = now.format('YYYY-MM-DD');
    return tarih === bugun;
  });
  const nakitToplam = gunlukHistory.filter(h => h.paymentMethod === 'cash').reduce((sum, h) => sum + (h.total || 0), 0);
  const kartToplam = gunlukHistory.filter(h => h.paymentMethod === 'card').reduce((sum, h) => sum + (h.total || 0), 0);
  const gunSonuKasa = gunlukHistory.reduce((sum, h) => sum + (h.total || 0), 0);

  // Verileri sıfırlama fonksiyonu (sadece admin)
  const handleResetData = () => {
    setResetConfirmOpen(true);
  };

  const handleResetConfirm = () => {
    if (resetPassword === 'olamaz123') {
      setOrderHistory({});
      setPaymentHistory({});
      localStorage.removeItem('orderHistory');
      localStorage.removeItem('paymentHistory');
      setResetConfirmOpen(false);
      setResetPassword('');
      setResetError('');
      window.location.reload();
    } else {
      setResetError('Hatalı şifre!');
    }
  };

  return (
    <>
      <div style={{ position: 'fixed', top: 12, right: 24, zIndex: 1000, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0002', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#8B4513', fontWeight: 600 }}>{displayName} ({role === 'admin' ? 'Yönetici' : 'Garson'})</span>
        {role === 'admin' && (
          <>
            <button onClick={() => setMenuManageOpen(true)} style={{ background: '#388e3c', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }}>Menü Yönetimi</button>
            <button onClick={() => setStatusOpen(true)} style={{ background: '#a86b32', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }}>Anlık Durum</button>
            <button onClick={() => setReportOpen(true)} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }}>Raporlar</button>
            <button onClick={handleResetData} style={{ background: '#616161', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }}>Verileri Sıfırla</button>
          </>
        )}
        <button onClick={() => setDebtOpen(true)} style={{ background: '#b71c1c', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }}>Borç</button>
        <button onClick={handleLogout} style={{ background: '#dc004e', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }}>Çıkış</button>
      </div>
      <Box sx={{ flexGrow: 1, p: 3, minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, gap: 2, width: '100%' }}>
          <RestaurantIcon sx={{ fontSize: 48, color: 'primary.main' }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: 'primary.main', textAlign: 'center' }}>
            NO 57 Ayancık Cafe
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start', justifyContent: 'center', width: '100%' }}>
          <Box sx={{ flex: 1, minWidth: 400 }}>
            <TableGrid onTableClick={handleTableClick} getTableTotal={getTableTotal} />
          </Box>
        </Box>
        <Dialog
          fullWidth
          maxWidth={false}
          open={selectedTable !== null}
          onClose={handleClosePanel}
          PaperProps={{
            sx: {
              borderRadius: 4,
              backgroundColor: 'background.paper',
            },
          }}
        >
          <IconButton
            onClick={handleClosePanel}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'primary.main',
              zIndex: 2,
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedTable && (
            <OrderPanel
              tableNumber={selectedTable}
              orderItems={orders[selectedTable] || []}
              setOrderItems={(newOrder) => updateOrder(selectedTable, newOrder)}
              menuItems={menuList}
              orderHistory={orderHistory[selectedTable] || []}
              addOrderHistory={addOrderHistory}
              onTableChange={handleTableChange}
            />
          )}
        </Dialog>
      </Box>
      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Ciro ve Satış Raporları</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 4, mb: 4, justifyContent: 'center' }}>
            <Paper sx={{ p: 3, minWidth: 260, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Ciro Raporu</Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>Günlük: <b>{gunlukCiro} TL</b></Typography>
              <Typography variant="body1">Haftalık (Pzt-Pzt): <b>{haftalikCiro} TL</b></Typography>
              <Typography variant="body1">Aylık ({ayIsmi}): <b>{aylikCiro} TL</b></Typography>
            </Paper>
            <Paper sx={{ p: 3, minWidth: 260, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Kasa/Ödeme Raporları</Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>Nakit Toplam: <b>{nakitToplam} TL</b></Typography>
              <Typography variant="body1">Kart Toplam: <b>{kartToplam} TL</b></Typography>
              <Typography variant="body1" sx={{ mt: 2, color: '#388e3c' }}>Gün Sonu Kasa: <b>{gunSonuKasa} TL</b></Typography>
            </Paper>
            <Paper sx={{ p: 3, minWidth: 260, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>En Çok Satılanlar</Typography>
              {Object.entries(kategoriMap).map(([cat, urunler]) => (
                urunler.length > 0 && (
                  <div key={cat} style={{ marginBottom: 12 }}>
                    <b>{sabitKategoriler.find(k => k.value === cat)?.label || cat}</b>
                    <ol style={{ margin: 0, paddingLeft: 20, textAlign: 'left' }}>
                      {urunler.map((u, i) => (
                        <li key={u.name}>{u.name} <b>{u.adet} adet</b></li>
                      ))}
                    </ol>
                  </div>
                )
              ))}
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={menuManageOpen} onClose={() => setMenuManageOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Menü Yönetimi</DialogTitle>
        <DialogContent>
          <Tabs value={menuManageTab} onChange={(_, v) => setMenuManageTab(v)} sx={{ mb: 2 }}>
            <Tab label="Ürünler" />
          </Tabs>
          {menuManageTab === 0 && (
            <>
              <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <TextField label="Ürün Adı" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} size="small" />
                <TextField label="Fiyat" type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} size="small" />
                <FormControl size="small">
                  <InputLabel>Kategori</InputLabel>
                  <Select value={newProduct.category} label="Kategori" onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                    {sabitKategoriler.map(k => <MenuItem key={k.value} value={k.value}>{k.label}</MenuItem>)}
                  </Select>
                </FormControl>
                <Button onClick={handleAddProduct} variant="contained">Ekle</Button>
              </Box>
              <Box>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                      <th style={{ padding: 8, border: '1px solid #eee' }}>Adı</th>
                      <th style={{ padding: 8, border: '1px solid #eee' }}>Fiyat</th>
                      <th style={{ padding: 8, border: '1px solid #eee' }}>Kategori</th>
                      <th style={{ padding: 8, border: '1px solid #eee' }}>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuList.map(p => (
                      <tr key={p.id}>
                        <td style={{ padding: 8, border: '1px solid #eee' }}>{p.name}</td>
                        <td style={{ padding: 8, border: '1px solid #eee' }}>
                          {editId === p.id ? (
                            <>
                              <TextField size="small" type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} sx={{ width: 80 }} />
                              <Button onClick={() => handleEditPrice(p.id)} size="small" variant="contained" sx={{ ml: 1 }}>Kaydet</Button>
                            </>
                          ) : (
                            <>
                              {p.price} TL <Button onClick={() => { setEditId(p.id); setEditPrice(String(p.price)); }} size="small">Düzenle</Button>
                            </>
                          )}
                        </td>
                        <td style={{ padding: 8, border: '1px solid #eee' }}>{sabitKategoriler.find(k => k.value === p.category)?.label || p.category}</td>
                        <td style={{ padding: 8, border: '1px solid #eee' }}>
                          <Button onClick={() => handleDeleteProduct(p.id)} color="error" size="small">Sil</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMenuManageOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={statusOpen} onClose={() => setStatusOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Anlık Durum</DialogTitle>
        <DialogContent>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Masa Durumları</Typography>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>Masa</th>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>Durum</th>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>Tutar</th>
                </tr>
              </thead>
              <tbody>
                {masaDurumlari.map(m => (
                  <tr key={m.id}>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>{m.label}</td>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>{m.dolu ? 'Dolu' : 'Boş'}</td>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>{m.tutar} TL</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Aktif Siparişler</Typography>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>Masa</th>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>Tutar</th>
                </tr>
              </thead>
              <tbody>
                {aktifSiparisler.map(m => (
                  <tr key={m.id}>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>{m.label}</td>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>{m.tutar} TL</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={debtOpen} onClose={() => setDebtOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Borçlu Müşteriler</DialogTitle>
        <DialogContent>
          {borclularList.length === 0 ? (
            <Typography>Borçlu müşteri yok.</Typography>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>Müşteri Adı</th>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>Toplam Borç</th>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {borclularList.map(([ad, data]) => (
                  <tr key={ad}>
                    <td style={{ padding: 8, border: '1px solid #eee', cursor: 'pointer', color: '#1976d2', textDecoration: 'underline' }} onClick={() => setSelectedDebt({ ad, kayitlar: data.kayitlar })}>{ad}</td>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>{data.toplam} TL</td>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>
                      <Button onClick={() => handleDebtPay(ad)} color="success" size="small">Borcu Kapattı</Button>
                      <Button onClick={() => setPaymentHistoryOpen(ad)} color="info" size="small" style={{ marginLeft: 8 }}>Ödeme Geçmişi</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDebtOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!selectedDebt} onClose={() => setSelectedDebt(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedDebt?.ad} - Borçlu Sipariş Geçmişi</DialogTitle>
        <DialogContent>
          {selectedDebt?.kayitlar && selectedDebt.kayitlar.length === 0 ? (
            <Typography>Geçmiş borç kaydı yok.</Typography>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>Masa</th>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>Tutar</th>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>Tarih</th>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>Sipariş</th>
                </tr>
              </thead>
              <tbody>
                {selectedDebt?.kayitlar && selectedDebt.kayitlar.map((k, i) => (
                  <tr key={i}>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>{k.masa}</td>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>{k.tutar} TL</td>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>{k.tarih}</td>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>{k.urunler}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedDebt(null)}>Kapat</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!paymentHistoryOpen} onClose={() => setPaymentHistoryOpen(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{paymentHistoryOpen} - Ödeme Geçmişi</DialogTitle>
        <DialogContent>
          {(!paymentHistoryOpen || !paymentHistory[paymentHistoryOpen] || paymentHistory[paymentHistoryOpen].length === 0) ? (
            <Typography>Ödeme kaydı yok.</Typography>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>Tarih</th>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>Ödenen Tutar</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory[paymentHistoryOpen].map((p, i) => (
                  <tr key={i}>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>{p.date}</td>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>{p.amount} TL</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentHistoryOpen(null)}>Kapat</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!payDebtName} onClose={() => setPayDebtName(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Borç Ödeme</DialogTitle>
        <DialogContent>
          <Typography>{payDebtName} için ödenen tutarı giriniz:</Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Ödenen Tutar"
            type="number"
            fullWidth
            value={payAmount}
            onChange={e => setPayAmount(e.target.value)}
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayDebtName(null)}>İptal</Button>
          <Button onClick={handleDebtPayConfirm} variant="contained" disabled={!payAmount || Number(payAmount) <= 0}>Onayla</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={resetConfirmOpen} onClose={() => { setResetConfirmOpen(false); setResetError(''); setResetPassword(''); }} maxWidth="xs" fullWidth>
        <DialogTitle>Verileri Sıfırla</DialogTitle>
        <DialogContent>
          <Typography>Bu işlem tüm verileri silecektir. Onaylamak için şifre giriniz:</Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Şifre"
            type="password"
            fullWidth
            value={resetPassword}
            onChange={e => setResetPassword(e.target.value)}
          />
          {resetError && <Typography color="error">{resetError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setResetConfirmOpen(false); setResetError(''); setResetPassword(''); }}>İptal</Button>
          <Button onClick={handleResetConfirm} variant="contained">Onayla</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Home;