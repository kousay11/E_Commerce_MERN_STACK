import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/Auth/AuthContext";


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Récupération du contexte d'authentification
    const { isAuthenticated } = useAuthContext();
    
    // Si l'utilisateur n'est pas authentifié, redirection vers la page de connexion
    if (!isAuthenticated) {
        return <Navigate to="/Login" replace />;
    }

    // Si l'utilisateur est authentifié, afficher le contenu protégé
    return <>{children}</>;
}
export default ProtectedRoute;