/**
 * Navbar.tsx - Barre de navigation moderne avec animations
 * 
 * FONCTIONNALITÉS:
 * - Design moderne avec glassmorphism et animations fluides
 * - Navigation responsive avec effets visuels
 * - Menu utilisateur avec avatar animé
 * - Panier d'achat avec badge de notification
 * - Authentification intégrée avec contexte
 * - Transitions et effets hover sophistiqués
 * 
 * DESIGN:
 * - Glassmorphism avec backdrop-filter
 * - Gradient de fond animé
 * - Animations d'entrée et de hover
 * - Effets de glow et de shadow
 * - Typography moderne avec gradients
 * - Boutons avec effets de vague
 */

// Imports des composants Material-UI pour la barre de navigation
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ListAltIcon from '@mui/icons-material/ListAlt';
// Import du hook d'authentification pour accéder aux données utilisateur
import { useAuthContext } from '../context/Auth/AuthContext';
import { Badge, Button, Fade, Slide } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/Cart/CartContext';

/**
 * Composant Navbar - Barre de navigation moderne et animée
 * 
 * Ce composant nouvelle génération propose :
 * - Design glassmorphism avec backdrop-filter
 * - Animations fluides et effets visuels
 * - Menu utilisateur avec transitions sophistiquées
 * - Badge de panier avec effet de pulsation
 * - Responsive design avec breakpoints optimisés
 * - Gestion d'authentification intégrée
 * - Effets hover et focus avancés
 */
