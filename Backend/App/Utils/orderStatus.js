const validTransitions = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: ['refunded'],
    cancelled: [],
    refunded: []
  };
  
  const validateStatusChange = (oldStatus, newStatus) => {
    return validTransitions[oldStatus]?.includes(newStatus) || false;
  };
  
  module.exports = { validateStatusChange };