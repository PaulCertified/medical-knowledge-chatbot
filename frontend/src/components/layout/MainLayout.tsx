import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Avatar,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Menu as MenuIcon,
  ExitToApp as LogoutIcon,
  Chat as ChatIcon,
  Person as ProfileIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
      handleClose();
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleClose();
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const userInitials = user?.getSignInUserSession()?.getIdToken().payload.given_name?.[0] || 'U';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={handleMenu}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Medical Assistant
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                color="inherit"
                startIcon={<ChatIcon />}
                onClick={() => handleNavigate('/chat')}
              >
                Chat
              </Button>
              <Button
                color="inherit"
                startIcon={<ProfileIcon />}
                onClick={() => handleNavigate('/profile')}
              >
                Profile
              </Button>
            </Box>
          )}

          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
              {userInitials}
            </Avatar>
          </IconButton>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {isMobile && (
              <>
                <MenuItem onClick={() => handleNavigate('/chat')}>
                  <ChatIcon sx={{ mr: 1 }} /> Chat
                </MenuItem>
                <MenuItem onClick={() => handleNavigate('/profile')}>
                  <ProfileIcon sx={{ mr: 1 }} /> Profile
                </MenuItem>
                <MenuItem onClick={handleClose}>
                  <AccountCircleIcon sx={{ mr: 1 }} /> My Account
                </MenuItem>
              </>
            )}
            <MenuItem onClick={handleLogout} disabled={isLoggingOut}>
              <LogoutIcon sx={{ mr: 1 }} />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout; 