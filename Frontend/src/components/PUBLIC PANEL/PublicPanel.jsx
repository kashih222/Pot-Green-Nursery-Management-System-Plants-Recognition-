import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Plants from "./Pages/Plantspage/Plants";
import Home from "./Home";
import Services from "./Services";
import AboutUs from "./AboutUs";
import Popular from "./Popular";
import About from "./Pages/About/About";
import ServicesPage from "./Pages/Services/ServicesPage";
import PlantRecognition from "./Pages/Recognition/PlantRecognition";
import ScrollToTopButton from "./ScrollToTopButton";
import ScrollToTopOnRouteChange from "./ScrollToTopOnRouteChange";
import { CartProvider } from "../../context/CartContext";
import CheckOutForm from "./Pages/Checkout&cart/CheckoutForm";
import OrderHistory from "./Pages/OrderHistory";

const PublicPanel = () => {
  const location = useLocation(); 

  const hideHeaderFooter = location.pathname.startsWith("/dashboard");

  return (
    <CartProvider>
      <div>
        <ScrollToTopButton />
        <ScrollToTopOnRouteChange />

        {!hideHeaderFooter && <Navbar />} 
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Home />
                <AboutUs />
                <Popular />
                <Services />
              </>
            }
          />
          <Route path="/plants" element={<Plants />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/recognition" element={<PlantRecognition />} />
          <Route path="/checkout" element={<CheckOutForm/>} />
          <Route path="/orders" element={<OrderHistory />} />
        </Routes>

        {!hideHeaderFooter && <Footer />}
      </div>
    </CartProvider>
  );
};

export default PublicPanel;