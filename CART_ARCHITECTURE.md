# Architecture du Système de Panier E-commerce

## Vue d'ensemble

Le système de panier de cette application e-commerce MERN suit une architecture en couches avec séparation claire des responsabilités entre le frontend et le backend, garantissant une synchronisation en temps réel et une expérience utilisateur optimale.

## Architecture générale

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
├─────────────────────────────────────────────────────────────┤
│  CartPage.tsx (UI + UX)                                     │
│     ↕ Utilise les fonctions du contexte                     │
│  CartContext.ts (Interface TypeScript)                      │
│     ↕ Interface entre UI et logique métier                  │
│  CartProvider.tsx (Logique métier + API calls)              │
│     ↕ Appels HTTP avec authentification JWT                 │
├─────────────────────────────────────────────────────────────┤
│                        BACKEND                              │
├─────────────────────────────────────────────────────────────┤
│  cartRoutes.ts (Endpoints REST API)                         │
│     ↕ Routing et validation des requêtes                    │
│  cartService.ts (Logique métier backend)                    │
│     ↕ Opérations CRUD et calculs                           │
│  cartModel.ts (Modèle de données MongoDB)                   │
└─────────────────────────────────────────────────────────────┘
```

## 1. Couche de Présentation (Frontend)

### CartPage.tsx - Interface Utilisateur

**Responsabilités :**
- Affichage responsive du contenu du panier
- Gestion des interactions utilisateur (boutons +/-, suppression, checkout)
- Boîtes de dialogue de confirmation et de checkout
- Messages de succès et d'erreur
- Navigation entre les pages

**Fonctionnalités principales :**
- **Affichage conditionnel** : Panier vide vs panier avec contenu
- **Contrôles de quantité** : Boutons +/- avec validation (minimum 1)
- **Suppression individuelle** : Icône poubelle pour chaque article
- **Vidage complet** : Bouton avec confirmation obligatoire
- **Processus de checkout** : Saisie d'adresse et validation
- **Notifications** : Snackbar pour succès, Alert pour erreurs

**États locaux gérés :**
```typescript
- openClearDialog: boolean          // Contrôle boîte de dialogue vidage
- openCheckoutDialog: boolean       // Contrôle boîte de dialogue checkout  
- address: string                   // Adresse de livraison saisie
- isCheckingOut: boolean           // État de chargement checkout
- checkoutSuccess: boolean         // Indicateur de succès checkout
- checkoutError: string           // Messages d'erreur checkout
```

### CartContext.ts - Interface TypeScript

**Responsabilités :**
- Définition de l'interface du contexte React
- Type safety pour toutes les interactions avec le panier
- Hook personnalisé pour simplifier l'utilisation

**Interface exposée :**
```typescript
interface CartContextType {
  // Données d'état
  cartItems: CartItem[]             // Articles du panier
  totalAmount: number               // Montant total