function Navbar() {
  // ========== GESTION D'ÉTAT ET CONTEXTES ==========
  // Récupération des données d'authentification depuis le contexte
  const {username, isAuthenticated, logout} = useAuthContext();
  
  // Récupération des articles du panier pour le badge de notification
  const {cartItems} = useCart();
  
  // État local pour gérer l'ouverture/fermeture du menu utilisateur
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  
  // Hook pour la navigation entre les pages
  const navigate = useNavigate();

  // ========== GESTIONNAIRES D'ÉVÉNEMENTS ==========
  
  /**
   * Fonction pour ouvrir le menu utilisateur avec animation
   */
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  /**
   * Fonction pour fermer le menu utilisateur
   */
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  /**
   * Fonction pour rediriger vers la page de connexion
   */
  const handleLogin = () => {
    navigate('/login');
  }
  
  /**
   * Fonction pour déconnecter l'utilisateur avec animation
   */
  const handleLogout = () => {
    logout();
    navigate('/');
    handleCloseUserMenu();
  }
  
  /**
   * Fonction pour rediriger vers la page du panier
   */
  const handleCart = () => {
    navigate('/cart');
  }

  // ========== RENDU DE L'INTERFACE MODERNE ==========
  return (
    <>
      {/* CSS pour les animations et effets visuels */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        /* Animation du gradient de fond */
        @keyframes navbarGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        /* Animation de pulsation pour le badge */
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        /* Animation de flottement pour le logo */
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(5deg); }
        }
        
        /* Animation de glow */
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
          50% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.6); }
        }
        
        /* Styles pour les boutons avec effet de vague */
        .wave-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .wave-btn:before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        
        .wave-btn:hover:before {
          left: 100%;
        }
        
        .wave-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }
        
        /* Styles pour l'avatar avec animation */
        .animated-avatar {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid transparent;
        }
        
        .animated-avatar:hover {
          transform: scale(1.1) rotate(5deg);
          border: 2px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
        }
        
        /* Animation pour le panier */
        .cart-icon {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .cart-icon:hover {
          transform: scale(1.1);
          color: #ffa726 !important;
        }
        
        .cart-badge {
          animation: badgePulse 2s infinite;
        }
      `}</style>

      {/* AppBar avec glassmorphism */}
      <Slide direction="down" in={true} timeout={800}>
        <AppBar 
          position="static" 
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 50%, rgba(240, 147, 251, 0.9) 100%)',
            backgroundSize: '200% 200%',
            animation: 'navbarGradient 15s ease infinite',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            fontFamily: 'Inter, sans-serif',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
            }
          }}
        >
          <Container maxWidth="xl">
            <Toolbar disableGutters sx={{ minHeight: 70 }}>
              {/* Container principal pour organiser les éléments */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                width: '100%' 
              }}>
                
                {/* ========== SECTION GAUCHE : LOGO ET NOM ========== */}
                <Fade in={true} timeout={1000}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    }
                  }} 
                  onClick={() => navigate('/')}>
                    {/* Icône de l'application avec animation */}
                    <AdbIcon sx={{ 
                      display: { xs: 'flex', md: 'flex' }, 
                      mr: 1, 
                      color: 'white',
                      fontSize: 32,
                      animation: 'logoFloat 3s ease-in-out infinite',
                      filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))'
                    }} />
                    
                    {/* Nom de l'application avec gradient */}
                    <Typography
                      variant="h5"
                      noWrap
                      sx={{
                        mr: 2,
                        display: { xs: 'flex', md: 'flex' },
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #ffffff 100%)',
                        backgroundClip: 'text',
                        textFillColor: 'transparent',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Team Office
                    </Typography>
                  </Box>
                </Fade>

                {/* ========== SECTION DROITE : PANIER ET MENU UTILISATEUR ========== */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  gap: 3 
                }}>
                  
                  {/* ========== BOUTON PANIER (TOUJOURS VISIBLE) ========== */}
                  <Fade in={true} timeout={1200}>
                    <Tooltip title="Voir mon panier" arrow>
                      <IconButton 
                        className="cart-icon"
                        onClick={handleCart}
                        sx={{
                          color: 'white',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          padding: '10px',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      >
                        {isAuthenticated ? (
                          // Badge avec nombre d'articles pour utilisateur connecté
                          <Badge 
                            badgeContent={cartItems.length > 0 ? cartItems.length : undefined} 
                            color="secondary"
                            className="cart-badge"
                            sx={{
                              '& .MuiBadge-badge': {
                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                minWidth: '20px',
                                height: '20px',
                                borderRadius: '10px',
                                boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)'
                              }
                            }}
                          >
                            <ShoppingCart sx={{ fontSize: 24 }} />
                          </Badge>
                        ) : (
                          // Icône simple pour utilisateur déconnecté
                          <ShoppingCart sx={{ fontSize: 24 }} />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Fade>

                  {/* ========== SECTION AUTHENTIFICATION ========== */}
                  {isAuthenticated ? (
                    /* ========== UTILISATEUR CONNECTÉ ========== */
                    <Fade in={true} timeout={1400}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Nom d'utilisateur */}
                        <Typography sx={{
                          color: 'white',
                          fontWeight: 500,
                          fontSize: '1rem',
                          textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                          display: { xs: 'none', sm: 'block' }
                        }}>
                          Bonjour, {username}
                        </Typography>
                        
                        {/* Avatar utilisateur avec tooltip */}
                        <Tooltip title="Menu utilisateur" arrow>
                          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                            <Avatar 
                              alt={username || ''} 
                              src="/static/images/avatar/2.jpg"
                              className="animated-avatar"
                              sx={{
                                width: 40,
                                height: 40,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                              }}
                            >
                              {username?.charAt(0).toUpperCase()}
                            </Avatar>
                          </IconButton>
                        </Tooltip>

                        {/* ========== MENU DÉROULANT UTILISATEUR ========== */}
                        <Menu
                          sx={{ 
                            mt: '45px',
                            '& .MuiPaper-root': {
                              background: 'rgba(255, 255, 255, 0.95)',
                              backdropFilter: 'blur(20px)',
                              borderRadius: '15px',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                              minWidth: 180,
                              overflow: 'hidden',
                              '&:before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '1px',
                                background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.8), transparent)',
                              }
                            }
                          }}
                          id="menu-appbar"
                          anchorEl={anchorElUser}
                          anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                          }}
                          keepMounted
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                          }}
                          open={Boolean(anchorElUser)}
                          onClose={handleCloseUserMenu}
                        >
                          {/* Option : Mes commandes */}
                          <MenuItem 
                            onClick={handleCloseUserMenu}
                            sx={{
                              py: 1.5,
                              px: 2,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                transform: 'translateX(5px)',
                              }
                            }}
                          >
                            <ListAltIcon sx={{ mr: 1, color: '#667eea' }} />
                            <Typography sx={{ 
                              color: '#333', 
                              fontWeight: 500,
                              fontFamily: 'Inter, sans-serif'
                            }}>
                              Mes commandes
                            </Typography>
                          </MenuItem>

                          {/* Option : Déconnexion */}
                          <MenuItem 
                            onClick={handleLogout}
                            sx={{
                              py: 1.5,
                              px: 2,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 166, 38, 0.1) 100%)',
                                transform: 'translateX(5px)',
                              }
                            }}
                          >
                            <LogoutIcon sx={{ mr: 1, color: '#ff6b6b' }} />
                            <Typography sx={{ 
                              color: '#333', 
                              fontWeight: 500,
                              fontFamily: 'Inter, sans-serif'
                            }}>
                              Déconnexion
                            </Typography>
                          </MenuItem>
                        </Menu>
                      </Box>
                    </Fade>
                  ) : (
                    /* ========== UTILISATEUR NON CONNECTÉ ========== */
                    <Fade in={true} timeout={1400}>
                      <Button
                        variant="contained"
                        onClick={handleLogin}
                        className="wave-btn"
                        startIcon={<PersonIcon />}
                        sx={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                          color: 'white',
                          borderRadius: '12px',
                          px: 3,
                          py: 1,
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          textTransform: 'none',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          fontFamily: 'Inter, sans-serif',
                          '&:hover': {
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%)',
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                          }
                        }}
                      >
                        Connexion
                      </Button>
                    </Fade>
                  )}
                </Box>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </Slide>
    </>
  );
}

export default Navbar;
