/**
 * RegisterPage.tsx - Page d'inscription moderne avec animations
 * 
 * FONCTIONNALITÉS:
 * - Interface moderne avec animations CSS fluides
 * - Formulaire d'inscription avec validation en temps réel
 * - Effets visuels inspirés des designs CodePen
 * - Création de compte utilisateur via API
 * - Connexion automatique après inscription réussie
 * - Gestion des erreurs avec feedback visuel
 * - Responsive design pour tous les écrans
 * 
 * DESIGN:
 * - Card flottante avec glassmorphism
 * - Animations d'entrée et de hover
 * - Gradient de fond animé
 * - Champs de saisie avec effets focus
 * - Boutons avec transitions smooth
 * - Validation en temps réel avec indicateurs visuels
 */

// Imports des composants Material-UI pour l'interface utilisateur
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Fade from "@mui/material/Fade";
import Slide from "@mui/material/Slide";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
// Icons Material-UI
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
// Hooks React pour la gestion d'état et les références DOM
import { useRef, useState } from "react";
// URL de base du serveur backend
import { Base_URL } from "../constants/baseUrl";
// Hook d'authentification pour gérer la connexion automatique
import { useAuthContext } from "../context/Auth/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * Composant RegisterPage - Page d'inscription moderne et animée
 * 
 * Cette nouvelle version propose :
 * - Design moderne avec effets glassmorphism
 * - Animations fluides d'entrée et d'interaction
 * - Validation en temps réel avec feedback visuel
 * - Interface responsive et accessible
 * - Gestion avancée des erreurs avec alerts stylisées
 * - Indicateur de force du mot de passe
 * - Effets hover et focus sophistiqués
 */
