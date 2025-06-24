// Importation des modules nécessaires depuis mongoose et du modèle de produit
import mongoose,{ Schema,ObjectId,Document } from 'mongoose';
import { IProduct} from './productModel';

// Définition des statuts possibles pour un panier
const cardStatusEnum = ["active", "completed", "cancelled"];

// Interface représentant un article dans le panier
export interface ICartItem extends Document {
    product: IProduct; // Produit associé à l'article du panier
    unitPrice: number; // Prix unitaire du produit au moment de l'ajout
    quantity: number;  // Quantité de ce produit dans le panier
}

// Interface représentant le panier
export interface ICart extends Document {
    userId: ObjectId|string; // Référence à l'utilisateur propriétaire du panier
    items: ICartItem[];      // Liste des articles dans le panier
    quantity: number;        // Quantité totale d'articles dans le panier
    status: "active" | "completed" | "cancelled"; // Statut du panier
}

// Schéma Mongoose pour un article du panier
const cartItemSchema = new Schema<ICartItem>({
    product: {
        type: Schema.Types.ObjectId, ref: 'Product', // Référence au modèle Product
        required: true
    },
    unitPrice: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    }
});

// Schéma Mongoose pour le panier
const cartSchema = new Schema<ICart>({
    userId: {
        type: Schema.Types.ObjectId, ref: 'User', // Référence au modèle User
        required: true
    },
    items: [cartItemSchema], // Tableau d'articles du panier
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: cardStatusEnum, // Statut limité aux valeurs définies
        default: "active"
    }
});

// Exportation du modèle Cart basé sur le schéma cartSchema
export const CartModel = mongoose.model<ICart>('Cart', cartSchema);
