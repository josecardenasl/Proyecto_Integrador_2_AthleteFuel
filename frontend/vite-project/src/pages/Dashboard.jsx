import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import WorkoutForm from "../components/WorkoutForm";
import SupplementForm from "../components/SupplementForm";
import ProfileForm from "../components/ProfileForm";
import CalendarView from "../components/CalendarView";
import Toast from "../components/Toast";
import {
  getWorkouts, createWorkout, updateWorkout, deleteWorkout,
  getSessions, createSession, updateSession, deleteSession,
  getSupplements, createSupplement, updateSupplement, deleteSupplement,
  getScheduledIntakes, scheduleIntake, updateScheduledIntake, deleteScheduledIntake,
  updateProfile, getProfile, logActivity,
} from "../services/api";

// ─── Reminder helpers ─────────────────────────────────────────────────────────
function computeReminders(sessions, intakeSchedules, minutesBefore) {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const reminders = [];

  (sessions || []).forEach(s => {
    if (s.date === todayStr && s.time) {
      const [h, m] = s.time.split(":").map(Number);
      const diff = (h * 60 + m) - nowMin;
      if (diff > 0 && diff <= minutesBefore) {
        reminders.push({ id: s.id, type: "session", name: s.workoutName, time: s.time, minutesLeft: diff });
      }
    }
  });

  (intakeSchedules || []).forEach(i => {
    if (i.date === todayStr) {
      (i.intakeTimes || []).forEach(t => {
        const [h, m] = t.split(":").map(Number);
        const diff = (h * 60 + m) - nowMin;
        if (diff > 0 && diff <= minutesBefore) {
          reminders.push({ id: `${i.id}_${t}`, type: "intake", name: i.supplementName, time: t, minutesLeft: diff });
        }
      });
    }
  });

  return reminders;
}

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch { return null; }
}

