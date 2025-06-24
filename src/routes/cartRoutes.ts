import express from 'express';
import { getActiveCartForUser } from '../services/cartService';
import validateJWT from '../middlewares/validateJWT';


const router = express.Router();

// Route GET pour récupérer le panier actif de l'utilisateur authentifié
router.get('/',validateJWT, async (req, res) => {
    // Cast de req pour accéder à la propriété user injectée par le middleware validateJWT
    const userId = (req as any).user._id;
    const cart = await getActiveCartForUser({ userId });
    res.status(200).send(cart);
});


export default router;