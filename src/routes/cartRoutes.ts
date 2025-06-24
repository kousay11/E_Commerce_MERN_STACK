import express from 'express';
import { addItemToCart, getActiveCartForUser, updateItemInCart } from '../services/cartService';
import validateJWT from '../middlewares/validateJWT';
import { ExtendRequest } from '../types/extensedRequest';


const router = express.Router();

// Route GET pour récupérer le panier actif de l'utilisateur authentifié
router.get('/',validateJWT, async (req:ExtendRequest, res) => {
    // Cast de req pour accéder à la propriété user injectée par le middleware validateJWT
    // Sans ?. -> peut planter si user est undefined // Avec ?. -> renvoie undefined si user est undefined
    const userId = req?.user?._id;
    const cart = await getActiveCartForUser({ userId });
    res.status(200).send(cart);
});
// Route POST pour ajouter un produit au panier de l'utilisateur
router.post('/items', validateJWT, async (req, res) => {
    const userId = (req as any).user._id;
        const { productId, quantity } = req.body;
    const responce = await addItemToCart({productId,quantity, userId});
    res.status(responce.statusCode).send(responce.data);
});
// Route PUT pour mettre à jour un produit dans le panier de l'utilisateur
router.put('/items', validateJWT, async (req, res) => {
    const userId = (req as any).user._id;
    const { itemId } = req.params;
    const {productId,quantity}=req.body;
    const responce = await updateItemInCart({ productId, quantity, userId });
    res.status(200).send(responce.data);
});


export default router;