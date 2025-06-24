import mongoose,{ Schema,Document } from 'mongoose';
import productModel from '../models/productModel';

export const getAllProducts = async () => {
    try {
        const products = await productModel.find({});
        return products;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error('Error fetching products: ' + error.message);
        } else {
            throw new Error('Error fetching products: ' + String(error));
        }
    }
}
export const seedInitialProducts = async () => {
    const initialProducts = [
        { title: 'Laptop hp', image: 'https://i5.walmartimages.com/seo/HP-15-6-Ryzen-5-8GB-256GB-Laptop-Rose-Gold_36809cf3-480b-47a5-94f0-e1d5e70c58c0_3.fcc0d6494b0e279a13c32c80c28abfa3.jpeg', price: 10000, stock: 10 },
       
    ];

    const products = await getAllProducts();
    if (products.length === 0) {
        await productModel.insertMany(initialProducts);
    }
}

