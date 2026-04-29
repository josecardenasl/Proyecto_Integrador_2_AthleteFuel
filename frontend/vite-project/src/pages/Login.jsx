import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import Toast from "../components/Toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = await loginUser({ email, password });

    if (data.token) {
      localStorage.setItem("token", data.token);
      setToast({ message: "Login successful", type: "success" });
      setTimeout(() => navigate("/dashboard"), 1200);
    } else {
      setToast({ message: data.message || "Login failed", type: "error" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
          AthleteFuel Login
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
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-red-500 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-red-500 font-semibold">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;