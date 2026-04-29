import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import Toast from "../components/Toast";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = await registerUser({ name, email, password });

    const isError = !!data.error;
    setToast({
      message: data.message || (isError ? "Registration failed" : "Account created!"),
      type: isError ? "error" : "success",
    });

    if (!isError) {
      setTimeout(() => navigate("/"), 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
          Create Account
        </h2>

        {toast.message && (
          <div className="mb-4">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast({ message: "", type: "success" })}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required
            minLength={6}
          />
          <button
            type="submit"
            className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition"
          >
            Register
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/" className="text-red-500 font-semibold">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;