import mongoose,{ Schema,ObjectId,Document } from 'mongoose';

export interface IOrderItem {
    productTitle: string;
    productImage: string;
    productPrice: number;
    quantity: number;
}
export interface IOrder extends Document {
    orderItems: IOrderItem[]; // Liste des articles commandés
    total: number; // Montant total de la commande
    address: string; // Adresse de livraison
    userId: ObjectId | string; // Référence à l'utilisateur qui a passé la commande
}
// Schéma Mongoose pour un article de commande
const orderItemSchema = new Schema<IOrderItem>({
    productTitle: {
        type: String,
        required: true
    },
    productImage: {
        type: String,
        required: true
    },
    productPrice: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
});
// Schéma Mongoose pour la commande
const orderSchema = new Schema<IOrder>({
    orderItems: [orderItemSchema], // Tableau d'articles de commande
    total: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId, ref: 'User', // Référence à l'utilisateur
        required: true
    }
});
// Exportation du modèle Order basé sur le schéma orderSchema
export const OrderModel = mongoose.model<IOrder>('Order', orderSchema);