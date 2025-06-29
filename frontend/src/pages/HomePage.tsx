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
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
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
    // État pour gérer l'état de chargement
    const [loading, setLoading] = useState<boolean>(true);
    // État pour gérer les erreurs
    const [error, setError] = useState<string | null>(null);

    // Hook useEffect pour récupérer les produits au montage du composant
    useEffect(() => {
        /**
         * Fonction asynchrone pour récupérer les produits depuis l'API
         * Utilise fetch() pour faire une requête HTTP GET vers /product
         */
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Requête GET vers l'endpoint des produits
                const response = await fetch(`${Base_URL}/product`);
                
                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }
                
                // Conversion de la réponse en JSON
                const data = await response.json();
                // Mise à jour de l'état avec les produits récupérés
                setProducts(data);
            } catch (error) {
                // Gestion des erreurs de réseau ou de parsing
                console.error('Error fetching products:', error);
                setError('Erreur lors du chargement des produits. Veuillez réessayer plus tard.');
            } finally {
                setLoading(false);
            }
        };

        // Appel de la fonction de récupération des produits
        fetchProducts();
    }, []); // Tableau de dépendances vide = exécution une seule fois au montage

    // Rendu du composant
    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* En-tête de la page */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography 
                    variant="h3" 
                    component="h1" 
                    sx={{ 
                        fontWeight: 'bold', 
                        mb: 2,
                        background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                        backgroundClip: 'text',
                        color: 'transparent',
                    }}
                >
                    Nos Produits
                </Typography>
                <Typography 
                    variant="h6" 
                    color="text.secondary"
                    sx={{ maxWidth: 600, mx: 'auto' }}
                >
                    Découvrez notre sélection de produits de qualité
                </Typography>
            </Box>

            {/* Gestion des états de chargement et d'erreur */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress size={60} sx={{ mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            Chargement des produits...
                        </Typography>
                    </Box>
                </Box>
            ) : error ? (
                <Box sx={{ mb: 4 }}>
                    <Alert 
                        severity="error" 
                        sx={{ 
                            borderRadius: 2,
                            '& .MuiAlert-message': {
                                width: '100%',
                                textAlign: 'center'
                            }
                        }}
                    >
                        {error}
                    </Alert>
                </Box>
            ) : products.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                        Aucun produit disponible
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Les produits seront bientôt disponibles !
                    </Typography>
                </Box>
            ) : (
                <>
                    {/* Informations sur le nombre de produits */}
                    <Box sx={{ mb: 4 }}>
                        <Typography 
                            variant="body1" 
                            color="text.secondary"
                            sx={{ textAlign: 'center' }}
                        >
                            {products.length} produit{products.length > 1 ? 's' : ''} disponible{products.length > 1 ? 's' : ''}
                        </Typography>
                    </Box>

                    {/* Grille des produits */}
                    <Grid container spacing={3} justifyContent="center">
                        {products.map((product) => (
                            <Grid 
                                size={{ xs: 12, sm: 6, md: 4, lg: 3 }} 
                                key={product._id}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center'
                                }}
                            >
                                <Box
                                    sx={{
                                        width: '100%',
                                        maxWidth: 320,
                                        transition: 'transform 0.2s ease-in-out',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                        }
                                    }}
                                >
                                    <ProductCard {...product} />
                                </Box>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Footer informatif */}
                    <Box sx={{ textAlign: 'center', mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body2" color="text.secondary">
                            Tous nos produits sont soigneusement sélectionnés pour vous offrir la meilleure qualité
                        </Typography>
                    </Box>
                </>
            )}
        </Container>
    );
};

export default HomePage;