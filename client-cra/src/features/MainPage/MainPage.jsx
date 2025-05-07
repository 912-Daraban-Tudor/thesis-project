import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavBar from './TopNavBar';
import MapView from './MapView';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function MainPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token'); 

    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <TopNavBar />
      <div style={{ flex: 1, position: 'relative' }}>
        <MapView />
        <Fab
          color="primary"
          aria-label="post"
          sx={{ position: 'absolute', bottom: 16, right: 16 }}
          onClick={() => navigate('/post')}
        >
          <AddIcon />
        </Fab>
      </div>
    </div>
  );
}

export default MainPage;
