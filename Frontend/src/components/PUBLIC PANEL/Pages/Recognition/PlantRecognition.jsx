import { useState, useRef } from 'react';
import axios from "axios";
import { FaUpload, FaLeaf, FaSpinner, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { Helmet } from 'react-helmet-async';

const PlantRecognition = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    processFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    } else {
      setError("Please select a valid image file");
    }
  };

  const handleRecognition = async () => {
    if (!image) return;
    
    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/web/plant-recognition/recognize`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      if (response.data.success) {
        setResult(response.data);
      } else {
        setError(response.data.error || "Recognition failed");
      }
    } catch (error) {
      console.error("Error recognizing plant:", error);
      setError("Failed to recognize plant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const resetForm = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 mt-20">
      <Helmet>
            <title> Recognition | Pot Green Nursery</title>
        </Helmet>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FaLeaf className="text-4xl text-green-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Plant Recognition</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload a photo of any plant and our AI will identify it for you. 
            Get instant results with the top 3 predictions and detailed confidence scores.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Upload Image</h2>
            
            {/* Drag & Drop Area */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                dragging 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              
              <div className="space-y-4">
                <FaUpload className="mx-auto text-4xl text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    {dragging ? "Drop your image here" : "Drag & drop your image here"}
                  </p>
                  <p className="text-gray-500 mt-2">or click to browse</p>
                </div>
                <p className="text-sm text-gray-400">
                  Supports: JPG, PNG, GIF (Max 10MB)
                </p>
              </div>
            </div>

            {/* Preview */}
            {preview && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Preview</h3>
                <div className="relative">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                  <button
                    onClick={resetForm}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <FaTimesCircle />
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <FaTimesCircle className="text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Recognize Button */}
            <button
              onClick={handleRecognition}
              disabled={!image || loading}
              className={`w-full mt-6 py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center ${
                !image || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 transform hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Analyzing Plant...
                </>
              ) : (
                <>
                  <FaLeaf className="mr-2" />
                  Identify Plant
                </>
              )}
            </button>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Results</h2>
            
            {loading && (
              <div className="text-center py-12">
                <FaSpinner className="animate-spin text-4xl text-green-600 mx-auto mb-4" />
                <p className="text-gray-600">Analyzing your plant image...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Success Icon */}
                <div className="text-center">
                  <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800">Plant Identified!</h3>
                </div>

                {/* Top 3 Predictions */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Top 3 Predictions</h4>
                  
                  {result.topPredictions && result.topPredictions.map((prediction, index) => (
                    <div 
                      key={prediction.index}
                      className={`border rounded-lg p-4 transition-all duration-300 ${
                        index === 0 
                          ? 'bg-green-50 border-green-300 shadow-md' 
                          : index === 1 
                            ? 'bg-blue-50 border-blue-300' 
                            : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 ${
                            index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-gray-500'
                          }`}>
                            {index + 1}
                          </div>
                          <h5 className={`font-semibold ${
                            index === 0 ? 'text-green-900' : index === 1 ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {prediction.name}
                          </h5>
                        </div>
                        <span className={`text-lg font-bold ${
                          index === 0 ? 'text-green-600' : index === 1 ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          {prediction.confidence}%
                        </span>
                      </div>
                      
                      {/* Confidence Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${
                            index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-gray-500'
                          }`}
                          style={{ width: `${prediction.confidence}%` }}
                        ></div>
                      </div>
                      
                      {/* Rank Label */}
                      <div className="text-center mt-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          index === 0 
                            ? 'bg-green-100 text-green-800' 
                            : index === 1 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {index === 0 ? '🥇 Most Likely' : index === 1 ? '🥈 Second Choice' : '🥉 Third Choice'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Uploaded Image */}
                {(preview || result.uploadedImage) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Analyzed Image</h4>
                    <img 
                      src={preview || result.uploadedImage} 
                      alt="Analyzed Plant" 
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                  </div>
                )}

                {/* Try Again Button */}
                <button
                  onClick={resetForm}
                  className="w-full py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Try Another Image
                </button>
              </div>
            )}

            {!loading && !result && (
              <div className="text-center py-12 text-gray-500">
                <FaLeaf className="text-4xl mx-auto mb-4 opacity-50" />
                <p>Upload an image to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Image</h3>
              <p className="text-gray-600">Simply drag and drop or click to upload a clear photo of your plant</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Analysis</h3>
              <p className="text-gray-600">Our advanced AI model analyzes the image using deep learning technology</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Get Results</h3>
              <p className="text-gray-600">Receive instant identification with top 3 predictions and confidence scores</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantRecognition;
