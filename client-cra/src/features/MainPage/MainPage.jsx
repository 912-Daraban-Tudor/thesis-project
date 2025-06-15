import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavBar from './TopNavBar';
import MapView from './MapView';
import {
  Fab,
  Tooltip,
  Button,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || jwtDecode(token).exp * 1000 < Date.now()) {
      navigate('/login');
    }

    const hasSeenDialog = sessionStorage.getItem('seen_safety_dialog');
    if (!hasSeenDialog) {
      setSafetyDialogOpen(true);
    }
  }, [navigate]);

  const handleCloseDialog = () => {
    sessionStorage.setItem('seen_safety_dialog', 'true');
    setSafetyDialogOpen(false);
  };

  return (
    <MapProvider>
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        <TopNavBar />

        <Box sx={{ flex: 1, position: 'relative' }}>
          <ListViewDrawer />
          <MapView />

          <Tooltip title="Chats">
            <Fab
              color="default"
              size="medium"
              sx={{
                position: 'absolute',
                bottom: isMobile ? 72 : 88,
                right: 16,
                bgcolor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                boxShadow: 3,
                '&:hover': {
                  bgcolor: theme.palette.grey[200],
                },
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
                bgcolor: theme.palette.secondary.light,
                color: theme.palette.text.primary,
                fontWeight: 700,
                fontSize: '1.1rem',
                padding: '12px 24px',
                borderRadius: '16px',
                boxShadow: 3,
                minWidth: '170px',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: theme.palette.secondary.main,
                  boxShadow: 4,
                },
              }}
            >
              Post a Room
            </Button>
          </Tooltip>
        </Box>

        <SafetyDialog open={safetyDialogOpen} onClose={handleCloseDialog} />
      </Box>
    </MapProvider>
  );
}

export default MainPage;
