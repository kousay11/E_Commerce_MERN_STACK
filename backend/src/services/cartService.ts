import { CartModel, ICartItem } from '../models/cartModel';
import { IOrderItem, OrderModel } from '../models/orderModel';
import ProductModel from '../models/productModel';
import mongoose from 'mongoose';

interface createCartForUser {
  userId: string;
}

// Fonction pour créer un nouveau panier vide pour un utilisateur
const createCartForUser = async ({userId}: createCartForUser) => {
    // Création d'un nouveau panier avec montant total initial à 0
    const Cart = await CartModel.create({userId, totalAmount: 0});
    // Sauvegarde du panier en base de données
    await Cart.save();
    return Cart;
}
interface GetActiveCartForUser {
    userId: string;
    populateProduct?: boolean; // Optionnel, pour peupler les détails des produits dans le panier
}
export const getActiveCartForUser = async ({
  userId,
  populateProduct,
}: GetActiveCartForUser) => {
  let cart;
  
  // Si populateProduct est true, on récupère le panier avec les détails des produits
  if (populateProduct) {
    cart = await CartModel
      .findOne({ userId, status: "active" })
      .populate("items.product"); // Population des références produits avec leurs détails complets
  } else {
    // Sinon, on récupère le panier sans les détails des produits (plus rapide)
    cart = await CartModel.findOne({ userId, status: "active" });
  }

  // Si aucun panier actif n'existe, on en crée un nouveau pour l'utilisateur
  if (!cart) {
    cart = await createCartForUser({ userId });
  }

  return cart;
};

interface addItemToCart {
    productId: any; 
    quantity: number; // Quantity to add
    userId: string; // User ID
}
export const addItemToCart = async ({productId, quantity, userId}: addItemToCart) => {
    try {
        // Récupération ou création du panier actif pour l'utilisateur
        const cart = await getActiveCartForUser({userId});
        
        // Vérification si le produit existe déjà dans le panier
        const existingItem = cart.items.find((p: any) => p.product.toString() === productId.toString());

        if (existingItem) {
            // Si le produit existe déjà, retourner une erreur
            return {data: 'Item already exists in the cart', statusCode: 400}; 
        } else {
            // Recherche du produit dans la base de données pour vérifier son existence
            const product = await ProductModel.findById(productId);
            if (!product) {
                return {data: 'Product not found', statusCode: 404};
            }
            // Vérification de la disponibilité du stock avant ajout
            if (quantity > product.stock) {
                return {data: 'Requested quantity exceeds available stock', statusCode: 400};
            }
            // Ajout du nouvel article au panier avec les informations du produit
            cart.items.push({
                product: product._id as mongoose.Types.ObjectId, // Référence vers le produit
                unitPrice: product.price, // Prix unitaire au moment de l'ajout
                quantity: quantity // Quantité demandée
            });
            // Mise à jour du montant total du panier
            cart.totalAmount += product.price*quantity;
            // Sauvegarde du panier mis à jour en base de données
            await cart.save();
            // Retour du panier mis à jour avec les produits populés pour l'affichage
            return {data: await getActiveCartForUser({userId,populateProduct:true}), statusCode: 200};
        }
    } catch (error) {
        // Gestion des erreurs lors de l'ajout
        return {data: 'Erreur lors de l\'ajout au panier', statusCode: 500, error};
    }
}
interface updateItemInCart {
    productId: any; 
    quantity: number; 
    userId: string; 
}
export const updateItemInCart = async ({productId, quantity, userId}: addItemToCart) => {
    try {
        // Récupérer le panier actif de l'utilisateur
        const cart = await getActiveCartForUser({userId});
        // Chercher l'article à mettre à jour dans le panier
        const existingCart = cart.items.find((p: any) => p.product.toString() === productId.toString());
        // Récupérer les informations du produit depuis la base de données
        const product = await ProductModel.findById(productId);
        if (!existingCart) {
            // Si l'article n'existe pas dans le panier, retourner une erreur
            return {data: 'Item not found in the cart', statusCode: 404}; 
        } 
        if (!product) {
            // Si le produit n'existe pas, retourner une erreur
            return {data: 'Product not found', statusCode: 404};
        }
        // Vérifier que la quantité demandée ne dépasse pas le stock disponible
        if (quantity > product.stock) {
            return {data: 'Requested quantity exceeds available stock', statusCode: 400};
        }
        // Mettre à jour la quantité de l'article dans le panier
        existingCart.quantity = quantity;
        // Filtrer tous les articles du panier sauf celui dont l'identifiant correspond à productId
        const otherCartItems = cart.items.filter((p: any) => p.product.toString() !== productId.toString());
        let total = calculateCartTotalItem({cartItems: otherCartItems});
        // Ajouter le total de l'article mis à jour
        total += existingCart.quantity * existingCart.unitPrice;
        // Mettre à jour le montant total du panier
        cart.totalAmount = total;
        // Sauvegarder le panier mis à jour
         await cart.save();

        return {
            data: await getActiveCartForUser({ userId, populateProduct: true }),
            statusCode: 200,
        };
    } catch (error) {
        return {data: 'Erreur lors de la mise à jour du panier', statusCode: 500, error};
    }
}
interface deleteItemInCart {
    productId: any; 
    userId: string; 
}
export const deleteItemInCart = async ({productId, userId}: deleteItemInCart) => {
    try {
        // Récupérer le panier actif de l'utilisateur
        const cart = await getActiveCartForUser({userId});
        // Chercher l'article à supprimer dans le panier
        const existingCart = cart.items.find((p: any) => p.product.toString() === productId.toString());
        if (!existingCart) {
            // Si l'article n'existe pas dans le panier, retourner une erreur
            return {data: 'Item not found in the cart', statusCode: 404}; 
        }
        // Calculer le montant total du panier en excluant l'article supprimé
        // Filtrer tous les articles du panier sauf celui dont l'identifiant correspond à productId
        const otherCartItems = cart.items.filter((p: any) => p.product.toString() !== productId.toString());
        let total =calculateCartTotalItem({cartItems: otherCartItems});
        // Mettre à jour le montant total du panier
        cart.totalAmount = total;
        // Supprimer l'article du panier
        cart.items = otherCartItems;
        // Sauvegarder le panier mis à jour
        await cart.save();
        // Retourner le panier mis à jour et le code de succès
        return {data: await getActiveCartForUser({ userId, populateProduct: true }), statusCode: 200};
    } catch (error) {
        return {data: 'Erreur lors de la suppression du produit du panier', statusCode: 500, error};
    }
}
 interface clearCart {
    userId: string; // Identifiant de l'utilisateur dont on veut vider le panier
}
export const clearCart = async ({userId}: clearCart) => {
    try {
        // Récupérer le panier actif de l'utilisateur
        const cart = await getActiveCartForUser({userId});
        // Vider les articles du panier
        cart.items = [];
        // Réinitialiser le montant total du panier à 0
        cart.totalAmount = 0;
        // Sauvegarder le panier mis à jour
       await cart.save();
        // Retourner le panier mis à jour et le code de succès
        return {data: await getActiveCartForUser({ userId, populateProduct: true }), statusCode: 200};
    } catch (error) {
        return {data: 'Erreur lors de la suppression du panier', statusCode: 500, error};
    }
}   

