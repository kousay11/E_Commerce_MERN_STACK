/**
 * orderRoutes.ts - Routes pour la gestion des commandes
 * 
 * RÔLE:
 * - Créer de nouvelles commandes
 * - Récupérer les commandes
 * - Mettre à jour les statuts de commandes
 */

import express, { Response } from 'express';
import { OrderService, CreateOrderData } from '../services/orderService';
import validateJWT from '../middlewares/validateJWT';
import { ExtendRequest } from '../types/extensedRequest';

const router = express.Router();

/**
 * POST /api/orders - Créer une nouvelle commande
 */
router.post('/', validateJWT, async (req: ExtendRequest, res) => {
    try {
        const userId = req?.user?._id;
        if (!userId) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const { orderItems, address }: { orderItems: any[], address: string } = req.body;

        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({ error: 'Les articles de commande sont requis' });
        }

        if (!address) {
            return res.status(400).json({ error: 'L\'adresse de livraison est requise' });
        }

        // Préparer les données de commande
        const orderData: CreateOrderData = {
            orderItems: orderItems.map(item => ({
                productId: item.productId,
                productTitle: item.productTitle || item.title,
                productImage: item.productImage || item.image,
                productPrice: item.productPrice || item.price,
                quantity: item.quantity || 1
            })),
            address,
            userId
        };

        // Créer la commande
        const newOrder = await OrderService.createOrder(orderData);

        res.status(201).json({
            message: 'Commande créée avec succès',
            order: newOrder
        });

    } catch (error) {
        console.error('Erreur lors de la création de la commande:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la création de la commande',
            details: error
        });
    }
});

/**
 * GET /api/orders - Récupérer toutes les commandes de l'utilisateur connecté
 */
router.get('/', validateJWT, async (req: ExtendRequest, res) => {
    try {
        const userId = req?.user?._id;
        if (!userId) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const orders = await OrderService.getUserOrders(userId);

        res.status(200).json({
            message: 'Commandes récupérées avec succès',
            orders: orders,
            count: orders.length
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la récupération des commandes',
            details: error
        });
    }
});

/**
 * GET /api/orders/:id - Récupérer une commande spécifique
 */
router.get('/:id', validateJWT, async (req: ExtendRequest, res) => {
    try {
        const userId = req?.user?._id;
        const orderId = req.params.id;

        if (!userId) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const order = await OrderService.getOrderById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Commande non trouvée' });
        }

        // Vérifier que la commande appartient à l'utilisateur connecté
        if (order.userId.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Accès non autorisé à cette commande' });
        }

        res.status(200).json({
            message: 'Commande récupérée avec succès',
            order: order
        });

    } catch (error) {
        console.error('Erreur lors de la récupération de la commande:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la récupération de la commande',
            details: error
        });
    }
});

/**
 * PATCH /api/orders/:id/status - Mettre à jour le statut d'une commande (admin seulement)
 */
router.patch('/:id/status', validateJWT, async (req: ExtendRequest, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Le statut est requis' });
        }

        const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: 'Statut invalide', 
                validStatuses 
            });
        }

        const updatedOrder = await OrderService.updateOrderStatus(orderId, status);

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Commande non trouvée' });
        }

        res.status(200).json({
            message: 'Statut de la commande mis à jour avec succès',
            order: updatedOrder
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la mise à jour du statut',
            details: error
        });
    }
});

/**
 * GET /api/orders/stats/summary - Obtenir les statistiques des commandes de l'utilisateur
 */
router.get('/stats/summary', validateJWT, async (req: ExtendRequest, res) => {
    try {
        const userId = req?.user?._id;
        if (!userId) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const stats = await OrderService.getUserOrderStats(userId);

        res.status(200).json({
            message: 'Statistiques récupérées avec succès',
            stats: stats
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la récupération des statistiques',
            details: error
        });
    }
});

export default router;
