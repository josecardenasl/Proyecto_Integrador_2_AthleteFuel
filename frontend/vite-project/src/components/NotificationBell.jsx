import { useState, useRef, useEffect } from "react";

function NotificationBell({ reminders, onDismiss, onDismissAll }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const count = reminders.length;

  function typeLabel(type) {
    return type === "session" ? "Entrenamiento" : "Suplemento";
  }

  function typeColor(type) {
    return type === "session" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600";
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition"
        title="Recordatorios"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h4 className="font-semibold text-gray-900 text-sm">Recordatorios</h4>
            {count > 0 && (
              <button onClick={onDismissAll} className="text-xs text-gray-400 hover:text-gray-600 transition">
                Descartar todos
              </button>
            )}
          </div>

          {count === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-400 text-sm">No hay recordatorios pendientes</p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
              {reminders.map(r => (
                <div key={r.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition">
                  <div className={`text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 shrink-0 ${typeColor(r.type)}`}>
                    {typeLabel(r.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{r.name}</p>
                    <p className="text-xs text-gray-400">
                      {r.time} · en {r.minutesLeft} min
                    </p>
                  </div>
                  <button
                    onClick={() => onDismiss(r.id)}
                    className="text-gray-300 hover:text-gray-500 text-lg leading-none mt-0.5 shrink-0"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
