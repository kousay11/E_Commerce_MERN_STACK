/**
 * Interface CartItem - Représente un article dans le panier côté frontend
 * 
 * Cette interface définit la structure d'un article du panier tel qu'utilisé
 * dans les composants React pour l'affichage et la gestion du panier
 */
export interface CartItem {
    productId: string;   // Identifiant unique du produit (ObjectId MongoDB)
    title: string;       // Nom/titre du produit à afficher
    quantity: number;    // Quantité de ce produit dans le panier
    unitPrice: number;   // Prix unitaire du produit (au moment de l'ajout)
    image: string;       // URL de l'image du produit pour l'affichage
}