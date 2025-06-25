import { UserModel } from "../models/userModel";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface RegisterParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
export const registerUser = async ({firstName,lastName,email,password}: RegisterParams) => {
    try {
        const findUser = await UserModel.findOne({email : email});
        if (findUser) {
            return {data:"User already exists",statusCode:400};
        }
        const newuser = new UserModel({
            firstName,
            lastName,
            email,
            // Hash the password before saving it
            password: await bcrypt.hash(password, 10) // Hashing the password with a salt rounds(nb of encryption) of 10
        });
        await newuser.save();
        return {data: generateJWT({firstName,lastName,email}),statusCode:200};  
    } catch (error) {
        return {data: 'Erreur lors de l\'inscription', statusCode: 500, error};
    }
 }
 interface LogInParams {
    email: string;
    password: string;
}
 export const logInUser = async ({email,password}:LogInParams) => {
    try {
        const finduser = await UserModel.findOne({ email });
        if (!finduser) {
            return {data:"incorrect email or password",statusCode:400};
        }  
        const isPasswordCorrect = bcrypt.compareSync(password, finduser.password);
        if(isPasswordCorrect) {
            return {data: generateJWT({firstName:finduser.firstName,lastName:finduser.lastName,email}),statusCode:200}; // Return the user data if login is successful
        }
        else {
            return {data:"incorrect email or password",statusCode:400};
        } 
    } catch (error) {
        return {data: 'Erreur lors de la connexion', statusCode: 500, error};
    }
}         
const generateJWT = (data: any) => {
    return jwt.sign(data, process.env.JWT_SECRET ||
        '0nTquJhcLzE6a3K8WEMkcBb54U1rZAbe', { expiresIn: '1h' });
}