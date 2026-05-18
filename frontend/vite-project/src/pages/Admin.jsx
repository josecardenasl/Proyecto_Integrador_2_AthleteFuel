import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminUsers, deleteAdminUser, getActivityLogs,
  getAdminUserData, adminAssignWorkout, adminAssignSupplement,
  adminAssignSession, adminAssignIntake,
} from "../services/api";
import WorkoutForm from "../components/WorkoutForm";
import SupplementForm from "../components/SupplementForm";
import CalendarView from "../components/CalendarView";

function decodeToken(token) {
  try { return JSON.parse(atob(token.split(".")[1])); }
  catch { return null; }
}

const ACTION_LABELS = {
  login: "Login",
  register: "Registro",
  delete_user: "Eliminar usuario",
  CREATE_WORKOUT: "Crear entrenamiento",
  DELETE_WORKOUT: "Eliminar entrenamiento",
  CREATE_SUPPLEMENT: "Crear suplemento",
  DELETE_SUPPLEMENT: "Eliminar suplemento",
  SCHEDULE_SESSION: "Programar sesión",
  SCHEDULE_INTAKE: "Programar ingesta",
  ASSIGN_WORKOUT: "Asignar entrenamiento",
  ASSIGN_SUPPLEMENT: "Asignar suplemento",
  ASSIGN_SESSION: "Asignar sesión",
  ASSIGN_INTAKE: "Asignar ingesta",
};

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
}

