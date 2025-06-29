/**
 * Navbar.tsx - Composant de navigation principal de l'application
 * 
 * FONCTIONNALITÉS:
 * - Affichage du nom de l'application
 * - Menu utilisateur avec avatar
 * - Accès aux paramètres du profil
 * - Utilisation du contexte d'authentification pour récupérer les données utilisateur
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
// Import du hook d'authentification pour accéder aux données utilisateur
import { useAuthContext } from '../context/Auth/AuthContext';
import { Badge, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/Cart/CartContext';

// Configuration des options du menu utilisateur

/**
 * Composant Navbar - Barre de navigation responsive
 * 
 * Ce composant :
 * - Récupère les données utilisateur depuis le contexte d'authentification
 * - Affiche un menu déroulant avec les paramètres utilisateur
 * - Gère l'ouverture et la fermeture du menu utilisateur
 */
function Navbar() {
  // Récupération des données d'authentification depuis le contexte
  const {username,isAuthenticated,logout} = useAuthContext();
  
  const {cartItems} = useCart()
  // État local pour gérer l'ouverture/fermeture du menu utilisateur
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  // Hook pour la navigation
  // Permet de naviguer entre les pages de l'application
  const navigate = useNavigate();
  // Fonction pour ouvrir le menu utilisateur
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  // Fonction pour fermer le menu utilisateur
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  // Fonction pour rediriger vers la page de connexion
  // si l'utilisateur n'est pas connecté
  const handleLogin = () => {
navigate('/login');
  }
  // Fonction pour déconnecter l'utilisateur
  // et rediriger vers la page d'accueil
  const handleLogout = () => {
    logout();
    navigate('/');
    handleCloseUserMenu();
  }
  // Fonction pour rediriger vers la page du panier
  // pour afficher les articles ajoutés au panier
  const handleCart = () => {
    navigate('/cart');
  }

  
  
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
            {/* Container principal pour organiser les éléments de la navbar */}
            <Box sx={{ display: { xs: 'flex',flexDirection:'row' , justifyContent: 'space-between',alignItems:'center' ,width:'100%' }, mr: 1 }}>
            {/* Section gauche : Logo et nom de l'application */}
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
                {/* Icône de l'application */}
                <AdbIcon sx={{ display: { xs: 'flex', md: 'flex' }, mr: 1, color: 'white' }} />
                {/* Nom de l'application */}
                <Typography
                    variant="h6"
                    noWrap
                    sx={{
                        mr: 2,
                        display: { xs: 'flex', md: 'flex' },
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: 'white',
                        textDecoration: 'none',
                    }}
                >
                    Team office
                </Typography>
            </Box>
       
         
          {/* Section droite : Menu utilisateur */}
          <Box  gap={4} display='flex' flexDirection='row' alignItems={'center'} justifyContent={'center'}>
           <IconButton aria-label="cart" color ="inherit" onClick={handleCart}>
            <Badge badgeContent={cartItems.length} color="secondary">
              <ShoppingCart />
            </Badge>
          </IconButton>
            {isAuthenticated ? <>
            <Tooltip title="Open settings">
              <Grid container direction="row" alignItems="center" gap={2}>      
              <Typography >{username}</Typography>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={username|| ''}  src="/static/images/avatar/2.jpg" />
              </IconButton>
              </Grid>
            </Tooltip>
            {/* Menu déroulant des paramètres utilisateur */}
            <Menu
              sx={{ mt: '45px' }}
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
              {/* Génération dynamique des éléments du menu */}
             <MenuItem  onClick={handleCloseUserMenu}>
                  <Typography sx={{ textAlign: 'center' }}>My orders</Typography>
                </MenuItem>
              <MenuItem  onClick={handleLogout}>
                  <Typography sx={{ textAlign: 'center' }}>Logout</Typography>
                </MenuItem>
            </Menu>
            </>: <Button variant='contained' color='success'onClick={handleLogin}>Login</Button>}
            {/* Bouton avatar avec tooltip */}
            
          </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Navbar;
