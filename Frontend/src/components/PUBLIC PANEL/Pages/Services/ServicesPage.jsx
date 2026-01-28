import { useState, useEffect } from 'react';
import { FaTruck, FaHeadphones } from "react-icons/fa";
import { PiPottedPlantBold } from "react-icons/pi";
import { GrMoney } from "react-icons/gr";
import { FaTree } from "react-icons/fa6";
import { FaCut } from "react-icons/fa";
import { GiTumbleweed } from "react-icons/gi";
import { GiCactusPot } from "react-icons/gi";
import { X, Calendar, Clock, MapPin, Phone, User, Mail } from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import LoginForm from "../../LoginForm";
import SignupForm from "../../SignupForm";
import logo from "../../../../../public/img/logo.png"

const ServicesPage = () => {
  const { currentUser } = useAuth();
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    service: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    preferredDate: "",
    preferredTime: "",
    additionalNotes: "",
  });

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: currentUser.fullName || currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
      }));
    }
  }, [currentUser]);

  // Manage body scroll when login modal is open
  useEffect(() => {
    if (showLoginModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showLoginModal]);

  const services = [
    {
      id: "tree-planting",
      name: "Tree Planting",
      icon: FaTree,
      description: "Professional tree planting and landscaping services",
    },
    {
      id: "grass-cutting",
      name: "Grass Cutting",
      icon: FaCut,
      description: "Lawn maintenance and grass cutting services",
    },
    {
      id: "weeds-control",
      name: "Weeds Control",
      icon: GiTumbleweed,
      description: "Eco-friendly weed control and garden maintenance",
    },
    {
      id: "pots-planters",
      name: "Pots & Planters",
      icon: GiCactusPot,
      description: "High-quality pots and planters for your plants",
    },
    {
      id: "garden-maintenance",
      name: "Garden Maintenance",
      icon: PiPottedPlantBold,
      description: "Comprehensive garden care and maintenance services",
    },
    {
      id: "landscaping",
      name: "Landscaping",
      icon: FaTree,
      description: "Professional landscaping and design services",
    },
    {
      id: "irrigation-system",
      name: "Irrigation System",
      icon: PiPottedPlantBold,
      description: "Installation and maintenance of irrigation systems",
    },
    {
      id: "plant-care-consultation",
      name: "Plant Care Consultation",
      icon: PiPottedPlantBold,
      description: "Expert advice on plant care and maintenance",
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (
        !formData.service ||
        !formData.fullName ||
        !formData.email ||
        !formData.phone ||
        !formData.address ||
        !formData.city ||
        !formData.zipCode ||
        !formData.preferredDate ||
        !formData.preferredTime
      ) {
        toast.error("Please fill in all required fields.");
        return;
      }

      // Prepare data for backend
      const serviceRequestData = {
        serviceType: formData.service,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phone,
        streetAddress: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        additionalNotes: formData.additionalNotes || "",
      };

      // Send data to backend
      const response = await axios.post(
        "http://localhost:8020/api/web/services/create",
        serviceRequestData
      );

      if (response.data.success) {
        // Show success message
        toast.success(
          "Service request submitted successfully! We will contact you within 24-48 hours."
        );

        // Reset form and close modal
        setFormData({
          service: "",
          fullName: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          zipCode: "",
          preferredDate: "",
          preferredTime: "",
          additionalNotes: "",
        });
        setShowServicesModal(false);
      } else {
        toast.error(
          response.data.message ||
          "Failed to submit service request. Please try again."
        );
      }
    } catch (error) {
      console.error("Error submitting service request:", error);

      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          toast.error("Please log in to submit a service request.");
          setShowServicesModal(false);
          setShowLoginPrompt(true);
        } else if (error.response.status === 400) {
          toast.error(
            error.response.data.message ||
            "Please check your input and try again."
          );
        } else {
          toast.error(
            error.response.data.message ||
            "Failed to submit service request. Please try again."
          );
        }
      } else if (error.request) {
        // Request was made but no response received
        toast.error(
          "Failed to submit service request. Please check your connection and try again."
        );
      } else {
        // Something else happened
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const openServicesModal = () => {
    if (!currentUser) {
      setShowLoginPrompt(true);
      return;
    }
    setShowServicesModal(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
  };

  const closeServicesModal = () => {
    setShowServicesModal(false);
    // Restore body scroll
    document.body.style.overflow = "unset";
  };

  return (
    <div className="bg-white text-green-900 pt-40">
      <div className="container w-full grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* card1 */}
        <div
          className="border border-green-900 p-5  cursor-pointer rounded-md hover:shadow-2xl
         hover:-translate-y-1 duration-300 space-y-5"
        >
          <div className="flex items-center gap-5 ">
            <FaTruck className="text-3xl md:text-4xl xl:text-5xl " />
            <p className="md:text-lg font-bold ">
              Fast <br />
              Delivery
            </p>
          </div>
          <p className="font-Jost">
            At Pot Green, we ensure quick and reliable delivery so you can enjoy
            fresh, healthy plants without any delays. Our efficient logistics
            guarantee that your plants arrive in perfect condition, ready to
            brighten your space. Order now and experience hassle-free, fast
            delivery! 🌱✨
          </p>
        </div>
        {/* card2 */}
        <div
          className="border border-green-900 p-5  cursor-pointer rounded-md hover:shadow-2xl
          hover:-translate-y-1 duration-300 space-y-5"
        >
          <div className="flex items-center gap-5 ">
            <FaHeadphones className="text-3xl md:text-4xl xl:text-5xl " />
            <p className="md:text-lg font-bold ">
              Great Customer <br />
              Service
            </p>
          </div>
          <p className="font-Jost">
            At Pot Green, we are committed to providing exceptional customer
            service. Whether you need plant care advice, order assistance, or
            product recommendations, our friendly team is always ready to help.
            Your happiness is our priority—because every plant and every
            customer matters! 🌿😊
          </p>
        </div>

        {/* card3 */}
        <div
          className="border border-green-900 p-5  cursor-pointer rounded-md hover:shadow-2xl
          hover:-translate-y-1 duration-300 space-y-5"
        >
          <div className="flex items-center gap-5 ">
            <PiPottedPlantBold className="text-3xl md:text-4xl xl:text-5xl " />
            <p className="md:text-lg font-bold ">
              Original <br />
              Plants
            </p>
          </div>
          <p className="font-Jost">
            At Pot Green, we take pride in offering only authentic, high-quality
            plants sourced from trusted growers. Our plants are carefully
            nurtured to ensure they thrive in your home or garden. Shop with
            confidence and bring home the best, naturally! 🌱✨
          </p>
        </div>

        {/* card4 */}
        <div
          className="border border-green-900 p-5  cursor-pointer rounded-md hover:shadow-2xl
          hover:-translate-y-1 duration-300 space-y-5"
        >
          <div className="flex items-center gap-5 ">
            <GrMoney className="text-3xl md:text-4xl xl:text-5xl " />
            <p className="md:text-lg font-bold ">
              Affordable <br />
              Price
            </p>
          </div>
          <p className="font-Jost">
            At Pot Green, we believe that everyone should have access to
            beautiful, healthy plants without breaking the bank. Our wide range
            of plants comes at budget-friendly prices, ensuring you get the best
            quality at the best value. Start your green journey
            today—affordably! 🌱✨
          </p>
        </div>

        {/* card5 */}
        <div
          className="border border-green-900 p-5  cursor-pointer rounded-md hover:shadow-2xl
          hover:-translate-y-1 duration-300 space-y-5"
        >
          <div className="flex items-center gap-5 ">
            <FaTree className="text-3xl md:text-4xl xl:text-5xl " />
            <p className="md:text-lg font-bold ">Tree Planting</p>
          </div>
          <p className="font-Jost">
            Planting trees is one of the best ways to protect the environment
            and create a healthier planet. Trees provide oxygen, improve air
            quality, support wildlife, and combat climate change. At Pot Green,
            we encourage tree planting to build a sustainable future. Join us in
            making the world greener—one tree at a time! 🌱🌍✨
          </p>
        </div>

        {/* card6 */}
        <div
          className="border border-green-900 p-5  cursor-pointer rounded-md hover:shadow-2xl
          hover:-translate-y-1 duration-300 space-y-5"
        >
          <div className="flex items-center gap-5 ">
            <FaCut className="text-3xl md:text-4xl xl:text-5xl " />
            <p className="md:text-lg font-bold ">Grass Cutting</p>
          </div>
          <p className="font-Jost">
            A well-maintained lawn enhances the beauty of any space. Regular
            grass cutting promotes healthy growth, prevents weed invasion, and
            keeps your garden looking lush and tidy. At Pot Green, we provide
            expert tips and tools to help you achieve the perfect green lawn
            effortlessly. Keep your outdoor space fresh and vibrant with proper
            grass care! 🌱✨
          </p>
        </div>

        {/* card7 */}
        <div
          className="border border-green-900 p-5  cursor-pointer rounded-md hover:shadow-2xl
          hover:-translate-y-1 duration-300 space-y-5"
        >
          <div className="flex items-center gap-5 ">
            <GiTumbleweed className="text-3xl md:text-4xl xl:text-5xl " />
            <p className="md:text-lg font-bold ">Weeds Control</p>
          </div>
          <p className="font-Jost">
            Unwanted weeds compete with your plants for nutrients, water, and
            sunlight, affecting their growth. Effective weed control helps
            maintain a healthy and thriving garden. At Pot Green, we offer
            expert tips and eco-friendly solutions to keep your plants safe from
            invasive weeds. Say goodbye to weeds and hello to a flourishing
            garden! 🌱✨
          </p>
        </div>

        {/* card8 */}
        <div
          className="border border-green-900 p-5  cursor-pointer rounded-md hover:shadow-2xl
          hover:-translate-y-1 duration-300 space-y-5"
        >
          <div className="flex items-center gap-5 ">
            <GiCactusPot className="text-3xl md:text-4xl xl:text-5xl " />
            <p className="md:text-lg font-bold ">Pots</p>
          </div>
          <p className="font-Jost">
            At Pot Green, we offer a wide variety of high-quality pots to suit
            every plant and space. Whether you need ceramic, clay, plastic, or
            decorative pots, we have the perfect options to complement your
            garden or indoor setup. Give your plants the best home with our
            stylish and durable pots! 🌱✨
          </p>
        </div>
      </div>
      <div className="service-buy-btn w-full flex flex-col items-center justify-center pb-12  pt-12">
        {/* Login Requirement Note */}
        <div className="text-center mb-6">
          {currentUser ? (
            <p className="text-green-700 font-medium">
              ✅ You're logged in and ready to request services!
            </p>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-yellow-800 font-medium mb-2">
                🔐 Login Required
              </p>
              <p className="text-yellow-700 text-sm">
                Please log in to your account to request our professional
                services.
              </p>
            </div>
          )}
        </div>

        <div
          className="relative group 
        "
        >
          {/* Background glow effect */}
          <div
            className={`absolute -inset-1 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse ${currentUser
              ? "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600"
              : "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600"
              }`}
          ></div>

          {/* Main button */}
          <button
            onClick={openServicesModal}
            className={`relative font-bold text-lg px-12 py-5 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 border-2 ${currentUser
              ? "bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 text-white hover:shadow-green-500/50 border-green-500/30 hover:border-green-400/50"
              : "bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white hover:shadow-yellow-500/50 border-yellow-500/30 hover:border-yellow-400/50"
              }`}
          >
            <span className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              {currentUser ? "Get Our Services" : "Login to Request Services"}
              <svg
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </span>
          </button>

          {/* Floating elements for visual appeal */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-bounce opacity-80"></div>
          <div
            className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-400 rounded-full animate-bounce opacity-80"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>
      </div>

      {/* Services Modal */}
      {showServicesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-green-700 shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={closeServicesModal}
              className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-700 to-emerald-700 text-white p-8 rounded-t-3xl">
              <h2 className="text-3xl font-bold text-center mb-2">
                Request Our Services
              </h2>
              <p className="text-center text-green-100">
                Fill out the form below to get started with our professional
                plant care services
              </p>

              {/* User Info Section */}
              {currentUser && (
                <div className="mt-4 p-4 bg-green-600/20 rounded-xl border border-green-400/30">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                      <User size={16} className="text-green-800" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-green-100">
                        Welcome back, {currentUser.fullName || currentUser.name}
                        !
                      </p>
                      <p className="text-sm text-green-200">
                        Your information will be pre-filled below
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Service Selection */}
              <div className="space-y-3">
                <label className="block text-lg font-semibold text-green-900">
                  Select Service
                </label>
                <select
                  value={formData.service}
                  onChange={(e) => handleInputChange("service", e.target.value)}
                  required
                  className="w-full p-4 border-2 border-green-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-colors text-green-900"
                >
                  <option value="">Choose a service...</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.name}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-green-900">
                    <User size={20} className="inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    required
                    minLength={6}
                    maxLength={18}
                    pattern="^[A-Za-z ]{6,18}$"
                    title="Full name should only contain alphabets and spaces (6–18 characters)."
                    className="w-full p-4 border-2 border-green-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-colors text-green-900"
                    placeholder="Enter your full name"
                  />  
                </div>

                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-green-900">
                    <Mail size={20} className="inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="w-full p-4 border-2 border-green-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-colors text-green-900"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-green-900">
                    <Phone size={20} className="inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                    minLength={10}
                    maxLength={15}
                    pattern="[0-9]+"
                    title="Phone number should contain only digits."
                    className="w-full p-4 border-2 border-green-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-colors text-green-900"
                    placeholder="Enter your phone number"
                  />

                </div>

                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-green-900">
                    <Calendar size={20} className="inline mr-2" />
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) =>
                      handleInputChange("preferredDate", e.target.value)
                    }
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full p-4 border-2 border-green-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-colors text-green-900"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-green-900">
                    <Clock size={20} className="inline mr-2" />
                    Preferred Time *
                  </label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) =>
                      handleInputChange("preferredTime", e.target.value)
                    }
                    required
                    className="w-full p-4 border-2 border-green-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-colors text-green-900"
                  >
                    <option value="">Select time...</option>
                    <option value="Morning (8:00 AM - 12:00 PM)">
                      Morning (8:00 AM - 12:00 PM)
                    </option>
                    <option value="Afternoon (12:00 PM - 4:00 PM)">
                      Afternoon (12:00 PM - 4:00 PM)
                    </option>
                    <option value="Evening (4:00 PM - 8:00 PM)">
                      Evening (4:00 PM - 8:00 PM)
                    </option>
                  </select>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-green-900 border-b-2 border-green-200 pb-2">
                  <MapPin size={24} className="inline mr-2" />
                  Service Address
                </h3>

                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-green-900">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    required
                    className="w-full p-4 border-2 border-green-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-colors text-green-900"
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-lg font-semibold text-green-900">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      required
                      className="w-full p-4 border-2 border-green-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-colors text-green-900"
                      placeholder="Enter your city"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-lg font-semibold text-green-900">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) =>
                        handleInputChange("zipCode", e.target.value)
                      }
                      required
                      className="w-full p-4 border-2 border-green-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-colors text-green-900"
                      placeholder="Enter ZIP code"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-3">
                <label className="block text-lg font-semibold text-green-900">
                  Additional Notes
                </label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) =>
                    handleInputChange("additionalNotes", e.target.value)
                  }
                  rows={4}
                  className="w-full p-4 border-2 border-green-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-colors text-green-900 resize-none"
                  placeholder="Any special requirements or additional information..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold text-lg px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Submit Service Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={32} className="text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Login Required
              </h3>
              <p className="text-gray-600">
                Please log in to your account to submit a service request.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  setShowLoginModal(true);
                }}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Go to Login
              </button>

              <button
                onClick={() => setShowLoginPrompt(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1000] transition-opacity duration-300">
          <div className="bg-white p-6 rounded-lg relative w-11/12 sm:w-96 shadow-lg transform transition-all duration-300 scale-100">
            <button
              onClick={() => {
                setShowLoginModal(false);
                setShowLoginPrompt(false);
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl"
            >
              ✖
            </button>
            <button
              onClick={() => {
                setShowLoginModal(false);
                setShowLoginPrompt(true);
              }}
              className="absolute top-2 left-2 text-gray-500 hover:text-blue-600 text-lg"
            >
              ← Back
            </button>
            <div className="flex justify-center">
              <img src={logo} className="w-16 h-16 mb-3" alt="logo" />
            </div>

            {isSignup ? (
              <SignupForm
                switchToLogin={() => setIsSignup(false)}
                closeModal={() => setShowLoginModal(false)}
              />
            ) : (
              <LoginForm
                switchToSignup={() => setIsSignup(true)}
                closeModal={() => setShowLoginModal(false)}
                onLoginSuccess={(userData) => {
                  // Close login modal and login prompt, then open services modal
                  setShowLoginModal(false);
                  setShowLoginPrompt(false);
                  setShowServicesModal(true);
                  // Pre-fill form with user data
                  setFormData((prev) => ({
                    ...prev,
                    fullName: userData.fullName || userData.name || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                  }));
                  // Show success message
                  toast.success(`Welcome back, ${userData.fullName || userData.name}! You can now submit your service request.`);
                }}
              />
            )}
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
};

export default ServicesPage;
