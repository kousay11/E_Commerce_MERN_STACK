/**
 * LoginPage.tsx - Page de connexion moderne avec animations
 * 
 * FONCTIONNALITÉS:
 * - Interface moderne avec animations CSS fluides
 * - Formulaire de connexion avec validation en temps réel
 * - Effets visuels inspirés des designs CodePen
 * - Authentification utilisateur via API
 * - Gestion des erreurs avec feedback visuel
 * - Responsive design pour tous les écrans
 * 
 * DESIGN:
 * - Card flottante avec glassmorphism
 * - Animations d'entrée et de hover
 * - Gradient de fond animé
 * - Champs de saisie avec effets focus
 * - Boutons avec transitions smooth
 */

// Imports des composants Material-UI pour l'interface utilisateur
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Fade from "@mui/material/Fade";
import Slide from "@mui/material/Slide";
// Icons Material-UI
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";
// Hooks React pour la gestion d'état et les références DOM
import { useRef, useState } from "react";
// URL de base du serveur backend
import { Base_URL } from "../constants/baseUrl";
// Hook d'authentification pour gérer la connexion
import { useAuthContext } from "../context/Auth/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * Composant LoginPage - Page de connexion moderne et animée
 * 
 * Cette nouvelle version propose :
 * - Design moderne avec effets glassmorphism
 * - Animations fluides d'entrée et d'interaction
 * - Validation en temps réel avec feedback visuel
 * - Interface responsive et accessible
 * - Gestion avancée des erreurs avec alerts stylisées
 * - Effets hover et focus sophistiqués
 */
