import { useNavigate } from "react-router-dom";

function Navbar({ userName }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <span className="text-red-500 font-extrabold text-2xl tracking-tight">
        AthleteFuel
      </span>

      <div className="flex items-center gap-4">
        {userName && (
          <span className="text-gray-300 text-sm">
            Hola,{" "}
            <span className="text-white font-semibold">{userName}</span>
          </span>
        )}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
