import { useState, useEffect, useRef } from 'react';
import { User, Mail, Calendar, Edit3, Shield, Save, X, Eye, EyeOff, Camera } from 'lucide-react';
import axios from '../../utils/axios';
import { useAuth } from '../auth/AuthContext';

const PublicProfile = ({ isOpen, onClose }) => {
  const { updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: '',
    joined: '',
    profilePic: null
  });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [originalData, setOriginalData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);
  const firstFocusableElementRef = useRef(null);
  const lastFocusableElementRef = useRef(null);

  // Fetch user data only when modal is open
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    
    if (isOpen) {
      console.log('PublicProfile: Fetching user data...');
      fetchUserData(abortController.signal);
    }

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [isOpen]);

  const fetchUserData = async (signal) => {
    try {
      setLoading(true);
      const response = await axios.get('/api/web/me', { signal });
      const user = response.data.user;
      
      // Check if component is still mounted before updating state
      if (!isOpen) return;
      
      setUserData({
        name: user.name,
        email: user.email,
        role: user.role,
        joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : 'Unknown',
        profilePic: user.profilePic
      });
      
      setFormData({
        fullName: user.name,
        email: user.email,
        password: ''
      });
      
      setOriginalData({
        fullName: user.name,
        email: user.email,
        password: ''
      });
    } catch (error) {
      // Don't log errors for aborted requests
      if (error.name === 'AbortError') return;
      
      console.error('Error fetching user data:', error);
      if (isOpen) {
        setMessage('Failed to load user data');
      }
    } finally {
      if (isOpen) {
        setLoading(false);
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setOriginalData({ ...formData });
    setMessage('');
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const updateData = {};
      if (formData.fullName !== originalData.fullName) updateData.fullName = formData.fullName;
      if (formData.email !== originalData.email) updateData.email = formData.email;
      if (formData.password) updateData.password = formData.password;
      
      if (Object.keys(updateData).length === 0) {
        setMessage('No changes to save');
        setIsEditing(false);
        return;
      }
      
      const response = await axios.put('/api/web/me', updateData);
      
      if (response.data.success) {
        setMessage('Profile updated successfully!');
        setUserData(prev => ({
          ...prev,
          name: response.data.user.name,
          email: response.data.user.email
        }));
        setFormData(prev => ({
          ...prev,
          password: ''
        }));
        setIsEditing(false);
        
        // Update the user data in AuthContext
        updateUser(response.data.user);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...originalData });
    setIsEditing(false);
    setShowPassword(false);
    setMessage('');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size should be less than 5MB');
      return;
    }

    try {
      setImageUploading(true);
      setMessage('');

      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await axios.post('/api/web/me/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setMessage('Profile image updated successfully!');
        setUserData(prev => ({
          ...prev,
          profilePic: response.data.user.profilePic
        }));
        
        // Update the user data in AuthContext
        updateUser(response.data.user);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Focus management and accessibility
  useEffect(() => {
    if (isOpen) {
      // Store the element that had focus before opening the modal
      const previouslyFocusedElement = document.activeElement;
      
      // Focus the first focusable element in the modal
      if (firstFocusableElementRef.current) {
        firstFocusableElementRef.current.focus();
      }
      
      // Instead of making the entire page inert, we'll use a more targeted approach
      // Only prevent body scroll and manage focus within the modal
      document.body.style.overflow = 'hidden';
      
      // Add a class to the body to indicate modal is open
      document.body.classList.add('modal-open');
      
      return () => {
        // Restore focus when modal closes
        if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
          previouslyFocusedElement.focus();
        }
        
        // Remove body class and restore scroll
        document.body.classList.remove('modal-open');
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Handle keyboard navigation (trap focus within modal)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Don't render if modal is not open
  if (!isOpen) {
    console.log('PublicProfile: Modal is not open');
    return null;
  }
  
  console.log('PublicProfile: Modal is open, rendering...');

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-green-900 text-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-green-700 shadow-2xl relative" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          ref={firstFocusableElementRef}
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
        
        {/* Main Profile Card */}
        <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-3xl border border-green-700 shadow-2xl overflow-hidden">
          {/* Header Section with Background Pattern */}
          <div className="relative bg-gradient-to-r from-green-700 to-emerald-700 h-32 overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full bg-repeat" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
            </div>
          </div>

          <div className="relative px-8 pb-8">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
              <div className="relative group">
                <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-4xl font-bold text-green-900 border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                  {userData.profilePic ? (
                    <img 
                      src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${userData.profilePic}`} 
                      alt={userData.name} 
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full rounded-full flex items-center justify-center ${userData.profilePic ? 'hidden' : ''}`}>
                    <User size={48} />
                  </div>
                </div>
                
                {/* Camera icon for image upload */}
                <button
                  onClick={triggerFileInput}
                  disabled={imageUploading}
                  className="absolute -bottom-2 -right-2 bg-green-600 rounded-full p-2 shadow-lg hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Change profile picture"
                >
                  {imageUploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Camera size={16} className="text-white" />
                  )}
                </button>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
             
              <div className="text-center sm:text-left flex-1">
                <h1 
                  id="profile-modal-title"
                  className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent"
                >
                  {userData.name || 'Loading...'}
                </h1>
                <p className="text-xl text-yellow-400 font-semibold mb-2">{userData.role || 'Loading...'}</p>
                <p className="text-green-200 max-w-md">Welcome to your profile! Here you can manage your account information and preferences.</p>
              </div>
            </div>

            {/* Contact Information - Editable */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 pt-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-yellow-400 mb-4">Contact Information</h3>
                
                {/* Name Field */}
                <div className="flex items-center gap-4 p-4 bg-green-800/30 rounded-xl border border-green-600/30 hover:bg-green-700/30 transition-colors">
                  <div className="bg-yellow-400 p-2 rounded-lg">
                    <User className="text-green-900" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-green-300 text-sm">Full Name</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="bg-green-700 text-white border border-green-500 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
                        placeholder="Enter full name"
                      />
                    ) : (
                      <p className="text-white font-medium">{formData.fullName}</p>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div className="flex items-center gap-4 p-4 bg-green-800/30 rounded-xl border border-green-600/30 hover:bg-green-700/30 transition-colors">
                  <div className="bg-yellow-400 p-2 rounded-lg">
                    <Mail className="text-green-900" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-green-300 text-sm">Email</p>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="bg-green-700 text-white border border-green-500 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
                        placeholder="Enter email"
                      />
                    ) : (
                      <p className="text-white font-medium">{formData.email}</p>
                    )}
                  </div>
                </div>

                {/* Password Field */}
                <div className="flex items-center gap-4 p-4 bg-green-800/30 rounded-xl border border-green-600/30 hover:bg-green-700/30 transition-colors">
                  <div className="bg-yellow-400 p-2 rounded-lg">
                    <Shield className="text-green-900" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-green-300 text-sm">Password</p>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="bg-green-700 text-white border border-green-500 rounded-lg px-3 py-2 w-full pr-12 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
                          placeholder="Enter new password (leave blank to keep current)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-300 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    ) : (
                      <p className="text-white font-medium">••••••••</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-yellow-400 mb-4">Account Details</h3>
                
                <div className="flex items-center gap-4 p-4 bg-green-800/30 rounded-xl border border-green-600/30 hover:bg-green-700/30 transition-colors">
                  <div className="bg-yellow-400 p-2 rounded-lg">
                    <Calendar className="text-green-900" size={20} />
                  </div>
                  <div>
                    <p className="text-green-300 text-sm">Joined</p>
                    <p className="text-white font-medium">{userData.joined || 'Loading...'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-green-800/30 rounded-xl border border-green-600/30 hover:bg-green-700/30 transition-colors">
                  <div className="bg-yellow-400 p-2 rounded-lg">
                    <Shield className="text-green-900" size={20} />
                  </div>
                  <div>
                    <p className="text-green-300 text-sm">Account Type</p>
                    <p className="text-white font-medium capitalize">{userData.role || 'Loading...'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`mb-6 p-4 rounded-xl text-center ${
                message.includes('successfully') 
                  ? 'bg-green-800/50 border border-green-600 text-green-200' 
                  : 'bg-red-800/50 border border-red-600 text-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  disabled={loading}
                  className={`flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 rounded-xl font-bold text-lg shadow-lg hover:from-yellow-300 hover:to-yellow-400 transform hover:scale-105 transition-all duration-300 ${isHovered ? 'shadow-yellow-400/50 shadow-2xl' : ''} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Edit3 size={20} />
                  {loading ? 'Loading...' : 'Edit Profile'}
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold text-lg shadow-lg hover:from-green-500 hover:to-green-600 transform hover:scale-105 transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Save size={20} />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  
                  <button
                    ref={lastFocusableElementRef}
                    onClick={handleCancel}
                    disabled={loading}
                    className={`flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-red-400 text-red-400 rounded-xl font-bold text-lg hover:bg-red-400 hover:text-white transform hover:scale-105 transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <X size={20} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
