import { type FC,type PropsWithChildren, useState } from "react";
import { CartContext } from "./CartContext";
import { type CartItem } from "../../types/CartItem";

const CartProvider: FC<PropsWithChildren> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  
  const addItemToCart = async (productId: string) => {
    console.log("Adding item to cart:", productId);
  };

  
  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalAmount,
        addItemToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;