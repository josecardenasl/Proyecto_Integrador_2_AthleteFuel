import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import WorkoutForm from "../components/WorkoutForm";
import SupplementForm from "../components/SupplementForm";
import ProfileForm from "../components/ProfileForm";
import Toast from "../components/Toast";
import {
  getWorkouts,
  createWorkout,
  getSupplements,
  createSupplement,
  updateProfile,
} from "../services/api";

function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function WorkoutCard({ workout }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-gray-900">{workout.name}</h4>
          <p className="text-sm text-gray-500 mt-1">
            {workout.type} · {workout.duration} min
          </p>
          {workout.notes && (
            <p className="text-sm text-gray-400 mt-1">{workout.notes}</p>
          )}
        </div>
        <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
          {workout.type}
        </span>
      </div>
    </div>
  );
}

function SupplementCard({ supplement }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-gray-900">{supplement.name}</h4>
          <p className="text-sm text-gray-500 mt-1">
            {supplement.dose} · {supplement.timing}
          </p>
          {supplement.notes && (
            <p className="text-sm text-gray-400 mt-1">{supplement.notes}</p>
          )}
        </div>
        <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-1 rounded-full">
          {supplement.timing}
        </span>
      </div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [workouts, setWorkouts] = useState([]);
  const [supplements, setSupplements] = useState([]);
  const [userGoals, setUserGoals] = useState("");
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showSupplementModal, setShowSupplementModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  const [loadingSupplements, setLoadingSupplements] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    const decoded = decodeToken(token);
    if (decoded?.name) setUserName(decoded.name);
    else if (decoded?.email) setUserName(decoded.email);

    fetchWorkouts();
    fetchSupplements();
  }, []);

  async function fetchWorkouts() {
    setLoadingWorkouts(true);
    try {
      const data = await getWorkouts();
      if (Array.isArray(data)) setWorkouts(data);
    } catch {
      // backend aún no implementado
    } finally {
      setLoadingWorkouts(false);
    }
  }

  async function fetchSupplements() {
    setLoadingSupplements(true);
    try {
      const data = await getSupplements();
      if (Array.isArray(data)) setSupplements(data);
    } catch {
      // backend aún no implementado
    } finally {
      setLoadingSupplements(false);
    }
  }

  async function handleAddWorkout(workoutData) {
    try {
      const result = await createWorkout(workoutData);
      const saved = result.workout ?? { ...workoutData, id: Date.now() };
      setWorkouts((prev) => [saved, ...prev]);
    } catch {
      setWorkouts((prev) => [{ ...workoutData, id: Date.now() }, ...prev]);
    }
    setShowWorkoutModal(false);
  }

  async function handleAddSupplement(supplementData) {
    try {
      const result = await createSupplement(supplementData);
      const saved = result.supplement ?? { ...supplementData, id: Date.now() };
      setSupplements((prev) => [saved, ...prev]);
    } catch {
      setSupplements((prev) => [{ ...supplementData, id: Date.now() }, ...prev]);
    }
    setShowSupplementModal(false);
  }

  async function handleUpdateProfile(profileData) {
    try {
      await updateProfile(profileData);
      setUserGoals(profileData.goals);
      setToast({ message: "Profile updated successfully!", type: "success" });
    } catch {
      setToast({ message: "Error updating profile", type: "error" });
    }
    setShowProfileModal(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={userName} />

      <main className="max-w-5xl mx-auto px-4 py-8">

        {toast.message && (
          <div className="mb-6">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast({ message: "", type: "success" })}
            />
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Gestiona tus entrenamientos y suplementos
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Training Goals</p>
            <p className="text-gray-800 mt-1">
              {userGoals || <span className="text-gray-400 italic">No goals set yet.</span>}
            </p>
          </div>
          <button
            onClick={() => setShowProfileModal(true)}
            className="bg-gray-800 hover:bg-gray-900 text-white text-sm px-4 py-2 rounded-lg transition font-medium"
          >
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-xl">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{workouts.length}</p>
              <p className="text-sm text-gray-500">Entrenamientos</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{supplements.length}</p>
              <p className="text-sm text-gray-500">Suplementos</p>
            </div>
          </div>
        </div>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Entrenamientos</h2>
            <button
              onClick={() => setShowWorkoutModal(true)}
              className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg transition font-medium flex items-center gap-1"
            >
              <span className="text-lg leading-none">+</span> Agregar
            </button>
          </div>
          {loadingWorkouts ? (
            <p className="text-gray-400 text-sm">Cargando...</p>
          ) : workouts.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
              <p className="text-gray-400">No hay entrenamientos aún.</p>
              <p className="text-gray-400 text-sm mt-1">Agrega tu primer entrenamiento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {workouts.map((w) => (
                <WorkoutCard key={w.id ?? w.SK ?? Math.random()} workout={w} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Suplementos</h2>
            <button
              onClick={() => setShowSupplementModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition font-medium flex items-center gap-1"
            >
              <span className="text-lg leading-none">+</span> Agregar
            </button>
          </div>
          {loadingSupplements ? (
            <p className="text-gray-400 text-sm">Cargando...</p>
          ) : supplements.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
              <p className="text-gray-400">No hay suplementos aún.</p>
              <p className="text-gray-400 text-sm mt-1">Agrega tu primer suplemento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {supplements.map((s) => (
                <SupplementCard key={s.id ?? s.SK ?? Math.random()} supplement={s} />
              ))}
            </div>
          )}
        </section>
      </main>

      {showWorkoutModal && (
        <Modal title="Nuevo entrenamiento" onClose={() => setShowWorkoutModal(false)}>
          <WorkoutForm onSubmit={handleAddWorkout} onCancel={() => setShowWorkoutModal(false)} />
        </Modal>
      )}
      {showSupplementModal && (
        <Modal title="Nuevo suplemento" onClose={() => setShowSupplementModal(false)}>
          <SupplementForm onSubmit={handleAddSupplement} onCancel={() => setShowSupplementModal(false)} />
        </Modal>
      )}
      {showProfileModal && (
        <Modal title="Edit Profile" onClose={() => setShowProfileModal(false)}>
          <ProfileForm
            currentGoals={userGoals}
            onSubmit={handleUpdateProfile}
            onCancel={() => setShowProfileModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}

export default Dashboard;
