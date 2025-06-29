/**
 * AuthPro// Imports React pour la gestion d'état et les types TypeScript
import { useState, useCallback, type FC,type PropsWithChildren } from "react";
// Import du contexte d'authentification
import { AuthContext, Order } from "./AuthContext";
import { Base_URL } from "../../constants/baseUrl";.tsx - Fournisseur du contexte d'authentification
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
import { useState, useCallback, type FC,type PropsWithChildren } from "react";
// Import du contexte d'authentification
import { AuthContext } from "./AuthContext";
import { Base_URL } from "../../constants/baseUrl";

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

    const [ myOrders ,setMyOrders] = useState([]); 

    
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
     const login = useCallback((username:string, token:string) => {
         setusername(username);
            setToken(token);
            // Sauvegarde dans localStorage pour maintenir la session
            localStorage.setItem(USERNAME_KEY, username);
            localStorage.setItem(TOKEN_KEY, token);
    }, []);
    const isAuthenticated =!!token; // Vérifie si l'utilisateur est connecté

    /**
     * Fonction pour déconnecter un utilisateur
     * 
     * Actions :
     * - Remet à null l'état d'authentification
     * - Supprime les données de localStorage
     * - L'utilisateur sera redirigé vers l'état non-connecté
     */
    const logout = useCallback(() => {
        console.log('Déconnexion de l\'utilisateur');
        setusername(null);
        setToken(null);
        setMyOrders([]);
        localStorage.removeItem(USERNAME_KEY);
        localStorage.removeItem(TOKEN_KEY);
    }, []);

    /**
     * Fonction pour nettoyer complètement le localStorage et forcer un nouveau login
     * Utile pour corriger les problèmes de token corrompu
     */
    const clearStorageAndLogout = useCallback(() => {
        console.log('Nettoyage complet du localStorage');
        localStorage.clear();
        setusername(null);
        setToken(null);
        setMyOrders([]);
    }, []);
    const getMyOrders = useCallback(async() => {
        try {
            console.log("Token utilisé pour getMyOrders:", token);
            console.log("Token valide ?", !!token);
            console.log("Longueur du token:", token?.length);
            
            // Diagnostic: décoder le token pour voir sa structure
            if (token) {
                try {
                    const [, payload] = token.split('.');
                    const decodedPayload = JSON.parse(atob(payload));
                    console.log("Payload du token:", decodedPayload);
                    console.log("Token expiré ?", decodedPayload.exp ? Date.now() >= decodedPayload.exp * 1000 : "Pas d'expiration");
                } catch (e) {
                    console.error("Erreur lors du décodage du token:", e);
                }
            }
            
            const response = await fetch(`${Base_URL}/user/my_orders`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // Authentification JWT
                }
            });
            
            if (!response.ok) {
                // Si le serveur renvoie du texte au lieu de JSON pour les erreurs
                const errorText = await response.text();
                console.error('Erreur du serveur:', errorText);
                
                // Si l'erreur est 403 (token invalide), déconnecter l'utilisateur
                if (response.status === 403) {
                    console.warn('Token invalide, déconnexion automatique');
                    logout();
                }
                
                throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            setMyOrders(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des commandes:', error);
            throw error; // Re-lancer l'erreur pour que le composant puisse la gérer
        }           
    }, [token, logout]);

    return (
        <AuthContext.Provider value={{ username, token,myOrders,login,logout,isAuthenticated,getMyOrders ,clearStorageAndLogout}}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;