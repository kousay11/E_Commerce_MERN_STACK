import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";
import type { TransitionProps } from "@mui/material/transitions";
import React, { useState, forwardRef } from "react";
import { useCart } from "../context/Cart/CartContext";

// Composant de transition pour la boîte de dialogue
const Transition = forwardRef<unknown, TransitionProps & { children: React.ReactElement }>(
  function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  },
);

interface Props {
  _id: string;
  title: string;
  image: string;
  price: number; // Changé de string à number pour correspondre aux données du backend
}

export default function ProductCard({ _id, title, image, price }: Props) {
  const { addItemToCart, cartItems } = useCart();
  
  // État pour gérer l'ouverture/fermeture de la boîte de dialogue
  const [open, setOpen] = useState(false);
  // État pour le message à afficher
  const [message, setMessage] = useState("");
  // État pour le type d'alerte (success ou warning)
  const [alertType, setAlertType] = useState<"success" | "warning">("success");

  // Fonction pour gérer l'ajout au panier
  const handleAddToCart = () => {
    // Vérifier si le produit existe déjà dans le panier
    const existingItem = cartItems.find(item => item.productId === _id);
    
    if (existingItem) {
      // Produit déjà dans le panier
      setMessage("Ce produit est déjà ajouté dans le panier");
      setAlertType("warning");
    } else {
      // Nouveau produit, l'ajouter au panier
      addItemToCart(_id);
      setMessage("Produit ajouté au panier avec succès !");
      setAlertType("success");
    }
    
    // Ouvrir la boîte de dialogue
    setOpen(true);
  };

  // Fonction pour fermer la boîte de dialogue
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Card sx={{
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 25px rgba(0, 0, 0, 0.15)',
        }
      }}>
        <CardMedia sx={{ height: 200 }} image={image} title={title} />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {price} TD
          </Typography>
        </CardContent>
        <CardActions>
          <Button 
            variant="contained" 
            size="small" 
            onClick={handleAddToCart}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            Add to Cart
          </Button>
        </CardActions>
      </Card>

      {/* Boîte de dialogue pour les messages */}
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '15px',
            minWidth: 300,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{
          textAlign: 'center',
          fontWeight: 600,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Panier
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert 
            severity={alertType} 
            sx={{ 
              borderRadius: '12px',
              '& .MuiAlert-message': {
                fontWeight: 500
              }
            }}
          >
            {message}
          </Alert>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={handleClose}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              }
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}