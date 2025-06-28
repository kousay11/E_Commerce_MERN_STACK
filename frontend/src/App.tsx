import { BrowserRouter, Route, Routes } from "react-router-dom"
import HomePage from "./pages/HomePage"
import Navbar from "./components/Navbar"
import RegisterPage from "./pages/RegisterPage"
import AuthProvider from "./context/Auth/AuthProvider"
import LoginPage from "./pages/LoginPage"
import CartPage from "./pages/CartPage"
import ProtectedRoute from "./components/ProtectedRoute"
function App() {

  return (
  <AuthProvider>
   <BrowserRouter>
   <Navbar />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/Register" element={<RegisterPage />} />
      <Route path="/Login" element={<LoginPage />} />
      {/* Route protégée pour le panier */}
      {<Route path="/Cart" element={<ProtectedRoute><CartPage/></ProtectedRoute>} /> }
      {/* Ajoutez d'autres routes ici si nécessaire */}    
    </Routes>
   </BrowserRouter>
   </AuthProvider>

      
  )
}

export default App
