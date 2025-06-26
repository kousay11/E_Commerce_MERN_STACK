import mongoose,{ Schema,Document } from 'mongoose';


export interface IUser extends Document{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}
const userSchema = new Schema<IUser>({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

export const UserModel = mongoose.model<IUser>('User', userSchema);