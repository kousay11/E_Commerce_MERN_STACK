/**
 * AuthContext.ts - Contexte d'authentification de l'application
 * 
 * RÔLE:
 * - Définit l'interface TypeScript pour les données d'authentification
 * - Crée le contexte React pour partager l'état d'authentification
 * - Fournit un hook personnalisé pour accéder aux données d'authentification
 * 
 * PATTERN:
 * - Context API de React pour éviter le prop drilling
 * - Hook personnalisé pour simplifier l'utilisation
 * - TypeScript pour la sécurité des types
 */

import { createContext, useContext } from "react"
import type { Order } from "../../types/Order";

/**
 * Interface définissant la structure des données d'authentification
 * 
 * @property username - Nom d'utilisateur (peut être null si non connecté)
 * @property token - Token JWT d'authentification (peut être null si non connecté)
 * @property login - Fonction pour connecter un utilisateur avec ses identifiants
 * @property logout - Fonction pour déconnecter l'utilisateur et nettoyer la session
 * @property isAuthenticated - Booléen indiquant si l'utilisateur est connecté
 */
interface AuthContextType {
    username: string | null;
    token: string | null;
    myOrders: Order[]; // Tableau pour stocker les commandes de l'utilisateur
    login: (username:string, token:string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    getMyOrders: () => void; // Fonction pour récupérer les commandes de l'utilisateur
    clearStorageAndLogout: () => void; // Fonction pour nettoyer le stockage local et déconnecter l'utilisateur
}

/**
 * Création du contexte d'authentification avec des valeurs par défaut
 * - username: null (utilisateur non connecté)
 * - token: null (pas de token d'authentification)
 * - login: fonction vide par défaut
 * - logout: fonction vide par défaut
 * - isAuthenticated: false (utilisateur non connecté par défaut)
 */
export const AuthContext = createContext<AuthContextType>({
    username: null, 
    token: null, 
    myOrders: [],
    login: () => {}, 
    logout: () => {},
    isAuthenticated: false,
    getMyOrders: () => {},
    clearStorageAndLogout: () => {}
});

/**
 * Hook personnalisé pour accéder aux données d'authentification
 * 
 * @returns Les données d'authentification du contexte
 * @throws Error si utilisé en dehors d'un AuthProvider
 * 
 * Usage:
 * const { username, token, login, logout, isAuthenticated } = useAuthContext();
 */
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
};