import mongoose,{ Schema,ObjectId,Document } from 'mongoose';

export interface IOrderItem {
    productTitle: string;
    productImage: string;
    productPrice: number;
    quantity: number;
    unitPrice?: number; // Prix unitaire au moment de la commande
}

export interface IOrder extends Document {
    orderItems: IOrderItem[]; // Liste des articles commandés
    total: number; // Montant total de la commande
    address: string; // Adresse de livraison
    userId: ObjectId | string; // Référence à l'utilisateur qui a passé la commande
    status: 'En Cours' | 'Livrée'; // Statut de la commande
    createdAt: Date; // Date de création automatique
    updatedAt: Date; // Date de mise à jour automatique
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
        required: true,
        min: 1
    },
    unitPrice: {
        type: Number,
        required: false // Prix unitaire optionnel
    }
});
// Schéma Mongoose pour la commande
const orderSchema = new Schema<IOrder>({
    orderItems: [orderItemSchema], // Tableau d'articles de commande
    total: {
        type: Number,
        required: true,
        min: 0
    },
    address: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId, 
        ref: 'User', // Référence à l'utilisateur
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['En Cours', 'Livrée'],
        default: 'En Cours'
    }
}, {
    timestamps: true // Ajoute automatiquement createdAt et updatedAt
});
// Exportation du modèle Order basé sur le schéma orderSchema
export const OrderModel = mongoose.model<IOrder>('Order', orderSchema);