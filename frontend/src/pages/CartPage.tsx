/**
 * CartPage.tsx - Page principale du panier d'achat
 * 
 * Cette page affiche le contenu du panier utilisateur et fournit toutes les fonctionnalités
 * de gestion du panier : modification des quantités, suppression d'articles, vidage complet,
 * et processus de checkout avec saisie d'adresse de livraison.
 * 
 * Fonctionnalités principales :
 * - Affichage des articles du panier avec détails (titre, prix, quantité, total)
 * - Contrôles pour augmenter/diminuer la quantité de chaque article
 * - Suppression individuelle d'articles via icône poubelle
 * - Vidage complet du panier avec confirmation
 * - Processus de checkout avec saisie d'adresse et validation
 * - Messages de succès et d'erreur avec notifications visuelles
 * - Interface responsive adaptée mobile et desktop
 */

import { Container, Typography, Box, Card, CardContent, Divider, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, TextField, Alert, Snackbar } from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import { useCart } from "../context/Cart/CartContext";
import type { CartItem } from "../types/CartItem";
import { useState, useRef } from "react";
import { useAuthContext } from "../context/Auth/AuthContext";
import { Base_URL } from "../constants/baseUrl";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
    // ========== GESTION DES CONTEXTES ET HOOKS ==========
    // Récupération des données du panier depuis le contexte global
    // - cartItems : tableau des articles dans le panier
    // - totalAmount : montant total calculé du panier
    // - updateItemQuantity : fonction pour modifier la quantité d'un article
    // - removeItemFromCart : fonction pour supprimer un article du panier
    // - clearCart : fonction pour vider complètement le panier
    const { cartItems, totalAmount, updateItemQuantity, removeItemFromCart, clearCart } = useCart();
    
    // Récupération du token d'authentification pour les appels API
    const { token } = useAuthContext();
    
    // Hook de navigation pour rediriger l'utilisateur
    const navigate = useNavigate();
    
    // ========== ÉTATS LOCAUX POUR LA GESTION DU PANIER ==========
    // État pour contrôler l'affichage de la boîte de dialogue de confirmation de vidage
    const [openClearDialog, setOpenClearDialog] = useState(false);
    
    // ========== ÉTATS LOCAUX POUR LA GESTION DU CHECKOUT ==========
    // État pour contrôler l'affichage de la boîte de dialogue de checkout
    const [openCheckoutDialog, setOpenCheckoutDialog] = useState(false);
    // État pour stocker l'adresse de livraison saisie par l'utilisateur
    const [address, setAddress] = useState("");
    // État pour indiquer si le processus de checkout est en cours (désactive les boutons)
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    // État pour afficher le message de succès après checkout réussi
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);
    // État pour stocker et afficher les messages d'erreur du checkout
    const [checkoutError, setCheckoutError] = useState("");
    
    // ========== RÉFÉRENCES DOM ==========
    // Référence pour le bouton de vidage du panier (gestion du focus pour l'accessibilité)
    const clearButtonRef = useRef<HTMLButtonElement>(null);
    
    // ========== FONCTIONS DE GESTION DU VIDAGE DU PANIER ==========
    
    /**
     * Fonction pour confirmer et exécuter le vidage complet du panier
     * - Appelle la fonction clearCart du contexte qui fait l'appel API
     * - Ferme la boîte de dialogue de confirmation
     * - Restaure le focus sur le bouton d'origine pour l'accessibilité
     */
    const handleClearCart = () => {
        clearCart(); // Appel de la fonction du contexte pour vider le panier
        setOpenClearDialog(false); // Fermeture de la boîte de dialogue
        // Restauration du focus sur le bouton d'origine après un délai
        setTimeout(() => {
            clearButtonRef.current?.focus();
        }, 100);
    };
    
    /**
     * Fonction pour fermer la boîte de dialogue de vidage sans action
     * - Ferme la boîte de dialogue
     * - Restaure le focus sur le bouton d'origine pour l'accessibilité
     */
    const handleCloseDialog = () => {
        setOpenClearDialog(false); // Fermeture de la boîte de dialogue
        // Restauration du focus sur le bouton d'origine
        setTimeout(() => {
            clearButtonRef.current?.focus();
        }, 100);
    };
    
    // ========== FONCTIONS DE GESTION DU CHECKOUT ==========
    
    /**
     * Fonction principale pour gérer le processus de checkout
     * - Valide la saisie de l'adresse de livraison
     * - Fait l'appel API vers le backend pour créer la commande
     * - Gère les états de chargement, succès et erreur
     * - Redirige vers la page d'accueil après succès
     */
    const handleCheckout = async () => {
        // Validation : vérifier que l'adresse n'est pas vide
        if (!address.trim()) {
            setCheckoutError("Veuillez saisir une adresse de livraison");
            return;
        }
        
        // Démarrage du processus de checkout
        setIsCheckingOut(true); // Désactive les boutons
        setCheckoutError(""); // Efface les erreurs précédentes
        
        try {
            // Appel API vers le backend pour créer la commande
            const response = await fetch(`${Base_URL}/cart/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // Authentification JWT
                },
                body: JSON.stringify({ address: address.trim() }), // Envoi de l'adresse
            });
            
            // Vérification du statut de la réponse
            if (!response.ok) {
                throw new Error("Erreur lors du checkout");
            }
            
            // Récupération des détails de la commande créée
            const order = await response.json();
            console.log("Commande créée:", order);
            
            // ========== GESTION DU SUCCÈS ==========
            setOpenCheckoutDialog(false); // Fermeture de la boîte de dialogue
            setCheckoutSuccess(true); // Affichage du message de succès
            setAddress(""); // Réinitialisation du champ adresse
            
            // Rechargement de la page après 2 secondes pour afficher le panier vide
            // (Le panier a été vidé côté backend lors du checkout)
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            // ========== GESTION DES ERREURS ==========
            console.error("Erreur checkout:", error);
            setCheckoutError("Une erreur s'est produite lors de la commande");
        } finally {
            // Réactivation des boutons à la fin du processus
            setIsCheckingOut(false);
        }
    };
    
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* ========== EN-TÊTE DE LA PAGE ========== */}
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
        Mon Panier
      </Typography>
      
      {/* ========== AFFICHAGE CONDITIONNEL : PANIER VIDE OU AVEC CONTENU ========== */}
      {cartItems.length === 0 ? (
        // ========== ÉTAT PANIER VIDE ==========
        // Affichage d'un message informatif quand le panier ne contient aucun article
        <Card sx={{ p: 4, textAlign: 'center', boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              Votre panier est vide
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Découvrez nos produits et ajoutez-les à votre panier !
            </Typography>
          </CardContent>
        </Card>
      ) : (
        // ========== ÉTAT PANIER AVEC CONTENU ==========
        // Layout principal en deux colonnes : articles à gauche, résumé à droite
        // Responsive : colonnes empilées sur mobile, côte à côte sur desktop
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          
          {/* ========== SECTION DES ARTICLES (COLONNE GAUCHE) ========== */}
          <Box sx={{ flex: 2 }}>
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                {/* En-tête de la section avec compteur d'articles */}
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Articles dans votre panier ({cartItems.length})
                </Typography>
                
                {/* ========== BOUCLE D'AFFICHAGE DES ARTICLES ========== */}
                {/* Chaque article est affiché avec ses détails et contrôles */}
                {cartItems.map((item: CartItem, index) => (
                  <Box key={item.productId}>
                    <Box sx={{ py: 2 }}>
                      {/* Layout responsive pour chaque article */}
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
                        
                        {/* ========== IMAGE DU PRODUIT ========== */}
                        {/* Container d'image avec placeholder si pas d'image */}
                        <Box
                          sx={{
                            width: { xs: '100%', sm: 120 },
                            height: 120,
                            backgroundColor: 'grey.200',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundImage: item.image ? `url(${item.image})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {/* Placeholder text si pas d'image disponible */}
                          {!item.image && (
                            <Typography variant="body2" color="text.secondary">
                              Image
                            </Typography>
                          )}
                        </Box>
                        
                        {/* ========== DÉTAILS DU PRODUIT ========== */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          {/* Titre du produit */}
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {item.title}
                          </Typography>
                          {/* Prix unitaire avec vérification de disponibilité */}
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Prix unitaire: {item.unitPrice ? `${item.unitPrice}€` : 'Prix non disponible'}
                          </Typography>
                          
                          {/* ========== CONTRÔLES DE QUANTITÉ ========== */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Quantité:
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {/* Bouton diminuer quantité */}
                              {/* Désactivé si quantité = 1 pour éviter les valeurs négatives */}
                              <IconButton
                                size="small"
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    updateItemQuantity(item.productId, item.quantity - 1);
                                  }
                                }}
                                disabled={item.quantity <= 1}
                                sx={{ 
                                  border: '1px solid',
                                  borderColor: 'grey.300',
                                  '&:hover': { backgroundColor: 'grey.100' }
                                }}
                              >
                                <Remove fontSize="small" />
                              </IconButton>
                              
                              {/* Affichage de la quantité actuelle */}
                              <Typography variant="body1" sx={{ 
                                mx: 1, 
                                minWidth: '30px', 
                                textAlign: 'center',
                                fontWeight: 'medium'
                              }}>
                                {item.quantity}
                              </Typography>
                              
                              {/* Bouton augmenter quantité */}
                              {/* Appelle updateItemQuantity avec la nouvelle quantité */}
                              <IconButton
                                size="small"
                                onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                                sx={{ 
                                  border: '1px solid',
                                  borderColor: 'grey.300',
                                  '&:hover': { backgroundColor: 'grey.100' }
                                }}
                              >
                                <Add fontSize="small" />
                              </IconButton>
                            </Box>
                            
                            {/* ========== BOUTON SUPPRIMER ARTICLE ========== */}
                            {/* Icône poubelle pour supprimer l'article individuellement */}
                            <IconButton
                              size="small"
                              onClick={() => removeItemFromCart(item.productId)}
                              sx={{ 
                                color: 'error.main',
                                ml: 2,
                                '&:hover': { 
                                  backgroundColor: 'error.light',
                                  color: 'white'
                                }
                              }}
                              title="Supprimer cet article"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        {/* ========== PRIX TOTAL DE L'ARTICLE ========== */}
                        {/* Calcul et affichage du prix total (quantité × prix unitaire) */}
                        <Box sx={{ textAlign: { xs: 'center', sm: 'right' }, flexShrink: 0 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            {item.unitPrice ? `${(item.quantity * item.unitPrice).toFixed(2)}€` : 'Prix non disponible'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    {/* ========== SÉPARATEUR ENTRE ARTICLES ========== */}
                    {/* Divider affiché seulement entre les articles, pas après le dernier */}
                    {index < cartItems.length - 1 && <Divider />}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>
          
          {/* ========== SECTION DU RÉSUMÉ (COLONNE DROITE) ========== */}
          {/* Panneau sticky contenant le résumé de commande et les actions */}
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Card sx={{ boxShadow: 3, position: 'sticky', top: 20 }}>
              <CardContent>
                {/* En-tête du résumé */}
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Résumé de la commande
                </Typography>
                
                {/* ========== DÉTAIL DES COÛTS ========== */}
                <Box sx={{ mb: 2 }}>
                  {/* Sous-total avec compteur d'articles */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">
                      Sous-total ({cartItems.length} article{cartItems.length > 1 ? 's' : ''})
                    </Typography>
                    <Typography variant="body1">
                      {totalAmount}€
                    </Typography>
                  </Box>
                  
                  {/* Frais de livraison (gratuits dans ce cas) */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">
                      Livraison
                    </Typography>
                    <Typography variant="body1" color="success.main">
                      Gratuite
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {/* ========== TOTAL FINAL ========== */}
                {/* Affichage du montant total en évidence */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {totalAmount}€
                  </Typography>
                </Box>
                
                {/* ========== BOUTONS D'ACTION ========== */}
                
                {/* Bouton principal : Passer la commande */}
                {/* Ouvre la boîte de dialogue de checkout pour saisir l'adresse */}
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ mb: 2, py: 1.5 }}
                  onClick={() => setOpenCheckoutDialog(true)}
                >
                  Passer la commande
                </Button>
                
                {/* Bouton secondaire : Continuer les achats */}
                {/* Redirige vers la page d'accueil pour ajouter d'autres produits */}
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  sx={{ mb: 2 }}
                   onClick={() => navigate("/")}
                >
                  Continuer les achats
                </Button>
                
                {/* Bouton destructeur : Vider le panier */}
                {/* Utilise une référence pour la gestion du focus (accessibilité) */}
                {/* Style rouge pour indiquer l'action destructrice */}
                <Button
                  ref={clearButtonRef}
                  variant="outlined"
                  fullWidth
                  size="medium"
                  onClick={() => setOpenClearDialog(true)}
                  sx={{ 
                    color: 'error.main',
                    borderColor: 'error.main',
                    '&:hover': { 
                      backgroundColor: 'error.light',
                      borderColor: 'error.main',
                      color: 'white'
                    }
                  }}
                >
                  Vider le panier
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
      
      {/* ========== BOÎTES DE DIALOGUE ET NOTIFICATIONS ========== */}
      
      {/* ========== BOÎTE DE DIALOGUE DE CONFIRMATION POUR VIDER LE PANIER ========== */}
      {/* Modal avec confirmation avant vidage complet du panier */}
      {/* Utilise les props d'accessibilité pour les lecteurs d'écran */}
      <Dialog
        open={openClearDialog}
        onClose={handleCloseDialog}
        aria-labelledby="clear-cart-dialog-title"
        aria-describedby="clear-cart-dialog-description"
        disableAutoFocus={false}
        disableEnforceFocus={false}
        disableRestoreFocus={false}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="clear-cart-dialog-title">
          Vider le panier
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="clear-cart-dialog-description">
            Êtes-vous sûr de vouloir vider complètement votre panier ? 
            Cette action supprimera tous les articles et ne peut pas être annulée.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {/* Bouton d'annulation */}
          <Button onClick={handleCloseDialog} color="primary">
            Annuler
          </Button>
          {/* Bouton de confirmation (destructeur) */}
          {/* autoFocus pour naviguer directement au bouton principal */}
          <Button onClick={handleClearCart} color="error" variant="contained" autoFocus>
            Vider le panier
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* ========== BOÎTE DE DIALOGUE DE CHECKOUT ========== */}
      {/* Modal pour saisir l'adresse de livraison et finaliser la commande */}
      <Dialog
        open={openCheckoutDialog}
        onClose={() => setOpenCheckoutDialog(false)}
        aria-labelledby="checkout-dialog-title"
        aria-describedby="checkout-dialog-description"
        disableAutoFocus={false}
        disableEnforceFocus={false}
        disableRestoreFocus={false}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="checkout-dialog-title">
          Passer la commande
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="checkout-dialog-description">
            Veuillez confirmer votre adresse de livraison pour finaliser la commande.
          </DialogContentText>
          
          {/* ========== CHAMP DE SAISIE DE L'ADRESSE ========== */}
          {/* Champ texte avec validation et état de chargement */}
          <TextField
            autoFocus
            margin="dense"
            label="Adresse de livraison"
            type="text"
            fullWidth
            variant="outlined"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isCheckingOut} // Désactivé pendant le processus
            sx={{ mb: 2 }}
          />
          
          {/* ========== AFFICHAGE DES ERREURS ========== */}
          {/* Alerte rouge affichée en cas d'erreur de validation ou d'API */}
          {checkoutError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {checkoutError}
            </Alert>
          )}
          
          {/* ========== AFFICHAGE DU SUCCÈS ========== */}
          {/* Alerte verte affichée après succès du checkout */}
          {checkoutSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Commande passée avec succès ! Vous serez redirigé vers la page d'accueil dans quelques secondes.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          {/* Bouton d'annulation du checkout */}
          <Button onClick={() => setOpenCheckoutDialog(false)} color="primary">
            Annuler
          </Button>
          {/* Bouton de confirmation du checkout */}
          {/* Texte dynamique selon l'état de chargement */}
          {/* Désactivé pendant le processus pour éviter les doublons */}
          <Button 
            onClick={handleCheckout} 
            color="primary" 
            variant="contained" 
            disabled={isCheckingOut}
          >
            {isCheckingOut ? 'Traitement...' : 'Confirmer l\'adresse'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* ========== NOTIFICATION DE SUCCÈS (SNACKBAR) ========== */}
      {/* Notification flottante en haut de l'écran pour confirmer le succès */}
      {/* Se ferme automatiquement après 6 secondes */}
      <Snackbar
        open={checkoutSuccess}
        autoHideDuration={6000}
        onClose={() => setCheckoutSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setCheckoutSuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          🎉 Commande passée avec succès ! Merci pour votre achat.
        </Alert>
      </Snackbar>
    </Container>
  );
}
export default CartPage;