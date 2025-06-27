/**
 * RegisterPage.tsx - Page d'inscription des utilisateurs
 * 
 * FONCTIONNALITÉS:
 * - Formulaire d'inscription avec validation des champs
 * - Création de compte utilisateur via API
 * - Connexion automatique après inscription réussie
 * - Gestion des erreurs et feedback utilisateur
 * - Persistence de la session via AuthContext
 * 
 * ARCHITECTURE:
 * - React Functional Component avec hooks
 * - Material-UI pour l'interface utilisateur
 * - Refs pour accéder aux valeurs des champs de formulaire
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
// Hook d'authentification pour gérer la connexion automatique
import { useAuthContext } from "../context/Auth/AuthContext";

/**
 * Composant RegisterPage - Page d'inscription
 * 
 * Ce composant :
 * - Affiche un formulaire d'inscription avec 4 champs
 * - Valide les données côté client
 * - Envoie les données au backend pour créer le compte
 * - Connecte automatiquement l'utilisateur après inscription
 * - Gère les erreurs et affiche des messages appropriés
 */
const RegisterPage = () => {
    // État pour gérer les messages d'erreur
    const [error, setError] = useState("");
    
    // Références pour accéder directement aux valeurs des champs du formulaire
    const firstNameRef = useRef<HTMLInputElement>(null);
    const lastNameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);  
    const passwordRef = useRef<HTMLInputElement>(null);

    // Récupération de la fonction login depuis le contexte d'authentification
    const {login} = useAuthContext();    

    /**
     * Fonction de soumission du formulaire d'inscription
     * 
     * Processus :
     * 1. Récupère les valeurs des champs via les refs
     * 2. Valide que tous les champs sont remplis
     * 3. Envoie une requête POST au backend
     * 4. Gère la réponse (succès ou erreur)
     * 5. Connecte automatiquement l'utilisateur si succès
     * 6. Nettoie le formulaire et affiche un message de confirmation
     */
    const onSubmit = async() => {
        // Récupération des valeurs des champs via les références
        const firstName = firstNameRef.current?.value;
        const lastName = lastNameRef.current?.value;
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;

        // Validation côté client - vérification que tous les champs sont remplis
        if (!firstName || !lastName || !email || !password) {
            setError("Tous les champs sont obligatoires");
            return;
        }

        try {
            // Requête HTTP POST vers l'API d'inscription
            const response = await fetch(`${Base_URL}/user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({firstName, lastName, email, password }),
            });

            // Gestion des erreurs HTTP (statut 4xx ou 5xx)
            if(!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || errorData.error || "Erreur lors de l'inscription");
                return;
            }

            // Parse de la réponse JSON du serveur
            const responseData = await response.json();
            
            // Extraction du token JWT depuis différents formats de réponse possibles
            let token = null;
            if (responseData.message && typeof responseData.message === 'string') {
                // Si message est une string, c'est probablement le token JWT
                token = responseData.message;
            } else if (responseData.token) {
                // Si il y a un champ token explicite
                token = responseData.token;
            } else if (responseData.data) {
                // Si le token est dans le champ data
                token = responseData.data;
            }
            
            // Vérification que le token a bien été reçu
            if(!token) {
                setError("Token non reçu du serveur");
                return;
            }
            
            // Connexion automatique de l'utilisateur avec ses identifiants
            login(email, token);
            console.log("Response from server:", responseData);
            setError(""); // Effacement des erreurs précédentes
            alert("Inscription réussie !"); // Message de confirmation
            
            // Nettoyage du formulaire après inscription réussie
            if (firstNameRef.current) firstNameRef.current.value = "";
            if (lastNameRef.current) lastNameRef.current.value = "";
            if (emailRef.current) emailRef.current.value = "";
            if (passwordRef.current) passwordRef.current.value = "";
            
        } catch (err) {
            // Gestion des erreurs de réseau ou autres erreurs techniques
            setError("Erreur de connexion au serveur");
            console.error("Registration error:", err);
        }
    }
    // Rendu du composant - Interface utilisateur du formulaire d'inscription
    return (
        <Container>
            <Box sx={{ display: 'flex',
                 alignItems: 'center',
                    flexDirection: 'column',
                  justifyContent: 'center',
                  mt: 4}}>
                {/* Titre de la page */}
                <Typography variant="h6">Register New Account</Typography> 
                {/* Container du formulaire avec bordure et padding */}
                <Box  sx={{ display: 'flex',
                     flexDirection: 'column',
                      width: '300px',
                      border: '1px solid #ccc',
                      padding: '16px',
                      borderColor : '#f5f5f5'}}>
                    {/* Champ Prénom */}
                    <TextField
                        inputRef={firstNameRef} 
                        label="First Name" 
                        variant="outlined" 
                        fullWidth 
                        margin="normal"
                    />
                    {/* Champ Nom de famille */}
                    <TextField
                        inputRef={lastNameRef} 
                        label="Last Name" 
                        variant="outlined" 
                        fullWidth 
                        margin="normal" 
                    />
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
                    <Button onClick={onSubmit} variant="contained" color="primary" fullWidth>Register</Button>
                    {/* Affichage conditionnel des messages d'erreur */}
                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>
                    )}
                </Box>
            </Box>
        </Container>  
    );  
}

export default RegisterPage;
