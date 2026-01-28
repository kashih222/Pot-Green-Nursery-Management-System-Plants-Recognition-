import { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Helmet } from 'react-helmet-async';

const EditPlant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    plantName: "",
    description: "",
    price: "",
    category: "",
    stockQuantity: "",
    rating: "",
    plantImage: null,
  });
  const [previewImage, setPreviewImage] = useState(null);

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
    const fetchPlant = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/all-plants/products/${id}`);
        const plant = response.data;
        setFormData({
          plantName: plant.plantName,
          description: plant.description,
          price: plant.price,
          category: plant.category,
          stockQuantity: plant.stockQuantity,
          rating: plant.rating || "",
        });
        setPreviewImage(
          plant.plantImage?.startsWith('http')
            ? plant.plantImage
            : `${import.meta.env.VITE_API_BASE_URL}/uploads/${plant.plantImage}`
        );
      } catch (err) {
        console.error("Error fetching plant:", err);
        setError(err.message || "Failed to fetch plant details");
      } finally {
        setLoading(false);
      }
    };

    fetchPlant();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        plantImage: file,
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Only include fields that have been changed
      const formDataToSend = new FormData();
      
      // Compare with initial data and only send changed fields
      if (formData.plantName !== "") formDataToSend.append("plantName", formData.plantName);
      if (formData.description !== "") formDataToSend.append("description", formData.description);
      if (formData.price !== "") formDataToSend.append("price", formData.price);
      if (formData.category !== "") formDataToSend.append("category", formData.category);
      if (formData.stockQuantity !== "") formDataToSend.append("stockQuantity", formData.stockQuantity);
      if (formData.rating !== "") formDataToSend.append("rating", formData.rating);
      if (formData.plantImage) formDataToSend.append("plantImage", formData.plantImage);

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/all-plants/${id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setSuccess(true);
        // Navigate back to plants list after 2 seconds
        setTimeout(() => {
          navigate("/dashboard/product/plants-list");
        }, 2000);
      }
    } catch (err) {
      console.error("Error updating plant:", err);
      setError(err.response?.data?.message || err.message || "Failed to update plant");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.plantName) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="p-6 bg-green-950 rounded-lg shadow">
      <Helmet>
                    <title>Update Info | Pot Green Nursary</title>
                  </Helmet>
      <Typography variant="h4" className="text-yellow-500 mb-6">
        Edit Plant
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" className="mb-4">
          Plant updated successfully! Redirecting...
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            name="plantName"
            label="Plant Name"
            value={formData.plantName}
            onChange={handleInputChange}
            required
            fullWidth
            className="bg-white rounded"
          />

          <FormControl fullWidth required>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="bg-white rounded"
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            name="price"
            label="Price"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            required
            fullWidth
            className="bg-white rounded"
          />

          <TextField
            name="stockQuantity"
            label="Stock Quantity"
            type="number"
            value={formData.stockQuantity}
            onChange={handleInputChange}
            required
            fullWidth
            className="bg-white rounded"
          />

          <TextField
            name="rating"
            label="Rating (1-5)"
            type="number"
            value={formData.rating}
            onChange={handleInputChange}
            inputProps={{ min: 1, max: 5 }}
            fullWidth
            className="bg-white rounded"
          />

          <div className="col-span-2">
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleInputChange}
              required
              fullWidth
              multiline
              rows={4}
              className="bg-white rounded"
            />
          </div>

          <div className="col-span-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="plant-image-input"
            />
            <label
              htmlFor="plant-image-input"
              className="block w-full p-2 text-center border-2 border-dashed border-yellow-500 rounded-lg cursor-pointer hover:border-yellow-600 text-white"
            >
              Click to upload new image
            </label>
            {previewImage && (
              <div className="mt-2">
                <img
                  src={previewImage}
                  alt="Plant preview"
                  className="max-w-xs mx-auto rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            onClick={() => navigate("/dashboard/product/plants-list")}
            className="!bg-gray-500 !text-white hover:!bg-gray-600"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="!bg-yellow-500 !text-green-950 hover:!bg-yellow-600"
          >
            {loading ? <CircularProgress size={24} /> : "Update Plant"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditPlant; 
