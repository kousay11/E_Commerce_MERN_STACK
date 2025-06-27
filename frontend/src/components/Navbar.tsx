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
// Import du hook d'authentification pour accéder aux données utilisateur
import { useAuthContext } from '../context/Auth/AuthContext';

// Configuration des options du menu utilisateur
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

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
  const {username,token} = useAuthContext();
  
  // État local pour gérer l'ouverture/fermeture du menu utilisateur
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  // Fonction pour ouvrir le menu utilisateur
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  // Fonction pour fermer le menu utilisateur
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  // Log pour le débogage - affiche les données d'authentification
  console.log("from navbar:", username,token);
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
            {/* Container principal pour organiser les éléments de la navbar */}
            <Box sx={{ display: { xs: 'flex',flexDirection:'row' , justifyContent: 'space-between',alignItems:'center' ,width:'100%' }, mr: 1 }}>
            {/* Section gauche : Logo et nom de l'application */}
            <Box sx={{ display: { xs: 'flex',flexDirection:'row',alignItems:'center' }, mr: 1 }}>
                {/* Icône de l'application */}
                <AdbIcon sx={{ display: {md: 'flex' }, mr: 1 }} />
                {/* Nom de l'application */}
                <Typography
                    variant="h6"
                    noWrap
                    component="a"
                    sx={{
                    mr: 2,
                    display: { xs: 'none', md: 'flex' },
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    }}
                >
                    Team office
                </Typography>
            </Box>
       
         
          {/* Section droite : Menu utilisateur */}
          <Box sx={{ flexGrow: 0 }}>
            {/* Bouton avatar avec tooltip */}
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
              </IconButton>
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
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography sx={{ textAlign: 'center' }}>{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Navbar;
