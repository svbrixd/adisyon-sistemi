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
export {};

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

const Login: React.FC<{ onLogin: (user: string, role: string, displayName: string) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('garson');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log("fetch başlıyor", { username, password, role });
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      console.log("fetch bitti", res);
      if (res.ok) {
        const data = await res.json();
        console.log("login başarılı", data);
        onLogin(data.username, data.role, data.displayName);
      } else {
        const err = await res.json();
        console.log("login hatası", err);
        setError(err.error || 'Giriş başarısız!');
      }
    } catch (e) {
      setError('Sunucu hatası!');
      console.log("catch", e);
    }
    setLoading(false);
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
        <button type="submit" style={{ width: '100%', padding: 10, background: '#8B4513', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600 }} disabled={loading}>{loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</button>
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
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('user'));
  const [role, setRole] = useState<string | null>(() => localStorage.getItem('role'));
  const [displayName, setDisplayName] = useState<string | null>(() => localStorage.getItem('displayName'));
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [orders, setOrders] = useState<OrdersState>({});
  const [orderHistory, setOrderHistory] = useState<OrderHistoryState>({});
  const [reportOpen, setReportOpen] = useState(false);
  const [menuManageOpen, setMenuManageOpen] = useState(false);
  const [menuList, setMenuList] = useState<MenuItemType[]>([]);
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
  const [paymentHistory, setPaymentHistory] = useState<Record<string, { amount: number; date: string }[]>>({});
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [ciroRapor, setCiroRapor] = useState({ gunluk: 0, haftalik: 0, aylik: 0, toplam: 0 });
  const [topProducts, setTopProducts] = useState<{ name: string; adet: number }[]>([]);
  const [activeOrders, setActiveOrders] = useState<{ tableNumber: number, items: any[] }[]>([]);

  // Siparişleri API'den çek
  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        // API'den gelen orders dizisini OrderHistoryState formatına dönüştür
        const grouped: Record<string, any[]> = {};
        (data.orders || []).forEach((o: any) => {
          if (!grouped[o.tableNumber]) grouped[o.tableNumber] = [];
          grouped[o.tableNumber].push(o);
        });
        setOrderHistory(grouped);
      });
  }, []);

  // Borç/ödeme verilerini API'den çek
  useEffect(() => {
    fetch('/api/debts')
      .then(res => res.json())
      .then(data => {
        // API'den gelen debts dizisini uygun şekilde grupla
        const grouped: Record<string, { amount: number; date: string }[]> = {};
        (data.debts || []).forEach((d: any) => {
          if (!grouped[d.customerName]) grouped[d.customerName] = [];
          grouped[d.customerName].push({ amount: d.amount, date: d.date });
        });
        setPaymentHistory(grouped);
      });
  }, []);

  // Raporlar ve en çok satanlar verilerini API'den çek
  useEffect(() => {
    fetch('/api/reports')
      .then(res => res.json())
      .then(data => setCiroRapor(data));
    fetch('/api/top-products')
      .then(res => res.json())
      .then(data => setTopProducts(data.topProducts || []));
  }, []);

  // Aktif siparişleri API'den çek
  useEffect(() => {
    fetch('/api/active-orders')
      .then(res => res.json())
      .then(data => setActiveOrders(data.activeOrders || []));
  }, []);

  useEffect(() => {
    if (selectedTable !== null) {
      // Aktif siparişleri API'den çek ve orders state'ini güncelle
      fetch('/api/active-orders')
        .then(res => res.json())
        .then(data => {
          const aktif = (data.activeOrders || []).find((o: any) => o.tableNumber === selectedTable);
          setOrders(prev => ({ ...prev, [selectedTable]: aktif ? aktif.items : [] }));
        });
    }
  }, [selectedTable]);

  // Menü ürünlerini API'den çek
  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => setMenuList(data.menu || []));
  }, []);

  if (!user || !role || !displayName) {
    return <Login onLogin={(u, r, d) => {
      setUser(u);
      setRole(r);
      setDisplayName(d);
      localStorage.setItem('user', u);
      localStorage.setItem('role', r);
      localStorage.setItem('displayName', d);
    }} />;
  }

  // Sipariş ekleme/çıkarma fonksiyonları (hem state hem API)
  const updateOrder = async (tableNumber: number, newOrder: OrderItem[]) => {
    setOrders((prev) => ({ ...prev, [tableNumber]: newOrder }));
    await fetch('/api/active-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableNumber, items: newOrder })
    });
    // Aktif siparişleri tekrar çek
    fetch('/api/active-orders')
      .then(res => res.json())
      .then(data => setActiveOrders(data.activeOrders || []));
  };

  // Masa toplamı aktif siparişlerden hesaplanır
  const getTableTotal = (tableNumber: number) => {
    const aktif = activeOrders.find(o => o.tableNumber === tableNumber);
    if (!aktif) return 0;
    return (aktif.items || []).reduce((total, item) => total + item.menuItem.price * item.quantity, 0);
  };

  const handleTableClick = (tableNumber: number) => {
    setSelectedTable(tableNumber);
  };

  const handleClosePanel = () => {
    setSelectedTable(null);
  };

  // Sipariş geçmişine kayıt ekle (adisyon kapatınca aktif siparişi sil)
  const addOrderHistory = async (tableNumber: number, historyItem: OrderHistoryItem) => {
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...historyItem, tableNumber })
    });
    // Aktif siparişi sil
    await fetch('/api/active-orders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableNumber })
    });
    // Siparişleri tekrar çek
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        const grouped: Record<string, any[]> = {};
        (data.orders || []).forEach((o: any) => {
          if (!grouped[o.tableNumber]) grouped[o.tableNumber] = [];
          grouped[o.tableNumber].push(o);
        });
        setOrderHistory(grouped);
      });
    // Aktif siparişleri tekrar çek
    fetch('/api/active-orders')
      .then(res => res.json())
      .then(data => setActiveOrders(data.activeOrders || []));
  };

  // Profil alanı
  const handleLogout = () => {
    setUser(null);
    setRole(null);
    setDisplayName(null);
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('displayName');
  };

  // Raporlar ve en çok satanlar state'lerini ilgili alanlarda kullan:
  // ciroRapor.gunluk, ciroRapor.haftalik, ciroRapor.aylik, ciroRapor.toplam
  // topProducts dizisi

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
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newProduct.name, price: Number(newProduct.price), category: newProduct.category })
    });
    // Menüleri tekrar çek
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => setMenuList(data.menu || []));
    setNewProduct({ name: '', price: '', category: sabitKategoriler[0].value });
  };
  // Ürün sil
  const handleDeleteProduct = async (id: number) => {
    await fetch('/api/menu', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => setMenuList(data.menu || []));
  };
  // Fiyat ve ürün güncelle
  const handleEditPrice = async (id: number) => {
    const product = menuList.find(p => p.id === id);
    if (!product) return;
    await fetch('/api/menu', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: product.name, price: Number(editPrice), category: product.category })
    });
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => setMenuList(data.menu || []));
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

  // Borç ödeme işlemi başlatıcı (isim seçildiğinde modal açar)
  const handleDebtPay = (ad: string) => {
    setPayDebtName(ad);
    setPayAmount('');
  };

  // Borç ödeme işlemi (API'ye POST)
  const handleDebtPayConfirm = async () => {
    if (!payDebtName) return;
    const odenecek = Number(payAmount);
    if (!odenecek || odenecek <= 0) return;
    // API'ye POST
    await fetch('/api/debts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName: payDebtName, amount: odenecek, date: dayjs().format('YYYY-MM-DD HH:mm:ss') })
    });
    // Ekleme sonrası tekrar borçları çek
    fetch('/api/debts')
      .then(res => res.json())
      .then(data => {
        const grouped: Record<string, { amount: number; date: string }[]> = {};
        (data.debts || []).forEach((d: any) => {
          if (!grouped[d.customerName]) grouped[d.customerName] = [];
          grouped[d.customerName].push({ amount: d.amount, date: d.date });
        });
        setPaymentHistory(grouped);
      });
    setPayDebtName(null);
    setPayAmount('');
  };

  // Kasa/Ödeme raporları için hesaplamalar
  const gunlukHistory = Object.values(orderHistory).flat().filter(h => {
    const tarih = dayjs(h.date, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');
    const bugun = dayjs().format('YYYY-MM-DD');
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
              <Typography variant="body1" sx={{ mt: 2 }}>Günlük: <b>{ciroRapor.gunluk} TL</b></Typography>
              <Typography variant="body1">Haftalık (Pzt-Pzt): <b>{ciroRapor.haftalik} TL</b></Typography>
              <Typography variant="body1">Aylık: <b>{ciroRapor.aylik} TL</b></Typography>
              <Typography variant="body1">Toplam: <b>{ciroRapor.toplam} TL</b></Typography>
            </Paper>
            <Paper sx={{ p: 3, minWidth: 260, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Kasa/Ödeme Raporları</Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>Nakit Toplam: <b>{nakitToplam} TL</b></Typography>
              <Typography variant="body1">Kart Toplam: <b>{kartToplam} TL</b></Typography>
              <Typography variant="body1" sx={{ mt: 2, color: '#388e3c' }}>Gün Sonu Kasa: <b>{gunSonuKasa} TL</b></Typography>
            </Paper>
            <Paper sx={{ p: 3, minWidth: 260, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>En Çok Satılanlar</Typography>
              {topProducts.map((p, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <b>{p.name}</b>
                  <span style={{ marginLeft: 8 }}>{p.adet} adet</span>
                </div>
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