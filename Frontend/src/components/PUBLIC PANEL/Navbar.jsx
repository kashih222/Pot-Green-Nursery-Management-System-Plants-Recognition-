import { useState, useEffect, useRef } from 'react';
import { GiHamburgerMenu } from 'react-icons/gi';
import { RxCross1 } from 'react-icons/rx';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import PublicProfile from './PublicProfile';
import {
  FaUserCircle,
  FaCog,
  FaHistory,
  FaHeart,
  FaSignOutAlt,
  FaShoppingCart,
  FaTimes
} from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from "../../../public/img/logo.png"

const Navbar = () => {
  const {
    cart,
    fetchCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loading: cartLoading,
    error: cartError
  } = useCart();

  const { currentUser: user, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [localCartLoading, setLocalCartLoading] = useState(false);
  const [localCartError, setLocalCartError] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const profileRef = useRef(null);
  const cartRef = useRef(null);
  const location = useLocation();

  // API Configuration
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Base64 encoded SVG as a fallback image
  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2NjYyIgZD0iTTE5IDVIMWEyIDIgMCAwMC0yIDJ2MTRhMiAyIDAgMDAyIDJoMThhMiAyIDAgMDAyLTJWN2EyIDIgMCAwMC0yLTJtMCAxNkgxVjdoMTh2MTRNMTcgMTFhNCA0IDAgMDAtNC00YTQgNCAwIDAwLTQgNCA0IDQgMCAwMDQgNCA0IDQgMCAwMDQtNHoiLz48L3N2Zz4=';

  const userId = user?.id || user?._id;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target) &&
        !event.target.closest('.cart-icon')) {
        setShowCartModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.addEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch user data when user changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      setUserLoading(true);
      setUserError(null);

      try {
        setUserDetails({
          name: user.name,
          email: user.email,
          profilePic: user.profilePic,
        });
      } catch (error) {
        console.error("Failed to process user data:", error);
        setUserError("Failed to load profile data");
        setUserDetails({
          name: user.name,
          email: user.email,
          profilePic: user.profilePic,
        });
      } finally {
        setUserLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Refresh cart when cart modal is opened
  useEffect(() => {
    if (showCartModal && user?._id) {
      fetchCart();
    }
  }, [showCartModal, user?._id]);

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const toggleModal = () => {
    setShowModal(prev => !prev);
    setIsSignup(false);
  };
  const toggleProfileMenu = () => setProfileMenuOpen(prev => !prev);
  const toggleCartModal = () => {
    setShowCartModal(prev => !prev);
    setLocalCartError(null);
    if (!showCartModal && user?._id) {
      fetchCart();
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    try {
      setLocalCartLoading(true);
      setLocalCartError(null);
      await removeFromCart(itemId);
      await fetchCart();
      toast.success('Item removed from cart!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (err) {
      console.error("Failed to remove item:", err);
      setLocalCartError("Failed to remove item");
      toast.error('Failed to remove item', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLocalCartLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      setLocalCartLoading(true);
      setLocalCartError(null);

      if (newQuantity < 1) {
        await handleRemoveFromCart(itemId);
        return;
      }

      if (typeof updateQuantity !== 'function') {
        throw new Error('updateQuantity is not available');
      }

      await updateQuantity(itemId, newQuantity);
      await fetchCart();
      toast.success('Cart updated!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (err) {
      console.error("Failed to update quantity:", err);
      setLocalCartError("Failed to update quantity");
      toast.error('Failed to update quantity', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setLocalCartLoading(false);
    }
  };

  const handleClearCart = async () => {
    try {
      setLocalCartLoading(true);
      setLocalCartError(null);

      if (typeof clearCart !== 'function') {
        throw new Error('clearCart is not available');
      }

      await clearCart();
      await fetchCart();
      toast.success('Cart cleared successfully!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (err) {
      console.error("Failed to clear cart:", err);
      setLocalCartError("Failed to clear cart");
      toast.error('Failed to clear cart', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLocalCartLoading(false);
    }
  };

  // Function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className='mt-[-225px]'>
      {/* Toast Container for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <header className="bg-green-950 fixed w-full top-0 left-0 z-50">
        <nav className="container flex items-center justify-between h-16 sm:h-20 border-b-2 border-yellow-500 px-4">
          <Link to="/">
            <img src={logo} className="w-24 h-24" alt="logo" />
          </Link>

          {/* Mobile Menu */}
          <div className={`fixed top-0 left-0 w-full h-full bg-green-950/90 backdrop-blur-md 
            transform transition-transform duration-300 ease-in-out 
            ${menuOpen ? "translate-x-0" : "-translate-x-full"} 
            lg:static lg:transform-none lg:min-h-fit lg:bg-transparent lg:w-auto lg:flex`}>
            <ul className="flex flex-col items-center gap-8 lg:flex-row lg:gap-6 lg:mt-0 mt-20">
              <li>
                <Link
                  to="/"
                  className={`nav-link ${isActive('/') ? 'text-yellow-500' : 'text-white'}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className={`nav-link ${isActive('/about') ? 'text-yellow-500' : 'text-white'}`}
                  onClick={() => setMenuOpen(false)}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/plants"
                  className={`nav-link ${isActive('/plants') ? 'text-yellow-500' : 'text-white'}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Plants
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className={`nav-link ${isActive('/services') ? 'text-yellow-500' : 'text-white'}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  to="/recognition"
                  className={`nav-link ${isActive('/recognition') ? 'text-yellow-500' : 'text-white'}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Recognition
                </Link>
              </li>
            </ul>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-x-4">
            {/* Shopping Cart */}
            {user && userId && (
              <div className="relative" ref={cartRef}>
                <button
                  onClick={toggleCartModal}
                  className="cart-icon relative text-yellow-500 hover:text-yellow-400 transition-colors"
                  aria-label="Shopping cart"
                >
                  <FaShoppingCart className="text-3xl mt-2" />
                  {cart?.totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.totalItems}
                    </span>
                  )}
                </button>

                {/* Cart Modal */}
                {showCartModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex justify-end">
                    <div className="bg-white w-full max-w-md h-full overflow-y-auto animate-slideIn">
                      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-black">Your Cart ({cart?.totalItems || 0})</h2>
                        <button
                          onClick={toggleCartModal}
                          className="text-gray-500 hover:text-red-500 text-xl"
                        >
                          <FaTimes />
                        </button>
                      </div>

                      {cartLoading || localCartLoading ? (
                        <div className="p-8 text-center text-black">Loading cart...</div>
                      ) : localCartError || cartError ? (
                        <div className="p-8 text-center text-red-500">
                          {localCartError || cartError}
                          <button
                            onClick={() => {
                              setLocalCartError(null);
                              fetchCart();
                            }}
                            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-green-950 font-medium py-2 px-4 rounded-md"
                          >
                            Try Again
                          </button>
                        </div>
                      ) : cart?.items?.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-gray-500 mb-4">Your cart is empty</p>
                          <Link
                            to="/plants"
                            onClick={() => {
                              toggleCartModal();
                              window.scrollTo(0, 0);
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-green-950 font-medium py-2 px-4 rounded-md text-center"
                          >
                            Continue Shopping
                          </Link>
                        </div>
                      ) : (
                        <>
                          <div className="divide-y divide-gray-200">
                            {cart?.items?.map(item => {
                              const imageUrl = item.productId?.plantImage || item.plantImage;
                              const finalImageUrl = imageUrl
                                ? imageUrl.startsWith('http')
                                  ? imageUrl
                                  : `${API_BASE_URL}/uploads/${imageUrl.replace(/^\/?(uploads\/)?/, '')}`
                                : fallbackImage;

                              return (
                                <div key={item._id} className="p-4 flex gap-4 items-start">
                                  <img
                                    src={finalImageUrl}
                                    alt={item.productId?.plantName || item.plantName || 'Plant'}
                                    className="w-20 h-20 object-cover rounded bg-gray-100"
                                    onError={(e) => {
                                      e.target.src = fallbackImage;
                                    }}
                                  />
                                  <div className="flex-1">
                                    <h3 className="font-medium text-black">
                                      {item.productId?.plantName || item.plantName}
                                    </h3>
                                    <p className="text-green-950 font-bold">Rs. {item.price?.toFixed(2)}</p>
                                    <div className="flex items-center mt-2">
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleUpdateQuantity(item._id, item.quantity - 1);
                                        }}
                                        className="w-8 h-8 border border-gray-300 rounded-l flex items-center justify-center hover:bg-gray-100 text-black"
                                        disabled={localCartLoading}
                                      >
                                        -
                                      </button>
                                      <span className="w-10 h-8 border-t border-b border-gray-300 flex items-center justify-center text-black">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleUpdateQuantity(item._id, item.quantity + 1);
                                        }}
                                        className="w-8 h-8 border border-gray-300 rounded-r flex items-center justify-center hover:bg-gray-100 text-black"
                                        disabled={localCartLoading}
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleRemoveFromCart(item._id);
                                    }}
                                    className="text-gray-400 hover:text-red-500 p-1 self-start"
                                    disabled={localCartLoading}
                                  >
                                    <FaTimes />
                                  </button>
                                </div>
                              );
                            })}
                          </div>

                          <div className="p-4 border-t border-gray-200">
                            <div className="flex justify-between font-bold text-lg mb-4 text-black">
                              <span>Total Items:</span>
                              <span>{cart?.totalItems || 0}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg mb-4 text-black">
                              <span>Total Price:</span>
                              <span>Rs. {cart?.totalPrice?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleClearCart}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md"
                                disabled={localCartLoading}
                              >
                                Clear Cart
                              </button>
                              <Link
                                to="/checkout"
                                onClick={toggleCartModal}
                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-950 font-bold py-2 px-4 rounded-md text-center"
                              >
                                Checkout
                              </Link>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Login */}
            {user && userId ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center gap-2 focus:outline-none"
                  aria-label="User profile"
                >
                  {userLoading ? (
                    <div className="animate-pulse">
                      <FaUserCircle className="text-gray-400 text-3xl" />
                    </div>
                  ) : (
                    <>
                      {userDetails?.profilePic ? (
                        <img
                          src={`${API_BASE_URL}/uploads/${userDetails.profilePic}`}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover border-2 border-yellow-500"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-green-900 font-bold text-sm border-2 border-yellow-500 ${userDetails?.profilePic ? 'hidden' : ''}`}>
                        {userDetails?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </>
                  )}
                </button>

                {/* Profile Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 divide-y divide-gray-100 animate-fadeIn">
                    <div className="px-4 py-3">
                      {userError ? (
                        <p className="text-xs text-red-500">{userError}</p>
                      ) : userLoading ? (
                        <div className="animate-pulse space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="rounded-full w-8 h-8 overflow-hidden border-2 border-yellow-500 bg-yellow-400 flex items-center justify-center">
                            {userDetails?.profilePic ? (
                              <img
                                src={`${API_BASE_URL}/uploads/${userDetails.profilePic}`}
                                alt={userDetails?.name || 'User'}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center text-green-900 font-bold text-sm ${userDetails?.profilePic ? 'hidden' : ''}`}>
                              {userDetails?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {userDetails?.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {userDetails?.email || 'user@example.com'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          console.log('Navbar: Opening profile modal');
                          setShowProfileModal(true);
                          setProfileMenuOpen(false);
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FaUserCircle className="mr-2 text-gray-500" />
                        My Profile
                      </button>

                      <Link
                        to="/orders"
                        className={`flex items-center px-4 py-2 text-sm ${isActive('/orders') ? 'text-yellow-500' : 'text-gray-700'} hover:bg-gray-100`}
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <FaHistory className="mr-2 text-gray-500" />
                        Order History
                      </Link>

                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          logout();
                          setProfileMenuOpen(false);
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FaSignOutAlt className="mr-2 text-gray-500" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={toggleModal}
                className="bg-yellow-500 hover:bg-yellow-600 text-green-950 font-medium py-1.5 px-3 sm:py-2 sm:px-4 rounded-md transition-all duration-300 text-sm sm:text-base hover:scale-105"
              >
                Login
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden text-white z-[1001] focus:outline-none"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <RxCross1 size={28} className="transition-transform duration-200 hover:scale-110" />
              ) : (
                <GiHamburgerMenu size={28} className="transition-transform duration-200 hover:scale-110" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Login/Signup Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1000] animate-fadeIn">
          <div className="bg-white p-6 rounded-lg relative w-11/12 sm:w-96 shadow-lg animate-scaleIn">
            <button
              onClick={toggleModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl"
            >
              ✖
            </button>
            <div className="flex justify-center">
              <img src={logo} className="w-16 h-16 mb-3" alt="logo" />
            </div>

            {isSignup ? (
              <SignupForm switchToLogin={() => setIsSignup(false)} closeModal={toggleModal} />
            ) : (
              <LoginForm switchToSignup={() => setIsSignup(true)} closeModal={toggleModal} />
            )}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {console.log('Navbar: showProfileModal state:', showProfileModal)}
      <PublicProfile
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default Navbar;
