import { useEffect, useState } from "react";
import { useAuthContext } from "../context/Auth/AuthContext";
import type { Order } from "../types/Order";
import { 
    Container, 
    Typography, 
    CircularProgress, 
    Alert, 
    Box,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    Paper,
    Divider,
    Avatar
} from "@mui/material";
import { 
    ShoppingBag, 
    CalendarToday, 
    LocalShipping,
    Receipt,
    Inventory
} from "@mui/icons-material";

const MyOrdersPage = () => {
    const { getMyOrders, myOrders } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                setLoading(true);
                setError(null);
                await getMyOrders();
            } catch (err) {
                setError('Erreur lors du chargement des commandes');
                console.error('Erreur:', err);
            } finally {
                setLoading(false);
            }
        };
        
        loadOrders();
    }, [getMyOrders]);

    const formatDate = (dateString?: string | Date) => {
        if (!dateString) {
            return 'Date non disponible';
        }
        
        try {
            const date = new Date(dateString);
            // Vérifier si la date est valide
            if (isNaN(date.getTime())) {
                return 'Date invalide';
            }
            
            return date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Erreur lors du formatage de la date:', error);
            return 'Date non disponible';
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'accompli':
            case 'completed':
            case 'livré':
            case 'livrée':
                return 'success';
            case 'en_cours':
            case 'pending':
            case 'en cours':
                return 'warning';
            case 'cancelled':
            case 'annulé':
                return 'error';
            case 'processing':
            case 'en traitement':
                return 'info';
            default:
                return 'warning'; // Par défaut "En cours"
        }
    };

    const getStatusText = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'accompli':
            case 'completed':
                return 'Accompli';
            case 'en_cours':
            case 'pending':
            case 'en cours':
                return 'En cours';
            case 'cancelled':
            case 'annulé':
                return 'Annulé';
            case 'processing':
            case 'en traitement':
                return 'En traitement';
            default:
                return 'En cours'; // Statut par défaut
        }
    };

    // Affichage des commandes de l'utilisateur
    console.log("Mes commandes :", myOrders);
    
    // Debug: Afficher la structure d'une commande si disponible
    if (myOrders.length > 0) {
        console.log("Structure de la première commande:", {
            _id: myOrders[0]._id,
            createdAt: myOrders[0].createdAt,
            status: myOrders[0].status,
            total: myOrders[0].total,
            orderItems: myOrders[0].orderItems?.length || 0
        });
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh' }}>
            {/* En-tête avec style glassmorphism */}
            <Box 
                sx={{ 
                    textAlign: 'center', 
                    mb: 6,
                    position: 'relative',
                    p: 4,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -2,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '120px',
                        height: '4px',
                        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '2px'
                    }
                }}
            >
                <Typography 
                    variant="h3" 
                    component="h1" 
                    sx={{ 
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2
                    }}
                >
                    <ShoppingBag sx={{ fontSize: '0.8em', color: '#667eea' }} />
                    Mes Commandes
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Suivez l'état de vos commandes et consultez votre historique d'achats
                </Typography>
            </Box>

            {/* Loading */}
            {loading && (
                <Box 
                    display="flex" 
                    flexDirection="column" 
                    alignItems="center" 
                    my={8}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <CircularProgress 
                        size={60} 
                        thickness={4} 
                        sx={{ 
                            color: '#667eea',
                            mb: 2 
                        }} 
                    />
                    <Typography variant="body1" color="text.secondary">
                        Chargement de vos commandes...
                    </Typography>
                </Box>
            )}

            {/* Erreur */}
            {error && (
                <Alert 
                    severity="error" 
                    sx={{ 
                        mb: 4,
                        borderRadius: 3,
                        background: 'rgba(244, 67, 54, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(244, 67, 54, 0.3)',
                        '& .MuiAlert-icon': {
                            fontSize: '1.5rem'
                        }
                    }}
                >
                    <Typography variant="body1" fontWeight="medium">
                        {error}
                    </Typography>
                </Alert>
            )}

            {/* Pas de commandes */}
            {!loading && !error && myOrders.length === 0 && (
                <Paper 
                    elevation={0}
                    sx={{ 
                        textAlign: 'center', 
                        py: 8, 
                        px: 4,
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <ShoppingBag sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
                    <Typography variant="h4" gutterBottom fontWeight="bold" sx={{
                        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Aucune commande pour le moment
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                        Vous n'avez pas encore passé de commandes. Découvrez notre collection de produits exceptionnels !
                    </Typography>
                    <Button 
                        variant="contained" 
                        size="large"
                        sx={{
                            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: 3,
                            px: 6,
                            py: 1.5,
                            fontWeight: 'bold',
                            textTransform: 'none',
                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)'
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        onClick={() => window.location.href = '/'}
                    >
                        <Inventory sx={{ mr: 1 }} />
                        Découvrir nos produits
                    </Button>
                </Paper>
            )}

            {/* Liste des commandes */}
            {!loading && myOrders.length > 0 && (
                <Box>
                    {/* Statistiques rapides */}
                    <Paper 
                        elevation={0}
                        sx={{ 
                            p: 4, 
                            mb: 4, 
                            borderRadius: 4,
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, textAlign: 'center' }}>
                            Résumé de vos achats
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'space-around' }}>
                            <Box sx={{ textAlign: 'center', minWidth: 150 }}>
                                <Typography variant="h3" fontWeight="bold" sx={{
                                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {myOrders.length}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" fontWeight="medium">
                                    Commande{myOrders.length > 1 ? 's' : ''}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', minWidth: 150 }}>
                                <Typography variant="h3" fontWeight="bold" sx={{
                                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {myOrders.reduce((total, order) => total + (order.total || 0), 0).toFixed(2)}€
                                </Typography>
                                <Typography variant="body1" color="text.secondary" fontWeight="medium">
                                    Total dépensé
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', minWidth: 150 }}>
                                <Typography variant="h3" fontWeight="bold" sx={{
                                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {myOrders.reduce((total, order) => total + (order.orderItems?.length || 0), 0)}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" fontWeight="medium">
                                    Article{myOrders.reduce((total, order) => total + (order.orderItems?.length || 0), 0) > 1 ? 's' : ''}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>

                    {/* Cartes des commandes */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {myOrders.map((order: Order) => (
                            <Card 
                                key={order._id}
                                elevation={0}
                                sx={{ 
                                    borderRadius: 4,
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.2)',
                                        borderColor: 'rgba(102, 126, 234, 0.3)'
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 4 }}>
                                    {/* En-tête de la commande */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                                        <Box>
                                            <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                                                Commande #{order._id.slice(-8).toUpperCase()}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                                                    <Typography variant="body1" color="text.secondary">
                                                        {(() => {
                                                            // Essayer plusieurs sources pour la date
                                                            const dateToUse = order.createdAt || order.updatedAt;
                                                            console.log('Date pour la commande', order._id, ':', dateToUse);
                                                            return formatDate(dateToUse);
                                                        })()}
                                                    </Typography>
                                                </Box>
                                                <Chip 
                                                    label={getStatusText(order.status)}
                                                    color={getStatusColor(order.status) as  "info" | "success"}
                                                    size="medium"
                                                    icon={<LocalShipping />}
                                                    sx={{ fontWeight: 'medium' }}
                                                />
                                            </Box>
                                        </Box>
                                        <Box textAlign="right">
                                            <Typography variant="h4" fontWeight="bold" sx={{
                                                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent'
                                            }}>
                                                {(order.total || 0).toFixed(2)}€
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary">
                                                {order.orderItems?.length || 0} article{(order.orderItems?.length || 0) > 1 ? 's' : ''}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ mb: 4, background: 'rgba(255, 255, 255, 0.1)' }} />

                                    {/* Articles de la commande */}
                                    {order.orderItems && order.orderItems.length > 0 && (
                                        <>
                                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                                                Articles commandés
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                                {order.orderItems.map((item, index) => {
                                                    // Priorité aux données directes du backend
                                                    const title = item.productTitle || item.product?.title || item.title || 'Produit sans nom';
                                                    const image = item.productImage || item.product?.image || item.image;
                                                    const price = item.unitPrice || item.productPrice || item.product?.price || item.price || 0;
                                                    
                                                    return (
                                                        <Paper 
                                                            key={index}
                                                            elevation={0}
                                                            sx={{ 
                                                                p: 2.5, 
                                                                borderRadius: 3,
                                                                background: 'rgba(255, 255, 255, 0.03)',
                                                                backdropFilter: 'blur(10px)',
                                                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                                                flex: '1 1 300px',
                                                                maxWidth: '400px',
                                                                transition: 'all 0.2s ease',
                                                                '&:hover': {
                                                                    background: 'rgba(255, 255, 255, 0.06)',
                                                                    borderColor: 'rgba(102, 126, 234, 0.2)'
                                                                }
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                                {image ? (
                                                                    <Box
                                                                        component="img"
                                                                        src={image}
                                                                        alt={title}
                                                                        sx={{
                                                                            width: 70,
                                                                            height: 70,
                                                                            objectFit: 'cover',
                                                                            borderRadius: 2,
                                                                            border: '1px solid rgba(255, 255, 255, 0.1)'
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Avatar 
                                                                        sx={{ 
                                                                            width: 70, 
                                                                            height: 70,
                                                                            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
                                                                        }}
                                                                    >
                                                                        <Inventory />
                                                                    </Avatar>
                                                                )}
                                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                    <Typography 
                                                                        variant="body1" 
                                                                        fontWeight="bold"
                                                                        sx={{ 
                                                                            mb: 1,
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            display: '-webkit-box',
                                                                            WebkitLineClamp: 2,
                                                                            WebkitBoxOrient: 'vertical'
                                                                        }}
                                                                    >
                                                                        {title}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                        Quantité: <strong>{item.quantity || 1}</strong>
                                                                    </Typography>
                                                                    <Typography variant="h6" fontWeight="bold" sx={{
                                                                        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                                                                        WebkitBackgroundClip: 'text',
                                                                        WebkitTextFillColor: 'transparent'
                                                                    }}>
                                                                        {price.toFixed(2)}€
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </Paper>
                                                    );
                                                })}
                                            </Box>
                                        </>
                                    )}
                                </CardContent>

                                <CardActions sx={{ px: 4, pb: 4 }}>
                                    <Button 
                                        size="large" 
                                        sx={{ 
                                            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            borderRadius: 2,
                                            px: 3,
                                            fontWeight: 'bold',
                                            textTransform: 'none',
                                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                                                transform: 'translateY(-1px)',
                                                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                                            },
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <Receipt sx={{ mr: 1 }} />
                                        Voir les détails
                                    </Button>
                                    <Button 
                                        size="large" 
                                        color="inherit"
                                        sx={{ 
                                            borderRadius: 2,
                                            px: 3,
                                            fontWeight: 'medium',
                                            textTransform: 'none',
                                            '&:hover': {
                                                background: 'rgba(255, 255, 255, 0.1)'
                                            }
                                        }}
                                    >
                                        Télécharger la facture
                                    </Button>
                                </CardActions>
                            </Card>
                        ))}
                    </Box>
                </Box>
            )}
        </Container>
    );
}

export default MyOrdersPage;