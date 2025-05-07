import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  InputBase,
  Box,
  Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';

function TopNavBar() {
  const navigate = useNavigate();

  const [anchorElMenu, setAnchorElMenu] = useState(null);
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const [searchValue, setSearchValue] = useState('');

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

  const handleMyPostsClick = () => {
    navigate('/my-posts');
    handleProfileClose();
  };


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Search:', searchValue);
    // later connect search
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
          <MenuItem onClick={() => { console.log('Home clicked'); handleMenuClose(); }}>Home</MenuItem>
          <MenuItem onClick={() => { console.log('Rooms clicked'); handleMenuClose(); }}>Rooms</MenuItem>
          <MenuItem onClick={() => { console.log('About clicked'); handleMenuClose(); }}>About</MenuItem>
        </Menu>

        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center' }}>
            <InputBase
              placeholder="Search for rooms…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              sx={{
                color: 'inherit',
                backgroundColor: '#555',
                px: 1,
                borderRadius: '4px 0 0 4px',
                height: '36px',
                width: { xs: '50%', sm: '300px' }
              }}
            />
            <Button
              type="submit"
              sx={{
                backgroundColor: '#777',
                color: 'white',
                borderRadius: '0 4px 4px 0',
                height: '36px',
                minWidth: '40px'
              }}
            >
              <SearchIcon />
            </Button>
          </form>
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
          <MenuItem onClick={() => { console.log('Settings clicked'); handleProfileClose(); }}>Settings</MenuItem>
          <MenuItem onClick={() => { console.log('Logout clicked'); handleProfileClose(); }}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default TopNavBar;
