/**
 * CartContext.ts - Contexte global pour la gestion du panier d'achat
 * 
 * Ce fichier définit l'interface TypeScript et le contexte React pour partager
 * l'état du panier entre tous les composants de l'application.
 * 
 * Architecture du contexte :
 * - Interface CartContextType : définit la structure des données et fonctions disponibles
 * - CartContext : contexte React créé avec des valeurs par défaut
 * - useCart : hook personnalisé pour accéder facilement au contexte
 * 
 * Avantages de cette approche :
 * - État global du panier accessible depuis n'importe quel composant
 * - Type safety avec TypeScript
 * - Hook personnalisé pour une utilisation simplifiée
 * - Séparation claire entre la définition du contexte et son implémentation
 */

import { createContext, useContext } from "react";
import type { CartItem } from "../../types/CartItem";

// ========== INTERFACE DU CONTEXTE DU PANIER ==========
/**
 * Interface définissant toutes les données et actions disponibles dans le contexte du panier
 * Cette interface garantit la cohérence des types entre tous les composants utilisant le panier
 */
interface CartContextType {
  // ========== DONNÉES D'ÉTAT ==========
  cartItems: CartItem[];                        // Tableau des articles présents dans le panier
  totalAmount: number;                          // Montant total calculé du panier (somme des prix × quantités)
  
  // ========== FONCTIONS D'ACTION ==========
  addItemToCart: (productId: string) => void;  // Ajouter un nouveau produit au panier (quantité par défaut : 1)
  updateItemQuantity: (productId: string, quantity: number) => void;  // Modifier la quantité d'un produit existant
  removeItemFromCart: (productId: string) => void;  // Supprimer complètement un produit du panier
  clearCart: () => void;  // Vider complètement le panier (supprime tous les articles)
}

// ========== CRÉATION DU CONTEXTE REACT ==========
/**
 * Contexte React créé avec des valeurs par défaut
 * Ces valeurs par défaut garantissent que le contexte fonctionne même si aucun Provider n'est trouvé
 * (bien que les fonctions par défaut ne fassent rien)
 */
export const CartContext = createContext<CartContextType>({
  // ========== VALEURS PAR DÉFAUT DES DONNÉES ==========
  cartItems: [],                // Panier vide par défaut
  totalAmount: 0,              // Montant total à 0 par défaut
  
  // ========== FONCTIONS VIDES PAR DÉFAUT ==========
  // Ces fonctions ne font rien mais évitent les erreurs si le contexte est utilisé sans Provider
  addItemToCart: () => {},     // Fonction vide par défaut pour ajout
  updateItemQuantity: () => {},  // Fonction vide par défaut pour mise à jour quantité
  removeItemFromCart: () => {},  // Fonction vide par défaut pour suppression
  clearCart: () => {},         // Fonction vide par défaut pour vidage complet
});

// ========== HOOK PERSONNALISÉ POUR UTILISER LE CONTEXTE ==========
/**
 * Hook personnalisé qui encapsule useContext(CartContext)
 * 
 * Avantages :
 * - Simplification de l'utilisation : useCart() au lieu de useContext(CartContext)
 * - Point central pour ajouter de la logique de validation si nécessaire
 * - Meilleure lisibilité dans les composants
 * 
 * Usage dans un composant :
 * const { cartItems, addItemToCart } = useCart();
 */
export const useCart = () => useContext(CartContext);