// Fonction utilitaire pour calculer le montant total d'un tableau d'articles du panier
const calculateCartTotalItem = ({cartItems}:{cartItems: ICartItem[];}) => {
    const total = cartItems.reduce((sum, product) => {
        sum += product.quantity * product.unitPrice;
        return sum;
    }, 0);
    return total;
}
interface checkoutCart {
    userId: string; // Identifiant de l'utilisateur dont on veut finaliser le panier
    address: string; // Adresse de livraison, optionnelle
}
export const checkoutCart = async ({userId, address}: checkoutCart) => {
    try {
        // Vérifier que l'adresse de livraison est fournie
        if (!address) {
            return {data: 'Shipping address is required', statusCode: 400};
        }
        // Récupérer le panier actif de l'utilisateur
        const cart = await getActiveCartForUser({userId});
        // Préparer un tableau pour stocker les articles de la commande
        const orderItems: IOrderItem[] = [];
        // Parcourir chaque article du panier
        for (const item of cart.items) {
            // Récupérer les informations du produit associé à l'article
            const product = await ProductModel.findById(item.product);
            if (!product) {
                // Si le produit n'existe pas, retourner une erreur
                return {data: 'Product not found', statusCode: 404};
            }
            // Créer un objet représentant l'article de la commande
            const orderItem = {
                productTitle: product.title, // Titre du produit
                productImage: product.image, // Image du produit
                productPrice: item.unitPrice, // Prix unitaire au moment de l'achat
                quantity: item.quantity // Quantité achetée
            };
            // (Optionnel) Mettre à jour le stock du produit ici si besoin

            // Ajouter l'article à la liste des articles de la commande
            orderItems.push(orderItem);
        }
        // Créer la commande dans la base de données
        const order = await OrderModel.create({
            orderItems, // Liste des articles commandés
            total: cart.totalAmount, // Montant total de la commande
            address, // Adresse de livraison
            userId // Identifiant de l'utilisateur
        });
        if (!order) {
            // Si la création de la commande échoue, retourner une erreur
            return {data: 'Failed to create order', statusCode: 500}
        }

        // Sauvegarder la commande
        await order.save();
        // Mettre à jour le statut du panier à "completed" pour indiquer qu'il a été finalisé
        cart.status = 'completed';
        await cart.save();
        // Retourner la commande créée et le code de succès
        return {data: order, statusCode: 201};
    } catch (error) {
        return {data: 'Erreur lors du checkout', statusCode: 500, error};
    }
}
