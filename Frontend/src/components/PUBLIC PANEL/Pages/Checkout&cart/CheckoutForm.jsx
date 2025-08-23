import React, { useState, useEffect } from 'react';
import { FaUser, FaMapMarkerAlt, FaMobileAlt, FaLock, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../../../auth/AuthContext';
import { useCart } from '../../../../context/CartContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CheckoutForm = () => {
  const { currentUser, token } = useAuth();
  const { getCartTotal, clearCart } = useCart();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loadingCart, setLoadingCart] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'jazzcash',
    jazzcashNumber: '',
    easypaisaNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [productValidationError, setProductValidationError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || !token) {
      toast.error('Please login to access checkout');
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [currentUser, token, navigate]);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoadingCart(true);
        
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await axios.get('http://localhost:8020/api/cart', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data) {
          let cartItems = response.data.items || [];
          
          // Validate products but don't let validation errors block the checkout
          try {
            cartItems = await validateCartProducts(cartItems);
          } catch (validationError) {
            console.warn('Product validation warning:', validationError);
          }

          const formattedItems = cartItems.map(item => {
            let imageUrl = item.image || '';
            if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
              return {
                ...item,
                plantImage: imageUrl,
                plantName: item.name,
                _id: item.productId?._id || item._id,
              };
            }
            if (imageUrl) {
              imageUrl = imageUrl.replace(/^\//, '');
              if (!imageUrl.startsWith('uploads/')) {
                imageUrl = `uploads/${imageUrl}`;
              }
              imageUrl = `http://localhost:8020/${imageUrl}`;
            }
            return {
              ...item,
              plantImage: imageUrl,
              plantName: item.name,
              _id: item.productId?._id || item._id,
            };
          });

          setCartItems(formattedItems);
          setCartTotal(
            response.data.totalPrice ||
            formattedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
          );
        }
      } catch (error) {
        console.error('Error fetching cart items:', error);
        if (error.response?.status === 401 || error.message === 'Authentication required') {
          toast.error('Please login to view cart');
          navigate('/login', { state: { from: '/checkout' } });
        } else {
          toast.error('Failed to load cart items. Please try again.');
        }
      } finally {
        setLoadingCart(false);
      }
    };

    if (currentUser && token) {
      fetchCartItems();
    } else {
      setLoadingCart(false);
    }
  }, [currentUser, token, navigate]);

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        firstName: currentUser.firstName || currentUser.name?.split(' ')[0] || '',
        lastName: currentUser.lastName || currentUser.name?.split(' ')[1] || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address?.street || '',
        city: currentUser.address?.city || '',
        zipCode: currentUser.address?.zipCode || '',
      }));
    }
  }, [currentUser]);

  const validateCartProducts = async (items) => {
    if (!items || items.length === 0) {
      return items;
    }

    try {
      if (!token) {
        throw new Error('Authentication required');
      }

      // Extract just the product IDs
      const productIds = items.map(item => 
        item.productId?._id || item.productId || item._id
      ).filter(Boolean);

      if (productIds.length === 0) {
        throw new Error('No valid product IDs found in cart');
      }

      // Log the validation request for debugging
      console.log('Validation Request - Product IDs:', productIds);

      // Validate each product individually using the admin plants endpoint
      const stockResponse = await axios.get(
        'http://localhost:8020/api/admin/plants/all',
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!stockResponse.data.success) {
        throw new Error(stockResponse.data.message || 'Failed to validate products');
      }

      // Check if all products exist and have sufficient stock
      const availableProducts = stockResponse.data.data;
      const productMap = new Map(availableProducts.map(p => [p._id, p]));

      // Validate each cart item
      items.forEach(item => {
        const productId = item.productId?._id || item.productId || item._id;
        const product = productMap.get(productId);
        
        if (!product) {
          throw new Error(`Product ${productId} not found`);
        }

        const size = item.size || 'small'; // Default to small if size not specified
        if (!product.stockQuantity || !product.stockQuantity[size]) {
          throw new Error(`Invalid size ${size} for product ${product.plantName}`);
        }

        if (product.stockQuantity[size] < item.quantity) {
          throw new Error(`Insufficient stock for ${product.plantName} (${size})`);
        }
      });

      return items;
    } catch (error) {
      console.error('Product validation error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to validate products');
    }
  };

  const fetchCart = async () => {
    try {
      setLoadingCart(true);
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get('http://localhost:8020/api/cart', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        const formattedItems = response.data.items?.map(item => {
          let imageUrl = item.image || '';
          if (!imageUrl.startsWith('http')) {
            imageUrl = imageUrl.replace(/^\//, '');
            if (!imageUrl.startsWith('uploads/')) {
              imageUrl = `uploads/${imageUrl}`;
            }
            imageUrl = `http://localhost:8020/${imageUrl}`;
          }
          return {
            ...item,
            plantImage: imageUrl,
            plantName: item.name,
            _id: item.productId?._id || item._id,
          };
        }) || [];

        setCartItems(formattedItems);
        setCartTotal(
          response.data.totalPrice ||
          formattedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        );
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to refresh cart. Please try again.');
    } finally {
      setLoadingCart(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.zipCode) newErrors.zipCode = 'Zip code is required';

    // if (formData.paymentMethod === 'jazzcash' && !formData.jazzcashNumber) {
    //   newErrors.jazzcashNumber = 'JazzCash number is required';
    // }
    // if (formData.paymentMethod === 'easypaisa' && !formData.easypaisaNumber) {
    //   newErrors.easypaisaNumber = 'EasyPaisa number is required';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateCODCharges = () => {
    return formData.paymentMethod === 'cod' ? cartTotal * 0.02 : 0;
  };

  const calculateTotal = () => {
    const shippingFee = 200;
    const codCharges = calculateCODCharges();
    return cartTotal + shippingFee + codCharges;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    setLoading(true);
    setProductValidationError(null);

    try {
      if (!token || !currentUser?._id) {
        throw new Error('Authentication required');
      }

      // First validate cart items
      const validatedItems = await validateCartProducts(cartItems);

      if (!validatedItems || validatedItems.length === 0) {
        throw new Error('No items in cart');
      }

      // Format order items properly according to backend schema
      const items = cartItems.map(item => {
        // Clean up image paths
        const imagePath = item.image || item.plantImage;
        const cleanedImagePath = imagePath ? 
          imagePath.replace(/^http:\/\/localhost:8020\/uploads\//, '')
            .replace(/^uploads\//, '')
            .replace(/^\//, '') : null;

        return {
          product: item.productId?._id || item.productId || item._id,
          name: item.name || item.plantName,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
          size: item.size || 'small',
          image: cleanedImagePath,
          plantImage: cleanedImagePath
        };
      });

      // Calculate totals with precision
      const subtotal = parseFloat(cartTotal.toFixed(2));
      const shippingFee = 200;
      const codCharges = formData.paymentMethod === 'cod' ? parseFloat((subtotal * 0.02).toFixed(2)) : 0;
      const totalAmount = parseFloat((subtotal + shippingFee + codCharges).toFixed(2));

      // Format phone number to include country code if not present
      const formatPhoneNumber = (phone) => {
        if (!phone) return '';
        phone = phone.replace(/\s+/g, ''); // Remove spaces
        if (phone.startsWith('+')) return phone;
        if (phone.startsWith('0')) return '+92' + phone.substring(1);
        return '+92' + phone;
      };

      // Prepare order data with additional validation
      const orderData = {
        user: currentUser._id,
        items: items,
        shippingAddress: {
          street: formData.address.trim(),
          city: formData.city.trim(),
          zipCode: formData.zipCode.trim(),
          country: 'Pakistan'
        },
        userDetails: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formatPhoneNumber(formData.phone)
        },
        paymentMethod: formData.paymentMethod.toLowerCase(),
        paymentDetails: formData.paymentMethod !== 'cod' ? {
          number: formData.paymentMethod === 'jazzcash' ? 
            formatPhoneNumber(formData.jazzcashNumber) : 
            formatPhoneNumber(formData.easypaisaNumber)
        } : {},
        subtotal: parseFloat(cartTotal.toFixed(2)),
        shippingFee: 200,
        discount: 0,
        codCharges: formData.paymentMethod === 'cod' ? parseFloat((cartTotal * 0.02).toFixed(2)) : 0,
        totalAmount: parseFloat((cartTotal + 200 + (formData.paymentMethod === 'cod' ? cartTotal * 0.02 : 0)).toFixed(2)),
        status: 'pending',
        isPaid: false,
        isDelivered: false,
        currency: 'PKR'
      };

      // Additional validation
      if (!orderData.userDetails.phone.match(/^\+92\d{10}$/)) {
        throw new Error('Invalid phone number format. Please use format: 03XXXXXXXXX');
      }

      if (orderData.paymentMethod !== 'cod' && !orderData.paymentDetails.number.match(/^\+92\d{10}$/)) {
        throw new Error('Invalid payment number format. Please use format: 03XXXXXXXXX');
      }

      // Log the complete order data for debugging
      console.log('Submitting Order Data:', JSON.stringify(orderData, null, 2));

      try {
        // Create order with proper error handling
        const response = await axios.post(
          'http://localhost:8020/api/orders',
          orderData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            withCredentials: true
          }
        );

        if (response.data.success) {
          // Clear cart after successful order
          try {
            await axios.delete('http://localhost:8020/api/cart/clear', {
              headers: {
                'Authorization': `Bearer ${token}`
              },
              withCredentials: true
            });
            
            await clearCart();
            setOrderId(response.data.order._id);
            setOrderSuccess(true);
            toast.success('Order placed successfully!');
          } catch (error) {
            console.error('Error clearing cart:', error);
            // Even if cart clearing fails, order was successful
            setOrderId(response.data.order._id);
            setOrderSuccess(true);
            toast.success('Order placed successfully!');
          }
        } else {
          throw new Error(response.data.message || 'Failed to create order');
        }
      } catch (error) {
        console.error('Order Submission Failed:', error);
        
        // Log detailed error information
        if (error.response) {
          console.error('Error Response Data:', error.response.data);
          console.error('Error Response Status:', error.response.status);
          console.error('Error Response Headers:', error.response.headers);
          console.error('Full Error Object:', JSON.stringify(error.response.data, null, 2));
          
          // Log validation errors if present
          if (error.response.data.error?.errors) {
            console.error('Validation Errors:', error.response.data.error.errors);
          }

          // Check for specific error types
          if (error.response.data.error?.code === 11000) {
            throw new Error('A transaction with this ID already exists. Please try again.');
          }
        }
        
        throw error;
      }

    } catch (error) {
      console.error('Order Submission Failed:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('Error Response Data:', error.response.data);
        console.error('Error Response Status:', error.response.status);
        console.error('Error Response Headers:', error.response.headers);
        console.error('Full Error Object:', JSON.stringify(error.response.data, null, 2));
        
        // Log validation errors if present
        if (error.response.data.error?.errors) {
          console.error('Validation Errors:', error.response.data.error.errors);
        }
      }
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Failed to place order. Please try again.';
      
      if (error.response?.status === 401 || error.message === 'Authentication required') {
        navigate('/login', { state: { from: '/checkout' } });
        toast.error('Please login to place an order');
      } else if (errorMessage.includes('out of stock')) {
        setProductValidationError('Some items in your cart are out of stock. Please review your quantities.');
        toast.error('Stock availability has changed. Please review your cart.');
        await fetchCart();
      } else {
        setProductValidationError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-950 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-green-950 rounded-lg shadow-lg overflow-hidden p-8 text-center">
          <div className="mb-6">
            <FaCheckCircle className="text-green-500 text-6xl mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-yellow-500 mb-4">Order Placed Successfully!</h2>
          <p className="text-green-200 mb-6">
            Thank you for your order. Your order number is #{orderId}.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-yellow-500 text-green-900 py-2 px-4 rounded-lg font-semibold hover:bg-yellow-600 transition duration-300"
          >
            Close and Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-yellow-500 mb-2">Checkout</h1>
          <p className="text-green-200">Complete your order details</p>
        </div>

        {productValidationError && (
          <div className="bg-red-900 text-white p-4 rounded-lg mb-6">
            <p>{productValidationError}</p>
          </div>
        )}

        <div className="bg-green-950 rounded-lg shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-yellow-500 mb-4 flex items-center">
                <FaUser className="mr-2" /> Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-green-200 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded bg-green-900 border ${errors.firstName ? 'border-red-500' : 'border-green-800'} text-white focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-green-200 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded bg-green-900 border ${errors.lastName ? 'border-red-500' : 'border-green-800'} text-white focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
                <div>
                  <label className="block text-green-200 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded bg-green-900 border ${errors.email ? 'border-red-500' : 'border-green-800'} text-white focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-green-200 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded bg-green-900 border ${errors.phone ? 'border-red-500' : 'border-green-800'} text-white focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-yellow-500 mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2" /> Shipping Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-green-200 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded bg-green-900 border ${errors.address ? 'border-red-500' : 'border-green-800'} text-white focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className="block text-green-200 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded bg-green-900 border ${errors.city ? 'border-red-500' : 'border-green-800'} text-white focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-green-200 mb-2">Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded bg-green-900 border ${errors.zipCode ? 'border-red-500' : 'border-green-800'} text-white focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                  {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-yellow-500 mb-4 flex items-center">
                <FaMobileAlt className="mr-2" /> Payment Method
              </h2>
              <div className="space-y-4">

                <div className="flex items-start">
                  <input
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                    className="h-4 w-4 mt-1 text-yellow-500 focus:ring-yellow-500 border-green-800"
                  />
                  <div className="ml-3 flex-1">
                    <label htmlFor="cod" className="block text-green-200">
                      Cash on Delivery
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-900 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-yellow-500 mb-4">Order Summary</h2>
              
              {loadingCart ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
                </div>
              ) : cartItems.length === 0 ? (
                <p className="text-green-200 text-center py-4">Your cart is empty</p>
              ) : (
                <>
                  <div className="mb-4 max-h-60 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item._id} className="flex justify-between items-center py-2 border-b border-green-800">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded mr-3 bg-green-800 flex items-center justify-center overflow-hidden">
                            {item.plantImage ? (
                              <img 
                                src={item.plantImage}
                                alt={item.plantName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '';
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : null}
                            {(!item.plantImage || item.plantImage === '') && (
                              <FaImage className="text-green-400 text-xl" />
                            )}
                          </div>
                          <div>
                            <p className="text-green-200">{item.plantName}</p>
                            <p className="text-green-400 text-sm">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-yellow-500">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-green-200">Subtotal</span>
                      <span className="text-white">Rs. {cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-200">Shipping Fee</span>
                      <span className="text-white">Rs. 200</span>
                    </div>
                    {formData.paymentMethod === 'cod' && (
                      <div className="flex justify-between">
                        <span className="text-green-200">COD Charges (2%)</span>
                        <span className="text-white">Rs. {calculateCODCharges().toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-green-800 pt-3">
                      <span className="text-green-200 font-semibold">Total</span>
                      <span className="text-yellow-500 font-bold">
                        Rs. {calculateTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || cartItems.length === 0 || isSubmitting}
                className={`px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-green-950 font-bold rounded-lg transition duration-300 flex items-center ${loading || cartItems.length === 0 || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaLock className="mr-2" /> Place Order (Rs. {calculateTotal().toLocaleString()})
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;