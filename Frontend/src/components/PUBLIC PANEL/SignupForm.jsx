import { useState } from 'react';
import axios from "axios";

const SignupForm = ({ switchToLogin, closeModal }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = (e) => {
    e.preventDefault(); // Prevent form default behavior

    const fullName = `${firstName} ${lastName}`;
    const UserRegisterData = {
      fullName,
      email,
      password
    };

    axios
      .post(`${import.meta.env.VITE_API_BASE_URL}/api/web/registerUser/insert`, UserRegisterData)
      .then((res) => {
        console.log("Signup success:", res.data);
        closeModal(); // Close modal after successful signup
        switchToLogin(); // Switch to login modal
      })
      .catch((err) => {
        console.error("Signup error:", err);
      });

    console.log("Signup data:", UserRegisterData);
  };

  return (
    <form onSubmit={handleSignup}>
      <h2 className="text-xl font-semibold mb-4 text-center">Sign Up</h2>

      <input
        type="text"
        placeholder="First Name"
        className="block border p-2 w-full my-2 rounded-md text-black"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        pattern="^[A-Za-z]{3,8}$"
        title="First name must be 3-8 letters (only alphabets allowed)"
        required
      />
      <input
        type="text"
        placeholder="Last Name"
        className="block border p-2 w-full my-2 rounded-md text-black"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        pattern="^[A-Za-z]{3,8}$"
        title="Last name must be 3-8 letters (only alphabets allowed)"
        required
      />

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
        className="bg-blue-600 text-white px-4 py-2 mt-2 w-full rounded-md"
      >
        Sign Up
      </button>

      <p className="mt-3 text-center text-gray-600">
        Already have an account?{" "}
        <button className="text-blue-600 underline" type="button" onClick={switchToLogin}>
          Login here
        </button>
      </p>
    </form>
  );
};

export default SignupForm;
