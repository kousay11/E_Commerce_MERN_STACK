import { Container, Typography, Alert, CircularProgress, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { Base_URL } from "../constants/baseUrl";
import { useAuthContext } from "../context/Auth/AuthContext";

// Interface pour typer les éléments du panier
interface CartItem {
    _id: string;
    productId: string;
    quantity: number;
    price: number;
    // Ajoutez d'autres propriétés selon votre modèle de données
}

interface Cart {
    items: CartItem[];
    totalAmount: number;
    // Ajoutez d'autres propriétés selon votre modèle de données
}

const CartPage = () => {
    // Correction de la syntaxe useState avec types TypeScript
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // Récupération du token d'authentification
    const { token, isAuthenticated } = useAuthContext();

    useEffect(() => {
        const fetchCart = async () => {
            // Vérification de l'authentification avant l'appel API
            if (!isAuthenticated || !token) {
                setError("Vous devez être connecté pour voir votre panier");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                // Appel API avec authentification
                const response = await fetch(`${Base_URL}/cart`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, // Ajout du token d'authentification
                    },
                });
                
                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Données du panier reçues:', data);
                setCart(data);
            }
            catch (error) {
                console.error('Erreur lors du chargement du panier:', error);
                setError("Failed to fetch  user cart, please try again later.");
            }
            finally {
                setLoading(false);
            }
        };
        
        fetchCart();
    }, [token, isAuthenticated]); // Dépendances ajoutées
    console.log('État du panier:', cart);
  return (
    <Container maxWidth="xl" sx={{ mt: 2, px: 1 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Mon Panier</Typography>
      
      {/* Affichage conditionnel selon l'état */}
      {loading ? (
        // Indicateur de chargement
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Chargement du panier...</Typography>
        </Box>
      ) : error ? (
        // Affichage des erreurs
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : cart && cart.items.length > 0 ? (
        // Affichage du panier avec des éléments
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Vous avez {cart.items.length} article(s) dans votre panier
          </Typography>
          {/* TODO: Ajouter ici les composants pour afficher les éléments du panier */}
          <Typography variant="h6" sx={{ mt: 3, fontWeight: 'bold' }}>
            Total: {cart.totalAmount}€
          </Typography>
        </Box>
      ) : (
        // Panier vide
        <Alert severity="info" sx={{ mt: 2 }}>
          Votre panier est vide. Commencez vos achats !
        </Alert>
      )}
    </Container>
  );
}
export default CartPage;