import React, { useState, useEffect } from "react";
import { IoCartOutline, IoHeartOutline, IoHeart } from "react-icons/io5";
import axios from "axios";
import { useAuth } from "../../../auth/AuthContext";
import { useCart } from "../../../../context/CartContext";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

const PlantCatalog = () => {
  const { currentUser: user, token } = useAuth();
  const { addToCart: addToCartContext } = useCart();
  const [plants, setPlants] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("price");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [isLoadingPlants, setIsLoadingPlants] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setIsLoadingPlants(true);
        const response = await axios.get(
          "http://localhost:8020/api/admin/plants/all"
        );

        if (response.data?.success && Array.isArray(response.data.data)) {
          setPlants(response.data.data);
        } else {
          throw new Error("Invalid plants data format");
        }
      } catch (error) {
        console.error("Failed to fetch plants:", error);
        setError("Failed to load plants. Please try again later.");
        setPlants([]);
      } finally {
        setIsLoadingPlants(false);
      }
    };

    fetchPlants();
  }, []);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 3000);
  };

  const categories = [
    "all",
    ...new Set(plants.map((plant) => plant?.category).filter(Boolean)),
  ];

  const filteredPlants = plants
    .filter(
      (plant) => categoryFilter === "all" || plant?.category === categoryFilter
    )
    .filter(
      (plant) =>
        plant?.plantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant?.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "price") {
        // Sort by the lowest price of any size
        const aPrice = Math.min(
          a?.prices?.small || Infinity,
          a?.prices?.medium || Infinity,
          a?.prices?.large || Infinity
        );
        const bPrice = Math.min(
          b?.prices?.small || Infinity,
          b?.prices?.medium || Infinity,
          b?.prices?.large || Infinity
        );
        return aPrice - bPrice;
      }
      if (sortBy === "rating") return (b?.rating || 0) - (a?.rating || 0);
      return 0;
    });

  const plantsPerPage = 16;
  const totalPages = Math.ceil(filteredPlants.length / plantsPerPage);
  const paginatedPlants = filteredPlants.slice(
    (currentPage - 1) * plantsPerPage,
    currentPage * plantsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [filteredPlants, totalPages, currentPage]);


  const addToCart = async (plant) => {
    console.log("Current user state:", user);
    console.log("Token state:", token);

    if (!user || !user._id) {
      console.log("User authentication check failed:", { user, token });
      showToast("Please login to add items to cart");
      return;
    }

    if (!plant?._id) {
      showToast("Invalid plant item");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Attempting to add to cart:", {
        plantId: plant._id,
        size: "small",
      });
      const result = await addToCartContext(plant._id, 1, "small");

      if (!result.success) {
        console.log("Add to cart failed:", result);
        throw new Error(result.error || "Failed to add to cart");
      }

      showToast(`${plant.plantName} added to cart!`);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      setError(err.message || "Failed to add item to cart. Please try again.");
      showToast(err.message || "Failed to add item to cart");
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = (plantId) => {
    setWishlist((prevWishlist) =>
      prevWishlist.includes(plantId)
        ? prevWishlist.filter((id) => id !== plantId)
        : [...prevWishlist, plantId]
    );
  };

  const handleSizeSelect = async () => {
    if (!selectedPlant || !selectedSize) return;

    if (!user || !user._id) {
      showToast("Please login to add items to cart");
      setSizeDialogOpen(false);
      return;
    }

    try {
      const result = await addToCartContext(selectedPlant._id, 1, selectedSize);
      if (!result.success) {
        throw new Error(result.error || "Failed to add to cart");
      }
      showToast(`${selectedPlant.plantName} (${selectedSize}) added to cart!`);
      setSizeDialogOpen(false);
      setSelectedPlant(null);
      setSelectedSize("");
    } catch (err) {
      console.error("Failed to add to cart:", err);
      setError(err.message || "Failed to add item to cart. Please try again.");
      showToast(err.message || "Failed to add item to cart");
    }
  };

  const openSizeDialog = (plant) => {
    if (!user || !user._id) {
      showToast("Please login to add items to cart");
      return;
    }
    setSelectedPlant(plant);
    setSizeDialogOpen(true);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);


  return (
    <div className="container mx-auto p-4">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-50 transition-all duration-500 ease-in-out opacity-100 translate-y-0">
          <div className="bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6 text-white-700 pt-16 text-center text-yellow-500">
        Plant Catalog
      </h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search plants by name, description, or category"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border rounded-lg bg-green-950 text-white"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold px-4 py-2 rounded-full bg-green-950">
            Category:
          </span>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-4 py-2 rounded-full ${categoryFilter === category
                ? "bg-yellow-500 text-white"
                : "bg-green-950 hover:bg-green-800"
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-green-950 border rounded-lg"
          >
            <option value="price">Price (Low to High)</option>
            <option value="rating">Rating (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Loading and Error States */}
      {isLoadingPlants ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
          <p className="mt-2">Loading plants...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-yellow-500 rounded-md hover:bg-yellow-600"
          >
            Retry
          </button>
        </div>
      ) : paginatedPlants.length === 0 ? (
        <div className="text-center py-20">
          <p>No plants found. Please try a different filter.</p>
        </div>
      ) : (
        /* Plant Grid */
        <div className="container w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-36 mt-40">
          {paginatedPlants.map((plant) => (
            <div
              key={plant._id}
              className="popular__card bg-green-950 pt-20 rounded-md relative flex flex-col"
            >
              {plant?.plantImage && (
                <img
                  src={`http://localhost:8020${plant.plantImage.startsWith("/uploads")
                    ? plant.plantImage
                    : `/uploads/${plant.plantImage}`
                    }`}
                  alt={plant.plantName}
                  className="w-56 absolute -top-5 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  onError={(e) => {
                    e.target.src = "/path-to-default-plant-image.jpg";
                  }}
                />
              )}

              {/* Card Content with flexbox */}
              <div className="p-4 w-full flex flex-col justify-between h-full">
                {/* --- Top Section --- */}
                <div>
                  <h3 className="text-base font-semibold mb-2">
                    {plant?.plantName || "Unknown Plant"}
                  </h3>
                  <p className="text-sm w-full line-clamp-3 overflow-hidden text-ellipsis">
                    {plant?.description || "No description available"}
                  </p>
                </div>

                {/* --- Bottom Section --- */}
                <div className="mt-4">
                  {plant?.category && (
                    <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm mb-2">
                      {plant.category}
                    </span>
                  )}

                  <div className="flex items-center mb-2 border-t border-green-800 pt-2 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(plant?.rating || 0)
                            ? "text-yellow-400"
                            : "text-green-950"
                          }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="flex text-yellow-500 text-xs ml-2">
                      ({plant?.rating || 0})
                    </span>
                  </div>

                  <div className="w-full flex justify-between items-center">
                    <div>
                      <p className="text-sm">
                        <span className="text-yellow-500">Rs.</span>
                        {plant?.prices
                          ? `${plant.prices.small} - ${plant.prices.large}`
                          : "N/A"}
                      </p>
                      <p className="text-[12px] text-gray-400">
                        {plant?.stockQuantity
                          ? `${plant.stockQuantity.small +
                          plant.stockQuantity.medium +
                          plant.stockQuantity.large
                          } in stock`
                          : "Out of stock"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openSizeDialog(plant)}
                        disabled={
                          loading ||
                          !plant?.stockQuantity ||
                          plant.stockQuantity.small +
                          plant.stockQuantity.medium +
                          plant.stockQuantity.large ===
                          0
                        }
                        className="bg-yellow-500 hover:bg-yellow-600 px-2 py-1 rounded-sm text-xl h-9 w-9 disabled:opacity-50"
                      >
                        <IoCartOutline />
                      </button>
                      <button
                        onClick={() => toggleWishlist(plant._id)}
                        className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded-sm text-xl h-9 w-9"
                      >
                        {wishlist.includes(plant._id) ? (
                          <IoHeart />
                        ) : (
                          <IoHeartOutline />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Size Selection Dialog */}
      <Dialog
        open={sizeDialogOpen}
        onClose={() => {
          setSizeDialogOpen(false);
          setSelectedPlant(null);
          setSelectedSize("");
        }}
        PaperProps={{
          style: {
            backgroundColor: "#052e16",
            color: "white",
            border: "2px solid #eab308",
          },
        }}
      >
        <DialogTitle className="text-yellow-500">Select Size</DialogTitle>
        <DialogContent>
          {selectedPlant && (
            <FormControl fullWidth variant="outlined" className="mt-4">
              <InputLabel
                style={{ color: "#eab308" }}
                className="bg-green-950 px-2"
              >
                Size
              </InputLabel>
              <Select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                label="Size"
                className="text-white border-yellow-500"
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#eab308",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "#eab308",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#eab308",
                  },
                }}
              >
                {["small", "medium", "large"].map((size) => (
                  <MenuItem
                    key={size}
                    value={size}
                    disabled={!selectedPlant.stockQuantity[size]}
                    sx={{
                      color: "white",
                      backgroundColor: "#052e16",
                      "&:hover": {
                        backgroundColor: "#0c4a2d",
                      },
                    }}
                  >
                    <span className="text-white">
                      {size.charAt(0).toUpperCase() + size.slice(1)} - Rs.{" "}
                      {selectedPlant.prices[size]}
                      {selectedPlant.stockQuantity[size] === 0
                        ? " (Out of Stock)"
                        : ` (${selectedPlant.stockQuantity[size]} available)`}
                    </span>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions className="border-t border-yellow-500/20 p-4">
          <Button
            onClick={() => {
              setSizeDialogOpen(false);
              setSelectedPlant(null);
              setSelectedSize("");
            }}
            className="!text-yellow-500"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSizeSelect}
            disabled={!selectedSize}
            className="!bg-yellow-500 !text-green-950"
          >
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          className="px-4 py-2 bg-green-950 text-white rounded-lg"
        >
          Prev
        </button>
        <span className="px-4 py-2 text-white">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
          className="px-4 py-2 bg-green-950 text-white rounded-lg"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PlantCatalog;
