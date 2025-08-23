import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../components/auth/AuthContext';
import { FaSpinner } from 'react-icons/fa';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!currentUser?._id) {
      navigate('/');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching orders for user:', currentUser._id);
        
        const response = await axios.get('http://localhost:8020/api/orders/myorders', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        console.log('Orders response:', response.data);

        if (response.data && Array.isArray(response.data.orders)) {
          setOrders(response.data.orders);
        } else {
          console.log('Invalid orders data:', response.data);
          setOrders([]);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        console.error('Error details:', err.response?.data);
        setError(err.response?.data?.message || 'Failed to fetch orders. Please try again later.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser, navigate]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-[80px]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
          <div className="mt-4 md:mt-0 bg-yellow-100 rounded-lg px-4 py-2">
            <p className="text-green-950 font-semibold">
              Total Orders: <span className="text-yellow-600">{orders.length}</span>
            </p>
          </div>
        </div>
        
        {!Array.isArray(orders) || orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        Order #{order._id.slice(-8)}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Placed on {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <div className="flow-root">
                      <ul className="-my-6 divide-y divide-gray-200">
                        {order.items.map((item) => (
                          <li key={item._id} className="py-6 flex">
                            <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden">
                              <img
                                src={`http://localhost:8020/uploads/${item.image}`}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2NjYyIgZD0iTTE5IDVIMWEyIDIgMCAwMC0yIDJ2MTRhMiAyIDAgMDAyIDJoMThhMiAyIDAgMDAyLTJWN2EyIDIgMCAwMC0yLTJtMCAxNkgxVjdoMTh2MTRNMTcgMTFhNCA0IDAgMDAtNC00YTQgNCAwIDAgMDQtNHoiLz48L3N2Zz4=';
                                }}
                              />
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="flex justify-between">
                                <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                                <p className="text-sm font-medium text-gray-900">
                                  Rs. {item.price.toFixed(2)}
                                </p>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">Rs. {order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">Rs. {order.shippingFee.toFixed(2)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm mt-2 text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">- Rs. {order.discount.toFixed(2)}</span>
                      </div>
                    )}
                    {order.codCharges > 0 && (
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-gray-600">COD Charges</span>
                        <span className="font-medium">Rs. {order.codCharges.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-medium mt-4">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">Rs. {order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <div className="text-sm">
                      <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                      <p className="text-gray-600">
                        {order.shippingAddress.street}<br />
                        {order.shippingAddress.city}, {order.shippingAddress.zipCode}<br />
                        {order.shippingAddress.country}
                      </p>
                    </div>
                    <div className="mt-4 text-sm">
                      <h4 className="font-medium text-gray-900 mb-2">Payment Method</h4>
                      <p className="text-gray-600 capitalize">{order.paymentMethod}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory; 