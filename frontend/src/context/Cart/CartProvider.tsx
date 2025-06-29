/**
 * CartProvider.tsx - Fournisseur du contexte du panier d'achat
 * 
 * Ce composant implémente la logique métier du panier et fournit toutes les fonctionnalités
 * de gestion du panier à l'ensemble de l'application via le Context API de React.
 * 
 * Responsabilités principales :
 * - Gestion de l'état local du panier (articles, montant total)
 * - Communication avec l'API backend pour toutes les opérations CRUD du panier
 * - Synchronisation automatique avec le backend au chargement
 * - Transformation des données entre les formats backend et frontend
 * - Gestion des erreurs et des états de chargement
 * - Fourniture des fonctions d'action aux composants enfants
 * 
 * Architecture des appels API :
 * - Récupération automatique du panier au montage du composant
 * - Appels API pour chaque modification (ajout, suppression, mise à jour)
 * - Mise à jour immédiate de l'état local après réponse API réussie
 * - Gestion centralisée de l'authentification via token JWT
 * 
 * Pattern utilisé :
 * - Provider Pattern avec Context API
 * - État local synchronisé avec le backend
 * - Transformation de données pour compatibilité frontend/backend
 */

import { type FC,type PropsWithChildren, useState, useEffect, useCallback } from "react";
import { CartContext } from "./CartContext";
import { type CartItem } from "../../types/CartItem";
import { useAuthContext } from "../Auth/AuthContext";
import { Base_URL } from "../../constants/baseUrl";

