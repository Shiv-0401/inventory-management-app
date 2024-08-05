'use client'

import { Box, Stack, Typography, Button, Modal, TextField, Snackbar, Alert } from '@mui/material';
import { firestore } from './firebase';
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { keyframes } from '@mui/system';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title as ChartTitle, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import SearchIcon from '@mui/icons-material/Search';

// Keyframes for animations
const titleAnimation = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  50% {
    opacity: 0.5;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-20px);
    opacity: 0;
  }
`;

// Styles
const titleStyle = {
  backgroundColor: '#3498db',
  color: '#FFFFFF',
  padding: '20px',
  borderRadius: '12px',
  textAlign: 'center',
  fontFamily: 'Arial, sans-serif',
  animation: `${titleAnimation} 1s ease-out`,
  marginBottom: '20px',
};

const titleTextStyle = {
  fontSize: '2rem',
  fontWeight: 'bold',
  letterSpacing: '1px',
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 360,
  bgcolor: '#FFFFFF',
  borderRadius: 2,
  boxShadow: 24,
  p: 3,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  animation: `${fadeIn} 0.3s ease-out`,
  color: '#2c3e50',
};

const itemStyle = {
  backgroundColor: '#FFFFFF',
  padding: '12px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  color: '#2c3e50',
  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  animation: `${slideIn} 0.5s ease-out`,
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
  },
};

const itemImageStyle = {
  width: '50px',
  height: '50px',
  objectFit: 'cover',
  borderRadius: '8px',
  marginRight: '16px',
};

const containerStyle = {
  width: '90%',
  maxWidth: '1000px',
  margin: 'auto',
  padding: '20px',
  backgroundColor: '#f5f5f5',
  borderRadius: '12px',
  animation: `${fadeIn} 0.5s ease-out`,
  color: '#2c3e50',
};

const buttonStyle = {
  marginTop: '30px', // Increased margin-top to move it up
  backgroundColor: '#e74c3c',
  color: '#FFFFFF',
  '&:hover': {
    backgroundColor: '#c0392b',
    transform: 'scale(1.05)',
    transition: 'transform 0.2s ease',
  },
  transition: 'transform 0.2s ease',
};

const removeButtonStyle = {
  backgroundColor: '#2ecc71',
  color: '#FFFFFF',
  '&:hover': {
    backgroundColor: '#27ae60',
  },
};

const pageStyle = {
  width: '100vw',
  height: '100vh',
  backgroundColor: '#000000',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

const lowStockAlertStyle = {
  backgroundColor: '#f39c12',
  color: '#FFFFFF',
  fontWeight: 'bold',
};

// Main Component
export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [itemToRemove, setItemToRemove] = useState(null);
  const [search, setSearch] = useState('');
  const [lowStockAlert, setLowStockAlert] = useState(null);

  const LOW_STOCK_THRESHOLD = 5;

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'Pantry'));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => {
      const data = doc.data();
      pantryList.push({
        name: capitalizeFirstLetter(doc.id),
        count: data.count || 0,
        image: data.image || '',
      });
    });
    setPantry(pantryList);

    const lowStockItems = pantryList.filter(item => item.count < LOW_STOCK_THRESHOLD);
    if (lowStockItems.length > 0) {
      setLowStockAlert(lowStockItems.map(item => item.name).join(', '));
    } else {
      setLowStockAlert(null);
    }
  };

  useEffect(() => {
    updatePantry();
  }, []);

  const addItem = async (item) => {
    const normalizedItem = item.toLowerCase();
    const docRef = doc(collection(firestore, 'Pantry'), normalizedItem);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      await setDoc(docRef, { count: data.count + 1, image: data.image || itemImage });
    } else {
      await setDoc(docRef, { count: 1, image: itemImage });
    }
    await updatePantry();
  };

  const removeItem = async (item) => {
    const normalizedItem = item.toLowerCase();
    const docRef = doc(collection(firestore, 'Pantry'), normalizedItem);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.count > 1) {
        await setDoc(docRef, { count: data.count - 1, image: data.image });
      } else {
        await deleteDoc(docRef);
      }
      setItemToRemove(item);
      setTimeout(async () => {
        await updatePantry();
        setItemToRemove(null);
      }, 500);
    }
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const filteredPantry = pantry.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={pageStyle}>
      <Box sx={titleStyle}>
        <Typography variant="h3" sx={titleTextStyle}>
          Pantry Management
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#ecf0f1' }}>
          Track your items, manage your stock, and never run low!
        </Typography>
      </Box>
      <Box sx={containerStyle}>
        <Button variant="contained" sx={buttonStyle} onClick={() => setOpen(true)}>
          Add Item
        </Button>
        <TextField
          label="Search Items"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchIcon />
            ),
          }}
        />

        <Modal
          open={open}
          onClose={() => setOpen(false)}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box sx={modalStyle}>
            <Typography variant="h6">Add New Item</Typography>
            <TextField
              label="Item Name"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              sx={{ input: { color: '#2c3e50' }, label: { color: '#2c3e50' } }}
            />
            <TextField
              label="Item Image URL"
              variant="outlined"
              fullWidth
              value={itemImage}
              onChange={(e) => setItemImage(e.target.value)}
              sx={{ input: { color: '#2c3e50' }, label: { color: '#2c3e50' } }}
            />
            <Button
              variant="contained"
              sx={buttonStyle}
              onClick={() => {
                addItem(itemName);
                setItemName('');
                setItemImage('');
                setOpen(false);
              }}
            >
              Add
            </Button>
          </Box>
        </Modal>

        {lowStockAlert && (
          <Snackbar open={Boolean(lowStockAlert)} autoHideDuration={6000} onClose={() => setLowStockAlert(null)}>
            <Alert onClose={() => setLowStockAlert(null)} severity="warning" sx={lowStockAlertStyle}>
              Low stock on: {lowStockAlert}
            </Alert>
          </Snackbar>
        )}

        {filteredPantry.length > 0 ? (
          filteredPantry.map((item) => (
            <Box key={item.name} sx={itemStyle}>
              <img src={item.image} alt={item.name} style={itemImageStyle} />
              <Typography variant="body1">{item.name}</Typography>
              <Typography variant="body1">Quantity: {item.count}</Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  sx={removeButtonStyle}
                  onClick={() => removeItem(item.name)}
                >
                  Remove
                </Button>
                <Button
                  variant="contained"
                  sx={removeButtonStyle}
                  onClick={() => addItem(item.name)}
                >
                  Add
                </Button>
              </Stack>
            </Box>
          ))
        ) : (
          <Typography variant="body1">No items found.</Typography>
        )}
      </Box>
    </Box>
  );
}
