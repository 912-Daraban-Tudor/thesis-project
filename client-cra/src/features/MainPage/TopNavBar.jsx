import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Drawer,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import SearchBoxInput from '../../components/SearchBoxInput';
import FilterPanel from '../../components/FilterPanel';

function TopNavBar() {
  const navigate = useNavigate();

  const [anchorElMenu, setAnchorElMenu] = useState(null);
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const handleMenuOpen = (event) => setAnchorElMenu(event.currentTarget);
  const handleMenuClose = () => setAnchorElMenu(null);

  const handleProfileOpen = (event) => setAnchorElProfile(event.currentTarget);
  const handleProfileClose = () => setAnchorElProfile(null);

  const handleProfileClick = () => {
    navigate('/account');
    handleProfileClose();
  };

  const handleHomeClick = () => {
    navigate('/main');
    handleMenuClose();
  };

  const handleMyPostsClick = () => {
    navigate('/my-posts');
    handleProfileClose();
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    handleProfileClose();
    navigate('/login');
  };

  const toggleFilterDrawer = (open) => () => {
    setFilterDrawerOpen(open);
  };

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: 1300, backgroundColor: '#333' }}>
        <Toolbar>
          {/* Menu button */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenuOpen}
          >
            <MenuIcon />
          </IconButton>

          <Menu
            anchorEl={anchorElMenu}
            open={Boolean(anchorElMenu)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleHomeClick}>Home</MenuItem>
            <MenuItem onClick={() => { console.log('Rooms clicked'); handleMenuClose(); }}>Rooms</MenuItem>
            <MenuItem onClick={() => { console.log('About clicked'); handleMenuClose(); }}>About</MenuItem>
          </Menu>

          {/* Center: Search + Filters */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <SearchBoxInput />

            <IconButton
              size="large"
              color="inherit"
              onClick={toggleFilterDrawer(true)}
              sx={{ ml: 1 }}
            >
              <TuneIcon />
            </IconButton>
          </Box>

          {/* Profile icon */}
          <IconButton
            size="large"
            color="inherit"
            onClick={handleProfileOpen}
          >
            <AccountCircle />
          </IconButton>

          <Menu
            anchorEl={anchorElProfile}
            open={Boolean(anchorElProfile)}
            onClose={handleProfileClose}
          >
            <MenuItem onClick={handleProfileClick}>My Account</MenuItem>
            <MenuItem onClick={handleMyPostsClick}>My Posts</MenuItem>
            <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Right-side drawer for filters */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={toggleFilterDrawer(false)}
        variant="persistent"
        slotProps={{
          paper: {
            sx: {
              width: 340,
              height: 'calc(100% - 64px)', // below TopNavBar
              top: '64px',
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            px={2}
            pt={2}
            pb={1}
          >
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={toggleFilterDrawer(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* 🧠 Scrollable container with custom scrollbar */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              px: 2,
              pb: 2,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#ccc',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: '#aaa',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f2f2f2',
              },
              scrollbarWidth: 'thin',
              scrollbarColor: '#ccc #f2f2f2',
            }}
          >
            <FilterPanel />
            <Box mt={2}>
              <Typography variant="caption" color="text.secondary">
                Filters automatically apply on submit.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>


    </>
  );
}

export default TopNavBar;
