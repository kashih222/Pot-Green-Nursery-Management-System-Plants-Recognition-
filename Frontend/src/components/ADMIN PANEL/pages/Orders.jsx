import React, { useState, useEffect } from 'react';
import {
  Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Paper,Button,MenuItem,
  Select,FormControl,CircularProgress,Alert,Pagination,TextField,IconButton,Dialog,
  DialogTitle,DialogContent,DialogActions,Tooltip,Snackbar,
} from '@mui/material';

import {  FaFilter, FaCopy, FaDownload } from 'react-icons/fa';
import {  IoSearchOutline } from 'react-icons/io5';
import { useAuth } from '../../auth/AuthContext';
import axiosInstance from '../../../utils/axios';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [downloadStatus, setDownloadStatus] = useState({ open: false, message: '', type: 'success' });
  const [searchQuery, setSearchQuery] = useState('');

  // Add status options array to ensure consistency and prevent duplication
  const STATUS_OPTIONS = [
    { value: 'all', label: 'All', color: '!bg-green-100 !text-green-600' },
    { value: 'pending', label: 'Pending', color: '!bg-yellow-100 !text-yellow-800' },
    { value: 'processing', label: 'Processing', color: '!bg-blue-100 !text-blue-800' },
    { value: 'shipped', label: 'Shipped', color: '!bg-purple-100 !text-purple-800' },
    { value: 'delivered', label: 'Delivered', color: '!bg-green-100 !text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: '!bg-red-100 !text-red-800' }
  ];

  useEffect(() => {
    fetchOrders();
  }, [page, filterStatus, dateRange, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = '/api/orders';
      
      // Add query parameters for filtering
          const params = new URLSearchParams();
    // Only add status if not 'all' and not empty
    if (filterStatus && filterStatus !== 'all') {
      params.append('status', filterStatus);
    }
    if (dateRange.startDate) {
      params.append('startDate', dateRange.startDate);
    }
    if (dateRange.endDate) {
      params.append('endDate', dateRange.endDate);
    }
    if (searchQuery) {
      params.append('search', searchQuery);
    }
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
      
      // Fetch orders without logging response
      const response = await axiosInstance.get(url);
      const ordersData = response.data?.orders || response.data || [];
      
      // Update state with orders data
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setTotalPages(Math.ceil(ordersData.length / 10));
      setError(null);
    } catch (err) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching orders:', err.response || err);
      }
      setError(err.response?.data?.message || 'Failed to fetch orders. Please check if the backend server is running.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(`/api/orders/${orderId}/status`, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      if (response.data.success) {
        // Show success notification
        setDownloadStatus({
          open: true,
          message: `Order status updated to ${newStatus}`,
          type: 'success'
        });
        
        // Update the order in the local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
              : order
          )
        );
      }
      setError(null);
    } catch (err) {
      console.error('Error updating order status:', err.response || err);
      setError(err.response?.data?.message || 'Failed to update order status');
      setDownloadStatus({
        open: true,
        message: 'Failed to update order status',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleFilterChange = () => {
    setPage(1);
    fetchOrders();
  };

  const clearFilters = () => {
    setFilterStatus('');
    setDateRange({ startDate: '', endDate: '' });
    setPage(1);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleCloseSnackbar = () => {
    setDownloadStatus({ ...downloadStatus, open: false });
  };

  const generateReceipt = async (order) => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Set document properties
      doc.setProperties({
        title: `Order Receipt - ${order._id}`,
        subject: 'Order Receipt',
        author: 'Pot Green',
        keywords: 'receipt, order, pot green, nursery',
        creator: 'Pot Green'
      });

      // Add company logo or name
      doc.setFontSize(20);
      doc.setTextColor(34, 139, 34); // Green color
      doc.text("Pot Green", 105, 20, { align: "center" });
      
      // Add receipt title
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Order Receipt", 105, 30, { align: "center" });
      
      // Add order details
      doc.setFontSize(12);
      doc.text(`Order ID: ${order._id}`, 20, 45);
      doc.text(`Date: ${formatDate(order.createdAt)}`, 20, 55);
      
      // Add customer details
      doc.text("Customer Details:", 20, 70);
      doc.setFontSize(10);
      const customerName = order.userDetails?.firstName && order.userDetails?.lastName 
        ? `${order.userDetails.firstName} ${order.userDetails.lastName}`
        : 'N/A';
      doc.text(`Name: ${customerName}`, 25, 80);
      doc.text(`Email: ${order.userDetails?.email || 'N/A'}`, 25, 87);
      doc.text(`Phone: ${order.userDetails?.phone || 'N/A'}`, 25, 94);
      
      // Add shipping address
      doc.setFontSize(12);
      doc.text("Shipping Address:", 20, 110);
      doc.setFontSize(10);
      doc.text(`${order.shippingAddress?.street || 'N/A'}`, 25, 120);
      doc.text(`${order.shippingAddress?.city || ''}, ${order.shippingAddress?.zipCode || ''}`, 25, 127);
      
      // Add items table
      const tableColumn = ["Item", "Quantity", "Price", "Total"];
      const tableRows = order.items?.map(item => [
        item.name || 'N/A',
        item.quantity || 0,
        `Rs. ${(item.price || 0).toFixed(2)}`,
        `Rs. ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}`
      ]) || [];

      let yPos = 140;

      // Using autoTable directly
      autoTable(doc, {
        startY: yPos,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { 
          fillColor: [34, 139, 34],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: { 
          fontSize: 8,
          cellPadding: 3,
        },
        margin: { top: 20 },
        didDrawPage: function(data) {
          // Update yPos to the position after the table
          yPos = data.cursor.y + 10;
        }
      });
      
      // Add summary section starting from the new yPos
      doc.setFontSize(10);
      doc.text(`Subtotal: Rs. ${(order.subtotal || 0).toFixed(2)}`, 140, yPos);
      yPos += 7;
      doc.text(`Shipping Fee: Rs. ${(order.shippingFee || 0).toFixed(2)}`, 140, yPos);
      yPos += 7;
      
      if (order.discount > 0) {
        doc.text(`Discount: Rs. ${order.discount.toFixed(2)}`, 140, yPos);
        yPos += 7;
      }
      
      if (order.codCharges > 0) {
        doc.text(`COD Charges: Rs. ${order.codCharges.toFixed(2)}`, 140, yPos);
        yPos += 7;
      }
      
      // Add total with some extra spacing
      yPos += 3;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`Total Amount: Rs. ${(order.totalAmount || 0).toFixed(2)}`, 140, yPos);
      
      // Add footer at fixed positions near the bottom
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text("Thank you for shopping with Pot Green!", 105, pageHeight - 20, { align: "center" });
      doc.text("For any queries, please contact our customer support.", 105, pageHeight - 15, { align: "center" });
      
      // Add a border to the page
      doc.setDrawColor(34, 139, 34); // Green color
      doc.setLineWidth(0.5);
      doc.rect(10, 10, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 20);
      
      // Save the PDF
      doc.save(`order-receipt-${order._id}.pdf`);
      
      // Show success message
      setDownloadStatus({
        open: true,
        message: 'Receipt downloaded successfully!',
        type: 'success'
      });
    } catch (err) {
      console.error('Error generating receipt:', err);
      setDownloadStatus({
        open: true,
        message: 'Failed to generate receipt. Please try again.',
        type: 'error'
      });
    }
  };

  // Simplified status badge component
  const StatusBadge = ({ status }) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status) || STATUS_OPTIONS[0];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${option.color}`}>
        {option.label}
      </span>
    );
  };

  // Single function to render status select
  const StatusSelect = ({ value, onChange, className }) => (
    <Select
      value={value || 'pending'}
      onChange={onChange}
      className={className}
      disabled={loading}
      aria-label="Order status"
      MenuProps={{
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'left',
        },
        transformOrigin: {
          vertical: 'top',
          horizontal: 'left',
        },
        PaperProps: {
          'aria-hidden': false,
          tabIndex: -1
        }
      }}
    >
      {STATUS_OPTIONS.map((option) => (
        <MenuItem 
          key={option.value} 
          value={option.value}
          role="option"
          aria-selected={value === option.value}
        >
          <StatusBadge status={option.value} />
        </MenuItem>
      ))}
    </Select>
  );

  // Update the filter section JSX
  const renderFilters = () => (
    <div className="mb-4 p-4 bg-green-900 rounded-lg border border-green-800">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormControl fullWidth size="small">
          <StatusSelect
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              handleFilterChange();
            }}
            className="bg-green-800 !text-white !border-green-700"
            aria-label="Filter by order status"
          />
        </FormControl>
        <TextField
          type="date"
          label="Start Date"
          value={dateRange.startDate}
          onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          size="small"
          InputLabelProps={{ shrink: true }}
          className="!bg-green-800 !text-white"
          inputProps={{
            'aria-label': 'Filter start date'
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#065f46',
              },
              '&:hover fieldset': {
                borderColor: '#059669',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#10b981',
              },
            },
            '& .MuiInputBase-input': {
              color: 'white',
            },
            '& .MuiInputLabel-root': {
              color: '#10b981',
            },
          }}
        />
        <TextField
          type="date"
          label="End Date"
          value={dateRange.endDate}
          onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          size="small"
          InputLabelProps={{ shrink: true }}
          className="!bg-green-800 !text-white"
          inputProps={{
            'aria-label': 'Filter end date'
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#065f46',
              },
              '&:hover fieldset': {
                borderColor: '#059669',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#10b981',
              },
            },
            '& .MuiInputBase-input': {
              color: 'white',
            },
            '& .MuiInputLabel-root': {
              color: '#10b981',
            },
          }}
        />
      </div>
    </div>
  );

  // Update the status cell in the table
  const renderStatusCell = (order) => (
    <td className="p-3">
      <FormControl size="small" fullWidth>
        <StatusSelect
          value={order.status}
          onChange={(e) => handleStatusChange(order._id, e.target.value)}
          className={STATUS_OPTIONS.find(opt => opt.value === order.status)?.color || STATUS_OPTIONS[0].color}
          aria-label={`Change status for order ${order._id}`}
        />
      </FormControl>
    </td>
  );

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center h-full">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-6 bg-green-950 rounded-lg shadow space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-yellow-500">
          Orders Management ({orders.length} total)
        </h2>
        <div className="flex gap-2">
          <div className="relative">
            <IoSearchOutline className="absolute left-3 top-3 text-green-700 text-xl" />
            <input
              type="text"
              placeholder="Search orders..."
              className="pl-10 p-2 text-green-950 border border-green-200 rounded-lg focus:ring-2 focus:ring-yellow-500 h-[42px]"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchOrders();
              }}
            />
          </div>
          <Button
            variant="outlined"
            startIcon={<FaFilter />}
            onClick={() => setShowFilters(!showFilters)}
            className="!border-yellow-500 !text-yellow-500 hover:!bg-yellow-500/10 !h-[42px]"
          >
            Filters
          </Button>
        </div>
      </div>

      {showFilters && renderFilters()}

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      <div className="overflow-x-auto rounded-lg border border-green-800">
        <table className="w-full">
          <thead>
            <tr className="bg-yellow-500">
              <th className="p-3 text-left text-white font-semibold">Order ID</th>
              <th className="p-3 text-left text-white font-semibold">Customer</th>
              <th className="p-3 text-left text-white font-semibold">Date</th>
              <th className="p-3 text-left text-white font-semibold">Items</th>
              <th className="p-3 text-left text-white font-semibold">Total Amount</th>
              <th className="p-3 text-left text-white font-semibold">Payment Method</th>
              <th className="p-3 text-left text-white font-semibold">Status</th>
              <th className="p-3 text-left text-white font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-green-800 hover:bg-green-900 text-white"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{order._id || 'N/A'}</span>
                      <Tooltip title={copySuccess || 'Copy ID'} placement="top">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(order._id)}
                          className="!text-yellow-500 hover:!text-yellow-600"
                        >
                          <FaCopy size={14} />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-medium">
                      {order.userDetails?.firstName} {order.userDetails?.lastName}
                    </span>
                    <div className="text-sm text-yellow-500">{order.userDetails?.email}</div>
                  </td>
                  <td className="p-3">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-medium text-yellow-500">{order.items?.length || 0} items</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center">
                      <span className="text-yellow-500 font-bold mr-1">Rs.</span>
                      <span className="font-bold">{order.totalAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </td>
                  <td className="p-3 capitalize">
                    {order.paymentMethod || 'N/A'}
                  </td>
                  {renderStatusCell(order)}
                  <td className="p-3">
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => handleViewDetails(order)}
                      className="!text-white hover:!bg-yellow-500 !min-w-0 !p-2"
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-8 text-white">
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <CircularProgress size={20} className="text-yellow-500" />
                      <span>Loading orders...</span>
                    </div>
                  ) : (
                    'No orders found'
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {orders && orders.length > 0 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <Button
            onClick={() => setPage(page > 1 ? page - 1 : 1)}
            disabled={page === 1}
            className="!text-white !border-green-700 hover:!bg-yellow-500"
          >
            Previous
          </Button>
          <span className="text-white">
            Page {page} of {totalPages}
          </span>
          <Button
            onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
            disabled={page === totalPages}
            className="!text-white !border-green-700 hover:!bg-yellow-500"
          >
            Next
          </Button>
        </div>
      )}

      <Dialog
        open={!!selectedOrder}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "!bg-green-950 border-2 border-green-800"
        }}
      >
        <DialogTitle className="bg-yellow-500 text-white px-6 py-4 flex justify-between items-center">
          <span>Order Details</span>
          {selectedOrder && (
            <Tooltip title="Download Receipt">
              <IconButton
                onClick={() => generateReceipt(selectedOrder)}
                className="!text-white hover:!text-green-950"
              >
                <FaDownload />
              </IconButton>
            </Tooltip>
          )}
        </DialogTitle>
        <DialogContent className="mt-4 px-6">
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-green-900 p-4 rounded-lg border border-green-800">
                  <h3 className="font-semibold text-yellow-500 mb-2">Customer Information</h3>
                  <p className="text-white">{selectedOrder.userDetails?.firstName} {selectedOrder.userDetails?.lastName}</p>
                  <p className="text-yellow-500">{selectedOrder.userDetails?.email}</p>
                  <p className="text-yellow-500">{selectedOrder.userDetails?.phone}</p>
                </div>
                <div className="bg-green-900 p-4 rounded-lg border border-green-800">
                  <h3 className="font-semibold text-yellow-500 mb-2">Shipping Address</h3>
                  <p className="text-white">{selectedOrder.shippingAddress?.street}</p>
                  <p className="text-yellow-500">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.zipCode}</p>
                </div>
              </div>

              <div className="bg-green-900 rounded-lg border border-green-800">
                <h3 className="font-semibold text-yellow-500 p-4 border-b border-green-800">Order Items</h3>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow className="bg-green-800">
                        <TableCell className="!text-white font-medium">Item</TableCell>
                        <TableCell align="right" className="!text-white font-medium">Quantity</TableCell>
                        <TableCell align="right" className="!text-white font-medium">Price</TableCell>
                        <TableCell align="right" className="!text-white font-medium">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items?.map((item) => (
                        <TableRow key={item._id || item.product} className="hover:bg-green-800/50">
                          <TableCell className="!text-white">{item.name}</TableCell>
                          <TableCell align="right" className="!text-white">{item.quantity}</TableCell>
                          <TableCell align="right" className="!text-white">Rs. {item.price?.toFixed(2)}</TableCell>
                          <TableCell align="right" className="!text-yellow-500 font-medium">
                            Rs. {(item.price * item.quantity)?.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-green-900 p-4 rounded-lg border border-green-800">
                  <h3 className="font-semibold text-yellow-500 mb-2">Payment Information</h3>
                  <p className="text-white">Method: {selectedOrder.paymentMethod || 'N/A'}</p>
                  <p className="text-white">Status: {selectedOrder.isPaid ? 'Paid' : 'Pending'}</p>
                  <p className="text-white">Delivery Status: {selectedOrder.isDelivered ? 'Delivered' : 'Pending'}</p>
                  {selectedOrder.paymentDetails?.transactionId && (
                    <p className="text-yellow-500">Transaction ID: {selectedOrder.paymentDetails.transactionId}</p>
                  )}
                </div>
                <div className="bg-green-900 p-4 rounded-lg border border-green-800">
                  <h3 className="font-semibold text-yellow-500 mb-2">Order Summary</h3>
                  <div className="space-y-2">
                    <p className="flex justify-between text-white">
                      <span>Subtotal:</span>
                      <span>Rs. {selectedOrder.subtotal?.toFixed(2) || '0.00'}</span>
                    </p>
                    <p className="flex justify-between text-white">
                      <span>Shipping Fee:</span>
                      <span>Rs. {selectedOrder.shippingFee?.toFixed(2) || '0.00'}</span>
                    </p>
                    {selectedOrder.discount > 0 && (
                      <p className="flex justify-between text-white">
                        <span>Discount:</span>
                        <span>Rs. {selectedOrder.discount?.toFixed(2)}</span>
                      </p>
                    )}
                    {selectedOrder.codCharges > 0 && (
                      <p className="flex justify-between text-white">
                        <span>COD Charges:</span>
                        <span>Rs. {selectedOrder.codCharges?.toFixed(2)}</span>
                      </p>
                    )}
                    <div className="border-t border-green-800 mt-2 pt-2">
                      <p className="flex justify-between text-yellow-500 font-semibold">
                        <span>Total:</span>
                        <span>Rs. {selectedOrder.totalAmount?.toFixed(2) || '0.00'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions className="p-4 border-t border-green-800 flex justify-between">
          <Button
            onClick={() => generateReceipt(selectedOrder)}
            className="!bg-green-700 !text-white hover:!bg-green-800 !px-6 flex items-center gap-2"
            variant="contained"
            startIcon={<FaDownload />}
          >
            Download Receipt
          </Button>
          <Button
            onClick={handleCloseDetails}
            className="!bg-yellow-500 !text-green-950 hover:!bg-yellow-600 !px-6"
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={downloadStatus.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={downloadStatus.type}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {downloadStatus.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Orders;