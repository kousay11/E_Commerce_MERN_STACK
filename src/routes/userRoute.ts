import express from 'express';
import { logInUser, registerUser } from '../services/userService';

const router = express.Router();

router.post('/register', async (req, res) => {
    const {firstName,lastName,email,password} = req.body;
    const result = await registerUser({firstName,lastName,email,password});
    if ('statusCode' in result && 'data' in result) {
        res.status(result.statusCode).send(result.data);
    } else {
        // Assuming result is a user document, send a success response
        res.status(201).send(result);
    }
    });
router.post('/login', async (req, res) => {
    const {email,password} = req.body; 
    const {statusCode,data} = await logInUser({email,password});  
    res.status(statusCode).send(data);  
});

export default router;