/**
 * Order.ts - Types pour les commandes
 * 
 * RÔLE:
 * - Définit l'interface TypeScript pour les commandes
 * - Structure des données reçues du backend
 * - Compatibilité avec différentes structures de données
 */

// Interface pour typer une commande selon la structure réelle du backend
export interface Order {
    _id: string;
    userId: string;
    orderItems: Array<{
        productTitle: string;
        productImage: string;
        productPrice: number;
        quantity: number;
        unitPrice?: number;
        // Fallback pour compatibilité avec d'autres structures
        product?: {
            _id: string;
            title: string;
            price: number;
            image?: string;
        };
        _id?: string;
        title?: string;
        price?: number;
        image?: string;
    }>;
    total: number;
    address: string;
    status: 'En Cours' | 'Livrée';
    createdAt?: string;
    updatedAt?: string;
    // Fallbacks pour les timestamps
    __v?: number;
}

// Interface pour un article de commande simplifié
export interface OrderItem {
    productTitle: string;
    productImage: string;
    productPrice: number;
    quantity: number;
    unitPrice?: number;
}

// Types de statuts possibles
export type OrderStatus = 'en_cours' | 'accompli';

// Interface pour les statistiques de commandes
export interface OrderStats {
    totalOrders: number;
    totalSpent: number;
    totalItems: number;
    statusBreakdown: {
        en_cours: number;
        accompli: number;
    };
}
