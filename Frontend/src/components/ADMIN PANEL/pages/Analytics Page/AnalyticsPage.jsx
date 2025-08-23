import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { format } from 'date-fns';
import { FaUsers, FaShoppingCart, FaBox, FaChartLine } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:8020';

const AnalyticsPage = () => {
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');

  // Colors for charts
  const COLORS = ['#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  // Debug logging effect
  useEffect(() => {
    if (orderStats) {
      console.log('Full API Response:', orderStats);
      console.log('TimeBasedOrders:', orderStats.timeBasedOrders);
    }
  }, [orderStats]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      console.log('Fetching analytics data...');
      const response = await axios.get(`${API_BASE_URL}/api/orders/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      console.log('Analytics response:', response.data);

      if (response.data.success) {
        // Validate the stats data
        const stats = response.data.stats;
        if (!stats) {
          throw new Error('Invalid analytics data structure');
        }

        // Ensure all required fields exist
        const validatedStats = {
          statusCounts: Array.isArray(stats.statusCounts) ? stats.statusCounts : [],
          monthlySales: Array.isArray(stats.monthlySales) ? stats.monthlySales : [],
          recentOrders: Array.isArray(stats.recentOrders) ? stats.recentOrders : [],
          timeBasedOrders: Array.isArray(stats.timeBasedOrders) ? stats.timeBasedOrders : [],
          totalUsers: Number(stats.totalUsers) || 0,
          totalProducts: Number(stats.totalProducts) || 0
        };

        setOrderStats(validatedStats);
        setError(null);
      } else {
        const errorMessage = response.data.message || 'Failed to fetch analytics data';
        console.error('Analytics error:', errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Analytics fetch error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else if (err.response?.status === 400) {
        setError('Invalid request. Please try again.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch analytics data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Format monthly sales data for the chart
  const monthlySalesData = orderStats?.monthlySales?.map(sale => {
    try {
      // Validate date components
      if (!sale._id?.year || !sale._id?.month || !sale._id?.day) {
        console.warn('Invalid date components:', sale._id);
        return null;
      }

      // Create date object with validation
      const date = new Date(sale._id.year, sale._id.month - 1, sale._id.day);

      // Validate if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', date);
        return null;
      }

      return {
        date: format(date, 'MMM dd'),
        sales: sale.total || 0,
        orders: sale.count || 0,
        fullDate: date
      };
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  }).filter(Boolean) || [];

  // Filter data based on time range
  const getFilteredData = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    console.log('Time Range:', timeRange);
    console.log('Current Date:', now);

    switch (timeRange) {
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(currentDay - 7);
        return monthlySalesData.filter(item => item.fullDate >= weekAgo);

      case 'month':
        const monthAgo = new Date(currentYear, currentMonth - 1, currentDay);
        return monthlySalesData.filter(item => item.fullDate >= monthAgo);

      case 'year':
        const yearStart = new Date(currentYear, 0, 1);
        return monthlySalesData.filter(item => item.fullDate >= yearStart);

      default:
        return monthlySalesData;
    }
  };

  // Get orders for the selected time range
  const getTimeBasedOrders = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    if (!orderStats?.timeBasedOrders) {
      console.log('No timeBasedOrders data available');
      return [];
    }

    let filteredOrders = [];
    switch (timeRange) {
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(currentDay - 7);
        filteredOrders = orderStats.timeBasedOrders
          .filter(day => {
            const dayDate = new Date(day.date);
            return dayDate >= weekAgo;
          })
          .flatMap(day => day.orders);
        break;

      case 'month':
        const monthAgo = new Date(currentYear, currentMonth - 1, currentDay);
        filteredOrders = orderStats.timeBasedOrders
          .filter(day => {
            const dayDate = new Date(day.date);
            return dayDate >= monthAgo;
          })
          .flatMap(day => day.orders);
        break;

      case 'year':
        const yearStart = new Date(currentYear, 0, 1);
        filteredOrders = orderStats.timeBasedOrders
          .filter(day => {
            const dayDate = new Date(day.date);
            return dayDate >= yearStart;
          })
          .flatMap(day => day.orders);
        break;

      default:
        filteredOrders = orderStats.timeBasedOrders.flatMap(day => day.orders);
    }

    return filteredOrders;
  };

  const filteredData = getFilteredData();
  const timeBasedOrders = getTimeBasedOrders();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 bg-red-500/10 rounded-lg">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-yellow-500 text-green-950 rounded-lg hover:bg-yellow-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-green-950 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Store Analytics</h2>
        <p className="text-yellow-500/80">Track your store's performance and growth</p>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-end space-x-2">
        {['week', 'month', 'year'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg ${timeRange === range
                ? 'bg-yellow-500 text-green-950'
                : 'bg-green-900 text-white hover:bg-green-800'
              }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-green-950 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Daily Sales Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={timeRange === 'year' ? 'preserveStartEnd' : 0}
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#022c22',
                    border: '1px solid #ca8a04',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value, name) => {
                    if (name === 'sales') return [`Rs. ${value.toLocaleString()}`, 'Sales'];
                    if (name === 'orders') return [value, 'Orders'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke="#eab308"
                  strokeWidth={2}
                  dot={{ fill: '#eab308' }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-green-950 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Order Status Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStats?.statusCounts || []}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {(orderStats?.statusCounts || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#06b6d4',
                    border: '1px solid #ca8a04',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-green-950 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          {timeRange === 'week' ? 'This Week\'s Orders' :
            timeRange === 'month' ? 'This Month\'s Orders' :
              timeRange === 'year' ? 'This Year\'s Orders' :
                'Today\'s Orders'}
        </h3>
        <div className="space-y-4">
          {timeBasedOrders.length > 0 ? (
            timeBasedOrders.map((order, index) => (
              <div
                key={index}
                className="bg-green-900/50 rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white font-medium text-lg">Order #{order._id}</p>
                    <p className="text-yellow-500/80 text-sm">
                      {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                        order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-blue-500/20 text-blue-500'
                      }`}>
                      {order.status}
                    </span>
                    <span className="text-white font-medium">
                      Rs. {order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mt-4">
                  <h4 className="text-white font-medium mb-2">Order Items:</h4>
                  <div className="space-y-2">
                    {order.items?.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center justify-between bg-green-800/30 p-3 rounded">
                        <div className="flex items-center space-x-3">
                          {item.image && (
                            <img
                              src={item.image.startsWith('http') ? item.image : `${API_BASE_URL}/uploads/${item.image}`}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `${API_BASE_URL}/uploads/default-plant.jpg`;
                              }}
                            />
                          )}
                          <div>
                            <p className="text-white">{item.name}</p>
                            <p className="text-yellow-500/80 text-sm">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-white">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="mt-4">
                  <h4 className="text-white font-medium mb-2">Customer Details:</h4>
                  <div className="bg-green-800/30 p-3 rounded">
                    <p className="text-white">
                      {order.userDetails?.firstName} {order.userDetails?.lastName}
                    </p>
                    <p className="text-yellow-500/80 text-sm">{order.userDetails?.email}</p>
                    <p className="text-yellow-500/80 text-sm">{order.userDetails?.phone}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-green-900/50 rounded-lg p-6 text-center">
              <p className="text-yellow-500/80">No orders available for the selected period</p>
              <p className="text-yellow-500/80 text-sm mt-2">Debug Info: {JSON.stringify({
                timeRange,
                hasTimeBasedOrders: !!orderStats?.timeBasedOrders,
                timeBasedOrdersLength: orderStats?.timeBasedOrders?.length,
                filteredOrdersLength: timeBasedOrders.length
              })}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
