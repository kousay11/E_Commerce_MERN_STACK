/**
 * orderService.ts - Service pour gérer les commandes
 * 
 * RÔLE:
 * - Créer des nouvelles commandes
 * - Récupérer les commandes d'un utilisateur
 * - Mettre à jour le statut des commandes
 * - Calculer les totaux
 */

import { OrderModel, IOrder, IOrderItem } from '../models/orderModel';
import { ObjectId } from 'mongoose';

/**
 * Interface pour créer une nouvelle commande
 */
export interface CreateOrderData {
    orderItems: Array<{
        productId: string;
        productTitle: string;
        productImage: string;
        productPrice: number;
        quantity: number;
    }>;
    address: string;
    userId: string | ObjectId;
}

/**
 * Service pour gérer les commandes
 */
export class OrderService {
    
    /**
     * Créer une nouvelle commande
     */
    static async createOrder(orderData: CreateOrderData): Promise<IOrder> {
        try {
            // Calculer le total
            const total = orderData.orderItems.reduce((sum, item) => {
                return sum + (item.productPrice * item.quantity);
            }, 0);

            // Préparer les articles de commande
            const orderItems: IOrderItem[] = orderData.orderItems.map(item => ({
                productTitle: item.productTitle,
                productImage: item.productImage,
                productPrice: item.productPrice,
                quantity: item.quantity,
                unitPrice: item.productPrice // Prix unitaire au moment de la commande
            }));

            // Créer la commande
            const newOrder = new OrderModel({
                orderItems,
                total,
                address: orderData.address,
                userId: orderData.userId,
                status: 'En Cours' // Statut initial
            });

            // Sauvegarder en base de données
            const savedOrder = await newOrder.save();
            
            console.log('Nouvelle commande créée:', savedOrder._id);
            return savedOrder;
            
        } catch (error) {
            console.error('Erreur lors de la création de la commande:', error);
            throw new Error('Impossible de créer la commande');
        }
    }

    /**
     * Récupérer toutes les commandes d'un utilisateur
     */
    static async getUserOrders(userId: string | ObjectId): Promise<IOrder[]> {
        try {
            const orders = await OrderModel
                .find({ userId })
                .sort({ createdAt: -1 }) // Trier par date de création (plus récent d'abord)
                .lean(); // Optimisation: retourne des objets JavaScript simples

            console.log(`Commandes trouvées pour l'utilisateur ${userId}:`, orders.length);
            return orders;
            
        } catch (error) {
            console.error('Erreur lors de la récupération des commandes:', error);
            throw new Error('Impossible de récupérer les commandes');
        }
    }

    /**
     * Récupérer une commande par ID
     */
    static async getOrderById(orderId: string | ObjectId): Promise<IOrder | null> {
        try {
            const order = await OrderModel.findById(orderId).lean();
            return order;
        } catch (error) {
            console.error('Erreur lors de la récupération de la commande:', error);
            throw new Error('Impossible de récupérer la commande');
        }
    }

    /**
     * Mettre à jour le statut d'une commande
     */
    static async updateOrderStatus(
        orderId: string | ObjectId, 
        status: 'pending' | 'processing' | 'completed' | 'cancelled'
    ): Promise<IOrder | null> {
        try {
            const updatedOrder = await OrderModel.findByIdAndUpdate(
                orderId,
                { status },
                { new: true } // Retourne le document mis à jour
            ).lean();

            if (updatedOrder) {
                console.log(`Statut de la commande ${orderId} mis à jour: ${status}`);
            }
            
            return updatedOrder;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            throw new Error('Impossible de mettre à jour le statut');
        }
    }

    /**
     * Calculer les statistiques des commandes d'un utilisateur
     */
    static async getUserOrderStats(userId: string | ObjectId) {
        try {
            const orders = await this.getUserOrders(userId);
            
            const stats = {
                totalOrders: orders.length,
                totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
                totalItems: orders.reduce((sum, order) => sum + order.orderItems.length, 0),
                statusBreakdown: {
                    en_cours: orders.filter(o => o.status === 'En Cours').length,
                    livrée: orders.filter(o => o.status === 'Livrée').length
                }
            };

            return stats;
        } catch (error) {
            console.error('Erreur lors du calcul des statistiques:', error);
            throw new Error('Impossible de calculer les statistiques');
        }
    }
}

export default OrderService;
