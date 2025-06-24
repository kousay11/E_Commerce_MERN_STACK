import {Request} from 'express';
// Cette interface étend l'interface Request d'Express pour y ajouter une propriété 'user'.
// Cela permet d'attacher l'utilisateur authentifié à la requête après validation du JWT.
export interface ExtendRequest extends Request {
    user?: any;
}