const CartProvider: FC<PropsWithChildren> = ({ children }) => {
  // ========== GESTION DES CONTEXTES ET HOOKS ==========
  // Récupération du token d'authentification depuis le contexte Auth
  // Ce token est nécessaire pour toutes les requêtes API authentifiées
  const { token } = useAuthContext();
  
  // ========== ÉTATS LOCAUX DU PANIER ==========
  // État principal contenant la liste des articles du panier
  // Structure : array de CartItem avec productId, title, image, quantity, unitPrice
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // État contenant le montant total calculé du panier
  // Synchronisé avec le backend pour garantir la cohérence
  const [totalAmount, setTotalAmount] = useState<number>(0);
  
  // État pour stocker les messages d'erreur (utilisé dans les fonctions async)
  // Non exposé dans le contexte mais utilisé pour le debugging
  const [, setError] = useState("");
  
  // ========== CHARGEMENT INITIAL DU PANIER ==========
  /**
   * useEffect pour synchroniser le panier avec le backend au chargement
   * - S'exécute uniquement si l'utilisateur est authentifié (token disponible)
   * - Récupère le panier existant depuis l'API
   * - Transforme les données backend vers le format frontend
   * - Met à jour l'état local avec les données récupérées
   */
   useEffect(() => {
    // Vérification de l'authentification avant toute requête
    if (!token) {
      return;
    }

    /**
     * Fonction interne pour récupérer le panier depuis l'API
     * Utilise l'endpoint GET /cart avec authentification JWT
     */
    const fetchCart = async () => {
      const response = await fetch(`${Base_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`, // Authentification JWT
        },
      });

      // Gestion des erreurs de réponse HTTP
      if (!response.ok) {
        setError("Failed to fetch user cart. Please try again");
      }

      // Parsing de la réponse JSON contenant les données du panier
      const cart = await response.json();

     /**
      * TRANSFORMATION DES DONNÉES BACKEND → FRONTEND
      * Le backend retourne : { items: [{ product: {...}, quantity: number }], totalAmount: number }
      * Le frontend attend : CartItem[] avec { productId, title, image, quantity, unitPrice }
      */
     const cartItemsMapped = cart.items.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ product, quantity }: { product: any; quantity: number }) => ({
          productId: product._id, // ID du produit pour les opérations futures
          title: product.title, // Titre du produit pour l'affichage
          image: product.image, // URL de l'image pour l'affichage
          quantity, // Quantité dans le panier
          unitPrice: product.unitPrice, // Prix unitaire pour le calcul des totaux
        })
      );

      // Mise à jour de l'état local avec les données transformées
      setCartItems(cartItemsMapped);
      setTotalAmount(cart.totalAmount);
    };

    // Exécution de la récupération du panier
    fetchCart();
  }, [token]); // Dépendance sur le token : re-exécute si l'utilisateur se connecte/déconnecte
  
  // ========== FONCTION D'AJOUT AU PANIER ==========
  /**
   * Fonction pour ajouter un nouveau produit au panier
   * - Vérifie l'authentification de l'utilisateur
   * - Fait un appel API POST vers /cart/items
   * - Gère les différents codes d'erreur HTTP
   * - Met à jour l'état local avec le panier modifié
   * - Transforme les données backend vers frontend
   * 
   * @param productId - Identifiant unique du produit à ajouter
   */
  const addItemToCart = async (productId: string) => {
    try {
      // ========== VALIDATION DE L'AUTHENTIFICATION ==========
      if (!token) {
        const errorMsg = "Vous devez être connecté pour ajouter des articles au panier";
        setError(errorMsg);
        return;
      }

      // ========== PRÉPARATION DE LA REQUÊTE ==========
      const requestBody = {
        productId, // ID du produit à ajouter
        quantity: 1, // Quantité par défaut fixée à 1 pour simplifier l'UX
      };
      console.log('Request body:', requestBody);

      // ========== APPEL API POUR AJOUTER AU PANIER ==========
      const response = await fetch(`${Base_URL}/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Authentification JWT requise
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Response status:', response.status);
      
      // ========== GESTION DÉTAILLÉE DES ERREURS HTTP ==========
      if (!response.ok) {
        let errorMessage = "Failed to add to cart";
        
        // Personnalisation des messages d'erreur selon le code HTTP
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
      
      // ========== TRAITEMENT DE LA RÉPONSE RÉUSSIE ==========
      const cart = await response.json();
      
      console.log('Cart data received:', cart);
      if (cart.items && cart.items.length > 0) {
        console.log('First cart item:', cart.items[0]);
      }

      // Validation des données reçues
      if (!cart || !cart.items) {
        setError("Failed to parse cart data");
        console.error("Invalid cart data received:", cart);
        return;
      }

      // ========== TRANSFORMATION DES DONNÉES BACKEND → FRONTEND ==========
      const cartItemsMapped = cart.items.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ product, quantity, unitPrice }: { product: any; quantity: number; unitPrice: number }) => ({
          productId: product._id, // ID du produit pour les futures opérations
          title: product.title, // Titre pour l'affichage
          image: product.image, // Image pour l'affichage
          quantity, // Quantité dans le panier
          unitPrice: unitPrice || product.price, // Prix unitaire depuis le cart item ou fallback vers product.price
        })
      );

      // ========== MISE À JOUR DE L'ÉTAT LOCAL ==========
      setCartItems([...cartItemsMapped]); // Spread pour forcer la re-render
      setTotalAmount(cart.totalAmount); // Montant total calculé par le backend
      
      // Réinitialisation de l'erreur en cas de succès
      setError("");

    } catch (error) {
      // ========== GESTION DES ERREURS RÉSEAU/PARSING ==========
      console.error("Error adding item to cart:", error);
      const errorMsg = "Une erreur s'est produite lors de l'ajout au panier";
      setError(errorMsg);
    }
  };

  // ========== FONCTION DE RÉCUPÉRATION DU PANIER ==========
  /**
   * Fonction pour récupérer le panier existant depuis l'API
   * - Utilisée pour synchroniser l'état local avec le backend
   * - Encapsulée dans useCallback pour optimiser les performances
   * - Utilisée au chargement initial et après certaines opérations
   * - Gère les erreurs d'authentification silencieusement
   */
  const fetchCart = useCallback(async () => {
    try {
      // ========== VALIDATION DE L'AUTHENTIFICATION ==========
      if (!token) {
        return; // Sortie silencieuse si pas de token
      }

      // ========== APPEL API POUR RÉCUPÉRER LE PANIER ==========
      const response = await fetch(`${Base_URL}/cart`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Authentification JWT
        },
      });

      // ========== GESTION DES ERREURS D'AUTHENTIFICATION ==========
      if (!response.ok) {
        // Gestion silencieuse des erreurs d'authentification
        // (évite les messages d'erreur au chargement initial)
        if (response.status === 403 || response.status === 401) {
          return;
        }
        throw new Error(`HTTP Error ${response.status}`);
      }

      // ========== TRAITEMENT DES DONNÉES RÉCUPÉRÉES ==========
      const cart = await response.json();

      if (cart && cart.items) {
        // ========== TRANSFORMATION DES DONNÉES BACKEND → FRONTEND ==========
        const cartItemsMapped = cart.items.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ({ product, quantity, unitPrice }: { product: any; quantity: number; unitPrice: number }) => ({
            productId: product._id, // ID pour les opérations futures
            title: product.title, // Titre pour l'affichage
            image: product.image, // Image pour l'affichage
            quantity, // Quantité actuelle
            unitPrice: unitPrice || product.price, // Prix unitaire avec fallback
          })
        );

        // ========== MISE À JOUR DE L'ÉTAT LOCAL ==========
        setCartItems(cartItemsMapped);
        setTotalAmount(cart.totalAmount);
      }
    } catch (error) {
      // ========== GESTION DES ERREURS ==========
      console.error("Error fetching cart:", error);
      // Pas d'affichage d'erreur pour le chargement initial
      // (évite les notifications intrusives au démarrage de l'app)
    }
  }, [token]); // Dépendance sur le token : re-exécute si authentification change

  // ========== SYNCHRONISATION AUTOMATIQUE AU MONTAGE ==========
  /**
   * useEffect pour charger automatiquement le panier au montage du composant
   * - Se déclenche une fois au montage puis à chaque changement de fetchCart
   * - fetchCart dépend du token, donc se relance si l'utilisateur se connecte
   */
  useEffect(() => {
    fetchCart();
  }, [fetchCart]); // Dépendance sur fetchCart qui inclut implicitement le token

  // ========== FONCTION DE MISE À JOUR DE LA QUANTITÉ ==========
  /**
   * Fonction pour mettre à jour la quantité d'un produit dans le panier
   * - Valide que l'utilisateur est authentifié
   * - Valide que la quantité est positive (≥ 1)
   * - Fait un appel API PUT vers /cart/items
   * - Met à jour l'état local avec le panier modifié
   * 
   * @param productId - Identifiant du produit à modifier
   * @param quantity - Nouvelle quantité (doit être ≥ 1)
   */
  const updateItemQuantity = async (productId: string, quantity: number) => {
    try {
      // ========== VALIDATIONS PRÉALABLES ==========
      if (!token) {
        setError("Vous devez être connecté pour modifier le panier");
        return;
      }

      if (quantity < 1) {
        setError("La quantité doit être au moins 1");
        return;
      }

      // ========== APPEL API POUR MISE À JOUR ==========
      const response = await fetch(`${Base_URL}/cart/items`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Authentification requise
        },
        body: JSON.stringify({
          productId, // ID du produit à modifier
          quantity,  // Nouvelle quantité
        }),
      });

      // ========== GESTION DES ERREURS HTTP ==========
      if (!response.ok) {
        setError("Erreur lors de la mise à jour de la quantité");
        return;
      }

      // ========== TRAITEMENT DE LA RÉPONSE RÉUSSIE ==========
      const cart = await response.json();

      if (cart && cart.items) {
        // ========== TRANSFORMATION DES DONNÉES ==========
        const cartItemsMapped = cart.items.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ({ product, quantity, unitPrice }: { product: any; quantity: number; unitPrice: number }) => ({
            productId: product._id,
            title: product.title,
            image: product.image,
            quantity,
            unitPrice: unitPrice || product.price, // Prix avec fallback
          })
        );

        // ========== MISE À JOUR DE L'ÉTAT LOCAL ==========
        setCartItems(cartItemsMapped);
        setTotalAmount(cart.totalAmount);
      }

      // ========== RÉINITIALISATION DES ERREURS ==========
      setError(""); // Effacement des erreurs précédentes en cas de succès
      
    } catch (error) {
      // ========== GESTION DES ERREURS ==========
      console.error("Error updating item quantity:", error);
      setError("Une erreur s'est produite lors de la mise à jour");
    }
  };

  // ========== FONCTION DE SUPPRESSION D'UN ARTICLE ==========
  /**
   * Fonction pour supprimer complètement un produit du panier
   * - Valide l'authentification de l'utilisateur
   * - Fait un appel API DELETE vers /cart/items/{productId}
   * - Gère le cas où le panier devient vide après suppression
   * - Met à jour l'état local avec le panier modifié
   * 
   * @param productId - Identifiant du produit à supprimer complètement
   */
  const removeItemFromCart = async (productId: string) => {
    try {
      // ========== VALIDATION DE L'AUTHENTIFICATION ==========
      if (!token) {
        setError("Vous devez être connecté pour modifier le panier");
        return;
      }

      // ========== APPEL API POUR SUPPRESSION ==========
      const response = await fetch(`${Base_URL}/cart/items/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Authentification requise
        },
      });

      // ========== GESTION DES ERREURS HTTP ==========
      if (!response.ok) {
        setError("Erreur lors de la suppression du produit");
        return;
      }

      // ========== TRAITEMENT DE LA RÉPONSE ==========
      const cart = await response.json();

      if (cart && cart.items) {
        // ========== CAS : PANIER CONTIENT ENCORE DES ARTICLES ==========
        const cartItemsMapped = cart.items.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ({ product, quantity, unitPrice }: { product: any; quantity: number; unitPrice: number }) => ({
            productId: product._id,
            title: product.title,
            image: product.image,
            quantity,
            unitPrice: unitPrice || product.price,
          })
        );

        setCartItems(cartItemsMapped);
        setTotalAmount(cart.totalAmount);
      } else {
        // ========== CAS : PANIER VIDE APRÈS SUPPRESSION ==========
        // Réinitialisation complète de l'état local
        setCartItems([]);
        setTotalAmount(0);
      }

      // ========== RÉINITIALISATION DES ERREURS ==========
      setError("");
      
    } catch (error) {
      // ========== GESTION DES ERREURS ==========
      console.error("Error removing item from cart:", error);
      setError("Une erreur s'est produite lors de la suppression");
    }
  };

  // ========== FONCTION DE VIDAGE COMPLET DU PANIER ==========
  /**
   * Fonction pour vider complètement le panier (supprimer tous les articles)
   * - Valide l'authentification de l'utilisateur
   * - Fait un appel API DELETE vers /cart (pour vider tout le panier)
   * - Réinitialise immédiatement l'état local côté frontend
   * - Utilisée par le bouton "Vider le panier" avec confirmation
   */
  const clearCart = async () => {
    try {
      // ========== VALIDATION DE L'AUTHENTIFICATION ==========
      if (!token) {
        setError("Vous devez être connecté pour vider le panier");
        return;
      }

      // ========== APPEL API POUR VIDER LE PANIER ==========
      const response = await fetch(`${Base_URL}/cart`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Authentification requise
        },
      });

      // ========== GESTION DES ERREURS HTTP ==========
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      // ========== RÉINITIALISATION IMMÉDIATE DE L'ÉTAT LOCAL ==========
      // Pas besoin d'attendre la réponse pour vider l'état local
      // car on sait que l'opération a réussi
      setCartItems([]); // Panier vide
      setTotalAmount(0); // Montant à zéro
      setError(""); // Pas d'erreur
      
    } catch (error) {
      // ========== GESTION DES ERREURS ==========
      console.error("Error clearing cart:", error);
      setError("Une erreur s'est produite lors de la suppression du panier");
    }
  };

  // ========== PROVISION DU CONTEXTE ==========
  /**
   * Retour du Provider qui rend toutes les données et fonctions du panier
   * disponibles pour tous les composants enfants de l'application
   * 
   * Structure des valeurs fournies :
   * - cartItems : état actuel des articles du panier
   * - totalAmount : montant total calculé
   * - addItemToCart : fonction pour ajouter un nouveau produit
   * - updateItemQuantity : fonction pour modifier une quantité
   * - removeItemFromCart : fonction pour supprimer un produit
   * - clearCart : fonction pour vider complètement le panier
   */
  return (
    <CartContext.Provider
      value={{
        // ========== DONNÉES D'ÉTAT ==========
        cartItems,           // Tableau des articles actuels du panier
        totalAmount,         // Montant total calculé et synchronisé avec le backend
        
        // ========== FONCTIONS D'ACTION ==========
        addItemToCart,       // Ajouter un produit (quantité par défaut : 1)
        updateItemQuantity,  // Modifier la quantité d'un produit existant
        removeItemFromCart,  // Supprimer complètement un produit du panier
        clearCart,           // Vider complètement le panier (tous les articles)
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;