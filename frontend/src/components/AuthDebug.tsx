/**
 * Composant de débogage pour vérifier l'état d'authentification
 * À supprimer une fois le problème résolu
 */

import { useAuthContext } from "../context/Auth/AuthContext";
import { Typography, Paper } from "@mui/material";

const AuthDebug = () => {
  const { username, token, isAuthenticated } = useAuthContext();

  return (
    <Paper sx={{ p: 2, mb: 2, bgcolor: "#f5f5f5" }}>
      <Typography variant="h6" color="primary">🔍 Debug Authentication</Typography>
      <Typography variant="body2">
        <strong>Username:</strong> {username || "Non connecté"}
      </Typography>
      <Typography variant="body2">
        <strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : "Aucun token"}
      </Typography>
      <Typography variant="body2">
        <strong>Is Authenticated:</strong> {isAuthenticated ? "✅ Oui" : "❌ Non"}
      </Typography>
      <Typography variant="body2">
        <strong>Token Length:</strong> {token?.length || 0} caractères
      </Typography>
    </Paper>
  );
};

export default AuthDebug;
