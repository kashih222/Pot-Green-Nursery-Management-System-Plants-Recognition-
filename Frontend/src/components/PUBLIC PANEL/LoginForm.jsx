import { useState } from 'react';
import { useAuth } from "../../components/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';

const LoginForm = ({ switchToSignup, closeModal, onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log('Submitting login form with:', { email });
      const response = await login(email, password);
      
      // Check for valid response structure
      if (!response) {
        throw new Error("No response received from server");
      }

      // Log the full response for debugging
      console.log("Full login response:", response);

      // Handle both direct user object and nested user object responses
      const userData = response.user || response;
      
      if (!userData || (!userData.id && !userData._id)) {
        throw new Error(response.message || "Invalid user data in response");
      }

      // Ensure role is lowercase for consistent comparison
      const userRole = (userData.role || '').toLowerCase();
      console.log("User role:", userRole);

      // Successful login handling
      console.log("Login successful", userData);
      
      // Close modal first to prevent any UI issues
      closeModal();
      
      // If onLoginSuccess callback is provided, use it instead of navigation
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      } else {
        // Default navigation behavior (for Navbar usage)
        const targetRoute = userRole === "admin" ? "/dashboard" : "/";
        console.log("Navigating to:", targetRoute);
        navigate(targetRoute);
      }

    } catch (error) {
      console.error("Login error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      // Handle different error cases
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           error.response.data?.details ||
                           "Invalid email or password";
        setError(errorMessage);
      } else if (error.request) {
        // Request was made but no response
        setError("No response from server. Please try again.");
      } else {
        // Other errors
        setError(error.message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <Helmet>
            <title> Login | Pot Green Nursery</title>
        </Helmet>
      <h2 className="text-xl font-semibold mb-4 text-center">Login</h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <input
        type="email"
        placeholder="Email"
        className="block border p-2 w-full my-2 rounded-md text-black"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <input
        type="password"
        placeholder="Password"
        className="block border p-2 w-full my-2 rounded-md text-black"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <button
        type="submit"
        className={`bg-green-600 text-white px-4 py-2 mt-2 w-full rounded-md ${
          isLoading ? "opacity-70 cursor-not-allowed" : ""
        }`}
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>
      
      <p className="mt-3 text-center text-gray-600">
        Don't have an account?{" "}
        <button
          type="button"
          className="text-blue-600 underline"
          onClick={switchToSignup}
        >
          Sign up here
        </button>
      </p>
    </form>
  );
};

export default LoginForm;
