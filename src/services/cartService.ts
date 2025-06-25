import { CartModel, ICartItem } from '../models/cartModel';
import ProductModel from '../models/productModel';
import mongoose from 'mongoose';

interface createCartForUser {
  userId: string;
}

const createCartForUser = async ({userId}: createCartForUser) => {
    const Cart = await CartModel.create({userId, totalAmount: 0});
    await Cart.save();
    return Cart;

}
interface getActiveCartForUser {
    userId: string;
}
export const getActiveCartForUser = async ({userId}:createCartForUser) => {

    let cart = await CartModel.findOne({userId, status: 'active'});
    if (!cart) {
        cart = await createCartForUser({userId});
    }
    return cart;
}
interface addItemToCart {
    productId: any; 
    quantity: number; // Quantity to add
    userId: string; // User ID
}
export const addItemToCart = async ({productId, quantity, userId}: addItemToCart) => {
    const cart = await getActiveCartForUser({userId});
    const existingItem = cart.items.find((p: any) => p.product.toString() === productId.toString());

    if (existingItem) {
        return {data: 'Item already exists in the cart', statusCode: 400}; 
    } else {
        // Utilisation directe de ProductModel importé
        const product = await ProductModel.findById(productId);
        if (!product) {
            return {data: 'Product not found', statusCode: 404};
        }
        // Vérification de la quantité demandée par rapport au stock du produit
        if (quantity > product.stock) {
            return {data: 'Requested quantity exceeds available stock', statusCode: 400};
        }
        cart.items.push({
            product: product._id as mongoose.Types.ObjectId, // Cast explicite pour éviter l'erreur de type
            unitPrice: product.price,
            quantity: quantity
        });
        // Mise à jour de la quantité totale du panier
        cart.totalAmount += product.price*quantity;
        const updatedcart = await cart.save();
        return {data: updatedcart, statusCode: 200};
    }

   
}
interface updateItemInCart {
    productId: any; 
    quantity: number; 
    userId: string; 
}
export const updateItemInCart = async ({productId, quantity, userId}: addItemToCart) => {
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
    const updatedcart = await cart.save();
    // Retourner le panier mis à jour et le code de succès
    return {data: updatedcart, statusCode: 200};
}
interface deleteItemInCart {
    productId: any; 
    userId: string; 
}
export const deleteItemInCart = async ({productId, userId}: deleteItemInCart) => {
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
    const updatedcart = await cart.save();
    // Retourner le panier mis à jour et le code de succès
    return {data: updatedcart, statusCode: 200};
}
 interface clearCart {
    userId: string; // Identifiant de l'utilisateur dont on veut vider le panier
}
export const clearCart = async ({userId}: clearCart) => {
    // Récupérer le panier actif de l'utilisateur
    const cart = await getActiveCartForUser({userId});
    // Vider les articles du panier
    cart.items = [];
    // Réinitialiser le montant total du panier à 0
    cart.totalAmount = 0;
    // Sauvegarder le panier mis à jour
    const updatedcart = await cart.save();
    // Retourner le panier mis à jour et le code de succès
    return {data: updatedcart, statusCode: 200};
}   

// Fonction utilitaire pour calculer le montant total d'un tableau d'articles du panier
const calculateCartTotalItem = ({cartItems}:{cartItems: ICartItem[];}) => {
    const total = cartItems.reduce((sum, product) => {
        sum += product.quantity * product.unitPrice;
        return sum;
    }, 0);
    return total;
}
