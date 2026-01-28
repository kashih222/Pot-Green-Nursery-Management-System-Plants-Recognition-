import { useState, useEffect } from 'react';
import { 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter, 
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaExclamationTriangle
} from 'react-icons/fa';
import { MdPendingActions, MdCheckCircle, MdCancel } from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const ServiceRequests = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    serviceType: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10
  });

  // Fetch service requests
  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/web/services/all?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setServiceRequests(result.data);
        setPagination(prev => ({
          ...prev,
          totalPages: result.pagination.totalPages,
          totalItems: result.pagination.totalItems
        }));
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error fetching service requests:', error);
      setError('Failed to fetch service requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceRequests();
  }, [pagination.currentPage, filters]);

  // Handle status update
  const handleStatusUpdate = async (requestId, newStatus, adminNotes, estimatedCost) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/web/services/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: adminNotes,
          estimatedCost: estimatedCost
        })
      });

      const result = await response.json();

      if (result.success) {
        setServiceRequests(prev =>
          prev.map(req =>
            req._id === requestId
              ? { ...req, status: newStatus, adminNotes: adminNotes, estimatedCost: estimatedCost }
              : req
          )
        );
        
        if (estimatedCost && newStatus === 'completed') {
          toast.success(`Service completed and cost updated! Revenue: Rs. ${estimatedCost}`);
          // Dispatch event to refresh dashboard data
          window.dispatchEvent(new CustomEvent('serviceRevenueUpdated'));
        } else {
          toast.success('Status updated successfully!');
        }
      } else {
        toast.error(result.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Handle delete
  const handleDelete = async (requestId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/web/services/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.success) {
        setServiceRequests(prev => prev.filter(req => req._id !== requestId));
        toast.success('Service request deleted successfully!');
        setRequestToDelete(null);
        setShowDeleteModal(false);
      } else {
        toast.error(result.message || 'Failed to delete service request');
      }
    } catch (error) {
      console.error('Error deleting service request:', error);
      toast.error('Failed to delete service request');
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: MdPendingActions },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: MdCheckCircle },
      'in-progress': { color: 'bg-purple-100 text-purple-800', icon: MdPendingActions },
      completed: { color: 'bg-green-100 text-green-800', icon: MdCheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: MdCancel }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-green-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 bg-green-900">
        <div className="text-red-400 text-lg mb-4">{error}</div>
        <button 
          onClick={fetchServiceRequests}
          className="bg-yellow-500 text-green-950 px-4 py-2 rounded hover:bg-yellow-600 transition-colors font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-green-900 min-h-screen">
      <Helmet>
               <title> Service Requests | Pot Green Nursery</title>
            </Helmet>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Service Requests</h1>
          <p className="text-yellow-300">Manage and track all service requests from customers</p>
        </div>

        {/* Revenue Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-950 p-6 rounded-lg border border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm">Total Services</p>
                <p className="text-white text-2xl font-bold">{serviceRequests.length}</p>
              </div>
              <div className="text-yellow-500 text-3xl">📋</div>
            </div>
          </div>
          
          <div className="bg-green-950 p-6 rounded-lg border border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm">Completed Services</p>
                <p className="text-white text-2xl font-bold">
                  {serviceRequests.filter(req => req.status === 'completed').length}
                </p>
              </div>
              <div className="text-green-500 text-3xl">✅</div>
            </div>
          </div>
          
          <div className="bg-green-950 p-6 rounded-lg border border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm">Total Revenue</p>
                <p className="text-white text-2xl font-bold">
                  Rs. {serviceRequests
                    .filter(req => req.status === 'completed' && req.estimatedCost)
                    .reduce((sum, req) => sum + (parseFloat(req.estimatedCost) || 0), 0)
                    .toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-green-500 text-3xl">💰</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-green-950 rounded-lg border border-yellow-500/20 shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500" />
                <input
                  type="text"
                  placeholder="Search by name, email, or city..."
                  className="pl-10 pr-4 py-2 border border-yellow-500/30 rounded-md w-full bg-green-900 text-white placeholder-yellow-300/50 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">Status</label>
              <select
                className="w-full px-3 py-2 border border-yellow-500/30 rounded-md bg-green-900 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">Service Type</label>
              <select
                className="w-full px-3 py-2 border border-yellow-500/30 rounded-md bg-green-900 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                value={filters.serviceType}
                onChange={(e) => setFilters(prev => ({ ...prev, serviceType: e.target.value }))}
              >
                <option value="">All Services</option>
                <option value="Tree Planting">Tree Planting</option>
                <option value="Grass Cutting">Grass Cutting</option>
                <option value="Weeds Control">Weeds Control</option>
                <option value="Pots & Planters">Pots & Planters</option>
                <option value="Garden Maintenance">Garden Maintenance</option>
                <option value="Landscaping">Landscaping</option>
                <option value="Irrigation System">Irrigation System</option>
                <option value="Plant Care Consultation">Plant Care Consultation</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', serviceType: '', search: '' })}
                className="w-full bg-yellow-500 text-green-950 px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors font-semibold"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Service Requests Table */}
        <div className="bg-green-950 rounded-lg border border-yellow-500/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-yellow-500/20">
              <thead className="bg-green-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-green-950 divide-y divide-yellow-500/20">
                {serviceRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-green-900 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{request.fullName}</div>
                        <div className="text-sm text-yellow-300">{request.email}</div>
                        <div className="text-sm text-yellow-300">{request.phoneNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{request.serviceType}</div>
                      <div className="text-sm text-yellow-300">{request.city}, {request.zipCode}</div>
                      {request.estimatedCost && request.status === 'completed' && (
                        <div className="text-xs text-green-400 font-medium mt-1">
                          💰 Revenue: Rs. {request.estimatedCost}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{formatDate(request.preferredDate)}</div>
                      <div className="text-sm text-yellow-300">{request.preferredTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-300">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="View Details"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowEditModal(true);
                          }}
                          className="text-green-400 hover:text-green-300 transition-colors"
                          title="Edit"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setRequestToDelete(request);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-green-900 px-4 py-3 flex items-center justify-between border-t border-yellow-500/20 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-yellow-500/30 text-sm font-medium rounded-md text-yellow-400 bg-green-950 hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-yellow-500/30 text-sm font-medium rounded-md text-yellow-400 bg-green-950 hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-yellow-300">
                    Showing page <span className="font-medium text-white">{pagination.currentPage}</span> of{' '}
                    <span className="font-medium text-white">{pagination.totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                      disabled={pagination.currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-yellow-500/30 bg-green-950 text-sm font-medium text-yellow-400 hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-yellow-500/30 bg-green-950 text-sm font-medium text-yellow-400 hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-yellow-500/20 w-96 shadow-lg rounded-md bg-green-950">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Service Request Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-yellow-400 mb-2">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <FaEnvelope className="w-4 h-4 text-yellow-500 mr-2" />
                      <span className="text-white">{selectedRequest.fullName}</span>
                    </div>
                    <div className="flex items-center">
                      <FaEnvelope className="w-4 h-4 text-yellow-500 mr-2" />
                      <span className="text-white">{selectedRequest.email}</span>
                    </div>
                    <div className="flex items-center">
                      <FaPhone className="w-4 h-4 text-yellow-500 mr-2" />
                      <span className="text-white">{selectedRequest.phoneNumber}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-yellow-400 mb-2">Service Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-yellow-300 font-semibold">Type:</span> <span className="text-white">{selectedRequest.serviceType}</span></div>
                    <div className="flex items-center">
                      <FaCalendarAlt className="w-4 h-4 text-yellow-500 mr-2" />
                      <span className="text-white">{formatDate(selectedRequest.preferredDate)} at {selectedRequest.preferredTime}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-yellow-400 mb-2">Address</h4>
                  <div className="flex items-start text-sm">
                    <FaMapMarkerAlt className="w-4 h-4 text-yellow-500 mr-2 mt-0.5" />
                    <div className="text-white">
                      {selectedRequest.streetAddress}<br />
                      {selectedRequest.city}, {selectedRequest.zipCode}
                    </div>
                  </div>
                </div>

                {selectedRequest.additionalNotes && (
                  <div>
                    <h4 className="font-medium text-yellow-400 mb-2">Additional Notes</h4>
                    <p className="text-sm text-yellow-300">{selectedRequest.additionalNotes}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-yellow-400 mb-2">Status</h4>
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="bg-yellow-500 text-green-950 px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-yellow-500/20 w-96 shadow-lg rounded-md bg-green-950">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Update Status</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-yellow-400 mb-2">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-yellow-500/30 rounded-md bg-green-900 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={selectedRequest.status}
                    onChange={(e) => setSelectedRequest(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-400 mb-2">Admin Notes</label>
                  <textarea
                    rows="3"
                    className="w-full px-3 py-2 border border-yellow-500/30 rounded-md bg-green-900 text-white placeholder-yellow-300/50 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Add admin notes..."
                    value={selectedRequest.adminNotes || ''}
                    onChange={(e) => setSelectedRequest(prev => ({ ...prev, adminNotes: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-400 mb-2">Estimated Cost (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-yellow-500/30 rounded-md bg-green-900 text-white placeholder-yellow-300/50 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="0.00"
                    value={selectedRequest.estimatedCost || ''}
                    onChange={(e) => setSelectedRequest(prev => ({ ...prev, estimatedCost: e.target.value }))}
                  />
                  <p className="text-xs text-yellow-300 mt-1">
                    💡 Setting a cost and marking as completed will add this amount to your service revenue
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleStatusUpdate(selectedRequest._id, selectedRequest.status, selectedRequest.adminNotes, selectedRequest.estimatedCost);
                    setShowEditModal(false);
                  }}
                  className="bg-yellow-500 text-green-950 px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors font-semibold"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && requestToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-red-500/20 w-96 shadow-lg rounded-md bg-green-950">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Confirm Deletion</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-red-400">
                  <FaExclamationTriangle className="w-5 h-5" />
                  <span className="text-sm font-medium">Warning</span>
                </div>
                
                <p className="text-sm text-yellow-300">
                  Are you sure you want to delete this service request? This action cannot be undone.
                </p>
                
                <div className="bg-green-900 p-3 rounded-md border border-yellow-500/20">
                  <p className="text-sm text-white font-medium">{requestToDelete.fullName}</p>
                  <p className="text-xs text-yellow-300">{requestToDelete.serviceType}</p>
                  <p className="text-xs text-yellow-300">{requestToDelete.city}, {requestToDelete.zipCode}</p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(requestToDelete._id);
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
};

export default ServiceRequests;
