import { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { 
  IoAddCircleOutline, 
  IoSearchOutline, 
  IoTrashBinOutline,
  IoPricetagOutline,
  IoStatsChartOutline,
  IoLeafOutline
} from 'react-icons/io5';
import { TbEdit, TbCurrencyRupee, TbPlant2 } from 'react-icons/tb';
import { GiPlantWatering, GiTreeGrowth, GiFruitTree } from 'react-icons/gi';
import { useAuth } from '../../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const CategoryPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAddCategory, setOpenAddCategory] = useState(false);
  const [openEditCategory, setOpenEditCategory] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAddProduct, setOpenAddProduct] = useState(false);
  const [openEditProduct, setOpenEditProduct] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch categories data
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        if (!token) {
          navigate('/');
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/plants/all`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          // Process plants into categories
          const plantsByCategory = response.data.data.reduce((acc, plant) => {
            if (!plant.category) return acc;
            
            if (!acc[plant.category]) {
              acc[plant.category] = {
                name: plant.category,
                products: []
              };
            }
            acc[plant.category].products.push(plant);
            return acc;
          }, {});

          setCategories(Object.values(plantsByCategory));
        } else {
          throw new Error(response.data.message || 'Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        if (error.response?.status === 401) {
          navigate('/');
        }
        setError(error.message || 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [token, navigate]);

  // Form Validation Schemas
  const categorySchema = Yup.object().shape({
    name: Yup.string().required('Category name is required')
  });

  const productSchema = Yup.object().shape({
    name: Yup.string().required('Product name is required'),
    price: Yup.number().required('Price is required').positive(),
    stock: Yup.number().required('Stock is required').integer().min(0)
  });

  // Category Operations
  const handleAddCategory = async (values, { resetForm }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/plants/categories`,
        { name: values.name },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setCategories([...categories, response.data.category]);
    setOpenAddCategory(false);
        resetForm();
      } else {
        throw new Error(response.data.message || 'Failed to add category');
      }
    } catch (err) {
      console.error('Error adding category:', err);
      setError(err.message || 'Error adding category');
    }
  };

  const handleUpdateCategory = async (values) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/plants/categories/${selectedCategory._id}`,
        { name: values.name },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setCategories(categories.map(cat => 
          cat._id === selectedCategory._id ? response.data.category : cat
        ));
    setOpenEditCategory(false);
      } else {
        throw new Error(response.data.message || 'Failed to update category');
      }
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err.message || 'Error updating category');
    }
  };

  const handleDeleteCategory = async () => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/plants/categories/${selectedCategory._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setCategories(categories.filter(cat => cat._id !== selectedCategory._id));
    setOpenDeleteDialog(false);
      } else {
        throw new Error(response.data.message || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err.message || 'Error deleting category');
    }
  };

  // Product Operations
  const handleAddProduct = (values) => {
    const updatedCategories = categories.map(category => {
      if (category.id === selectedCategory.id) {
        return {
          ...category,
          products: [...category.products, {
            id: category.products.length + 1,
            ...values
          }]
        };
      }
      return category;
    });
    setCategories(updatedCategories);
    setOpenAddProduct(false);
  };

  const handleUpdateProduct = (values) => {
    const updatedCategories = categories.map(category => {
      if (category.id === selectedCategory.id) {
        return {
          ...category,
          products: category.products.map(product => 
            product.id === selectedProduct.id ? values : product
          )
        };
      }
      return category;
    });
    setCategories(updatedCategories);
    setOpenEditProduct(false);
  };

  const handleDeleteProduct = (productId) => {
    const updatedCategories = categories.map(category => {
      if (category.id === selectedCategory.id) {
        return {
          ...category,
          products: category.products.filter(product => product.id !== productId)
        };
      }
      return category;
    });
    setCategories(updatedCategories);
  };

  // Filter Categories
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate statistics
  const totalPlants = categories.reduce((sum, cat) => sum + (cat.products?.length || 0), 0);
  const activeCategories = categories.filter(cat => cat.products?.length > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress className="text-green-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-950 p-6">
      {/* Header Section with improved styling */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-yellow-500 flex items-center gap-2">
          <IoLeafOutline className="text-4xl" />
          Plant Categories
        </h2>
        <p className="text-green-300 mt-2">View and manage your plant categories</p>
      </div>
        
      {/* Search Bar */}
      <div className="mb-8">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-96 p-3 rounded-lg bg-green-900 text-white border border-green-700 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-900 p-6 rounded-lg shadow-lg border border-green-700">
          <div className="flex items-center gap-3">
            <IoStatsChartOutline className="text-3xl text-yellow-500" />
            <div>
              <h3 className="text-white font-medium">Total Categories</h3>
              <p className="text-2xl font-bold text-yellow-500">{categories.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-900 p-6 rounded-lg shadow-lg border border-green-700">
          <div className="flex items-center gap-3">
            <TbPlant2 className="text-3xl text-yellow-500" />
            <div>
              <h3 className="text-white font-medium">Total Plants</h3>
              <p className="text-2xl font-bold text-yellow-500">{totalPlants}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-900 p-6 rounded-lg shadow-lg border border-green-700">
          <div className="flex items-center gap-3">
            <IoPricetagOutline className="text-3xl text-yellow-500" />
            <div>
              <h3 className="text-white font-medium">Active Categories</h3>
              <p className="text-2xl font-bold text-yellow-500">{activeCategories}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div
            key={category.name}
            className="bg-green-900 rounded-lg p-6 border border-green-700 hover:border-yellow-500 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">{category.name}</h3>
              <span className="text-yellow-500 font-medium">
                {category.products?.length || 0} Plants
              </span>
            </div>
            <div className="space-y-2">
              {category.products?.slice(0, 3).map((product) => (
                <div
                  key={product._id}
                  className="text-green-300 text-sm flex justify-between items-center"
                >
                  <span>{product.plantName}</span>
                  <span className="text-yellow-500">
                    PKR {product.prices ? `${product.prices.small} - ${product.prices.large}` : 'N/A'}
                  </span>
                </div>
              ))}
              {(category.products?.length || 0) > 3 && (
                <p className="text-green-500 text-sm">
                  +{category.products.length - 3} more plants
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      <Dialog open={openAddCategory} onClose={() => setOpenAddCategory(false)}>
        <div className="bg-green-50">
          <DialogTitle className="!bg-green-950 !text-yellow-500">
            Create New Category
          </DialogTitle>
          <DialogContent className="!pt-6">
            <Formik
              initialValues={{ name: '' }}
              validationSchema={categorySchema}
              onSubmit={handleAddCategory}
            >
              {() => (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-green-900 mb-2">Category Name</label>
                    <Field
                      name="name"
                      className="w-full p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <DialogActions>
                    <Button 
                      onClick={() => setOpenAddCategory(false)} 
                      className="!text-green-900 hover:!bg-green-200"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="!bg-yellow-500 !text-green-950 hover:!bg-yellow-600"
                    >
                      Create Category
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </div>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={openEditCategory} onClose={() => setOpenEditCategory(false)}>
        <div className="bg-green-50">
          <DialogTitle className="!bg-green-950 !text-yellow-500">
            Edit Category
          </DialogTitle>
          <DialogContent className="!pt-6">
            <Formik
              initialValues={{ name: selectedCategory?.name || '' }}
              validationSchema={categorySchema}
              onSubmit={handleUpdateCategory}
            >
              {() => (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-green-900 mb-2">Category Name</label>
                    <Field
                      name="name"
                      className="w-full p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <DialogActions>
                    <Button 
                      onClick={() => setOpenEditCategory(false)} 
                      className="!text-green-900 hover:!bg-green-200"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="!bg-yellow-500 !text-green-950 hover:!bg-yellow-600"
                    >
                      Update Category
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <div className="bg-green-50 p-6 rounded-lg">
          <DialogTitle className="!text-green-950 !font-bold !text-lg">
            Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <p className="text-green-700">
              Are you sure you want to permanently delete the "{selectedCategory?.name}" category?
            </p>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpenDeleteDialog(false)} 
              className="!text-green-900 hover:!bg-green-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteCategory} 
              className="!bg-red-600 !text-white hover:!bg-red-700"
            >
              Delete Permanently
            </Button>
          </DialogActions>
        </div>
      </Dialog>

      {/* Add Product Modal */}
      <Dialog open={openAddProduct} onClose={() => setOpenAddProduct(false)}>
        <div className="bg-green-50">
          <DialogTitle className="!bg-green-950 !text-yellow-500">
            Add New Product to {selectedCategory?.name}
          </DialogTitle>
          <DialogContent className="!pt-6">
            <Formik
              initialValues={{ name: '', price: '', stock: '' }}
              validationSchema={productSchema}
              onSubmit={handleAddProduct}
            >
              {() => (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-green-900 mb-2">Product Name</label>
                    <Field
                      name="name"
                      className="w-full p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <div>
                    <label className="block text-green-900 mb-2">Price</label>
                    <div className="relative">
                      <TbCurrencyRupee className="absolute left-3 top-3 text-green-700 text-xl" />
                      <Field
                        name="price"
                        type="number"
                        className="w-full pl-10 p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>
                    <ErrorMessage name="price" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <div>
                    <label className="block text-green-900 mb-2">Stock Quantity</label>
                    <Field
                      name="stock"
                      type="number"
                      className="w-full p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                    <ErrorMessage name="stock" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <DialogActions>
                    <Button 
                      onClick={() => setOpenAddProduct(false)} 
                      className="!text-green-900 hover:!bg-green-200"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="!bg-yellow-500 !text-green-950 hover:!bg-yellow-600"
                    >
                      Add Product
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </div>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={openEditProduct} onClose={() => setOpenEditProduct(false)}>
        <div className="bg-green-50">
          <DialogTitle className="!bg-green-950 !text-yellow-500">
            Edit Product in {selectedCategory?.name}
          </DialogTitle>
          <DialogContent className="!pt-6">
            <Formik
              initialValues={selectedProduct || { name: '', price: '', stock: '' }}
              validationSchema={productSchema}
              onSubmit={handleUpdateProduct}
            >
              {() => (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-green-900 mb-2">Product Name</label>
                    <Field
                      name="name"
                      className="w-full p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <div>
                    <label className="block text-green-900 mb-2">Price</label>
                    <div className="relative">
                      <TbCurrencyRupee className="absolute left-3 top-3 text-green-700 text-xl" />
                      <Field
                        name="price"
                        type="number"
                        className="w-full pl-10 p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>
                    <ErrorMessage name="price" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <div>
                    <label className="block text-green-900 mb-2">Stock Quantity</label>
                    <Field
                      name="stock"
                      type="number"
                      className="w-full p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                    <ErrorMessage name="stock" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <DialogActions>
                    <Button 
                      onClick={() => setOpenEditProduct(false)} 
                      className="!text-green-900 hover:!bg-green-200"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="!bg-yellow-500 !text-green-950 hover:!bg-yellow-600"
                    >
                      Update Product
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </div>
      </Dialog>
    </div>
  );
};

export default CategoryPage;
