import express from 'express';
import { addItemToCart, checkoutCart, clearCart, deleteItemInCart, getActiveCartForUser, updateItemInCart } from '../services/cartService';
import validateJWT from '../middlewares/validateJWT';
import { ExtendRequest } from '../types/extensedRequest';


const router = express.Router();

// Route GET pour récupérer le panier actif de l'utilisateur authentifié
router.get('/', validateJWT, async (req: ExtendRequest, res) => {
    try {
        const userId = req?.user?._id;
        const cart = await getActiveCartForUser({ userId });
        res.status(200).send(cart);
    } catch (error) {
        res.status(500).send({ error: 'Erreur lors de la récupération du panier', details: error });
    }
});
// Route POST pour ajouter un produit au panier de l'utilisateur
router.post('/items', validateJWT, async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const { productId, quantity } = req.body;
        const responce = await addItemToCart({ productId, quantity, userId });
        res.status(responce.statusCode).send(responce.data);
    } catch (error) {
        res.status(500).send({ error: 'Erreur lors de l\'ajout au panier', details: error });
    }
});
// Route PUT pour mettre à jour un produit dans le panier de l'utilisateur
router.put('/items', validateJWT, async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const { itemId } = req.params;
        const { productId, quantity } = req.body;
        const responce = await updateItemInCart({ productId, quantity, userId });
        res.status(200).send(responce.data);
    } catch (error) {
        res.status(500).send({ error: 'Erreur lors de la mise à jour du panier', details: error });
    }
});
// Route DELETE pour supprimer un produit du panier de l'utilisateur
router.delete('/items/:productId', validateJWT, async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const { productId } = req.params;
        const responce = await deleteItemInCart({ productId, userId });
        res.status(200).send(responce.data);
    } catch (error) {
        res.status(500).send({ error: 'Erreur lors de la suppression du produit du panier', details: error });
    }
});
router.delete('/', validateJWT, async (req: ExtendRequest, res) => {
    try {
        const userId = req?.user?._id;
        const responce = await clearCart({ userId });
        res.status(200).send(responce.data);
    } catch (error) {
        res.status(500).send({ error: 'Erreur lors de la suppression du panier', details: error });
    }
});
router.post('/checkout', validateJWT, async (req: ExtendRequest, res) => {
    try {
        const userId = req?.user?._id;
        const { address } = req.body;
        const responce = await checkoutCart({ userId, address });
        res.status(responce.statusCode).send(responce.data);
    } catch (error) {
        res.status(500).send({ error: 'Erreur lors du checkout', details: error });
    }
});

export default router;