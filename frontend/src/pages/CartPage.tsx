import { Container, Typography, Box, Card, CardContent, Divider, Button } from "@mui/material";
import { useCart } from "../context/Cart/CartContext";
import type { CartItem } from "../types/CartItem";

const CartPage = () => {
    // Récupération des données du panier depuis le contexte
    const { cartItems, totalAmount } = useCart();
    
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
        Mon Panier
      </Typography>
      
      {cartItems.length === 0 ? (
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
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Section des articles */}
          <Box sx={{ flex: 2 }}>
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Articles dans votre panier ({cartItems.length})
                </Typography>
                
                {cartItems.map((item: CartItem, index) => (
                  <Box key={item.productId}>
                    <Box sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
                        {/* Image placeholder */}
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
                          {!item.image && (
                            <Typography variant="body2" color="text.secondary">
                              Image
                            </Typography>
                          )}
                        </Box>
                        
                        {/* Détails du produit */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Prix unitaire: {item.unitPrice ? `${item.unitPrice}€` : 'Prix non disponible'}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            Quantité: {item.quantity}
                          </Typography>
                        </Box>
                        
                        {/* Prix total de l'article */}
                        <Box sx={{ textAlign: { xs: 'center', sm: 'right' }, flexShrink: 0 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            {item.unitPrice ? `${(item.quantity * item.unitPrice).toFixed(2)}€` : 'Prix non disponible'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    {/* Divider entre les articles */}
                    {index < cartItems.length - 1 && <Divider />}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>
          
          {/* Section du résumé */}
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Card sx={{ boxShadow: 3, position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Résumé de la commande
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">
                      Sous-total ({cartItems.length} article{cartItems.length > 1 ? 's' : ''})
                    </Typography>
                    <Typography variant="body1">
                      {totalAmount}€
                    </Typography>
                  </Box>
                  
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
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {totalAmount}€
                  </Typography>
                </Box>
                
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ mb: 2, py: 1.5 }}
                >
                  Passer la commande
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                >
                  Continuer les achats
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
    </Container>
  );
}
export default CartPage;