// Importation des modules nécessaires depuis mongoose et du modèle de produit
import mongoose,{ Schema,ObjectId,Document } from 'mongoose';
import { IProduct} from './productModel';

// Définition des statuts possibles pour un panier
const cardStatusEnum = ["active", "completed", "cancelled"];

// Interface représentant un article dans le panier
// extends Document impose que chaque item soit un document Mongoose complet 
// on essaye de garder la structure simple pour représenter un article dans le panier
export interface ICartItem {
    product: mongoose.Types.ObjectId | IProduct; // Accepte l'ObjectId ou l'objet produit complet
    unitPrice: number; // Prix unitaire du produit au moment de l'ajout
    quantity: number;  // Quantité de ce produit dans le panier
}

// Interface représentant le panier
export interface ICart extends Document {
    userId: ObjectId|string; // Référence à l'utilisateur propriétaire du panier
    items: ICartItem[];      // Liste des articles dans le panier
    totalAmount: number;        // Quantité totale d'articles dans le panier
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
    totalAmount: {
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
