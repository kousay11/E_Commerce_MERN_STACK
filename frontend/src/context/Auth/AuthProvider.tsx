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
 * - Décode le JWT pour afficher le vrai nom d'utilisateur
 * 
 * @param children - Composants enfants qui auront accès au contexte
 */
const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
    // Fonction pour décoder le token et extraire le nom d'utilisateur
    const getUsernameFromToken = (token: string): string | null => {
        try {
            const [, payload] = token.split('.');
            const decodedPayload = JSON.parse(atob(payload));
            return `${decodedPayload.firstName} ${decodedPayload.lastName}`;
        } catch (error) {
            console.error('Erreur lors du décodage du token:', error);
            return null;
        }
    };

    // Initialisation intelligente: décoder le token existant si possible
    const initializeUser = () => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUsername = localStorage.getItem(USERNAME_KEY);
        
        if (storedToken) {
            const decodedUsername = getUsernameFromToken(storedToken);
            if (decodedUsername) {
                // Mettre à jour le localStorage avec le vrai nom si nécessaire
                if (storedUsername !== decodedUsername) {
                    localStorage.setItem(USERNAME_KEY, decodedUsername);
                }
                return decodedUsername;
            }
        }
        
        return storedUsername;
    };

    // État pour le nom d'utilisateur - initialisé intelligemment
    const [username, setusername] = useState<string|null>(initializeUser());
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
     * @param email - Email de l'utilisateur (temporaire pour compatibilité)
     * @param token - Token JWT reçu du serveur
     * 
     * Actions :
     * - Décode le JWT pour extraire le firstName et lastName
     * - Met à jour l'état React avec le vrai nom d'utilisateur
     * - Sauvegarde dans localStorage pour persistance
     */
     const login = useCallback((email: string, token: string) => {
         try {
             // Décoder le JWT pour extraire les informations utilisateur
             const [, payload] = token.split('.');
             const decodedPayload = JSON.parse(atob(payload));
             
             // Construire le nom d'affichage à partir du firstName et lastName
             const displayName = `${decodedPayload.firstName} ${decodedPayload.lastName}`;
             
             setusername(displayName);
             setToken(token);
             
             // Sauvegarde dans localStorage pour maintenir la session
             localStorage.setItem(USERNAME_KEY, displayName);
             localStorage.setItem(TOKEN_KEY, token);
         } catch (error) {
             console.error('Erreur lors du décodage du token:', error);
             // Fallback vers l'email si le décodage échoue
             setusername(email);
             setToken(token);
             localStorage.setItem(USERNAME_KEY, email);
             localStorage.setItem(TOKEN_KEY, token);
         }
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