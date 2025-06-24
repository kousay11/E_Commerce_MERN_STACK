import { CartModel } from '../models/cartModel';
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