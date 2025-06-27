/**
 * LoginPage.tsx - Page de connexion des utilisateurs
 * 
 * FONCTIONNALITÉS:
 * - Formulaire de connexion avec validation des champs
 * - Authentification utilisateur via API
 * - Gestion des erreurs et feedback utilisateur
 * - Connexion automatique et persistence de session
 * 
 * ARCHITECTURE:
 * - React Functional Component avec hooks
 * - Material-UI pour l'interface utilisateur
 * - Refs pour accéder aux valeurs des champs
 * - Context API pour l'authentification
 */

// Imports des composants Material-UI pour l'interface utilisateur
import Box  from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import TextField  from "@mui/material/TextField";
import Button from "@mui/material/Button";
// Hooks React pour la gestion d'état et les références DOM
import { useRef, useState } from "react";
// URL de base du serveur backend
import { Base_URL } from "../constants/baseUrl";
// Hook d'authentification pour gérer la connexion
import { useAuthContext } from "../context/Auth/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * Composant LoginPage - Page de connexion
 * 
 * Ce composant :
 * - Affiche un formulaire de connexion avec 2 champs (email, password)
 * - Valide les données côté client
 * - Envoie les données au backend pour authentification
 * - Connecte automatiquement l'utilisateur en cas de succès
 * - Gère les erreurs et affiche des messages appropriés
 */
const LoginPage = () => {
    // État pour gérer les messages d'erreur
    const [error, setError] = useState("");
    
    // Références pour accéder directement aux valeurs des champs du formulaire
    const emailRef = useRef<HTMLInputElement>(null);  
    const passwordRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate();

    // Récupération de la fonction login depuis le contexte d'authentification
    const {login} = useAuthContext();    

    /**
     * Fonction de soumission du formulaire de connexion
     * 
     * Processus :
     * 1. Récupère les valeurs des champs email et password
     * 2. Valide que tous les champs sont remplis
     * 3. Envoie une requête POST au backend pour l'authentification
     * 4. Gère la réponse (succès ou erreur)
     * 5. Connecte automatiquement l'utilisateur si authentification réussie
     * 6. Nettoie le formulaire et affiche un message de confirmation
     */
    const onSubmit = async() => {
        // Récupération des valeurs des champs via les références
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;

        // Validation côté client - vérification que tous les champs sont remplis
        if (!email || !password) {
            setError("Tous les champs sont obligatoires");
            return;
        }

        try {
            // Requête HTTP POST vers l'API de connexion
            const response = await fetch(`${Base_URL}/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            // Gestion des erreurs HTTP (statut 4xx ou 5xx)
            if(!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || errorData.error || "unable to login user, please try again later");
                return;
            }

            // Parse de la réponse JSON du serveur
            const responseData = await response.json();
            console.log("Full response data:", responseData);
            console.log("Response type:", typeof responseData);
            console.log("Response.message:", responseData.message);
            console.log("Response.message type:", typeof responseData.message);
            
            // Gestion flexible du token selon le format de réponse
            let token = null;
            
            // Si c'est directement un string (ancien format)
            if (typeof responseData === 'string') {
                console.log("Case 1: Direct string");
                token = responseData;
            }
            // Si c'est un objet avec différents champs possibles
            else if (typeof responseData === 'object') {
                if (responseData.message && typeof responseData.message === 'string') {
                    console.log("Case 2: Object with message string");
                    // Vérifier si le message est un token JWT ou un message d'erreur
                    if (responseData.message.includes('.') && responseData.message.split('.').length === 3) {
                        // Probablement un JWT token (format: header.payload.signature)
                        token = responseData.message;
                        console.log("Detected JWT token in message");
                    } else {
                        // Probablement un message d'erreur
                        console.log("Detected error message:", responseData.message);
                        setError(responseData.message);
                        return;
                    }
                } else if (responseData.token) {
                    console.log("Case 3: Object with token field");
                    token = responseData.token;
                } else if (responseData.data) {
                    console.log("Case 4: Object with data field");
                    token = responseData.data;
                }
            }
            
            // Vérification que le token a bien été reçu
            if(!token) {
                console.error("Token extraction failed. Response:", responseData);
                setError("Token non reçu du serveur");
                return;
            }
            
            // Connexion automatique de l'utilisateur avec ses identifiants
            login(email, token);
            navigate("/"); // Redirection vers la page d'accueil après connexion réussie
            console.log("Login successful with token:", token);
            setError(""); // Effacement des erreurs précédentes
            alert("Connexion réussie !"); // Message de confirmation corrigé
            
            // Nettoyage du formulaire après connexion réussie
            if (emailRef.current) emailRef.current.value = "";
            if (passwordRef.current) passwordRef.current.value = "";
            
        } catch (err) {
            // Gestion des erreurs de réseau ou autres erreurs techniques
            setError("Erreur de connexion au serveur");
            console.error("Login error:", err);
        }
    }
    return (
        <Container>
            <Box sx={{ display: 'flex',
                 alignItems: 'center',
                    flexDirection: 'column',
                  justifyContent: 'center',
                  mt: 4}}>
                {/* Titre de la page */}
                <Typography variant="h6">Login to Your Account</Typography> 
                {/* Container du formulaire avec bordure et padding */}
                <Box  sx={{ display: 'flex',
                     flexDirection: 'column',
                      width: '300px',
                      border: '1px solid #ccc',
                      padding: '16px',
                      borderColor : '#f5f5f5'}}>
                    {/* Champ Email */}
                    <TextField 
                        inputRef={emailRef}
                        label="Email" 
                        variant="outlined" 
                        fullWidth 
                        margin="normal" 
                    />
                    {/* Champ Mot de passe */}
                    <TextField 
                        inputRef={passwordRef}
                        label="Password" 
                        type="password" 
                        variant="outlined" 
                        fullWidth 
                        margin="normal" 
                    />
                    {/* Bouton de soumission du formulaire */}
                    <Button onClick={onSubmit} variant="contained" color="primary" fullWidth>Login</Button>
                    {/* Affichage conditionnel des messages d'erreur */}
                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>
                    )}
                </Box>
            </Box>
        </Container>  
    );  
}

export default LoginPage;
