import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavBar from './TopNavBar';
import MapView from './MapView';
import { Fab, Tooltip, Button } from '@mui/material';
import PostAddIcon from '@mui/icons-material/PostAdd';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { MapProvider } from '../../context/MapContext';
import ListViewDrawer from '../../components/ListViewDrawer';
import { useChatUI } from '../../context/ChatUIContext';
import SafetyDialog from '../../components/SafetyDialog';
import { jwtDecode } from 'jwt-decode';

function MainPage() {
  const navigate = useNavigate();
  const { openChat } = useChatUI();
  const [safetyDialogOpen, setSafetyDialogOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || jwtDecode(token).exp * 1000 < Date.now()) {
      navigate('/login');
    }

    const hasSeenDialog = localStorage.getItem('seen_safety_dialog');
    if (!hasSeenDialog) {
      setSafetyDialogOpen(true);
    }
  }, [navigate]);

  const handleCloseDialog = () => {
    localStorage.setItem('seen_safety_dialog', 'true');
    setSafetyDialogOpen(false);
  };

  return (
    <MapProvider>
      <div
        style={{
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <TopNavBar />
        <div style={{ flex: 1, position: 'relative' }}>
          <ListViewDrawer />
          <MapView />

          {/* Chat Button */}
          <Tooltip title="Chats">
            <Fab
              color="default"
              size="medium"
              sx={{
                position: 'absolute',
                bottom: 88,
                right: 16,
                bgcolor: 'white',
              }}
              onClick={() => openChat()}
            >
              <MailOutlineIcon />
            </Fab>
          </Tooltip>

          <Tooltip title="Post a Room">
            <Button
              variant="contained"
              startIcon={<PostAddIcon />}
              onClick={() => navigate('/post')}
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                backgroundColor: '#f5efe6',
                color: '#333',
                fontWeight: 600,
                borderRadius: '12px',
                boxShadow: 3,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#e0dbd1',
                  boxShadow: 4,
                },
              }}
            >
              Post a Room
            </Button>
          </Tooltip>
        </div>

        <SafetyDialog open={safetyDialogOpen} onClose={handleCloseDialog} />
      </div>
    </MapProvider>
  );
}

export default MainPage;
