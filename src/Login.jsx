import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Static credentials for demo purposes
const STATIC_CREDENTIALS = {
  name: "John Doe",
  address: "123 Main St",
  number: "1234567890",
  password: "adi@gold",
};

const Login = ({ children }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    number: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Load saved credentials from local storage and attempt auto-login
  useEffect(() => {
    const savedCredentials = localStorage.getItem("savedCredentials");
    if (savedCredentials) {
      const parsedCredentials = JSON.parse(savedCredentials);
      setFormData(parsedCredentials);
      autoLogin(parsedCredentials);
    }
  }, []);

  const autoLogin = (credentials) => {
    if (
      credentials.name === STATIC_CREDENTIALS.name &&
      credentials.address === STATIC_CREDENTIALS.address &&
      credentials.number === STATIC_CREDENTIALS.number &&
      credentials.password === STATIC_CREDENTIALS.password
    ) {
      localStorage.setItem("isAuthenticated", "true");
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("savedCredentials");
      localStorage.removeItem("isAuthenticated");
      setError("Stored credentials are invalid. Please enter new credentials.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (
      formData.name === STATIC_CREDENTIALS.name &&
      formData.address === STATIC_CREDENTIALS.address &&
      formData.number === STATIC_CREDENTIALS.number &&
      formData.password === STATIC_CREDENTIALS.password
    ) {
      localStorage.setItem("savedCredentials", JSON.stringify(formData));
      localStorage.setItem("isAuthenticated", "true");
      setIsAuthenticated(true);
    } else {
      alert("Invalid credentials");
      setFormData({
        name: "",
        address: "",
        number: "",
        password: "",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("savedCredentials");
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
    setFormData({
      name: "",
      address: "",
      number: "",
      password: "",
    });
  };

  // Render children if authenticated
  if (isAuthenticated) {
    return (
      <div>
        <button
          onClick={handleLogout}
          className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
        {children}
      </div>
    );
  }

  // Login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 fixed top-0 w-full">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-[#FF9F00] mb-6">
          Tarnila Lager
        </h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-[#FF9F00] mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border border-[#F7CAAC] rounded focus:outline-none focus:border-[#FF9F00]"
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#FF9F00] mb-2" htmlFor="address">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full p-2 border border-[#F7CAAC] rounded focus:outline-none focus:border-[#FF9F00]"
              placeholder="Enter your address"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#FF9F00] mb-2" htmlFor="number">
              Phone Number
            </label>
            <input
              type="tel"
              id="number"
              name="number"
              value={formData.number}
              onChange={handleInputChange}
              className="w-full p-2 border border-[#F7CAAC] rounded focus:outline-none focus:border-[#FF9F00]"
              placeholder="Enter your phone number"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#FF9F00] mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full p-2 border border-[#F7CAAC] rounded focus:outline-none focus:border-[#FF9F00]"
              placeholder="Enter your password"
              required
            />
          </div>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-[#FF9F00] text-white py-2 rounded hover:bg-[#e68a00]"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;