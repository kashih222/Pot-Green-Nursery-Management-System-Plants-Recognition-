import { useState, useEffect } from 'react';
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from "@mui/material";
import {
  IoAddCircleOutline,
  IoSearchOutline,
  IoTrashBinOutline,
} from "react-icons/io5";
import { IoIosPricetags } from "react-icons/io";
import { MdCategory } from "react-icons/md";
import { TbEdit } from "react-icons/tb";
import { useAuth } from '../../../auth/AuthContext';

const PlantsList = () => {
  const { token } = useAuth();
  const [plants, setPlants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [plantToDelete, setPlantToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [editFormData, setEditFormData] = useState({
    plantName: "",
    description: "",
    prices: {
      small: "",
      medium: "",
      large: ""
    },
    category: "",
    stockQuantity: "",
    rating: ""
  });
  const [editSuccess, setEditSuccess] = useState(false);
  const plantsPerPage = 5;
  const navigate = useNavigate();

  const categories = [
    "summer-plant",
    "winter-plant",
    "indoor-plants",
    "outdoor-plants",
    "vegetable-plants",
    "fruits-plant",
    "trees",
    "ornamental",
    "shrubs",
    "herbs",
    "crops",
    "spices",
    "medicinal",
    "Ornamental",
    "flower",
  ];

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!token) {
          navigate('/');
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/plants/all`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Check if the response has the expected structure
        if (!response.data || !response.data.success) {
          throw new Error(response.data?.message || 'Failed to fetch plants');
        }

        // Access the plants array from the data property
        const plantsData = response.data.data;
        
        if (!Array.isArray(plantsData)) {
          throw new Error('Invalid data format received from server');
        }

        setPlants(plantsData);
        console.log('Plants loaded successfully:', plantsData.length, 'plants');
      } catch (err) {
        console.error("Error fetching plants:", err);
        if (err.response?.status === 401) {
          navigate('/');
        }
        setError(err.message || "Failed to fetch plants. Please try again later.");
        setPlants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, [token, navigate]);

  // Ensure plants is always an array before filtering
  const filteredPlants = Array.isArray(plants) ? plants.filter(
    (plant) => {
      if (!plant) return false;
      
      const plantName = (plant.plantName || "").toLowerCase();
      const category = (plant.category || "").toLowerCase();
      const searchTerm = searchQuery.toLowerCase();
      
      return plantName.includes(searchTerm) || category.includes(searchTerm);
    }
  ) : [];

  // Pagination logic
  const indexOfLastPlant = currentPage * plantsPerPage;
  const indexOfFirstPlant = indexOfLastPlant - plantsPerPage;
  const paginatedPlants = filteredPlants.slice(
    indexOfFirstPlant,
    indexOfLastPlant
  );
  const totalPages = Math.ceil(filteredPlants.length / plantsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleDeleteClick = (plant) => {
    setPlantToDelete(plant);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/plants/${plantToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setPlants(plants.filter(p => p._id !== plantToDelete._id));
        console.log('Plant deleted successfully');
      } else {
        throw new Error(response.data.message || 'Failed to delete plant');
      }
    } catch (err) {
      console.error("Error deleting plant:", err);
      if (err.response?.status === 401) {
        navigate('/');
      }
      setError(err.message || "Failed to delete plant. Please try again later.");
    } finally {
      setDeleteModalOpen(false);
      setPlantToDelete(null);
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setPlantToDelete(null);
  };

  const handleEditClick = (plant) => {
    setEditingPlant(plant);
    setEditFormData({
      plantName: plant.plantName || "",
      description: plant.description || "",
      prices: {
        small: plant.prices?.small || "",
        medium: plant.prices?.medium || "",
        large: plant.prices?.large || ""
      },
      category: plant.category || "",
      stockQuantity: "",
      rating: plant.rating || ""
    });
    setEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setEditingPlant(null);
    setEditFormData({
      plantName: "",
      description: "",
      prices: {
        small: "",
        medium: "",
        large: ""
      },
      category: "",
      stockQuantity: "",
      rating: ""
    });
    setEditSuccess(false);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('price-')) {
      const size = name.split('-')[1];
      setEditFormData(prev => ({
        ...prev,
        prices: {
          ...prev.prices,
          [size]: value || ""
        }
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value || ""
      }));
    }
  };

  const handleEditSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create FormData with only changed fields
      const formData = new FormData();
      Object.keys(editFormData).forEach(key => {
        if (key === 'prices') {
          // Handle prices object
          Object.entries(editFormData.prices).forEach(([size, price]) => {
            if (price !== "") {
              formData.append(`prices[${size}]`, price);
            }
          });
        } else if (editFormData[key] !== "") {
          if (key === "stockQuantity") {
            // Add the new quantity to the previous quantity
            const newQuantity = parseInt(editFormData[key]) || 0;
            const currentQuantity = parseInt(editingPlant.stockQuantity) || 0;
            formData.append(key, currentQuantity + newQuantity);
          } else {
            formData.append(key, editFormData[key]);
          }
        }
      });

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/plants/${editingPlant._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          },
        }
      );

      if (response.data.success) {
        // Update the plants list with the edited plant
        setPlants(plants.map(p => 
          p._id === editingPlant._id ? response.data.plant : p
        ));
        setEditSuccess(true);
        // Close modal after 1.5 seconds
        setTimeout(() => {
          handleEditClose();
        }, 1500);
      }
    } catch (err) {
      console.error("Error updating plant:", err);
      if (err.response?.status === 401) {
        navigate('/');
      }
      setError(err.response?.data?.message || err.message || "Failed to update plant");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-green-950 rounded-lg shadow space-y-6">
        <div className="text-center text-yellow-500 py-8">Loading plants...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-green-950 rounded-lg shadow space-y-6">
        <div className="text-center text-red-500 py-8">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="block mx-auto mt-4 bg-yellow-500 text-green-950 px-4 py-2 rounded-lg hover:bg-yellow-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-green-950 rounded-lg shadow space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h2 className="text-2xl font-bold text-yellow-500 mb-4 md:mb-0">
          Plants Inventory ({plants.length} total)
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <IoSearchOutline className="absolute left-3 top-3 text-green-700 text-xl" />
            <input
              type="text"
              placeholder="Search plants..."
              className="w-full pl-10 p-2 text-green-950 border border-green-200 rounded-lg focus:ring-2 focus:ring-yellow-500 h-[42px]"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Add Plant Button */}
          <Link to="/dashboard/product/product-upload">
            <Button
              variant="contained"
              className="!bg-yellow-500 !text-green-950 hover:!bg-yellow-600 !normal-case !text-sm !h-[42px] !min-h-[42px] !rounded-lg"
              startIcon={<IoAddCircleOutline />}
            >
              Add New Plant
            </Button>
          </Link>
        </div>
      </div>

      {/* Plants Table */}
      <div className="overflow-x-auto rounded-lg border border-green-100">
        <table className="w-full">
          <thead className="bg-green-50">
            <tr>
              <th className="p-3 text-left text-white bg-yellow-500">Sr. No.</th>
              <th className="p-3 text-left text-white bg-yellow-500">ID</th>
              <th className="p-3 text-left text-white bg-yellow-500">Image</th>
              <th className="p-3 text-left text-white bg-yellow-500">Plant Name</th>
              <th className="p-3 text-left text-white bg-yellow-500">Category</th>
              <th className="p-3 text-left text-white bg-yellow-500">Price</th>
              <th className="p-3 text-left text-white bg-yellow-500">Stock</th>
              <th className="p-3 text-left text-white bg-yellow-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPlants.map((plant, index) => (
              <tr
                key={plant._id}
                className="border-b text-white border-green-100 hover:bg-green-900"
              >
                <td className="p-8 text-white">
                  {(currentPage - 1) * plantsPerPage + index + 1}
                </td>
                <td className="p-3 text-white font-mono text-xs break-all">
                  {plant._id}
                </td>
                <td className="p-3 text-green-950 flex items-center justify-center">
                  <div className="w-20 h-20 overflow-hidden rounded-lg bg-red-50 flex items-center justify-center">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${plant.plantImage}`}
                      alt={plant.plantName}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.target.src = 'src/assets/img/logo.png'; // Fallback image
                      }}
                    />
                  </div>
                </td>
                <td className="p-3 font-medium text-white">{plant.plantName}</td>
                <td className="p-3 font-medium text-white">
                  <p className="flex items-center">
                    <MdCategory className="mr-1" />
                    {plant.category}
                  </p>
                </td>
                <td className="p-3">
                  <div className="flex items-center text-white">
                    <span className="text-yellow-500 font-bold mr-1">Rs.</span>
                    <span className="text-white font-bold">
                      {typeof plant.prices === 'object' ? 
                        `${plant.prices.small || 0} - ${plant.prices.large || 0}` :
                        plant.prices || '0'
                      }
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded ${
                      (plant.stockQuantity?.small || 0) + (plant.stockQuantity?.medium || 0) + (plant.stockQuantity?.large || 0) > 20
                        ? "bg-yellow-100 text-yellow-800 flex items-center"
                        : "bg-red-100 text-red-800 flex items-center"
                    }`}
                  >
                    <IoIosPricetags className="mr-1" />
                    {(plant.stockQuantity?.small || 0) + (plant.stockQuantity?.medium || 0) + (plant.stockQuantity?.large || 0)} in stock
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button 
                      className="!text-white hover:!bg-yellow-500 !min-w-0 !p-1"
                      onClick={() => handleEditClick(plant)}
                    >
                      <TbEdit />
                    </Button>
                    <Button 
                      className="!text-red-600 hover:!bg-yellow-500 !min-w-0 !p-1"
                      onClick={() => handleDeleteClick(plant)}
                    >
                      <IoTrashBinOutline />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPlants.length === 0 && (
          <div className="text-center text-green-500 py-6">No plants found</div>
        )}
      </div>

      {/* Pagination Buttons */}
      {filteredPlants.length > plantsPerPage && (
        <div className="flex justify-center items-center gap-4">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="!text-green-950 !border-green-300 !bg-green-100 hover:!bg-yellow-500"
          >
            Previous
          </Button>
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="!text-green-950 !border-green-300 !bg-green-100 hover:!bg-yellow-500"
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog
        open={editModalOpen}
        onClose={handleEditClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: '#052e16',
            borderRadius: '12px',
            border: '2px solid #eab308'
          },
        }}
      >
        <DialogTitle className="text-yellow-500 text-2xl font-bold border-b border-yellow-500/20 pb-4">
          Edit Plant Details
        </DialogTitle>
        <DialogContent className="mt-4">
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}
          {editSuccess && (
            <Alert severity="success" className="mb-4">
              Plant updated successfully!
            </Alert>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <TextField
              name="plantName"
              label="Plant Name"
              value={editFormData.plantName}
              onChange={handleEditInputChange}
              fullWidth
              variant="outlined"
              InputLabelProps={{
                style: { color: '#eab308' },
                className: 'bg-green-950 px-2'
              }}
              InputProps={{
                style: { color: 'white', borderColor: '#eab308' },
                className: '!border-yellow-500 focus:!border-yellow-500'
              }}
            />
            <FormControl fullWidth variant="outlined">
              <InputLabel style={{ color: '#eab308' }} className="bg-green-950 px-2">Category</InputLabel>
              <Select
                name="category"
                value={editFormData.category}
                onChange={handleEditInputChange}
                label="Category"
                className="text-white border-yellow-500"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#eab308',
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#eab308',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#eab308',
                  },
                  '& .MuiSelect-select': {
                    color: 'white',
                  },
                  '& .MuiPaper-root': {
                    backgroundColor: '#052e16',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: '#052e16',
                      '& .MuiMenuItem-root': {
                        color: 'white',
                        '&:hover': {
                          bgcolor: '#0c4a2d',
                        },
                        '&.Mui-selected': {
                          bgcolor: '#0c4a2d',
                          '&:hover': {
                            bgcolor: '#0c4a2d',
                          },
                        },
                      },
                    },
                  },
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <div className="grid grid-cols-3 gap-4">
              <TextField
                name="price-small"
                label="Small Size Price"
                type="number"
                value={editFormData.prices.small}
                onChange={handleEditInputChange}
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  style: { color: '#eab308' },
                  className: 'bg-green-950 px-2'
                }}
                InputProps={{
                  style: { color: 'white', borderColor: '#eab308' },
                  className: '!border-yellow-500 focus:!border-yellow-500'
                }}
              />
              <TextField
                name="price-medium"
                label="Medium Size Price"
                type="number"
                value={editFormData.prices.medium}
                onChange={handleEditInputChange}
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  style: { color: '#eab308' },
                  className: 'bg-green-950 px-2'
                }}
                InputProps={{
                  style: { color: 'white', borderColor: '#eab308' },
                  className: '!border-yellow-500 focus:!border-yellow-500'
                }}
              />
              <TextField
                name="price-large"
                label="Large Size Price"
                type="number"
                value={editFormData.prices.large}
                onChange={handleEditInputChange}
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  style: { color: '#eab308' },
                  className: 'bg-green-950 px-2'
                }}
                InputProps={{
                  style: { color: 'white', borderColor: '#eab308' },
                  className: '!border-yellow-500 focus:!border-yellow-500'
                }}
              />
            </div>
            <div className="relative">
              <TextField
                name="stockQuantity"
                label="Add New Quantity"
                type="number"
                value={editFormData.stockQuantity}
                onChange={handleEditInputChange}
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  style: { color: '#eab308' },
                  className: 'bg-green-950 px-2'
                }}
                InputProps={{
                  style: { color: 'white', borderColor: '#eab308' },
                  className: '!border-yellow-500 focus:!border-yellow-500'
                }}
              />
              <div className="mt-2 text-yellow-500 text-sm">
                Previous Quantity: {
                  typeof editingPlant?.stockQuantity === 'object' 
                    ? (editingPlant.stockQuantity?.small || 0) + 
                      (editingPlant.stockQuantity?.medium || 0) + 
                      (editingPlant.stockQuantity?.large || 0)
                    : editingPlant?.stockQuantity || 0
                }
              </div>
            </div>
            <TextField
              name="rating"
              label="Rating (1-5)"
              type="number"
              value={editFormData.rating}
              onChange={handleEditInputChange}
              inputProps={{ min: 1, max: 5 }}
              fullWidth
              variant="outlined"
              InputLabelProps={{
                style: { color: '#eab308' },
                className: 'bg-green-950 px-2'
              }}
              InputProps={{
                style: { color: 'white', borderColor: '#eab308' },
                className: '!border-yellow-500 focus:!border-yellow-500'
              }}
            />
            <div className="col-span-2">
              <TextField
                name="description"
                label="Description"
                value={editFormData.description}
                onChange={handleEditInputChange}
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                InputLabelProps={{
                  style: { color: '#eab308' },
                  className: 'bg-green-950 px-2'
                }}
                InputProps={{
                  style: { color: 'white', borderColor: '#eab308' },
                  className: '!border-yellow-500 focus:!border-yellow-500'
                }}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions className="p-6 border-t border-yellow-500/20">
          <Button 
            onClick={handleEditClose}
            variant="outlined"
            className="!border-yellow-500 !text-yellow-500 hover:!bg-yellow-500/10"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSubmit}
            disabled={loading}
            variant="contained"
            className="!bg-yellow-500 !text-green-950 hover:!bg-yellow-600 !px-8"
          >
            {loading ? <CircularProgress size={24} className="!text-green-950" /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            backgroundColor: '#052e16', // bg-green-950
          },
        }}
      >
        <DialogTitle id="alert-dialog-title" className="text-yellow-500">
          {"Confirm Delete"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText 
            id="alert-dialog-description" 
            className="text-white"
            sx={{ color: 'white !important' }}
          >
            Are you sure you want to delete the plant "{plantToDelete?.plantName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel}
            className="!text-white hover:!bg-yellow-500"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            className="!text-red-500 hover:!bg-red-700"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PlantsList;
