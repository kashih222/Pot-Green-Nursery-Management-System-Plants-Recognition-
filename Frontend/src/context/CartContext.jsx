import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import axios from 'axios';
import { useAuth } from '../components/auth/AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const auth = useAuth();
  const user = auth?.currentUser;
  const token = auth?.token;
  
  const [cart, setCart] = useState({
    items: [],
    totalItems: 0,
    totalPrice: 0,
    loading: false,
    error: null
  });

  const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

  const fetchCart = useCallback(async () => {
    // If auth is not available yet, don't fetch cart
    if (!auth) {
      setCart({
        items: [],
        totalItems: 0,
        totalPrice: 0,
        loading: false,
        error: null
      });
      return;
    }
    
    if (!user?._id || !token) {
      setCart({
        items: [],
        totalItems: 0,
        totalPrice: 0,
        loading: false,
        error: null
      });
      return;
    }

    setCart(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await axios.get(`${API_BASE_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      setCart({
        items: response.data.items || [],
        totalItems: response.data.totalItems || 0,
        totalPrice: response.data.totalPrice || 0,
        loading: false,
        error: null
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load cart';
      console.error('Fetch cart error:', errorMessage, err);
      setCart(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, [auth, user?._id, token]);

  const addToCart = async (productId, quantity = 1, size) => {
    // If auth is not available yet, return error
    if (!auth) {
      return { success: false, error: "Authentication not available" };
    }
    
    console.log('CartContext - Current user:', user);
    console.log('CartContext - Current token:', token);
    
    // Check both state and localStorage for authentication
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (!user?._id || !token || !storedToken || !storedUser) {
      console.log('CartContext - Authentication check failed:', { 
        user, 
        token, 
        storedToken: !!storedToken, 
        storedUser: !!storedUser 
      });
      return { success: false, error: "Please login to add items to cart" };
    }

    if (!productId || !size) {
      console.log('CartContext - Missing required parameters:', { productId, size });
      return { success: false, error: "Product ID and size are required" };
    }

    setCart(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('CartContext - Making API request to add to cart:', {
        productId,
        quantity,
        size,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await axios.post(
        `${API_BASE_URL}/cart`,
        { productId, quantity, size },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      console.log('CartContext - Add to cart response:', response.data);
      
      if (response.data?.success) {
        setCart({
          items: response.data.cart.items || [],
          totalItems: response.data.cart.totalItems || 0,
          totalPrice: response.data.cart.totalPrice || 0,
          loading: false,
          error: null
        });
        return { success: true };
      } else {
        throw new Error(response.data?.message || 'Failed to add to cart');
      }
    } catch (err) {
      console.error('CartContext - Add to cart error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add to cart';
      
      // If unauthorized, clear cart and return error
      if (err.response?.status === 401) {
        setCart({
          items: [],
          totalItems: 0,
          totalPrice: 0,
          loading: false,
          error: "Please login to add items to cart"
        });
      } else {
        setCart(prev => ({
          ...prev,
          loading: false,
          error: errorMessage
        }));
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const updateQuantity = async (itemId, newQuantity, size) => {
    if (!auth) {
      return { success: false, error: "Authentication not available" };
    }
    
    if (!user?._id || !token) {
      return { success: false, error: "Not authenticated" };
    }

    if (!itemId || !newQuantity) {
      return { success: false, error: "Item ID and quantity are required" };
    }

    if (newQuantity < 1) {
      return removeFromCart(itemId);
    }

    setCart(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await axios.put(
        `${API_BASE_URL}/cart/update`,
        { itemId, quantity: newQuantity, size },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      setCart({
        items: response.data.cart.items || [],
        totalItems: response.data.cart.totalItems || 0,
        totalPrice: response.data.cart.totalPrice || 0,
        loading: false,
        error: null
      });
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update cart item';
      console.error('Update cart error:', errorMessage, err);
      setCart(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  };

  const removeFromCart = async (productId) => {
    if (!auth) {
      return { success: false, error: "Authentication not available" };
    }
    
    if (!user?._id || !token) {
      return { success: false, error: "Not authenticated" };
    }

    setCart(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/cart/${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      setCart({
        items: response.data.items || [],
        totalItems: response.data.totalItems || 0,
        totalPrice: response.data.totalPrice || 0,
        loading: false,
        error: null
      });
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove from cart';
      console.error('Remove from cart error:', errorMessage, err);
      setCart(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  };

  const clearCart = async () => {
    if (!auth) {
      return { success: false, error: "Authentication not available" };
    }
    
    if (!user?._id || !token) {
      return { success: false, error: "Not authenticated" };
    }

    setCart(prev => ({ ...prev, loading: true, error: null }));

    try {
      await axios.delete(
        `${API_BASE_URL}/cart/clear`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      setCart({
        items: [],
        totalItems: 0,
        totalPrice: 0,
        loading: false,
        error: null
      });

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to clear cart';
      console.error('Clear cart error:', errorMessage, err);
      setCart(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <CartContext.Provider value={{ 
      cart, 
      fetchCart, 
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      loading: cart.loading,
      error: cart.error
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
