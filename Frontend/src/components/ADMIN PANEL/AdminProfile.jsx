import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Calendar, Edit3, MapPin, Award, Shield, Save, X, Eye, EyeOff, Camera } from 'lucide-react';
import axios from '../../utils/axios';
import { useAuth } from '../auth/AuthContext';

const adminInfo = {
  name: 'Admin User',
  email: 'admin@potgreen.com',
  role: 'Administrator',
  phone: '+92 300 1234567',
  joined: '2023-01-15',
  location: 'Lahore, Pakistan',
  avatar: '', // You can use a URL or leave empty for default
  bio: 'Passionate administrator with expertise in system management and team leadership.',
  stats: {
    projects: 45,
    experience: '5+ Years',
    rating: 4.9
  }
};

const AdminProfile = () => {
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

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/web/me');
      const user = response.data.user;
      
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
      console.error('Error fetching user data:', error);
      setMessage('Failed to load user data');
    } finally {
      setLoading(false);
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

  return (
    <div className="bg-green-900 text-white min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
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
                       src={`http://localhost:8020/uploads/${userData.profilePic}`} 
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
                <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                  {userData.name || 'Loading...'}
                </h1>
                <p className="text-xl text-yellow-400 font-semibold mb-2">{userData.role || 'Loading...'}</p>
                <p className="text-green-200 max-w-md">{adminInfo.bio}</p>
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
                <h3 className="text-xl font-semibold text-yellow-400 mb-4">Additional Details</h3>
                
                <div className="flex items-center gap-4 p-4 bg-green-800/30 rounded-xl border border-green-600/30 hover:bg-green-700/30 transition-colors">
                  <div className="bg-yellow-400 p-2 rounded-lg">
                    <Calendar className="text-green-900" size={20} />
                  </div>
                  <div>
                    <p className="text-green-300 text-sm">Joined</p>
                    <p className="text-white font-medium">{userData.joined || 'Loading...'}</p>
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
                    onClick={handleCancel}
                    disabled={loading}
                    className={`flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-red-400 text-red-400 rounded-xl font-bold text-lg hover:bg-red-400 hover:text-white transform hover:scale-105 transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <X size={20} />
                    Cancel
                  </button>
                </div>
              )}
              
              {!isEditing && (
                <button className="flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-yellow-400 text-yellow-400 rounded-xl font-bold text-lg hover:bg-yellow-400 hover:text-green-900 transform hover:scale-105 transition-all duration-300">
                  <Shield size={20} />
                  Settings
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
