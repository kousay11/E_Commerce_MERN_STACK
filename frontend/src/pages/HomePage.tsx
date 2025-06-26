/**
 * HomePage.tsx - Composant principal de la page d'accueil
 * 
 * ARCHITECTURE:
 * - React Functional Component avec hooks
 * - Material-UI pour l'interface utilisateur
 * - TypeScript pour le typage statique
 * 
 * FONCTIONNALITÉS:
 * - Récupération des produits depuis l'API REST
 * - Affichage responsive en grille (1 col mobile, 3 cols desktop)
 * - Gestion d'état avec useState
 * - Effet de bord avec useEffect pour le fetch des données
 * 
 * STRUCTURE DES DONNÉES:
 * - Utilise l'interface Product définie dans types/Product.ts
 * - Communique avec le backend via l'URL définie dans constants/baseUrl.ts
 */

// Imports des composants Material-UI pour la mise en page
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
// Import du composant ProductCard pour afficher chaque produit
import ProductCard from '../components/ProductCard';
// Hooks React pour la gestion d'état et des effets de bord
import { useEffect, useState } from 'react';
// Import du type Product depuis le fichier de types partagé
import type { Product } from '../types/Product';
// Import de l'URL de base du serveur backend depuis les constantes
import { Base_URL } from '../constants/baseUrl';

/**
 * Composant HomePage - Page d'accueil affichant la liste des produits
 * 
 * Ce composant :
 * - Récupère la liste des produits depuis l'API backend
 * - Affiche les produits dans une grille responsive
 * - Gère les erreurs de chargement
 */
const HomePage = () => {
    // État pour stocker la liste des produits récupérés depuis l'API
    const [products, setProducts] = useState<Product[]>([]);

    // Hook useEffect pour récupérer les produits au montage du composant
    useEffect(() => {
        /**
         * Fonction asynchrone pour récupérer les produits depuis l'API
         * Utilise fetch() pour faire une requête HTTP GET vers /product
         */
        const fetchProducts = async () => {
            try {
                // Requête GET vers l'endpoint des produits
                const response = await fetch(`${Base_URL}/product`);
                // Conversion de la réponse en JSON
                const data = await response.json();
                // Log des données pour le débogage
                console.log(data);
                // Mise à jour de l'état avec les produits récupérés
                setProducts(data);
            } catch (error) {
                // Gestion des erreurs de réseau ou de parsing
                console.error('Error fetching products:', error);
            }
        };

        // Appel de la fonction de récupération des produits
        fetchProducts();
    }, []); // Tableau de dépendances vide = exécution une seule fois au montage

    // Rendu du composant
    return (
        <Container maxWidth="xl" sx={{ mt: 2, px: 1 }}>
            {/* Grille container pour organiser les produits en colonnes responsives */}
            <Grid container spacing={2} justifyContent="center">
                {/* Mapping sur le tableau de produits pour créer une carte par produit */}
                {products.map((p) => (
                    <Grid size={{ xs: 12, md: 4 }} key={p._id}>
                        {/* 
                        ProductCard avec spread operator pour passer toutes les propriétés 
                        du produit comme props au composant 
                        */}
                        <ProductCard {...p} />
                    </Grid>
                ))}
                {/* Commentaire pour d'éventuels tests de mise en page */}
            </Grid>
        </Container>
    );
};

export default HomePage;