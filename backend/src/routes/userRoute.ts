import express from 'express';
import { logInUser, registerUser } from '../services/userService';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const {firstName,lastName,email,password} = req.body;
        const result = await registerUser({firstName,lastName,email,password});
        if ('statusCode' in result && 'data' in result) {
            res.status(result.statusCode).json({ message: result.data });
        } else {
            // Assuming result is a user document, send a success response
            res.status(201).json({ message: "User registered successfully", user: result });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error during registration' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const {email,password} = req.body; 
        const {statusCode,data} = await logInUser({email,password});  
        res.status(statusCode).json({ message: data });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error during login' });
    }    
});

export default router;