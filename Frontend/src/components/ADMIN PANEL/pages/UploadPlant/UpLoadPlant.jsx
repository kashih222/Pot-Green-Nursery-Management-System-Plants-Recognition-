import React, { useState } from 'react'; 
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, CircularProgress } from '@mui/material';
import { IoCloudUploadOutline, IoLeafOutline, IoCloseCircleOutline } from 'react-icons/io5';
import { GiPlantWatering, GiTreeGrowth, GiFruitTree, GiFlowerPot, GiHerbsBundle } from 'react-icons/gi';
import { TbSunset, TbSnowflake, TbPlant2, TbPlant } from 'react-icons/tb';
import { MdLandscape } from 'react-icons/md';
import { FaSeedling } from 'react-icons/fa';
import axios from 'axios';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const UpLoadPlant = () => {
  const [preview, setPreview] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  const initialValues = {
    plantName: '',
    description: '',
    prices: {
      small: '',
      medium: '',
      large: ''
    },
    category: '',
    stockQuantity: {
      small: '',
      medium: '',
      large: ''
    },
    image: null,
    rating: ''
  };

  const validationSchema = Yup.object({
    plantName: Yup.string().required('Plant name is required'),
    description: Yup.string().required('Description is required'),
    prices: Yup.object({
      small: Yup.number()
        .typeError('Price must be a number')
        .required('Small size price is required')
        .positive('Price must be positive'),
      medium: Yup.number()
        .typeError('Price must be a number')
        .required('Medium size price is required')
        .positive('Price must be positive'),
      large: Yup.number()
        .typeError('Price must be a number')
        .required('Large size price is required')
        .positive('Price must be positive')
    }),
    category: Yup.string()
      .required('Category is required')
      .oneOf([ 
        'summer-plant', 'medicinal', 'winter-plant', 'indoor-plants', 'outdoor-plants',
        'vegetable-plants', 'fruits-plant', 'trees', 'ornamental',
        'shrubs', 'herbs', 'crops', 'spices', 'medicinal', 'flower','succulents'
      ], 'Invalid category'),
    stockQuantity: Yup.object({
      small: Yup.number()
        .typeError('Stock must be a number')
        .required('Small size stock is required')
        .integer('Stock must be an integer')
        .min(0, 'Stock must be at least 0'),
      medium: Yup.number()
        .typeError('Stock must be a number')
        .required('Medium size stock is required')
        .integer('Stock must be an integer')
        .min(0, 'Stock must be at least 0'),
      large: Yup.number()
        .typeError('Stock must be a number')
        .required('Large size stock is required')
        .integer('Stock must be an integer')
        .min(0, 'Stock must be at least 0')
    }),
    image: Yup.mixed().required('Plant image is required'),
    rating: Yup.number()
      .required('Rating is required')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must be at most 5')
  });

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    if (!token) {
      navigate('/');
      return;
    }

    const formData = new FormData();
    formData.append('plantName', values.plantName);
    formData.append('description', values.description);
    formData.append('prices', JSON.stringify(values.prices));
    formData.append('category', values.category);
    formData.append('stockQuantity', JSON.stringify(values.stockQuantity));
    formData.append('plantImage', values.image);
    formData.append('rating', values.rating);

    const loadingToast = toast.loading('🌿 Uploading plant...', {
      theme: 'colored',
      style: { background: '#14532d', color: '#facc15' }
    });

    try {
      const response = await axios.post(
        'http://localhost:8020/api/admin/plants/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.update(loadingToast, {
          render: '✅ Plant uploaded successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
          transition: Slide,
          style: { background: '#14532d', color: '#facc15' }
        });
        resetForm();
        setPreview(null);
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error.response?.status === 401) {
        navigate('/');
      }
      toast.update(loadingToast, {
        render: `❌ ${error.response?.data?.message || 'Error uploading plant'}`,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
        transition: Slide,
        style: { background: '#7f1d1d', color: '#facc15' }
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
  };

  return (
    <div className="p-6 bg-green-950 rounded-lg shadow-lg border border-green-50">
      <ToastContainer />
      <div className="mb-8 mt-[-220px]">
        <h2 className="text-3xl font-bold text-white flex items-center gap-2 mt-0">
          <IoLeafOutline className="text-yellow-500" />
          Upload New Plant
        </h2>
        <p className="text-yellow-600 mt-2">Add new plants to your store inventory</p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isSubmitting }) => (
          <Form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-medium mb-2">Plant Name</label>
                <Field
                  name="plantName"
                  className="w-full text-black p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter plant name"
                />
                <ErrorMessage name="plantName" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Description</label>
                <Field
                  name="description"
                  className="w-full text-black p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder="Short description"
                />
                <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Size-based Pricing Section */}
              <div className="col-span-2">
                <h3 className="text-white font-medium mb-4">Size-based Pricing and Stock</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Small Size */}
                  <div className="bg-green-900 p-4 rounded-lg">
                    <h4 className="text-yellow-500 mb-3">Small Size</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-white text-sm mb-1">Price (PKR)</label>
                        <Field
                          name="prices.small"
                          type="number"
                          className="w-full text-black p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                          placeholder="Price for small size"
                        />
                        <ErrorMessage name="prices.small" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                      <div>
                        <label className="block text-white text-sm mb-1">Stock</label>
                        <Field
                          name="stockQuantity.small"
                          type="number"
                          className="w-full text-black p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                          placeholder="Stock for small size"
                        />
                        <ErrorMessage name="stockQuantity.small" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                    </div>
                  </div>

                  {/* Medium Size */}
                  <div className="bg-green-900 p-4 rounded-lg">
                    <h4 className="text-yellow-500 mb-3">Medium Size</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-white text-sm mb-1">Price (PKR)</label>
                        <Field
                          name="prices.medium"
                          type="number"
                          className="w-full text-black p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                          placeholder="Price for medium size"
                        />
                        <ErrorMessage name="prices.medium" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                      <div>
                        <label className="block text-white text-sm mb-1">Stock</label>
                        <Field
                          name="stockQuantity.medium"
                          type="number"
                          className="w-full text-black p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                          placeholder="Stock for medium size"
                        />
                        <ErrorMessage name="stockQuantity.medium" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                    </div>
                  </div>

                  {/* Large Size */}
                  <div className="bg-green-900 p-4 rounded-lg">
                    <h4 className="text-yellow-500 mb-3">Large Size</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-white text-sm mb-1">Price (PKR)</label>
                        <Field
                          name="prices.large"
                          type="number"
                          className="w-full text-black p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                          placeholder="Price for large size"
                        />
                        <ErrorMessage name="prices.large" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                      <div>
                        <label className="block text-white text-sm mb-1">Stock</label>
                        <Field
                          name="stockQuantity.large"
                          type="number"
                          className="w-full text-black p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                          placeholder="Stock for large size"
                        />
                        <ErrorMessage name="stockQuantity.large" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Category</label>
                <Field
                  as="select"
                  name="category"
                  className="w-full text-black p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Select Category</option>
                  <option value="summer-plant">Summer Plants</option>
                  <option value="winter-plant">Winter Plants</option>
                  <option value="indoor-plants">Indoor Plants</option>
                  <option value="outdoor-plants">Outdoor Plants</option>
                  <option value="vegetable-plants">Vegetable Plants</option>
                  <option value="fruits-plant">Fruit Plants</option>
                  <option value="trees">Trees</option>
                  <option value="ornamental">Ornamental</option>
                  <option value="shrubs">Shrubs</option>
                  <option value="herbs">Herbs</option>
                  <option value="crops">Crops</option>
                  <option value="spices">Spices</option>
                  <option value="flower">Flower</option>
                  <option value="medicinal">Medicinal</option>
                  <option value="succulents">Succulents</option>
                </Field>
                <ErrorMessage name="category" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Rating</label>
                <Field
                  as="select"
                  name="rating"
                  className="w-full text-black p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Select Rating</option>
                  {[1, 2, 3, 4, 5].map(rating => (
                    <option key={rating} value={rating}>{rating} Star</option>
                  ))}
                </Field>
                <ErrorMessage name="rating" component="div" className="text-red-500 text-sm mt-1" />
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Plant Image</label>
              <div className="flex flex-col md:flex-row gap-4 items-center w-full border-2 border-dashed border-green-200 rounded-lg p-6">
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setFieldValue('image', file || null);
                    setPreview(file ? URL.createObjectURL(file) : null);
                  }}
                  className="hidden"
                  id="imageUpload"
                  accept="image/*"
                />
                <label
                  htmlFor="imageUpload"
                  className="flex flex-col items-center cursor-pointer text-green-600 hover:text-yellow-600"
                >
                  <IoCloudUploadOutline className="text-4xl mb-2" />
                  <span className="font-medium">Click to upload plant image</span>
                  <span className="text-sm text-green-500">PNG, JPG, JPEG (max 5MB)</span>
                </label>
                {preview && (
                  <div className="relative">
                    <img src={preview} alt="Preview" className="w-32 h-32 rounded-lg object-cover shadow-md border border-green-500" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-0 right-0 text-red-500 text-xl"
                    >
                      <IoCloseCircleOutline />
                    </button>
                  </div>
                )}
              </div>
              <ErrorMessage name="image" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <div className="mt-8">
              <Button
                type="submit"
                variant="contained"
                className="!bg-yellow-500 !text-green-950 hover:!bg-yellow-600 !py-3 !px-6 !rounded-lg !font-medium !text-lg"
                startIcon={isSubmitting ? <CircularProgress size={24} color="inherit" /> : <IoCloudUploadOutline className="text-xl" />}
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Uploading...' : 'Upload Plant'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default UpLoadPlant;
