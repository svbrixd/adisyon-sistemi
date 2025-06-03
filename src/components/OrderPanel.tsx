import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { MenuItemType, OrderItem } from '../types';
import dayjs from 'dayjs';

interface OrderPanelProps {
  tableNumber: number;
  orderItems: OrderItem[];
  setOrderItems: (items: OrderItem[]) => void;
  menuItems: MenuItemType[];
  orderHistory: any[];
  addOrderHistory: (tableNumber: number, historyItem: any) => void;
  onTableChange?: (oldTable: number, newTable: number, items: OrderItem[]) => void;
}

const OrderPanel: React.FC<OrderPanelProps> = ({ tableNumber, orderItems, setOrderItems, menuItems, orderHistory, addOrderHistory, onTableChange }) => {
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [isDebt, setIsDebt] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [changeTableOpen, setChangeTableOpen] = useState(false);
  const [newTable, setNewTable] = useState<number>(tableNumber);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const addItem = (menuItem: MenuItemType) => {
    if (buttonDisabled) return;
    setButtonDisabled(true);
    setTimeout(() => setButtonDisabled(false), 300);
    const existingItem = orderItems.find((item) => item.menuItem.id === menuItem.id);
    let newOrder: OrderItem[];
    if (existingItem) {
      newOrder = orderItems.map((item) =>
        item.menuItem.id === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newOrder = [...orderItems, { menuItem, quantity: 1 }];
    }
    setOrderItems(newOrder);
  };

  const removeItem = (menuItemId: number) => {
    if (buttonDisabled) return;
    setButtonDisabled(true);
    setTimeout(() => setButtonDisabled(false), 300);
    const newOrder = orderItems
      .map((item) =>
        item.menuItem.id === menuItemId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0);
    setOrderItems(newOrder);
  };

  const getTotalAmount = () => {
    return orderItems.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0
    );
  };

  const handlePayment = () => {
    if (isDebt && !customerName) {
      alert('Borçlu müşteri için isim girmelisiniz!');
      return;
    }
    const historyItem = {
      date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      items: orderItems,
      total: getTotalAmount(),
      paymentMethod,
      customerName: isDebt ? customerName : undefined,
      isDebt,
    };
    console.log('Sipariş geçmişine eklenen kayıt:', historyItem);
    addOrderHistory(tableNumber, historyItem);
    setOpenPaymentDialog(false);
    setOrderItems([]);
  };

  const categoryLabels: Record<MenuItemType['category'], string> = {
    drink: 'İçecekler',
    breakfast: 'Kahvaltı',
    soup: 'Çorba',
    food: 'Yemekler',
  };

  return (
    <Paper sx={{ p: { xs: 4, md: 8 }, height: '100%', backgroundColor: 'background.paper', maxWidth: 2400, minWidth: 1800 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 0.5, px: 1, pt: 1, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: 0.5, fontSize: 22 }}>
            Masa {tableNumber} - Sipariş Paneli
          </Typography>
          <Button size="small" variant="outlined" onClick={() => setOpenHistory(true)} sx={{ ml: 2 }}>
            Geçmiş Siparişler
          </Button>
        </Box>
        <Divider sx={{ mb: 3 }} />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="outlined" color="primary" onClick={() => setChangeTableOpen(true)}>
          Masa Değiştir
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: 2 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 2, md: 4 }, 
              backgroundColor: 'background.default',
              borderRadius: 3,
              mb: 3
            }}
          >
            <Typography variant="h5" sx={{ mb: { xs: 1, md: 3 }, color: 'primary.main', fontWeight: 700, fontSize: { xs: 18, md: 28 } }}>
              Menü
            </Typography>
            {(['drink', 'breakfast', 'soup', 'food'] as MenuItemType['category'][]).map((cat) => (
              <Box key={cat} sx={{ mb: { xs: 1, md: 2 } }}>
                <Typography variant="subtitle1" sx={{ mb: 1, color: 'secondary.main', fontWeight: 700, fontSize: { xs: 15, md: 20 } }}>
                  {categoryLabels[cat]}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.5, md: 1 }, justifyContent: 'flex-start' }}>
                  {menuItems.filter((item) => item.category === cat).map((item) => (
                    <Paper
                      key={item.id}
                      elevation={2}
                      sx={{
                        width: { xs: 110, md: 140 },
                        minWidth: { xs: 90, md: 120 },
                        maxWidth: { xs: 120, md: 160 },
                        m: 0,
                        mb: 1,
                        p: { xs: 1, md: 1.5 },
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText',
                        },
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => addItem(item)}
                    >
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xs: 13, md: 15 } }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 11, md: 13 } }}>
                          {item.price} TL
                        </Typography>
                      </Box>
                      <AddIcon sx={{ fontSize: { xs: 16, md: 20 } }} />
                    </Paper>
                  ))}
                </Box>
              </Box>
            ))}
          </Paper>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              backgroundColor: 'background.default',
              borderRadius: 3,
              height: '100%'
            }}
          >
            <Typography variant="h4" sx={{ mb: 3, color: 'primary.main', fontWeight: 700 }}>
              Sipariş Özeti
            </Typography>
            {orderItems.map((item) => (
              <Box
                key={item.menuItem.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {item.menuItem.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.menuItem.price} TL x {item.quantity} = <b>{item.menuItem.price * item.quantity} TL</b>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton
                    size="large"
                    onClick={() => removeItem(item.menuItem.id)}
                    sx={{ color: 'primary.main' }}
                    disabled={buttonDisabled}
                  >
                    <RemoveIcon sx={{ fontSize: 28 }} />
                  </IconButton>
                  <Typography variant="h5">{item.quantity}</Typography>
                  <IconButton
                    size="large"
                    onClick={() => addItem(item.menuItem)}
                    sx={{ color: 'primary.main' }}
                    disabled={buttonDisabled}
                  >
                    <AddIcon sx={{ fontSize: 28 }} />
                  </IconButton>
                </Box>
              </Box>
            ))}
            <Divider sx={{ my: 3 }} />
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ color: 'primary.main', mb: 2 }}>
                Toplam Tutar
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {getTotalAmount()} TL
              </Typography>
            </Box>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => setOpenPaymentDialog(true)}
              disabled={orderItems.length === 0}
              sx={{
                py: 2,
                fontSize: 22,
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              Hesabı Kapat
            </Button>
          </Paper>
        </Box>
      </Box>

      <Dialog
        open={openPaymentDialog}
        onClose={() => setOpenPaymentDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 2,
            m: 0,
            boxShadow: 6,
          },
        }}
      >
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 700, fontSize: 20 }}>
          Ödeme
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ fontSize: 14 }}>Ödeme Yöntemi</InputLabel>
              <Select
                value={paymentMethod}
                label="Ödeme Yöntemi"
                onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card')}
                sx={{ fontSize: 14 }}
              >
                <MenuItem value="cash" sx={{ fontSize: 14 }}>Nakit</MenuItem>
                <MenuItem value="card" sx={{ fontSize: 14 }}>Kart</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Borçlu Müşteri
              </Typography>
              <Button
                variant={isDebt ? 'contained' : 'outlined'}
                onClick={() => setIsDebt(!isDebt)}
                fullWidth
                sx={{
                  borderColor: 'primary.main',
                  color: isDebt ? 'white' : 'primary.main',
                  fontSize: 13,
                  py: 1,
                  '&:hover': {
                    borderColor: 'primary.dark',
                  },
                }}
              >
                {isDebt ? 'Borçlu Değil' : 'Borçlu'}
              </Button>
            </Box>

            {isDebt && (
              <TextField
                fullWidth
                label="Müşteri Adı"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                sx={{ mb: 2, fontSize: 13 }}
                InputProps={{ style: { fontSize: 13 } }}
                InputLabelProps={{ style: { fontSize: 13 } }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button 
            onClick={() => setOpenPaymentDialog(false)}
            sx={{ color: 'text.secondary', fontSize: 13 }}
          >
            İptal
          </Button>
          <Button 
            onClick={handlePayment} 
            variant="contained"
            sx={{
              backgroundColor: 'primary.main',
              fontSize: 13,
              py: 1,
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            Onayla
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openHistory} onClose={() => setOpenHistory(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Geçmiş Siparişler</DialogTitle>
        <DialogContent>
          {orderHistory.length === 0 ? (
            <Typography variant="body2">Geçmiş sipariş yok.</Typography>
          ) : (
            orderHistory.slice().reverse().map((h, i) => (
              <Box key={i} sx={{ mb: 2, p: 1, border: '1px solid #eee', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">{h.date}</Typography>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {h.items.map((item: any, idx: number) => (
                    <li key={idx}>
                      {item.menuItem.name} x {item.quantity} - {item.menuItem.price * item.quantity} TL
                    </li>
                  ))}
                </ul>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Toplam: {h.total} TL</Typography>
                <Typography variant="caption">Ödeme: {h.paymentMethod === 'cash' ? 'Nakit' : 'Kart'}{h.isDebt ? ' (Borçlu)' : ''}{h.customerName ? ` - ${h.customerName}` : ''}</Typography>
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistory(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={changeTableOpen} onClose={() => setChangeTableOpen(false)}>
        <DialogTitle>Masayı Değiştir</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Yeni Masa</InputLabel>
            <Select
              value={newTable}
              label="Yeni Masa"
              onChange={e => setNewTable(Number(e.target.value))}
            >
              {Array.from({ length: 16 }, (_, i) => {
                let label = `Masa ${i + 1}`;
                if (i + 1 === 13) label = 'Bahçe 1';
                if (i + 1 === 14) label = 'Bahçe 2';
                if (i + 1 === 15) label = 'Kapı 1';
                if (i + 1 === 16) label = 'Kapı 2';
                return (
                  <MenuItem key={i + 1} value={i + 1} disabled={i + 1 === tableNumber}>
                    {label}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangeTableOpen(false)}>İptal</Button>
          <Button
            onClick={() => {
              if (onTableChange && newTable !== tableNumber) {
                onTableChange(tableNumber, newTable, orderItems);
                setOrderItems([]);
                setChangeTableOpen(false);
              }
            }}
            variant="contained"
            disabled={newTable === tableNumber}
          >
            Aktar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default OrderPanel; 