// TopNavBar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import SearchBoxInput from '../../components/SearchBoxInput';

function TopNavBar() {
  const navigate = useNavigate();

  const [anchorElMenu, setAnchorElMenu] = useState(null);
  const [anchorElProfile, setAnchorElProfile] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorElMenu(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorElMenu(null);
  };

  const handleProfileOpen = (event) => {
    setAnchorElProfile(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorElProfile(null);
  };

  const handleProfileClick = () => {
    navigate('/account');
    handleProfileClose();
  };

  const handleHomeClick = () => {
    navigate('/main');
    handleMenuClose();
  }

  const handleMyPostsClick = () => {
    navigate('/my-posts');
    handleProfileClose();
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    handleProfileClose();
    navigate('/login');
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#333' }}>
      <Toolbar>
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

        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <SearchBoxInput />
        </Box>

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
  );
}

export default TopNavBar;
