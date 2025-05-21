import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavBar from './TopNavBar';
import MapView from './MapView';
import { Fab, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { MapProvider } from '../../context/MapContext';
import ListViewDrawer from '../../components/ListViewDrawer';
import { useChatUI } from '../../context/ChatUIContext';

function MainPage() {
  const navigate = useNavigate();
  const { openChat } = useChatUI();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <MapProvider>
      <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <TopNavBar />
        <div style={{ flex: 1, position: 'relative' }}>
          <ListViewDrawer />
          <MapView />

          {/* Chat Button */}
          <Tooltip title="Chats">
            <Fab
              color="default"
              size="medium"
              sx={{ position: 'absolute', bottom: 88, right: 16, bgcolor: 'white' }}
              onClick={() => openChat()}
            >
              <MailOutlineIcon />
            </Fab>
          </Tooltip>

          {/* Post Button */}
          <Tooltip title="Post a room">
            <Fab
              color="primary"
              aria-label="post"
              sx={{ position: 'absolute', bottom: 16, right: 16 }}
              onClick={() => navigate('/post')}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </div>
      </div>
    </MapProvider>
  );
}

export default MainPage;