const RegisterPage = () => {
    // ========== ÉTATS DE GESTION ==========
    // État pour gérer les messages d'erreur
    const [error, setError] = useState("");
    // État pour gérer l'affichage du mot de passe
    const [showPassword, setShowPassword] = useState(false);
    // État pour gérer le loading pendant l'inscription
    const [isLoading, setIsLoading] = useState(false);
    // États pour la validation en temps réel
    const [firstNameError, setFirstNameError] = useState("");
    const [lastNameError, setLastNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    // État pour la force du mot de passe
    const [passwordStrength, setPasswordStrength] = useState(0);
    // État pour contrôler les animations d'entrée
    const [animationKey] = useState(0);
    
    // Références pour accéder directement aux valeurs des champs du formulaire
    const firstNameRef = useRef<HTMLInputElement>(null);
    const lastNameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);  
    const passwordRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate();

    // Récupération de la fonction login depuis le contexte d'authentification
    const {login} = useAuthContext();

    // ========== FONCTIONS DE VALIDATION ==========
    /**
     * Validation en temps réel du prénom
     */
    const validateFirstName = (firstName: string) => {
        if (!firstName) {
            setFirstNameError("Le prénom est requis");
            return false;
        }
        if (firstName.length < 2) {
            setFirstNameError("Minimum 2 caractères requis");
            return false;
        }
        setFirstNameError("");
        return true;
    };

    /**
     * Validation en temps réel du nom
     */
    const validateLastName = (lastName: string) => {
        if (!lastName) {
            setLastNameError("Le nom est requis");
            return false;
        }
        if (lastName.length < 2) {
            setLastNameError("Minimum 2 caractères requis");
            return false;
        }
        setLastNameError("");
        return true;
    };

    /**
     * Validation en temps réel de l'email
     */
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError("L'email est requis");
            return false;
        }
        if (!emailRegex.test(email)) {
            setEmailError("Format d'email invalide");
            return false;
        }
        setEmailError("");
        return true;
    };

    /**
     * Validation en temps réel du mot de passe avec calcul de force
     */
    const validatePassword = (password: string) => {
        if (!password) {
            setPasswordError("Le mot de passe est requis");
            setPasswordStrength(0);
            return false;
        }
        
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[a-z]/.test(password)) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        
        setPasswordStrength(strength);
        
        if (password.length < 6) {
            setPasswordError("Minimum 6 caractères requis");
            return false;
        }
        setPasswordError("");
        return true;
    };

    /**
     * Fonction pour obtenir la couleur de l'indicateur de force
     */
    const getPasswordStrengthColor = () => {
        if (passwordStrength < 25) return 'error';
        if (passwordStrength < 50) return 'warning';
        if (passwordStrength < 75) return 'info';
        return 'success';
    };

    /**
     * Fonction pour obtenir le texte de l'indicateur de force
     */
    const getPasswordStrengthText = () => {
        if (passwordStrength < 25) return 'Faible';
        if (passwordStrength < 50) return 'Moyen';
        if (passwordStrength < 75) return 'Bon';
        return 'Excellent';
    };

    /**
     * Gestionnaire pour basculer l'affichage du mot de passe
     */
    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };    

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
        // Démarrage du loading
        setIsLoading(true);
        setError("");
        
        // Récupération des valeurs des champs via les références
        const firstName = firstNameRef.current?.value;
        const lastName = lastNameRef.current?.value;
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;

        // Validation complète avant soumission
        const isFirstNameValid = validateFirstName(firstName || "");
        const isLastNameValid = validateLastName(lastName || "");
        const isEmailValid = validateEmail(email || "");
        const isPasswordValid = validatePassword(password || "");

        if (!isFirstNameValid || !isLastNameValid || !isEmailValid || !isPasswordValid) {
            setError("Veuillez corriger les erreurs dans le formulaire");
            setIsLoading(false);
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
                setIsLoading(false);
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
                setIsLoading(false);
                return;
            }
            
            // Connexion automatique de l'utilisateur avec ses identifiants
            if (email && token) {
                login(email, token);
                navigate("/"); // Redirection vers la page d'accueil après connexion réussie
            }

            console.log("Response from server:", responseData);
            setError(""); // Effacement des erreurs précédentes
            
            // Nettoyage du formulaire après inscription réussie
            if (firstNameRef.current) firstNameRef.current.value = "";
            if (lastNameRef.current) lastNameRef.current.value = "";
            if (emailRef.current) emailRef.current.value = "";
            if (passwordRef.current) passwordRef.current.value = "";
            
        } catch (err) {
            // Gestion des erreurs de réseau ou autres erreurs techniques
            setError("Erreur de connexion au serveur");
            console.error("Registration error:", err);
        } finally {
            setIsLoading(false);
        }
    }
    // ========== RENDU DE L'INTERFACE MODERNE ==========
    return (
        <>
            {/* CSS pour les animations et effets visuels */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                
                /* Animation du gradient de fond */
                @keyframes gradientMove {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                /* Animation de pulsation douce */
                @keyframes softPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }
                
                /* Animation de flottement */
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                
                /* Animation pour les champs de saisie */
                @keyframes inputFocus {
                    0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
                }
                
                /* Styles pour les champs avec focus animé */
                .animated-input .MuiOutlinedInput-root {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .animated-input .MuiOutlinedInput-root:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                }
                
                .animated-input .MuiOutlinedInput-root.Mui-focused {
                    animation: inputFocus 0.6s ease-out;
                    transform: translateY(-2px);
                    box-shadow: 0 12px 35px rgba(25, 118, 210, 0.2);
                }
                
                /* Style pour le bouton avec effet de vague */
                .wave-button {
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .wave-button:before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                    transition: left 0.5s;
                }
                
                .wave-button:hover:before {
                    left: 100%;
                }
                
                .wave-button:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 40px rgba(25, 118, 210, 0.4);
                }
                
                /* Animation de shake pour les erreurs */
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
                    20%, 40%, 60%, 80% { transform: translateX(10px); }
                }
                
                .error-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>

            {/* Container principal avec gradient animé */}
            <Box sx={{
                minHeight: '100vh',
                background: 'linear-gradient(-45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
                backgroundSize: '400% 400%',
                animation: 'gradientMove 15s ease infinite',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 2,
                fontFamily: 'Inter, sans-serif'
            }}>
                {/* Card principale avec effet glassmorphism */}
                <Slide direction="up" in={true} timeout={800} key={animationKey}>
                    <Paper elevation={0} sx={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '20px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: { xs: 3, sm: 4, md: 5 },
                        width: '100%',
                        maxWidth: 450,
                        position: 'relative',
                        overflow: 'hidden',
                        animation: 'float 6s ease-in-out infinite',
                        '&:before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '1px',
                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
                        },
                        '&:hover': {
                            transform: 'translateY(-5px)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                        }
                    }}>
                        {/* En-tête avec titre et sous-titre */}
                        <Fade in={true} timeout={1000}>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography variant="h4" sx={{
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    backgroundClip: 'text',
                                    textFillColor: 'transparent',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 1,
                                    fontFamily: 'Inter, sans-serif'
                                }}>
                                    Créer un Compte
                                </Typography>
                                <Typography variant="body1" sx={{
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    fontWeight: 400
                                }}>
                                    Rejoignez notre communauté dès aujourd'hui
                                </Typography>
                            </Box>
                        </Fade>

                        {/* Formulaire d'inscription */}
                        <Box component="form" sx={{ width: '100%' }}>
                            {/* Ligne pour prénom et nom */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                {/* Champ Prénom */}
                                <Fade in={true} timeout={1200}>
                                    <Box className="animated-input" sx={{ flex: 1 }}>
                                        <TextField
                                            inputRef={firstNameRef}
                                            label="Prénom"
                                            variant="outlined"
                                            fullWidth
                                            error={!!firstNameError}
                                            helperText={firstNameError}
                                            onChange={(e) => validateFirstName(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '12px',
                                                    '& fieldset': {
                                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#667eea',
                                                        borderWidth: '2px',
                                                    },
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                },
                                                '& .MuiInputBase-input': {
                                                    color: 'white',
                                                },
                                                '& .MuiFormHelperText-root': {
                                                    color: '#ff6b6b',
                                                    fontWeight: 500,
                                                }
                                            }}
                                        />
                                    </Box>
                                </Fade>

                                {/* Champ Nom */}
                                <Fade in={true} timeout={1400}>
                                    <Box className="animated-input" sx={{ flex: 1 }}>
                                        <TextField
                                            inputRef={lastNameRef}
                                            label="Nom"
                                            variant="outlined"
                                            fullWidth
                                            error={!!lastNameError}
                                            helperText={lastNameError}
                                            onChange={(e) => validateLastName(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '12px',
                                                    '& fieldset': {
                                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#667eea',
                                                        borderWidth: '2px',
                                                    },
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                },
                                                '& .MuiInputBase-input': {
                                                    color: 'white',
                                                },
                                                '& .MuiFormHelperText-root': {
                                                    color: '#ff6b6b',
                                                    fontWeight: 500,
                                                }
                                            }}
                                        />
                                    </Box>
                                </Fade>
                            </Box>

                            {/* Champ Email */}
                            <Fade in={true} timeout={1600}>
                                <Box className="animated-input" sx={{ mb: 3 }}>
                                    <TextField
                                        inputRef={emailRef}
                                        label="Adresse email"
                                        variant="outlined"
                                        fullWidth
                                        error={!!emailError}
                                        helperText={emailError}
                                        onChange={(e) => validateEmail(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                borderRadius: '12px',
                                                '& fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#667eea',
                                                    borderWidth: '2px',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: 'rgba(255, 255, 255, 0.7)',
                                            },
                                            '& .MuiInputBase-input': {
                                                color: 'white',
                                            },
                                            '& .MuiFormHelperText-root': {
                                                color: '#ff6b6b',
                                                fontWeight: 500,
                                            }
                                        }}
                                    />
                                </Box>
                            </Fade>

                            {/* Champ Mot de passe */}
                            <Fade in={true} timeout={1800}>
                                <Box className="animated-input" sx={{ mb: 2 }}>
                                    <TextField
                                        inputRef={passwordRef}
                                        label="Mot de passe"
                                        type={showPassword ? 'text' : 'password'}
                                        variant="outlined"
                                        fullWidth
                                        error={!!passwordError}
                                        helperText={passwordError}
                                        onChange={(e) => validatePassword(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={handleTogglePasswordVisibility}
                                                        edge="end"
                                                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                                    >
                                                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                borderRadius: '12px',
                                                '& fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#667eea',
                                                    borderWidth: '2px',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: 'rgba(255, 255, 255, 0.7)',
                                            },
                                            '& .MuiInputBase-input': {
                                                color: 'white',
                                            },
                                            '& .MuiFormHelperText-root': {
                                                color: '#ff6b6b',
                                                fontWeight: 500,
                                            }
                                        }}
                                    />
                                </Box>
                            </Fade>

                            {/* Indicateur de force du mot de passe */}
                            {passwordStrength > 0 && (
                                <Fade in={true} timeout={300}>
                                    <Box sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                                Force du mot de passe
                                            </Typography>
                                            <Typography variant="body2" sx={{ 
                                                color: getPasswordStrengthColor() === 'error' ? '#ff6b6b' :
                                                       getPasswordStrengthColor() === 'warning' ? '#ffa726' :
                                                       getPasswordStrengthColor() === 'info' ? '#42a5f5' : '#66bb6a',
                                                fontWeight: 600
                                            }}>
                                                {getPasswordStrengthText()}
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={passwordStrength}
                                            color={getPasswordStrengthColor()}
                                            sx={{
                                                height: 6,
                                                borderRadius: 3,
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: 3,
                                                }
                                            }}
                                        />
                                    </Box>
                                </Fade>
                            )}

                            {/* Message d'erreur global */}
                            {error && (
                                <Fade in={true} timeout={300}>
                                    <Alert 
                                        severity="error" 
                                        className="error-shake"
                                        sx={{ 
                                            mb: 3,
                                            background: 'rgba(244, 67, 54, 0.1)',
                                            color: '#ff6b6b',
                                            border: '1px solid rgba(244, 67, 54, 0.3)',
                                            borderRadius: '12px',
                                            '& .MuiAlert-icon': {
                                                color: '#ff6b6b'
                                            }
                                        }}
                                    >
                                        {error}
                                    </Alert>
                                </Fade>
                            )}

                            {/* Bouton de soumission */}
                            <Fade in={true} timeout={2000}>
                                <Button
                                    onClick={onSubmit}
                                    disabled={isLoading}
                                    className="wave-button"
                                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
                                    sx={{
                                        width: '100%',
                                        py: 1.5,
                                        mb: 3,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        borderRadius: '12px',
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        textTransform: 'none',
                                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                        },
                                        '&:disabled': {
                                            background: 'rgba(255, 255, 255, 0.3)',
                                            color: 'rgba(255, 255, 255, 0.5)',
                                        }
                                    }}
                                >
                                    {isLoading ? 'Création en cours...' : 'Créer mon compte'}
                                </Button>
                            </Fade>

                            {/* Lien vers la page de connexion */}
                            <Fade in={true} timeout={2200}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        Déjà un compte ?{' '}
                                        <Box 
                                            component="span" 
                                            onClick={() => navigate('/login')}
                                            sx={{
                                                color: '#667eea',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                textDecoration: 'underline',
                                                '&:hover': {
                                                    color: '#5a67d8',
                                                }
                                            }}
                                        >
                                            Se connecter
                                        </Box>
                                    </Typography>
                                </Box>
                            </Fade>
                        </Box>
                    </Paper>
                </Slide>
            </Box>
        </>
    );  
}

export default RegisterPage;