const LoginPage = () => {
    // ========== ÉTATS DE GESTION ==========
    // État pour gérer les messages d'erreur
    const [error, setError] = useState("");
    // État pour gérer l'affichage du mot de passe
    const [showPassword, setShowPassword] = useState(false);
    // État pour gérer le loading pendant la connexion
    const [isLoading, setIsLoading] = useState(false);
    // États pour la validation en temps réel
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    // État pour contrôler les animations d'entrée
    const [animationKey, setAnimationKey] = useState(0);
    
    // Références pour accéder directement aux valeurs des champs du formulaire
    const emailRef = useRef<HTMLInputElement>(null);  
    const passwordRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate();

    // Récupération de la fonction login depuis le contexte d'authentification
    const {login} = useAuthContext();

    // ========== FONCTIONS DE VALIDATION ==========
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
     * Validation en temps réel du mot de passe
     */
    const validatePassword = (password: string) => {
        if (!password) {
            setPasswordError("Le mot de passe est requis");
            return false;
        }
        // if (password.length < 6) {
        //     setPasswordError("Minimum 6 caractères requis");
        //     return false;
        // }
        setPasswordError("");
        return true;
    };

    /**
     * Gestionnaire pour basculer l'affichage du mot de passe
     */
    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };    

    /**
     * Fonction de soumission du formulaire de connexion améliorée
     * 
     * Nouvelles fonctionnalités :
     * - Validation en temps réel avec feedback visuel
     * - Animation de loading pendant la requête
     * - Gestion d'erreurs améliorée avec alerts stylisées
     * - Reset automatique des erreurs
     * - Feedback utilisateur optimisé
     */
    const onSubmit = async() => {
        // Récupération des valeurs des champs via les références
        const email = emailRef.current?.value || "";
        const password = passwordRef.current?.value || "";

        // Reset des erreurs précédentes
        setError("");
        setEmailError("");
        setPasswordError("");

        // Validation côté client avec feedback visuel
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);

        if (!isEmailValid || !isPasswordValid) {
            // Déclencher une animation pour attirer l'attention sur les erreurs
            setAnimationKey(prev => prev + 1);
            return;
        }

        // Démarrage du loading
        setIsLoading(true);

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
                setError(errorData.message || errorData.error || "Impossible de se connecter, veuillez réessayer plus tard");
                return;
            }

            // Parse de la réponse JSON du serveur
            const responseData = await response.json();
            console.log("Full response data:", responseData);
            
            // Gestion flexible du token selon le format de réponse
            let token = null;
            
            // Si c'est directement un string (ancien format)
            if (typeof responseData === 'string') {
                token = responseData;
            }
            // Si c'est un objet avec différents champs possibles
            else if (typeof responseData === 'object') {
                if (responseData.message && typeof responseData.message === 'string') {
                    // Vérifier si le message est un token JWT ou un message d'erreur
                    if (responseData.message.includes('.') && responseData.message.split('.').length === 3) {
                        // Probablement un JWT token (format: header.payload.signature)
                        token = responseData.message;
                    } else {
                        // Probablement un message d'erreur
                        setError(responseData.message);
                        return;
                    }
                } else if (responseData.token) {
                    token = responseData.token;
                } else if (responseData.data) {
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
            
            // Nettoyage du formulaire après connexion réussie
            if (emailRef.current) emailRef.current.value = "";
            if (passwordRef.current) passwordRef.current.value = "";
            
        } catch (err) {
            // Gestion des erreurs de réseau ou autres erreurs techniques
            setError("Erreur de connexion au serveur");
            console.error("Login error:", err);
        } finally {
            // Arrêt du loading dans tous les cas
            setIsLoading(false);
        }
    }
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    animation: 'float 20s ease-in-out infinite',
                },
                '@keyframes float': {
                    '0%, 100%': { transform: 'translateX(0px)' },
                    '50%': { transform: 'translateX(20px)' },
                },
            }}
        >
            <Container maxWidth="sm">
                <Slide direction="up" in={true} timeout={800}>
                    <Paper
                        elevation={24}
                        sx={{
                            padding: { xs: 3, sm: 5 },
                            borderRadius: 4,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: 'linear-gradient(90deg, #667eea, #764ba2, #667eea)',
                                animation: 'shimmer 3s ease-in-out infinite',
                            },
                            '@keyframes shimmer': {
                                '0%, 100%': { transform: 'translateX(-100%)' },
                                '50%': { transform: 'translateX(100%)' },
                            },
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 35px 60px rgba(0, 0, 0, 0.2)',
                            },
                        }}
                    >
                        {/* En-tête avec animation */}
                        <Fade in={true} timeout={1200}>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 20px',
                                        animation: 'pulse 2s ease-in-out infinite',
                                        '@keyframes pulse': {
                                            '0%, 100%': { transform: 'scale(1)' },
                                            '50%': { transform: 'scale(1.05)' },
                                        },
                                    }}
                                >
                                    <LoginIcon sx={{ fontSize: 40, color: 'white' }} />
                                </Box>
                                <Typography 
                                    variant="h4" 
                                    component="h1"
                                    sx={{ 
                                        fontWeight: 700,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        mb: 1,
                                    }}
                                >
                                    Connexion
                                </Typography>
                                <Typography 
                                    variant="body1" 
                                    sx={{ 
                                        color: 'text.secondary',
                                        opacity: 0.8,
                                    }}
                                >
                                    Accédez à votre compte
                                </Typography>
                            </Box>
                        </Fade>

                        {/* Affichage des erreurs globales */}
                        {error && (
                            <Fade in={true} timeout={500} key={`error-${animationKey}`}>
                                <Alert 
                                    severity="error" 
                                    sx={{ 
                                        mb: 3,
                                        borderRadius: 2,
                                        animation: 'shake 0.5s ease-in-out',
                                        '@keyframes shake': {
                                            '0%, 100%': { transform: 'translateX(0)' },
                                            '25%': { transform: 'translateX(-5px)' },
                                            '75%': { transform: 'translateX(5px)' },
                                        },
                                    }}
                                >
                                    {error}
                                </Alert>
                            </Fade>
                        )}

                        {/* Formulaire avec animations */}
                        <Box component="form" sx={{ mt: 2 }}>
                            {/* Champ Email avec icône et validation */}
                            <Fade in={true} timeout={1400}>
                                <TextField 
                                    inputRef={emailRef}
                                    label="Adresse email" 
                                    variant="outlined" 
                                    fullWidth 
                                    margin="normal"
                                    type="email"
                                    error={!!emailError}
                                    helperText={emailError}
                                    onChange={(e) => validateEmail(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon sx={{ color: 'primary.main' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            transition: 'all 0.3s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)',
                                            },
                                            '&.Mui-focused': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.25)',
                                            },
                                        },
                                    }}
                                />
                            </Fade>

                            {/* Champ Mot de passe avec toggle visibility */}
                            <Fade in={true} timeout={1600}>
                                <TextField 
                                    inputRef={passwordRef}
                                    label="Mot de passe" 
                                    type={showPassword ? "text" : "password"}
                                    variant="outlined" 
                                    fullWidth 
                                    margin="normal"
                                    error={!!passwordError}
                                    helperText={passwordError}
                                    onChange={(e) => validatePassword(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon sx={{ color: 'primary.main' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={handleTogglePasswordVisibility}
                                                    edge="end"
                                                    sx={{ 
                                                        transition: 'all 0.2s ease-in-out',
                                                        '&:hover': {
                                                            transform: 'scale(1.1)',
                                                        },
                                                    }}
                                                >
                                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            transition: 'all 0.3s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)',
                                            },
                                            '&.Mui-focused': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.25)',
                                            },
                                        },
                                    }}
                                />
                            </Fade>

                            {/* Bouton de connexion avec animation */}
                            <Fade in={true} timeout={1800}>
                                <Button 
                                    onClick={onSubmit} 
                                    variant="contained" 
                                    fullWidth
                                    disabled={isLoading}
                                    sx={{ 
                                        mt: 3, 
                                        mb: 2,
                                        py: 1.5,
                                        borderRadius: 2,
                                        fontWeight: 600,
                                        fontSize: '1.1rem',
                                        textTransform: 'none',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease-in-out',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: '-100%',
                                            width: '100%',
                                            height: '100%',
                                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                            transition: 'left 0.5s ease-in-out',
                                        },
                                        '&:hover': {
                                            transform: 'translateY(-3px)',
                                            boxShadow: '0 15px 35px rgba(102, 126, 234, 0.4)',
                                            '&::before': {
                                                left: '100%',
                                            },
                                        },
                                        '&:active': {
                                            transform: 'translateY(-1px)',
                                        },
                                        '&:disabled': {
                                            background: 'linear-gradient(135deg, #ccc 0%, #999 100%)',
                                            transform: 'none',
                                            boxShadow: 'none',
                                        },
                                    }}
                                >
                                    {isLoading ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 20,
                                                    height: 20,
                                                    border: '2px solid rgba(255,255,255,0.3)',
                                                    borderTop: '2px solid white',
                                                    borderRadius: '50%',
                                                    animation: 'spin 1s linear infinite',
                                                    '@keyframes spin': {
                                                        '0%': { transform: 'rotate(0deg)' },
                                                        '100%': { transform: 'rotate(360deg)' },
                                                    },
                                                }}
                                            />
                                            Connexion en cours...
                                        </Box>
                                    ) : (
                                        'Se connecter'
                                    )}
                                </Button>
                            </Fade>

                            {/* Lien vers l'inscription */}
                            <Fade in={true} timeout={2000}>
                                <Box sx={{ textAlign: 'center', mt: 2 }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Pas encore de compte ?{' '}
                                        <Typography 
                                            component="span" 
                                            sx={{ 
                                                color: 'primary.main',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                textDecoration: 'none',
                                                position: 'relative',
                                                '&:hover': {
                                                    '&::after': {
                                                        width: '100%',
                                                    },
                                                },
                                                '&::after': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    bottom: -2,
                                                    left: 0,
                                                    width: 0,
                                                    height: 2,
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    transition: 'width 0.3s ease-in-out',
                                                },
                                            }}
                                            onClick={() => navigate('/register')}
                                        >
                                            S'inscrire ici
                                        </Typography>
                                    </Typography>
                                </Box>
                            </Fade>
                        </Box>
                    </Paper>
                </Slide>
            </Container>
        </Box>
    );  
}

export default LoginPage;
