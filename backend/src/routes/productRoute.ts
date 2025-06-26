import express from 'express';
import { getAllProducts } from '../services/productService';

const router = express.Router();

router.get('/', async(req, res) => {
    try {
        const product = await getAllProducts();
        res.status(200).send(product)
    } catch (error) {
        res.status(500).send({ error: 'Erreur lors de la récupération des produits', details: error });
    }
});
export default router;