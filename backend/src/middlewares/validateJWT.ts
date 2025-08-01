import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel';
import { ExtendRequest } from '../types/extensedRequest';



// Middleware pour valider le JWT et authentifier l'utilisateur
const validateJWT = async (req: ExtendRequest, res: Response, next: NextFunction): Promise<void> => {
    // Récupère l'en-tête d'autorisation
    const authorizationHeader = req.get('authorization');
    if (!authorizationHeader) {
        // Aucun token fourni
        res.status(403).json({ error: 'No token provided' });
        return;
    }

    // Extrait le token du header (format: Bearer <token>)
    const token = authorizationHeader.split(" ")[1];
    if (!token) {
        // Format de token invalide
        res.status(403).json({ error: 'Invalid token format' });
        return;
    }

    // Vérifie et décode le token JWT
    jwt.verify(token, process.env.JWT_SECRET ||
        '', async (err, payload) => {
        if (err) {
            // Token invalide ou expiré
            res.status(403).json({ error: 'Invalid token payload' });
            return;
        }
        if (!payload) {
            // Payload du token manquant
            res.status(403).json({ error: 'Invalid token payload' });
            return;
        }

        // Récupère les informations utilisateur du payload
        const userPayload = payload as { userId: string; firstName: string; lastName: string; email: string };
        // Recherche l'utilisateur dans la base de données
        const user = await UserModel.findOne({ email: userPayload.email });
        if (!user) {
            // Utilisateur non trouvé
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Ajoute l'utilisateur à l'objet requête pour les middlewares suivants
        req.user = user;
        next();
    })
};

export default validateJWT;
