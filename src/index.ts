import "dotenv/config"; // Importation de dotenv pour charger les variables d'environnement
import express from "express";
import mongoose from "mongoose";
import userRoute from "./routes/userRoute";
import productRoute from "./routes/productRoute";
import { seedInitialProducts } from "./services/productService";
import cartRoutes from "./routes/cartRoutes";


const app = express();
const port = 3000;
app.use(express.json());
//console.log(process.env.Database_URL);
app.use('/user', userRoute)//Elle dit à Express : Pour chaque requête HTTP
//  qui commence par /user, utilise ce routeur (userRoute) pour traiter la suite de l'URL. 
app.use("/product", productRoute); 
app.use("/cart",cartRoutes); // Importation et utilisation des routes du panier
mongoose
  .connect(process.env.Database_URL||'')
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
  // Seed the products to database
  seedInitialProducts();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