  // Fonctions d'action
  addItemToCart: (productId: string) => void
  updateItemQuantity: (productId: string, quantity: number) => void
  removeItemFromCart: (productId: string) => void
  clearCart: () => void
}
```

### CartProvider.tsx - Logique Métier Frontend

**Responsabilités :**
- Gestion de l'état global du panier
- Communication avec l'API backend
- Transformation des données backend ↔ frontend
- Gestion des erreurs et de l'authentification
- Synchronisation automatique avec le backend

**États gérés :**
```typescript
- cartItems: CartItem[]           // Articles transformés pour le frontend
- totalAmount: number             // Montant total synchronisé
- error: string                   // Messages d'erreur internes
```

**Fonctions principales :**

1. **addItemToCart(productId)**
   - Validation authentification
   - POST /cart/items avec quantité par défaut 1
   - Gestion des codes d'erreur HTTP spécifiques
   - Transformation et mise à jour de l'état local

2. **updateItemQuantity(productId, quantity)**
   - Validation authentification et quantité > 0
   - PUT /cart/items avec nouvelle quantité
   - Synchronisation immédiate avec l'état local

3. **removeItemFromCart(productId)**
   - DELETE /cart/items/{productId}
   - Gestion du cas panier vide après suppression
   - Mise à jour de l'état local

4. **clearCart()**
   - DELETE /cart pour vidage complet
   - Réinitialisation immédiate de l'état local

5. **fetchCart()** (interne)
   - GET /cart pour synchronisation
   - Chargement automatique au montage
   - Gestion silencieuse des erreurs d'authentification

## 2. Couche API (Backend)

### cartRoutes.ts - Endpoints REST

**Routes exposées :**
```
GET    /cart              - Récupérer le panier de l'utilisateur
POST   /cart/items        - Ajouter un article au panier
PUT    /cart/items        - Modifier la quantité d'un article
DELETE /cart/items/:id    - Supprimer un article du panier
DELETE /cart              - Vider complètement le panier
POST   /cart/checkout     - Finaliser la commande
```

### cartService.ts - Logique Métier Backend

**Fonctions principales :**

1. **getActiveCartForUser({userId, populateProduct})**
   - Récupère ou crée un panier actif
   - Option de population des détails produits
   - Gestion automatique de la création de panier

2. **addItemToCart({productId, quantity, userId})**
   - Vérification d'existence du produit
   - Validation du stock disponible
   - Prévention des doublons
   - Calcul automatique du montant total

3. **updateItemInCart({productId, quantity, userId})**
   - Validation du stock disponible
   - Recalcul du montant total
   - Gestion des erreurs de produit inexistant

4. **deleteItemInCart({productId, userId})**
   - Suppression de l'article spécifique
   - Recalcul du montant total
   - Gestion du panier vide

5. **clearCart({userId})**
   - Vidage complet des articles
   - Réinitialisation du montant total
   - Préservation du panier pour futures utilisations

6. **checkoutCart({userId, address})**
   - Validation de l'adresse obligatoire
   - Création de la commande
   - Transfert des articles vers OrderModel
   - Marquage du panier comme "completed"

## 3. Flux de Données

### Ajout d'un produit au panier

```
1. HomePage.tsx → ProductCard.tsx → onClick()
2. useCart().addItemToCart(productId)
3. CartProvider.addItemToCart() → POST /cart/items
4. cartRoutes.ts → cartService.addItemToCart()
5. Validation stock + ajout en base
6. Retour panier mis à jour
7. Transformation des données backend → frontend
8. Mise à jour de l'état local React
9. Re-render automatique de tous les composants utilisant le panier
```

### Modification de quantité

```
1. CartPage.tsx → Bouton +/- → onClick()
2. updateItemQuantity(productId, newQuantity)
3. Validation côté frontend (quantity >= 1)
4. CartProvider.updateItemQuantity() → PUT /cart/items
5. cartService.updateItemInCart() → validation stock
6. Recalcul montant total côté backend
7. Retour panier mis à jour
8. Synchronisation état local frontend
```

### Checkout (finalisation commande)

```
1. CartPage.tsx → "Passer la commande" → Dialogue saisie adresse
2. Validation adresse non vide
3. Appel direct API POST /cart/checkout (pas via contexte)
4. cartService.checkoutCart() → création OrderModel
5. Marquage panier comme "completed"
6. Affichage message de succès
7. Rechargement page pour panier vide
```

## 4. Gestion des Erreurs

### Frontend (CartProvider)
- **Authentification** : Vérification token avant chaque appel
- **Validation** : Quantités positives, adresses non vides
- **HTTP** : Gestion spécifique des codes 400, 401, 403, 404, 500
- **Réseau** : Catch des erreurs de connexion
- **État** : Messages d'erreur stockés mais pas toujours affichés

### Backend (cartService)
- **Validation** : Existence produits, disponibilité stock
- **Cohérence** : Vérification panier actif, utilisateur valide
- **Calculs** : Vérification montants totaux, quantités
- **Base de données** : Gestion des erreurs MongoDB

## 5. Sécurité

### Authentification
- **JWT requis** pour toutes les opérations de panier
- **Vérification token** côté frontend et backend
- **Gestion expiration** avec messages d'erreur appropriés

### Validation
- **Côté frontend** : Validation immédiate pour UX
- **Côté backend** : Validation complète pour sécurité
- **Double validation** quantités, stocks, données utilisateur

### Isolation des données
- **Un panier par utilisateur** identifié par userId
- **Pas d'accès cross-user** aux paniers
- **Statut panier** pour éviter modifications post-checkout

## 6. Performance

### Optimisations Frontend
- **useCallback** pour fetchCart (évite re-créations)
- **Transformation unique** des données API → UI
- **Mise à jour locale immédiate** après appels API réussis
- **Chargement conditionnel** basé sur l'authentification

### Optimisations Backend
- **Population conditionnelle** des détails produits
- **Calculs côté serveur** pour cohérence des montants
- **Indexation MongoDB** sur userId et statut
- **Réutilisation panier** existant vs création nouveau

## 7. Extensibilité

### Fonctionnalités futures facilement ajoutables
- **Promotions/Coupons** : Extension du modèle de données
- **Sauvegarde paniers** : Modification du statut et cycle de vie
- **Paniers multiples** : Extension avec nom/type de panier
- **Variantes produits** : Extension des références produits
- **Gestion stock temps réel** : WebSocket pour notifications

### Points d'extension identifiés
- **CartItem interface** : Ajout de champs (couleur, taille, etc.)
- **Validation rules** : Système de règles métier configurables
- **Pricing engine** : Moteur de calcul de prix externalisé
- **Notification system** : Système d'événements pour notifications

## 8. Tests et Debugging

### Logs implémentés
- **Frontend** : Console.log pour requêtes et réponses API
- **Backend** : Gestion centralisée des erreurs avec détails
- **États** : Tracking des changements d'état du panier

### Points de test critiques
- **Synchronisation** frontend ↔ backend
- **Gestion concurrence** (utilisateur modifie panier depuis plusieurs onglets)
- **Cohérence** montants calculés
- **Robustesse** gestion des erreurs réseau
- **Performance** avec gros volumes d'articles

Cette architecture garantit une séparation claire des responsabilités, une maintenabilité élevée, et une expérience utilisateur fluide tout en conservant la cohérence des données entre le frontend et le backend.
