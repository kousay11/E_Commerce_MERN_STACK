import { Container, Typography, Box } from "@mui/material";
import { useCart } from "../context/Cart/CartContext";
import type { CartItem } from "../types/CartItem";

const CartPage = () => {
    // Récupération des données du panier depuis le contexte
    const { cartItems, totalAmount } = useCart();
    
  return (
    <Container maxWidth="xl" sx={{ mt: 2, px: 1 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Mon Panier</Typography>
      
      {cartItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Votre panier est vide
          </Typography>
        </Box>
      ) : (
        <>
          {cartItems.map((item: CartItem) => (
            <Box key={item.productId} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
              <Typography variant="h6">{item.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                Quantité: {item.quantity}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Prix unitaire: {item.unitPrice}€
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Total: {(item.quantity * item.unitPrice).toFixed(2)}€
              </Typography>
            </Box>
          ))}
          
          <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.100', borderRadius: 2 }}>
            <Typography variant="h5" sx={{ textAlign: 'right', fontWeight: 'bold' }}>
              Total du panier: {totalAmount}€
            </Typography>
          </Box>
        </>
      )}
    </Container>
  );
}
export default CartPage;