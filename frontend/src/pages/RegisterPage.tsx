import Box  from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import TextField  from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useRef, useState } from "react";
import { Base_URL } from "../constants/baseUrl";

const RegisterPage = () => {
    const [error, setError] = useState("");
    const firstNameRef = useRef<HTMLInputElement>(null);
    const lastNameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);  
    const passwordRef = useRef<HTMLInputElement>(null);


    const onSubmit = async() => {
        const firstName = firstNameRef.current?.value;
        const lastName = lastNameRef.current?.value;
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;

        // Validation des champs
        if (!firstName || !lastName || !email || !password) {
            setError("Tous les champs sont obligatoires");
            return;
        }

        try {
            //Make API call to register the user
            const response = await fetch(`${Base_URL}/user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({firstName, lastName, email, password }),
            });

            if(!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || errorData.error || "Erreur lors de l'inscription");
                return;
            }

            const data = await response.json();
            console.log("Response from server:", data);
            setError(""); // Clear error on success
            alert("Inscription réussie !");
            
            // Clear form fields
            if (firstNameRef.current) firstNameRef.current.value = "";
            if (lastNameRef.current) lastNameRef.current.value = "";
            if (emailRef.current) emailRef.current.value = "";
            if (passwordRef.current) passwordRef.current.value = "";
        } catch (err) {
            setError("Erreur de connexion au serveur");
            console.error("Registration error:", err);
        }
    }
    return (
        <Container>
            <Box sx={{ display: 'flex',
                 alignItems: 'center',
                    flexDirection: 'column',
                  justifyContent: 'center',
                  mt: 4}}>
                <Typography variant="h6">Register New Account</Typography> 
                <Box  sx={{ display: 'flex',
                     flexDirection: 'column',
                      width: '300px',
                      border: '1px solid #ccc',
                      padding: '16px',
                      borderColor : '#f5f5f5'}}>
                    <TextField
                        inputRef={firstNameRef} 
                        label="First Name" 
                        variant="outlined" 
                        fullWidth 
                        margin="normal"
                    />
                    <TextField
                        inputRef={lastNameRef} 
                        label="Last Name" 
                        variant="outlined" 
                        fullWidth 
                        margin="normal" 
                    />
                    <TextField 
                        inputRef={emailRef}
                        label="Email" 
                        variant="outlined" 
                        fullWidth 
                        margin="normal" 
                    />
                    <TextField 
                        inputRef={passwordRef}
                        label="Password" 
                        type="password" 
                        variant="outlined" 
                        fullWidth 
                        margin="normal" 
                    />
                    <Button onClick={onSubmit} variant="contained" color="primary" fullWidth>Register</Button>
                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>
                    )}
                </Box>
            </Box>
        </Container>  
    );  
}

export default RegisterPage;