import { useEffect } from "react";

/**
 * Toast — inline notification component
 * Props:
 *   message  : string  — text to show
 *   type     : "success" | "error" | "info"
 *   onClose  : fn      — called after duration or on click
 *   duration : number  — ms before auto-dismiss (default 3500)
 */
function Toast({ message, type = "success", onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  const styles = {
    success: {
      wrapper: "bg-green-50 border border-green-200 text-green-800",
      icon: (
        <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    error: {
      wrapper: "bg-red-50 border border-red-200 text-red-800",
      icon: (
        <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    info: {
      wrapper: "bg-blue-50 border border-blue-200 text-blue-800",
      icon: (
        <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
        </svg>
      ),
    },
  };

  const { wrapper, icon } = styles[type] ?? styles.info;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${wrapper} shadow-sm`}
      role="alert"
    >
      {icon}
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="text-current opacity-50 hover:opacity-80 transition text-lg leading-none ml-1"
        aria-label="Cerrar"
      >
        &times;
      </button>
    </div>
  );
}

export default Toast;