// ─── Schedule Session Form ────────────────────────────────────────────────────
function ScheduleSessionForm({ workouts, preselected, userTimezone, onSubmit, onCancel }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    workoutId: preselected?.id || workouts[0]?.id || "",
    date: today,
    time: "08:00",
    notes: "",
  });
  const inputClass = "border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full";

  function handleSubmit(e) {
    e.preventDefault();
    const selected = workouts.find(w => w.id === form.workoutId);
    onSubmit({ ...form, workoutName: selected?.name || "Entrenamiento", timezone: userTimezone || "America/Bogota" });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Plan de entrenamiento *</label>
        <select value={form.workoutId} onChange={e => setForm({ ...form, workoutId: e.target.value })} className={inputClass} required>
          {workouts.map(w => <option key={w.id} value={w.id}>{w.name} ({w.type})</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} min={today} className={inputClass} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
          <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className={inputClass} required />
        </div>
      </div>
      {userTimezone && <p className="text-xs text-gray-400">Zona horaria: {userTimezone}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Opcional..." className={inputClass} />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition">Programar</button>
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition">Cancelar</button>
      </div>
    </form>
  );
}

// ─── Schedule Intake Form ─────────────────────────────────────────────────────
function ScheduleIntakeForm({ supplements, preselected, userTimezone, onSubmit, onCancel }) {
  const today = new Date().toISOString().split("T")[0];
  const [supplementId, setSupplementId] = useState(preselected?.id || supplements[0]?.id || "");
  const [date, setDate] = useState(today);
  const [times, setTimes] = useState(["08:00"]);
  const [notes, setNotes] = useState("");
  const inputClass = "border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full";

  function handleSubmit(e) {
    e.preventDefault();
    const selected = supplements.find(s => s.id === supplementId);
    onSubmit({ supplementId, supplementName: selected?.name || "Suplemento", date, intakeTimes: times, timezone: userTimezone || "America/Bogota", notes });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Suplemento *</label>
        <select value={supplementId} onChange={e => setSupplementId(e.target.value)} className={inputClass} required>
          {supplements.map(s => <option key={s.id} value={s.id}>{s.name} ({s.dose})</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} min={today} className={inputClass} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Horarios de ingesta *</label>
        {times.map((t, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input type="time" value={t} onChange={e => { const u = [...times]; u[idx] = e.target.value; setTimes(u); }} className={inputClass} required />
            {times.length > 1 && <button type="button" onClick={() => setTimes(times.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 px-2">✕</button>}
          </div>
        ))}
        <button type="button" onClick={() => setTimes([...times, "12:00"])} className="text-sm text-blue-600 hover:underline">+ Agregar horario</button>
      </div>
      {userTimezone && <p className="text-xs text-gray-400">Zona horaria: {userTimezone}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opcional..." className={inputClass} />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition">Programar</button>
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition">Cancelar</button>
      </div>
    </form>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, children, onClose }) {
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

// ─── Workout Card ─────────────────────────────────────────────────────────────
function WorkoutCard({ workout, onEdit, onDelete, onSchedule }) {
  const typeColors = {
    Cardio: "bg-orange-100 text-orange-600",
    Fuerza: "bg-red-100 text-red-600",
    HIIT: "bg-purple-100 text-purple-600",
    Flexibilidad: "bg-green-100 text-green-600",
    Otro: "bg-gray-100 text-gray-600",
  };
  const color = typeColors[workout.type] || typeColors.Otro;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900">{workout.name}</h4>
          <p className="text-sm text-gray-500 mt-0.5">{workout.duration} min</p>
          {workout.notes && <p className="text-xs text-gray-400 mt-1">{workout.notes}</p>}
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ml-2 shrink-0 ${color}`}>{workout.type}</span>
      </div>
      <div className="flex gap-1.5 pt-1 border-t border-gray-50">
        <button onClick={() => onSchedule(workout)} className="flex-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 py-1.5 rounded-lg transition font-medium">Programar</button>
        <button onClick={() => onEdit(workout)} className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-lg transition">Editar</button>
        <button onClick={() => onDelete(workout.id)} className="flex-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-lg transition">Eliminar</button>
      </div>
    </div>
  );
}

// ─── Supplement Card ──────────────────────────────────────────────────────────
function SupplementCard({ supplement, onEdit, onDelete, onSchedule }) {
  const timingColors = {
    "Mañana": "bg-yellow-100 text-yellow-700",
    "Pre-entrenamiento": "bg-orange-100 text-orange-700",
    "Post-entrenamiento": "bg-blue-100 text-blue-700",
    "Noche": "bg-indigo-100 text-indigo-700",
    "Otro": "bg-gray-100 text-gray-600",
  };
  const color = timingColors[supplement.timing] || timingColors.Otro;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900">{supplement.name}</h4>
          <p className="text-sm text-gray-500 mt-0.5">{supplement.dose}</p>
          {supplement.notes && <p className="text-xs text-gray-400 mt-1">{supplement.notes}</p>}
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ml-2 shrink-0 ${color}`}>{supplement.timing}</span>
      </div>
      <div className="flex gap-1.5 pt-1 border-t border-gray-50">
        <button onClick={() => onSchedule(supplement)} className="flex-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 py-1.5 rounded-lg transition font-medium">Programar</button>
        <button onClick={() => onEdit(supplement)} className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-lg transition">Editar</button>
        <button onClick={() => onDelete(supplement.id)} className="flex-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-lg transition">Eliminar</button>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userProfile, setUserProfile] = useState({});
  const [workouts, setWorkouts] = useState([]);
  const [supplements, setSupplements] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [intakeSchedules, setIntakeSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState("workouts");
  const [toast, setToast] = useState({ message: "", type: "success" });

  // Modals
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showSupplementModal, setShowSupplementModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showScheduleSessionModal, setShowScheduleSessionModal] = useState(false);
  const [showScheduleIntakeModal, setShowScheduleIntakeModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [editingSupplement, setEditingSupplement] = useState(null);
  const [preselectedWorkout, setPreselectedWorkout] = useState(null);
  const [preselectedSupplement, setPreselectedSupplement] = useState(null);

  // ── Notifications / reminders ─────────────────────────────────────────────
  const [userRole, setUserRole] = useState("user");
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(30);
  const [reminders, setReminders] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(() => {
    try { return new Set(JSON.parse(sessionStorage.getItem("dismissedReminders") || "[]")); }
    catch { return new Set(); }
  });

  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  const [loadingSupplements, setLoadingSupplements] = useState(true);

  // ── Boot ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }
    const decoded = decodeToken(token);
    if (decoded?.name) setUserName(decoded.name);
    else if (decoded?.email) setUserName(decoded.email);
    if (decoded?.role) setUserRole(decoded.role);

    // Fetch full profile to get notification preferences
    getProfile().then(profile => {
      if (profile && !profile.error) {
        setUserProfile(profile);
        if (profile.notificationsEnabled !== undefined) setNotifEnabled(profile.notificationsEnabled);
        if (profile.reminderMinutesBefore)              setReminderMinutes(profile.reminderMinutesBefore);
      }
    }).catch(() => {});

    fetchWorkouts();
    fetchSupplements();
    fetchSessions();
    fetchIntakeSchedules();
  }, []);

  // ── Reminder polling (every 60 s) ─────────────────────────────────────────
  useEffect(() => {
    if (!notifEnabled) { setReminders([]); return; }

    function refresh() {
      const all = computeReminders(sessions, intakeSchedules, reminderMinutes);
      setReminders(all.filter(r => !dismissedIds.has(r.id)));
    }

    refresh();
    const timer = setInterval(refresh, 60_000);
    return () => clearInterval(timer);
  }, [sessions, intakeSchedules, notifEnabled, reminderMinutes, dismissedIds]);

  // ── Dismiss handlers ──────────────────────────────────────────────────────
  function handleDismissReminder(id) {
    setDismissedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      sessionStorage.setItem("dismissedReminders", JSON.stringify([...next]));
      return next;
    });
    setReminders(prev => prev.filter(r => r.id !== id));
  }

  function handleDismissAllReminders() {
    setDismissedIds(prev => {
      const next = new Set([...prev, ...reminders.map(r => r.id)]);
      sessionStorage.setItem("dismissedReminders", JSON.stringify([...next]));
      return next;
    });
    setReminders([]);
  }

  async function fetchWorkouts() {
    setLoadingWorkouts(true);
    try { const d = await getWorkouts(); if (Array.isArray(d)) setWorkouts(d); }
    catch { /* silent */ } finally { setLoadingWorkouts(false); }
  }
  async function fetchSupplements() {
    setLoadingSupplements(true);
    try { const d = await getSupplements(); if (Array.isArray(d)) setSupplements(d); }
    catch { /* silent */ } finally { setLoadingSupplements(false); }
  }
  async function fetchSessions() {
    try { const d = await getSessions(); if (Array.isArray(d)) setSessions(d); }
    catch { /* silent */ }
  }
  async function fetchIntakeSchedules() {
    try { const d = await getScheduledIntakes(); if (Array.isArray(d)) setIntakeSchedules(d); }
    catch { /* silent */ }
  }

  // ── Workouts ──────────────────────────────────────────────────────────────
  async function handleAddWorkout(data) {
    try {
      const result = await createWorkout(data);
      setWorkouts(prev => [result.workout ?? { ...data, id: "workout_" + Date.now() }, ...prev]);
      logActivity("CREATE_WORKOUT", data.name);
    } catch { setWorkouts(prev => [{ ...data, id: "workout_" + Date.now() }, ...prev]); }
    setShowWorkoutModal(false);
  }
  async function handleEditWorkout(data) {
    try {
      await updateWorkout(editingWorkout.id, data);
      setWorkouts(prev => prev.map(w => w.id === editingWorkout.id ? { ...w, ...data } : w));
    } catch { /* silent */ }
    setEditingWorkout(null);
  }
  async function handleDeleteWorkout(id) {
    if (!window.confirm("¿Eliminar este entrenamiento?")) return;
    try {
      await deleteWorkout(id);
      setWorkouts(prev => prev.filter(w => w.id !== id));
      logActivity("DELETE_WORKOUT", id);
    } catch { /* silent */ }
  }

  // ── Sessions ──────────────────────────────────────────────────────────────
  async function handleScheduleSession(data) {
    try {
      const result = await createSession(data);
      const saved = result.session ?? { ...data, id: "session_" + Date.now() };
      setSessions(prev => [...prev, saved].sort((a, b) => a.date.localeCompare(b.date)));
      logActivity("SCHEDULE_SESSION", `${data.workoutName} — ${data.date} ${data.time}`);
    } catch { /* silent */ }
    setShowScheduleSessionModal(false);
    setPreselectedWorkout(null);
    setActiveTab("calendar");
  }
  async function handleEditSession(id, data) {
    try {
      await updateSession(id, data);
      setSessions(prev =>
        prev.map(s => s.id === id ? { ...s, ...data } : s)
            .sort((a, b) => a.date.localeCompare(b.date))
      );
    } catch { /* silent */ }
  }
  async function handleDeleteSession(id) {
    if (!window.confirm("¿Eliminar esta sesión programada?")) return;
    try { await deleteSession(id); setSessions(prev => prev.filter(s => s.id !== id)); }
    catch { /* silent */ }
  }

  // ── Supplements ───────────────────────────────────────────────────────────
  async function handleAddSupplement(data) {
    try {
      const result = await createSupplement(data);
      setSupplements(prev => [result.supplement ?? { ...data, id: "supplement_" + Date.now() }, ...prev]);
      logActivity("CREATE_SUPPLEMENT", data.name);
    } catch { setSupplements(prev => [{ ...data, id: "supplement_" + Date.now() }, ...prev]); }
    setShowSupplementModal(false);
  }
  async function handleEditSupplement(data) {
    try {
      await updateSupplement(editingSupplement.id, data);
      setSupplements(prev => prev.map(s => s.id === editingSupplement.id ? { ...s, ...data } : s));
    } catch { /* silent */ }
    setEditingSupplement(null);
  }
  async function handleDeleteSupplement(id) {
    if (!window.confirm("¿Eliminar este suplemento?")) return;
    try {
      await deleteSupplement(id);
      setSupplements(prev => prev.filter(s => s.id !== id));
      logActivity("DELETE_SUPPLEMENT", id);
    } catch { /* silent */ }
  }

  // ── Intake schedules ──────────────────────────────────────────────────────
  async function handleScheduleIntake(data) {
    try {
      const result = await scheduleIntake(data);
      const saved = result.schedule ?? { ...data, id: "supp_schedule_" + Date.now() };
      setIntakeSchedules(prev => [saved, ...prev]);
      logActivity("SCHEDULE_INTAKE", `${data.supplementName} — ${data.date}`);
    } catch { /* silent */ }
    setShowScheduleIntakeModal(false);
    setPreselectedSupplement(null);
    setActiveTab("calendar");
  }
  async function handleEditIntake(id, data) {
    try {
      await updateScheduledIntake(id, data);
      setIntakeSchedules(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    } catch { /* silent */ }
  }
  async function handleDeleteIntake(id) {
    if (!window.confirm("¿Eliminar este schedule de suplemento?")) return;
    try { await deleteScheduledIntake(id); setIntakeSchedules(prev => prev.filter(i => i.id !== id)); }
    catch { /* silent */ }
  }

  // ── Profile ───────────────────────────────────────────────────────────────
  async function handleUpdateProfile(data) {
    try {
      await updateProfile(data);
      setUserProfile(data);
      // Keep reminder engine in sync with new preferences
      if (data.notificationsEnabled !== undefined) setNotifEnabled(data.notificationsEnabled);
      if (data.reminderMinutesBefore)              setReminderMinutes(data.reminderMinutesBefore);
      setToast({ message: "Perfil actualizado correctamente", type: "success" });
    } catch {
      setToast({ message: "Error al actualizar el perfil", type: "error" });
    }
    setShowProfileModal(false);
  }

  const userTimezone = userProfile.timezone || "America/Bogota";
  const totalEvents = sessions.length + intakeSchedules.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        userName={userName}
        userRole={userRole}
        reminders={reminders}
        onDismissReminder={handleDismissReminder}
        onDismissAllReminders={handleDismissAllReminders}
      />

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Toast */}
        {toast.message && (
          <div className="mb-6">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast({ message: "", type: "success" })}
            />
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Gestiona tus entrenamientos y suplementos</p>
          </div>
          <button onClick={() => setShowProfileModal(true)} className="bg-gray-800 hover:bg-gray-900 text-white text-sm px-4 py-2 rounded-lg transition font-medium">
            Mi perfil
          </button>
        </div>

        {/* Profile summary */}
        {(userProfile.weight || userProfile.height || userProfile.goals || userProfile.timezone) && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-x-6 gap-y-2 items-center">
            {userProfile.weight && <span className="text-sm text-gray-600"><span className="font-semibold">Peso:</span> {userProfile.weight} kg</span>}
            {userProfile.height && <span className="text-sm text-gray-600"><span className="font-semibold">Altura:</span> {userProfile.height} cm</span>}
            {userProfile.age && <span className="text-sm text-gray-600"><span className="font-semibold">Edad:</span> {userProfile.age} años</span>}
            {userProfile.gender && <span className="text-sm text-gray-600"><span className="font-semibold">Género:</span> {userProfile.gender}</span>}
            {userProfile.timezone && <span className="text-sm text-gray-600"><span className="font-semibold">Zona:</span> {userProfile.timezone}</span>}
            {userProfile.goals && <span className="text-sm text-gray-600 flex-1"><span className="font-semibold">Objetivos:</span> {userProfile.goals}</span>}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Entrenamientos", count: workouts.length, color: "bg-red-100 text-red-500", icon: "⚡" },
            { label: "Suplementos", count: supplements.length, color: "bg-blue-100 text-blue-500", icon: "💊" },
            { label: "Sesiones", count: sessions.length, color: "bg-green-100 text-green-500", icon: "📅" },
            { label: "Schedules", count: intakeSchedules.length, color: "bg-purple-100 text-purple-500", icon: "🔔" },
          ].map(({ label, count, color, icon }) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${color}`}>{icon}</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          {[
            { key: "workouts", label: "Entrenamientos" },
            { key: "supplements", label: "Suplementos" },
            { key: "calendar", label: `Calendario${totalEvents > 0 ? ` (${totalEvents})` : ""}` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                activeTab === key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Workouts Tab */}
        {activeTab === "workouts" && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Planes de entrenamiento</h2>
              <button onClick={() => setShowWorkoutModal(true)} className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg transition font-medium">
                + Agregar
              </button>
            </div>
            {loadingWorkouts ? (
              <p className="text-gray-400 text-sm">Cargando...</p>
            ) : workouts.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                <p className="text-gray-500 font-medium">No hay entrenamientos aún</p>
                <p className="text-gray-400 text-sm mt-1">Agrega tu primer plan de entrenamiento</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {workouts.map(w => (
                  <WorkoutCard key={w.id} workout={w}
                    onEdit={setEditingWorkout}
                    onDelete={handleDeleteWorkout}
                    onSchedule={wk => { setPreselectedWorkout(wk); setShowScheduleSessionModal(true); }}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Supplements Tab */}
        {activeTab === "supplements" && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Suplementos</h2>
              <button onClick={() => setShowSupplementModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition font-medium">
                + Agregar
              </button>
            </div>
            {loadingSupplements ? (
              <p className="text-gray-400 text-sm">Cargando...</p>
            ) : supplements.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                <p className="text-gray-500 font-medium">No hay suplementos aún</p>
                <p className="text-gray-400 text-sm mt-1">Agrega tu primer suplemento</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {supplements.map(s => (
                  <SupplementCard key={s.id} supplement={s}
                    onEdit={setEditingSupplement}
                    onDelete={handleDeleteSupplement}
                    onSchedule={sp => { setPreselectedSupplement(sp); setShowScheduleIntakeModal(true); }}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Calendar Tab */}
        {activeTab === "calendar" && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Calendario</h2>
              <div className="flex gap-2">
                {workouts.length > 0 && (
                  <button onClick={() => setShowScheduleSessionModal(true)} className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-2 rounded-lg transition font-medium">
                    + Entrenamiento
                  </button>
                )}
                {supplements.length > 0 && (
                  <button onClick={() => setShowScheduleIntakeModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-2 rounded-lg transition font-medium">
                    + Suplemento
                  </button>
                )}
              </div>
            </div>
            <CalendarView
              sessions={sessions}
              intakeSchedules={intakeSchedules}
              timezone={userTimezone}
              onEditSession={handleEditSession}
              onDeleteSession={handleDeleteSession}
              onEditIntake={handleEditIntake}
              onDeleteIntake={handleDeleteIntake}
            />
          </section>
        )}
      </main>

      {/* Modals */}
      {showWorkoutModal && (
        <Modal title="Nuevo entrenamiento" onClose={() => setShowWorkoutModal(false)}>
          <WorkoutForm onSubmit={handleAddWorkout} onCancel={() => setShowWorkoutModal(false)} />
        </Modal>
      )}
      {editingWorkout && (
        <Modal title="Editar entrenamiento" onClose={() => setEditingWorkout(null)}>
          <WorkoutForm initial={editingWorkout} onSubmit={handleEditWorkout} onCancel={() => setEditingWorkout(null)} />
        </Modal>
      )}
      {showScheduleSessionModal && workouts.length > 0 && (
        <Modal title="Programar sesión" onClose={() => { setShowScheduleSessionModal(false); setPreselectedWorkout(null); }}>
          <ScheduleSessionForm
            workouts={workouts}
            preselected={preselectedWorkout}
            userTimezone={userTimezone}
            onSubmit={handleScheduleSession}
            onCancel={() => { setShowScheduleSessionModal(false); setPreselectedWorkout(null); }}
          />
        </Modal>
      )}
      {showSupplementModal && (
        <Modal title="Nuevo suplemento" onClose={() => setShowSupplementModal(false)}>
          <SupplementForm onSubmit={handleAddSupplement} onCancel={() => setShowSupplementModal(false)} />
        </Modal>
      )}
      {editingSupplement && (
        <Modal title="Editar suplemento" onClose={() => setEditingSupplement(null)}>
          <SupplementForm initial={editingSupplement} onSubmit={handleEditSupplement} onCancel={() => setEditingSupplement(null)} />
        </Modal>
      )}
      {showScheduleIntakeModal && supplements.length > 0 && (
        <Modal title="Programar ingesta de suplemento" onClose={() => { setShowScheduleIntakeModal(false); setPreselectedSupplement(null); }}>
          <ScheduleIntakeForm
            supplements={supplements}
            preselected={preselectedSupplement}
            userTimezone={userTimezone}
            onSubmit={handleScheduleIntake}
            onCancel={() => { setShowScheduleIntakeModal(false); setPreselectedSupplement(null); }}
          />
        </Modal>
      )}
      {showProfileModal && (
        <Modal title="Mi perfil" onClose={() => setShowProfileModal(false)}>
          <ProfileForm currentProfile={userProfile} onSubmit={handleUpdateProfile} onCancel={() => setShowProfileModal(false)} />
        </Modal>
      )}
    </div>
  );
}

export default Dashboard;
