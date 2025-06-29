/**
 * CartProvider.tsx - Fournisseur du contexte du panier
 * 
 * Ce composant gère l'état global du panier et fournit les fonctionnalités
 * de gestion du panier à tous les composants enfants de l'application
 */

import { type FC,type PropsWithChildren, useState, useEffect, useCallback } from "react";
import { CartContext } from "./CartContext";
import { type CartItem } from "../../types/CartItem";
import { useAuthContext } from "../Auth/AuthContext";
import { Base_URL } from "../../constants/baseUrl";

const CartProvider: FC<PropsWithChildren> = ({ children }) => {
  // Récupération du token d'authentification depuis le contexte Auth
  const { token } = useAuthContext();
  
  // État local pour stocker les articles du panier
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  // État local pour stocker le montant total du panier
  const [totalAmount, setTotalAmount] = useState<number>(0);
  // État local pour gérer les erreurs (utilisé dans les fonctions async)
  const [, setError] = useState("");
  
   useEffect(() => {
    if (!token) {
      return;
    }

    const fetchCart = async () => {
      const response = await fetch(`${Base_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setError("Failed to fetch user cart. Please try again");
      }

      const cart = await response.json();

     const cartItemsMapped = cart.items.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ product, quantity }: { product: any; quantity: number }) => ({
          productId: product._id, // ID du produit
          title: product.title, // Titre du produit
          image: product.image, // Image du produit
          quantity, // Quantité dans le panier
          unitPrice: product.unitPrice, // Prix unitaire
        })
      );

      setCartItems(cartItemsMapped);
      setTotalAmount(cart.totalAmount);
    };

    fetchCart();
  }, [token]);
  // Fonction pour ajouter un produit au panier
  const addItemToCart = async (productId: string) => {
    try {
      // Vérification si l'utilisateur est authentifié
      if (!token) {
        const errorMsg = "Vous devez être connecté pour ajouter des articles au panier";
        setError(errorMsg);
        return;
      }

      const requestBody = {
        productId, // ID du produit à ajouter
        quantity: 1, // Quantité par défaut fixée à 1
      };
      console.log('Request body:', requestBody);

      // Envoi d'une requête POST vers l'API backend pour ajouter un produit au panier
      const response = await fetch(`${Base_URL}/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Ajout du token JWT pour l'authentification
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Response status:', response.status);
      
      // Vérification si la requête a échoué
      if (!response.ok) {
        let errorMessage = "Failed to add to cart";
        
        // Gestion spécifique des différents codes d'erreur
        if (response.status === 403) {
          errorMessage = "Accès refusé. Veuillez vous reconnecter.";
        } else if (response.status === 401) {
          errorMessage = "Non autorisé. Token expiré.";
        } else if (response.status === 404) {
          errorMessage = "Produit introuvable.";
        } else if (response.status === 400) {
          errorMessage = "Données invalides.";
        }
        
        setError(errorMessage);
        return;
      }
      
      // Récupération des données du panier mis à jour depuis la réponse
      const cart = await response.json();
      
      console.log('Cart data received:', cart);
      if (cart.items && cart.items.length > 0) {
        console.log('First cart item:', cart.items[0]);
      }

      // Vérification si les données du panier sont valides
      if (!cart || !cart.items) {
        setError("Failed to parse cart data");
        console.error("Invalid cart data received:", cart);
        return;
      }

      // Transformation des données du panier pour correspondre au format attendu par le frontend
      const cartItemsMapped = cart.items.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ product, quantity, unitPrice }: { product: any; quantity: number; unitPrice: number }) => ({
          productId: product._id, // ID du produit
          title: product.title, // Titre du produit
          image: product.image, // Image du produit
          quantity, // Quantité dans le panier
          unitPrice: unitPrice || product.price, // Prix unitaire depuis le cart item ou produit
        })
      );

      // Mise à jour du state avec les nouveaux articles du panier
      setCartItems([...cartItemsMapped]);
      // Mise à jour du montant total du panier
      setTotalAmount(cart.totalAmount);
      
      // Réinitialiser l'erreur en cas de succès
      setError("");

    } catch (error) {
      // Gestion des erreurs lors de l'ajout au panier
      console.error("Error adding item to cart:", error);
      const errorMsg = "Une erreur s'est produite lors de l'ajout au panier";
      setError(errorMsg);
    }
  };

  // Fonction pour récupérer le panier existant depuis l'API
  const fetchCart = useCallback(async () => {
    try {
      // Vérification si l'utilisateur est authentifié
      if (!token) {
        return;
      }

      // Récupération du panier depuis l'API
      const response = await fetch(`${Base_URL}/cart`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          return;
        }
        throw new Error(`HTTP Error ${response.status}`);
      }

      const cart = await response.json();

      if (cart && cart.items) {
        // Transformation des données du panier
        const cartItemsMapped = cart.items.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ({ product, quantity, unitPrice }: { product: any; quantity: number; unitPrice: number }) => ({
            productId: product._id,
            title: product.title,
            image: product.image,
            quantity,
            unitPrice: unitPrice || product.price, // Prix unitaire depuis le cart item ou produit
          })
        );

        setCartItems(cartItemsMapped);
        setTotalAmount(cart.totalAmount);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      // Ne pas afficher d'erreur pour le chargement initial du panier
    }
  }, [token]); // Dépendance sur le token

  // useEffect pour charger le panier au montage du composant
  useEffect(() => {
    fetchCart();
  }, [fetchCart]); // Dépendance sur fetchCart qui inclut le token

  // Fournisseur du contexte qui rend les données et fonctions du panier
  // disponibles pour tous les composants enfants
  return (
    <CartContext.Provider
      value={{
        cartItems,        // Articles actuels du panier
        totalAmount,      // Montant total calculé
        addItemToCart,    // Fonction pour ajouter un article
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;