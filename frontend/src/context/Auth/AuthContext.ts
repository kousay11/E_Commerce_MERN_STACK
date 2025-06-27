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

/**
 * Interface définissant la structure des données d'authentification
 * 
 * @property username - Nom d'utilisateur (peut être null si non connecté)
 * @property token - Token JWT d'authentification (peut être null si non connecté)
 * @property login - Fonction pour connecter un utilisateur avec ses identifiants
 */
interface AuthContextType {
    username: string | null;
    token: string | null;
    login: (username:string, token:string) => void;
}

/**
 * Création du contexte d'authentification avec des valeurs par défaut
 * - username: null (utilisateur non connecté)
 * - token: null (pas de token d'authentification)
 * - login: fonction vide par défaut
 */
export const AuthContext = createContext<AuthContextType>({username: null, token: null, login: () => {}});

/**
 * Hook personnalisé pour accéder aux données d'authentification
 * 
 * @returns Les données d'authentification du contexte
 * @throws Error si utilisé en dehors d'un AuthProvider
 * 
 * Usage:
 * const { username, token, login } = useAuthContext();
 */
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
};