import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/api";
import Toast from "../components/Toast";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await forgotPassword({ email });

      if (data.devOtp) {
        setToast({
          message: `Code sent! (dev mode: ${data.devOtp})`,
          type: "success",
        });
        setTimeout(() => {
          navigate("/reset-password", { state: { email } });
        }, 2000);
      } else {
        setToast({ message: data.message, type: "info" });
      }
    } catch {
      setToast({ message: "Connection error. Try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Forgot password?</h2>
          <p className="text-sm text-gray-500 mt-1">
            Enter your email and we'll send you a 6-digit code.
          </p>
        </div>

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
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send code"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          <Link to="/" className="text-red-500 font-semibold">
            Back to login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default ForgotPassword;