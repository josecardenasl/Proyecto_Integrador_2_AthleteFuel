import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/api";
import Toast from "../components/Toast";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setToast({ message: "Passwords do not match", type: "error" });
      return;
    }

    if (newPassword.length < 6) {
      setToast({ message: "Password must be at least 6 characters", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const data = await resetPassword({ email, otp, newPassword });

      if (data.message === "Password updated successfully") {
        setToast({ message: "Password updated! Redirecting to login...", type: "success" });
        setTimeout(() => navigate("/"), 2000);
      } else {
        setToast({ message: data.message || "Something went wrong", type: "error" });
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
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-4">
            <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Reset password</h2>
          <p className="text-sm text-gray-500 mt-1">
            Enter the 6-digit code and your new password.
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
          <input
            type="text"
            placeholder="6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 tracking-widest text-center text-lg font-mono"
            maxLength={6}
            required
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required
            minLength={6}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition disabled:opacity-60"
          >
            {loading ? "Updating..." : "Reset password"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          <Link to="/forgot-password" className="text-red-500 font-semibold">
            Resend code
          </Link>
        </p>

      </div>
    </div>
  );
}

export default ResetPassword;