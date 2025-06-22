import express from "express";
import mongoose from "mongoose";
import userRoute from "./routes/userRoute";


const app = express();
const port = 3000;
app.use(express.json());

app.use('/user', userRoute)//Elle dit à Express : Pour chaque requête HTTP
//  qui commence par /user, utilise ce routeur (userRoute) pour traiter la suite de l'URL. 

mongoose
  .connect("mongodb://localhost:27017/ecommerce")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
