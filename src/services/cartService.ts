import { CartModel } from '../models/cartModel';

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