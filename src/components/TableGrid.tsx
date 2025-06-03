import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import ParkIcon from '@mui/icons-material/Park';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

const tables = [
  ...Array.from({ length: 12 }, (_, i) => ({ id: i + 1, label: `Masa ${i + 1}`, type: 'masa' })),
  { id: 13, label: 'Bahçe 1', type: 'bahce' },
  { id: 14, label: 'Bahçe 2', type: 'bahce' },
  { id: 15, label: 'Kapı 1', type: 'kapi' },
  { id: 16, label: 'Kapı 2', type: 'kapi' },
];

const specials = [
  { label: 'cam', top: 10, left: 10 },
  { label: 'merdiven', top: 120, left: 10 },
  { label: 'kapı', top: 40, left: 600 },
  { label: 'kapı', top: 220, left: 600 },
  { label: 'b1', top: 350, left: 100 },
  { label: 'b2', top: 350, left: 350 },
];

interface TableGridProps {
  onTableClick: (id: number) => void;
  getTableTotal: (id: number) => number;
}

const TableGrid: React.FC<TableGridProps> = ({ onTableClick, getTableTotal }) => (
  <Box
    sx={{
      width: '100%',
      maxWidth: { xs: 400, sm: 700 },
      mx: 'auto',
      mt: { xs: 2, md: 4 },
    }}
  >
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: { xs: 1, sm: 3 },
        justifyContent: 'center',
        mb: { xs: 2, md: 4 },
      }}
    >
      {tables.map((table) => {
        let bg = '#8B4513';
        let color = '#fff';
        let icon = null;
        const isFull = getTableTotal(table.id) > 0;
        if (isFull) {
          bg = '#388e3c';
        } else if (table.type === 'bahce') {
          bg = '#1976d2';
        } else if (table.type === 'kapi') {
          bg = '#757575';
        }
        if (table.type === 'masa') {
          icon = <TableRestaurantIcon sx={{ mr: 1, fontSize: 22 }} />;
        } else if (table.type === 'bahce') {
          icon = <ParkIcon sx={{ mr: 1, fontSize: 22 }} />;
        } else if (table.type === 'kapi') {
          icon = <MeetingRoomIcon sx={{ mr: 1, fontSize: 22 }} />;
        }
        const total = getTableTotal(table.id);
        return (
          <Box
            key={table.id}
            sx={{
              width: { xs: '48%', sm: '22%' },
              minWidth: { xs: 100, sm: 120 },
              mb: { xs: 1, md: 2 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Button
              fullWidth
              variant="contained"
              sx={{
                background: bg,
                color,
                fontWeight: 700,
                fontSize: { xs: 14, md: 18 },
                boxShadow: 2,
                borderRadius: 2,
                py: { xs: 1, md: 2 },
                '&:hover': { background: bg },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => onTableClick(table.id)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                {icon}
                <span>{table.label}</span>
              </Box>
              {total > 0 && (
                <Typography variant="caption" sx={{ color: '#d32f2f', fontWeight: 700, mt: 0.5 }}>
                  {total} TL
                </Typography>
              )}
            </Button>
          </Box>
        );
      })}
    </Box>
  </Box>
);

export default TableGrid;