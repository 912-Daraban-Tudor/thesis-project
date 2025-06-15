import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Drawer,
  Button,
  Typography,
  Badge,
  Fade,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import SearchBoxInput from '../../components/SearchBoxInput';
import ApartmentFilters from '../../components/ApartmentFilters';
import TransportFilters from '../../components/TransportFilters';
import { useMapContext } from '../../context/MapContext';

function TopNavBar() {
  const navigate = useNavigate();
  const { filters } = useMapContext();

  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filterMode, setFilterMode] = useState('');

  const handleProfileOpen = (event) => setAnchorElProfile(event.currentTarget);
  const handleProfileClose = () => setAnchorElProfile(null);

  const handleProfileClick = () => {
    navigate('/account');
    handleProfileClose();
  };

  const handleMyPostsClick = () => {
    navigate('/my-posts');
    handleProfileClose();
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    localStorage.clear();
    handleProfileClose();
    navigate('/login');
  };

  const openDrawer = (mode) => {
    setFilterMode(mode);
    setFilterDrawerOpen(true);
  };

  const closeDrawer = () => setFilterDrawerOpen(false);

  const countApartmentFilters = [
    filters.price?.[0] > 0 || filters.price?.[1] < 2000,
    filters.floor?.[0] > 0 || filters.floor?.[1] < 10,
    filters.year_built?.[0] > 1900 || filters.year_built?.[1] < new Date().getFullYear(),
    filters.has_parking,
    filters.has_centrala,
    (filters.room_count || []).length > 0,
    (filters.number_of_rooms || []).length > 0,
    filters.sex_preference,
  ].filter(Boolean).length;

  const countTransportFilters = [
    filters.bus_line,
    filters.connected_to_university,
  ].filter(Boolean).length;

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: 1300, backgroundColor: '#2D3E50' }}>
        <Toolbar sx={{ flexWrap: 'nowrap', justifyContent: 'space-between' }}>
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 1.5,
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >

            <Box
              component="a"
              href="/main"
              sx={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                px: 1,
                textDecoration: 'none',
              }}
            >
              <Box
                component="img"
                src="/iconTextLogo.png"
                alt="Logo"
                sx={{
                  height: 32,
                  display: { xs: 'none', sm: 'block' },
                  objectFit: 'contain',
                  verticalAlign: 'middle',
                }}
              />
              <Box
                component="img"
                src="/iconLogo.png"
                alt="Icon Logo"
                sx={{
                  height: 32,
                  display: { xs: 'block', sm: 'none' },
                  objectFit: 'contain',
                  verticalAlign: 'middle',
                }}
              />
            </Box>

            <SearchBoxInput />

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                alignItems: 'center',
              }}
            >
              {countApartmentFilters > 0 ? (
                <Badge badgeContent={countApartmentFilters} color="secondary">
                  <Button
                    variant={filterMode === 'apartment' ? 'contained' : 'outlined'}
                    color="primary"
                    startIcon={<FilterAltIcon />}
                    onClick={() => openDrawer('apartment')}
                    sx={{ minWidth: 0, px: { xs: 1, sm: 2 } }}
                  >
                    <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Apartment Filters</Box>
                  </Button>
                </Badge>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<FilterAltIcon />}
                  onClick={() => openDrawer('apartment')}
                  sx={{ minWidth: 0, px: { xs: 1, sm: 2 } }}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Apartment Filters</Box>
                </Button>
              )}

              {countTransportFilters > 0 ? (
                <Badge badgeContent={countTransportFilters} color="secondary">
                  <Button
                    variant={filterMode === 'transport' ? 'contained' : 'outlined'}
                    color="primary"
                    startIcon={<DirectionsBusIcon />}
                    onClick={() => openDrawer('transport')}
                    sx={{ minWidth: 0, px: { xs: 1, sm: 2 } }}
                  >
                    <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Transport Filters</Box>
                  </Button>
                </Badge>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DirectionsBusIcon />}
                  onClick={() => openDrawer('transport')}
                  sx={{ minWidth: 0, px: { xs: 1, sm: 2 } }}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Transport Filters</Box>
                </Button>
              )}
            </Box>
          </Box>

          <IconButton
            size="large"
            color="inherit"
            onClick={handleProfileOpen}
            sx={{ ml: { xs: 0, md: 2 } }}
          >
            <AccountCircle />
          </IconButton>

          <Menu anchorEl={anchorElProfile} open={Boolean(anchorElProfile)} onClose={handleProfileClose}>
            <MenuItem onClick={handleProfileClick}>My Account</MenuItem>
            <MenuItem onClick={handleMyPostsClick}>My Posts</MenuItem>
            <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={closeDrawer}
        variant="persistent"
        slotProps={{
          paper: {
            sx: {
              width: 360,
              height: 'calc(100% - 64px)',
              top: '64px',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" px={2} pt={2} pb={1}>
            <Typography variant="h6">
              {filterMode === 'apartment' ? 'Apartment & Room Filters' : 'Transport Filters'}
            </Typography>
            <IconButton onClick={closeDrawer} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              px: 2,
              pb: 2,
              '&::-webkit-scrollbar': { width: '8px' },
              '&::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: '4px' },
              '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#aaa' },
              '&::-webkit-scrollbar-track': { backgroundColor: '#f2f2f2' },
              scrollbarWidth: 'thin',
              scrollbarColor: '#ccc #f2f2f2',
            }}
          >
            <Fade in timeout={300}>
              <Box>
                {filterMode === 'apartment' ? (
                  <ApartmentFilters onApplyComplete={closeDrawer} />
                ) : (
                  <TransportFilters />
                )}
              </Box>
            </Fade>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default TopNavBar;
