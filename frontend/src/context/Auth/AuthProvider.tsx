/**
 * AuthProvider.tsx - Fournisseur du contexte d'authentification
 * 
 * RÔLE:
 * - Gère l'état global d'authentification de l'application
 * - Fournit les données d'authentification à tous les composants enfants
 * - Implémente les fonctions de connexion/déconnexion
 * - Persiste les données dans localStorage pour maintenir la session
 * 
 * PATTERN:
 * - Provider Pattern avec React Context
 * - State management avec useState pour username et token
 * - Persistence avec localStorage pour garder la session active
 */

// Imports React pour la gestion d'état et les types TypeScript
import { useState, type FC,type PropsWithChildren } from "react";
// Import du contexte d'authentification
import { AuthContext } from "./AuthContext";

const USERNAME_KEY = "username";
const TOKEN_KEY= "token";

/**
 * Composant AuthProvider - Fournisseur du contexte d'authentification
 * 
 * Ce composant :
 * - Maintient l'état d'authentification (username, token)
 * - Fournit une fonction login pour connecter un utilisateur
 * - Enveloppe l'application pour partager ces données avec tous les composants
 * - Restaure automatiquement la session depuis localStorage
 * 
 * @param children - Composants enfants qui auront accès au contexte
 */
const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
    // État pour le nom d'utilisateur - récupéré depuis localStorage au démarrage
    const [username, setusername] = useState<string|null>(localStorage.getItem("username"));
    // État pour le token JWT - récupéré depuis localStorage au démarrage
    const [token, setToken] = useState<string|null>(localStorage.getItem("token"));
    
    /*
    Alternative avec useEffect pour la restauration de session :
    useEffect(() => {
        const localUsername = localStorage.getItem("username");
        const localToken = localStorage.getItem("token");
        if (localUsername && localToken) {
            setusername(localUsername);
            setToken(localToken);
        }
    }, []);
    */
    
    /**
     * Fonction pour connecter un utilisateur
     * 
     * @param username - Nom d'utilisateur à connecter
     * @param token - Token JWT reçu du serveur
     * 
     * Actions :
     * - Met à jour l'état React
     * - Sauvegarde dans localStorage pour persistance
     */
     const login = (username:string, token:string) => {
         setusername(username);
            setToken(token);
            // Sauvegarde dans localStorage pour maintenir la session
            localStorage.setItem(USERNAME_KEY, username);
            localStorage.setItem(TOKEN_KEY, token);
    };
    const isAuthenticated =!!token; // Vérifie si l'utilisateur est connecté

    /**
     * Fonction pour déconnecter un utilisateur
     * 
     * Actions :
     * - Remet à null l'état d'authentification
     * - Supprime les données de localStorage
     * - L'utilisateur sera redirigé vers l'état non-connecté
     */
    const logout = () => {
        setusername(null);
        setToken(null);
        localStorage.removeItem(USERNAME_KEY);
        localStorage.removeItem(TOKEN_KEY);
    };

    return (
        <AuthContext.Provider value={{ username, token,login,logout,isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;