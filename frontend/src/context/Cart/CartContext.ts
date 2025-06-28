/**
 * CartContext.ts - Contexte pour la gestion du panier
 * 
 * Définit l'interface et le contexte React pour partager l'état du panier
 * entre tous les composants de l'application
 */

import { createContext, useContext } from "react";
import type { CartItem } from "../../types/CartItem";

// Interface définissant les données et actions disponibles dans le contexte du panier
interface CartContextType {
  cartItems: CartItem[];                        // Liste des articles dans le panier
  totalAmount: number;                          // Montant total du panier
  addItemToCart: (productId: string) => void;  // Fonction pour ajouter un produit au panier
}

// Création du contexte avec des valeurs par défaut
export const CartContext = createContext<CartContextType>({
  cartItems: [],                // Panier vide par défaut
  totalAmount: 0,              // Montant total à 0 par défaut
  addItemToCart: () => {},     // Fonction vide par défaut
});

// Hook personnalisé pour utiliser le contexte du panier dans les composants
export const useCart = () => useContext(CartContext);