// ─── Inline modal wrapper ─────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Quick Schedule Session form ──────────────────────────────────────────────
function AssignSessionForm({ workouts, onSubmit, onCancel }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    workoutId: workouts[0]?.id || "",
    date: today,
    time: "08:00",
    notes: "",
  });
  const cls = "border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full";

  function handleSubmit(e) {
    e.preventDefault();
    const w = workouts.find(x => x.id === form.workoutId);
    onSubmit({ ...form, workoutName: w?.name || "Entrenamiento" });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Entrenamiento *</label>
        <select value={form.workoutId} onChange={e => setForm({ ...form, workoutId: e.target.value })} className={cls} required>
          {workouts.map(w => <option key={w.id} value={w.id}>{w.name} ({w.type})</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
          <input type="date" value={form.date} min={today} onChange={e => setForm({ ...form, date: e.target.value })} className={cls} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
          <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className={cls} required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Opcional..." className={cls} />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition">Programar</button>
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition">Cancelar</button>
      </div>
    </form>
  );
}

// ─── Quick Schedule Intake form ───────────────────────────────────────────────
function AssignIntakeForm({ supplements, onSubmit, onCancel }) {
  const today = new Date().toISOString().split("T")[0];
  const [supplementId, setSupplementId] = useState(supplements[0]?.id || "");
  const [date, setDate] = useState(today);
  const [times, setTimes] = useState(["08:00"]);
  const [notes, setNotes] = useState("");
  const cls = "border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full";

  function handleSubmit(e) {
    e.preventDefault();
    const s = supplements.find(x => x.id === supplementId);
    onSubmit({ supplementId, supplementName: s?.name || "Suplemento", date, intakeTimes: times, notes });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Suplemento *</label>
        <select value={supplementId} onChange={e => setSupplementId(e.target.value)} className={cls} required>
          {supplements.map(s => <option key={s.id} value={s.id}>{s.name} ({s.dose})</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
        <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)} className={cls} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Horarios de ingesta *</label>
        {times.map((t, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input type="time" value={t} onChange={e => { const u = [...times]; u[idx] = e.target.value; setTimes(u); }} className={cls} required />
            {times.length > 1 && (
              <button type="button" onClick={() => setTimes(times.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 px-2">✕</button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => setTimes([...times, "12:00"])} className="text-sm text-blue-600 hover:underline">+ Agregar horario</button>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opcional..." className={cls} />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition">Programar</button>
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition">Cancelar</button>
      </div>
    </form>
  );
}

// ─── Coach Panel (full-screen overlay) ───────────────────────────────────────
function CoachPanel({ user, onClose, onDataChanged }) {
  const [tab, setTab] = useState("workouts");
  const [data, setData] = useState({ workouts: [], supplements: [], sessions: [], intakeSchedules: [] });
  const [loading, setLoading] = useState(true);

  // sub-modals
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [showSupplementForm, setShowSupplementForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [preselectedWorkout, setPreselectedWorkout] = useState(null);
  const [preselectedSupplement, setPreselectedSupplement] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadData();
  }, [user.id]);

  async function loadData() {
    setLoading(true);
    try {
      const d = await getAdminUserData(user.id);
      setData(d);
    } catch { /* silent */ }
    setLoading(false);
  }

  function flash(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  async function handleAssignWorkout(formData) {
    const result = await adminAssignWorkout(user.id, formData);
    if (result.workout) {
      setData(prev => ({ ...prev, workouts: [result.workout, ...prev.workouts] }));
      flash("Entrenamiento asignado");
      onDataChanged?.();
    }
    setShowWorkoutForm(false);
  }

  async function handleAssignSupplement(formData) {
    const result = await adminAssignSupplement(user.id, formData);
    if (result.supplement) {
      setData(prev => ({ ...prev, supplements: [result.supplement, ...prev.supplements] }));
      flash("Suplemento asignado");
      onDataChanged?.();
    }
    setShowSupplementForm(false);
  }

  async function handleScheduleSession(formData) {
    const result = await adminAssignSession(user.id, formData);
    if (result.session) {
      setData(prev => ({
        ...prev,
        sessions: [...prev.sessions, result.session].sort((a, b) => a.date.localeCompare(b.date)),
      }));
      flash("Sesión programada en su calendario");
      onDataChanged?.();
    }
    setShowSessionForm(false);
    setPreselectedWorkout(null);
    setTab("calendar");
  }

  async function handleScheduleIntake(formData) {
    const result = await adminAssignIntake(user.id, formData);
    if (result.schedule) {
      setData(prev => ({ ...prev, intakeSchedules: [result.schedule, ...prev.intakeSchedules] }));
      flash("Ingesta programada en su calendario");
      onDataChanged?.();
    }
    setShowIntakeForm(false);
    setPreselectedSupplement(null);
    setTab("calendar");
  }

  const typeColors = { Cardio: "bg-orange-100 text-orange-600", Fuerza: "bg-red-100 text-red-600", HIIT: "bg-purple-100 text-purple-600", Flexibilidad: "bg-green-100 text-green-600", Otro: "bg-gray-100 text-gray-600" };
  const timingColors = { "Mañana": "bg-yellow-100 text-yellow-700", "Pre-entrenamiento": "bg-orange-100 text-orange-700", "Post-entrenamiento": "bg-blue-100 text-blue-700", "Noche": "bg-indigo-100 text-indigo-700", "Otro": "bg-gray-100 text-gray-600" };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto py-6 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-lg">
              {user.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{user.name}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">Vista Coach</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-3xl leading-none">&times;</button>
        </div>

        {/* Flash message */}
        {successMsg && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-xl">
            {successMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="px-6 pt-5">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
            {[
              { key: "workouts", label: `Entrenamientos (${data.workouts.length})` },
              { key: "supplements", label: `Suplementos (${data.supplements.length})` },
              { key: "calendar", label: `Calendario (${data.sessions.length + data.intakeSchedules.length})` },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${tab === key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {loading ? (
            <p className="text-gray-400 text-sm py-8 text-center">Cargando datos del usuario...</p>
          ) : (

            /* ── Workouts ── */
            tab === "workouts" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500">Planes de entrenamiento asignados a este usuario</p>
                  <button onClick={() => setShowWorkoutForm(true)}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg font-medium transition">
                    + Asignar entrenamiento
                  </button>
                </div>
                {data.workouts.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                    <p className="text-gray-400">Sin entrenamientos asignados aún</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.workouts.map(w => (
                      <div key={w.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900">{w.name}</h4>
                            <p className="text-sm text-gray-500">{w.duration} min</p>
                            {w.notes && <p className="text-xs text-gray-400 mt-1">{w.notes}</p>}
                          </div>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ml-2 shrink-0 ${typeColors[w.type] || typeColors.Otro}`}>{w.type}</span>
                        </div>
                        <button
                          onClick={() => { setPreselectedWorkout(w); setShowSessionForm(true); }}
                          className="w-full text-xs bg-green-50 hover:bg-green-100 text-green-700 py-1.5 rounded-lg transition font-medium"
                        >
                          Programar sesión en su calendario
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          )}

          {!loading && tab === "supplements" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">Suplementos asignados a este usuario</p>
                <button onClick={() => setShowSupplementForm(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-medium transition">
                  + Asignar suplemento
                </button>
              </div>
              {data.supplements.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                  <p className="text-gray-400">Sin suplementos asignados aún</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.supplements.map(s => (
                    <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900">{s.name}</h4>
                          <p className="text-sm text-gray-500">{s.dose}</p>
                          {s.notes && <p className="text-xs text-gray-400 mt-1">{s.notes}</p>}
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ml-2 shrink-0 ${timingColors[s.timing] || timingColors.Otro}`}>{s.timing}</span>
                      </div>
                      <button
                        onClick={() => { setPreselectedSupplement(s); setShowIntakeForm(true); }}
                        className="w-full text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 py-1.5 rounded-lg transition font-medium"
                      >
                        Programar ingesta en su calendario
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && tab === "calendar" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">Calendario del usuario</p>
                <div className="flex gap-2">
                  {data.workouts.length > 0 && (
                    <button onClick={() => setShowSessionForm(true)}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg font-medium transition">
                      + Sesión
                    </button>
                  )}
                  {data.supplements.length > 0 && (
                    <button onClick={() => setShowIntakeForm(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg font-medium transition">
                      + Ingesta
                    </button>
                  )}
                </div>
              </div>
              {data.sessions.length === 0 && data.intakeSchedules.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                  <p className="text-gray-400">El calendario de este usuario está vacío</p>
                  <p className="text-sm text-gray-400 mt-1">Asigna entrenamientos y suplementos primero, luego prográmalos aquí</p>
                </div>
              ) : (
                <CalendarView
                  sessions={data.sessions}
                  intakeSchedules={data.intakeSchedules}
                  timezone="America/Bogota"
                  onEditSession={() => {}}
                  onDeleteSession={() => {}}
                  onEditIntake={() => {}}
                  onDeleteIntake={() => {}}
                  readOnly
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sub-modals */}
      {showWorkoutForm && (
        <Modal title="Asignar entrenamiento" onClose={() => setShowWorkoutForm(false)}>
          <WorkoutForm onSubmit={handleAssignWorkout} onCancel={() => setShowWorkoutForm(false)} />
        </Modal>
      )}
      {showSupplementForm && (
        <Modal title="Asignar suplemento" onClose={() => setShowSupplementForm(false)}>
          <SupplementForm onSubmit={handleAssignSupplement} onCancel={() => setShowSupplementForm(false)} />
        </Modal>
      )}
      {showSessionForm && data.workouts.length > 0 && (
        <Modal title="Programar sesión" onClose={() => { setShowSessionForm(false); setPreselectedWorkout(null); }}>
          <AssignSessionForm
            workouts={data.workouts}
            preselected={preselectedWorkout}
            onSubmit={handleScheduleSession}
            onCancel={() => { setShowSessionForm(false); setPreselectedWorkout(null); }}
          />
        </Modal>
      )}
      {showIntakeForm && data.supplements.length > 0 && (
        <Modal title="Programar ingesta" onClose={() => { setShowIntakeForm(false); setPreselectedSupplement(null); }}>
          <AssignIntakeForm
            supplements={data.supplements}
            preselected={preselectedSupplement}
            onSubmit={handleScheduleIntake}
            onCancel={() => { setShowIntakeForm(false); setPreselectedSupplement(null); }}
          />
        </Modal>
      )}
    </div>
  );
}

// ─── Admin page ───────────────────────────────────────────────────────────────
export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [error, setError] = useState("");
  const [managedUser, setManagedUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }
    const decoded = decodeToken(token);
    if (decoded?.role !== "admin") { navigate("/dashboard"); return; }
    fetchUsers();
    fetchLogs();
  }, []);

  async function fetchUsers() {
    setLoadingUsers(true);
    try {
      const data = await getAdminUsers();
      if (Array.isArray(data)) setUsers(data);
      else setError("No se pudo cargar la lista de usuarios.");
    } catch { setError("Error de conexión."); }
    finally { setLoadingUsers(false); }
  }

  async function fetchLogs() {
    setLoadingLogs(true);
    try {
      const data = await getActivityLogs();
      if (Array.isArray(data)) setLogs(data);
    } catch { /* silent */ }
    finally { setLoadingLogs(false); }
  }

  async function handleDeleteUser(id, email) {
    if (!window.confirm(`¿Eliminar al usuario ${email}? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteAdminUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch { setError("Error al eliminar el usuario."); }
  }

  const actionColor = (action) => {
    if (action === "login")              return "bg-green-100 text-green-700";
    if (action === "register")           return "bg-blue-100 text-blue-700";
    if (action === "delete_user")        return "bg-red-100 text-red-700";
    if (action?.startsWith("ASSIGN_"))   return "bg-purple-100 text-purple-700";
    if (action?.startsWith("SCHEDULE_")) return "bg-orange-100 text-orange-700";
    if (action?.startsWith("CREATE_"))   return "bg-teal-100 text-teal-700";
    if (action?.startsWith("DELETE_"))   return "bg-red-50 text-red-500";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-red-500 font-extrabold text-2xl tracking-tight">AthleteFuel</span>
          <span className="bg-red-500/20 text-red-400 text-xs font-semibold px-2 py-0.5 rounded-full">Coach / Admin</span>
        </div>
        <button onClick={() => navigate("/dashboard")} className="text-sm text-gray-300 hover:text-white transition">
          Ir al Dashboard
        </button>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Coach</h1>
          <p className="text-gray-500 mt-1">Gestiona los entrenamientos y suplementos de tus usuarios</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-lg font-bold">
              {users.filter(u => u.role !== "admin").length}
            </div>
            <div>
              <p className="text-sm text-gray-500">Usuarios activos</p>
              <p className="text-xs text-gray-400">{users.length} en total (incluye admins)</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-lg font-bold">
              {logs.length}
            </div>
            <div>
              <p className="text-sm text-gray-500">Eventos registrados</p>
              <p className="text-xs text-gray-400">En el log de actividad</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          {[
            { key: "users", label: "Usuarios" },
            { key: "logs", label: `Actividad${logs.length > 0 ? ` (${logs.length})` : ""}` },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Lista de usuarios</h2>
              <p className="text-xs text-gray-400 mt-0.5">Haz clic en "Gestionar" para asignar entrenamientos y suplementos</p>
            </div>
            {loadingUsers ? (
              <p className="text-gray-400 text-sm p-5">Cargando...</p>
            ) : users.length === 0 ? (
              <p className="text-gray-400 text-sm p-5">No hay usuarios registrados.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm">
                        {user.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${user.role === "admin" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>
                        {user.role === "admin" ? "Admin" : "Usuario"}
                      </span>
                      {user.createdAt && (
                        <span className="text-xs text-gray-400 hidden sm:block">{formatDate(user.createdAt)}</span>
                      )}
                      {user.role !== "admin" && (
                        <>
                          <button
                            onClick={() => setManagedUser(user)}
                            className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition font-medium"
                          >
                            Gestionar
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition font-medium"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Log de actividad</h2>
              <button onClick={fetchLogs} className="text-xs text-gray-400 hover:text-gray-600 transition">Actualizar</button>
            </div>
            {loadingLogs ? (
              <p className="text-gray-400 text-sm p-5">Cargando...</p>
            ) : logs.length === 0 ? (
              <p className="text-gray-400 text-sm p-5">No hay actividad registrada.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {logs.map(log => (
                  <div key={log.id} className="flex items-start justify-between px-5 py-3 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${actionColor(log.action)}`}>
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                      <div>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">{log.userName}</span>
                          {log.details && <span className="text-gray-400"> — {log.details}</span>}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 ml-4">{formatDate(log.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Coach Panel overlay */}
      {managedUser && (
        <CoachPanel
          user={managedUser}
          onClose={() => setManagedUser(null)}
          onDataChanged={fetchLogs}
        />
      )}
    </div>
  );
}
