import { useState } from "react";

const TIMEZONES = [
  "America/Bogota", "America/New_York", "America/Chicago",
  "America/Denver", "America/Los_Angeles", "America/Mexico_City",
  "America/Lima", "America/Santiago", "America/Sao_Paulo",
  "America/Buenos_Aires", "Europe/London", "Europe/Madrid", "Europe/Paris", "UTC",
];

const GENDERS = ["Masculino", "Femenino", "Prefiero no decir"];
const REMINDER_OPTIONS = [15, 30, 45, 60];

function ProfileForm({ currentProfile, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    goals:                  currentProfile?.goals                ?? "",
    weight:                 currentProfile?.weight               ?? "",
    height:                 currentProfile?.height               ?? "",
    age:                    currentProfile?.age                  ?? "",
    gender:                 currentProfile?.gender               ?? "",
    timezone:               currentProfile?.timezone             ?? "America/Bogota",
    notificationsEnabled:   currentProfile?.notificationsEnabled ?? true,
    reminderMinutesBefore:  currentProfile?.reminderMinutesBefore ?? 30,
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const data = { ...form };
    if (data.weight) data.weight = Number(data.weight);
    if (data.height) data.height = Number(data.height);
    if (data.age)    data.age    = Number(data.age);
    data.reminderMinutesBefore = Number(data.reminderMinutesBefore);
    onSubmit(data);
  }

  const inputClass = "border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Physical data */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Datos físicos</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
          <input type="number" name="weight" placeholder="Ej: 70" value={form.weight}
            onChange={handleChange} min="1" max="300" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
          <input type="number" name="height" placeholder="Ej: 175" value={form.height}
            onChange={handleChange} min="50" max="250" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
          <input type="number" name="age" placeholder="Ej: 25" value={form.age}
            onChange={handleChange} min="10" max="100" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
          <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
            <option value="">Seleccionar...</option>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* Preferences */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-1">Preferencias</p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Zona horaria</label>
        <select name="timezone" value={form.timezone} onChange={handleChange} className={inputClass}>
          {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
        </select>
      </div>

      {/* Notification preferences */}
      <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Notificaciones in-app</p>
            <p className="text-xs text-gray-400">Recordatorios de entrenamientos y suplementos</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="notificationsEnabled"
              checked={form.notificationsEnabled} onChange={handleChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer
              peer-checked:after:translate-x-full peer-checked:after:border-white
              after:content-[''] after:absolute after:top-[2px] after:left-[2px]
              after:bg-white after:border-gray-300 after:border after:rounded-full
              after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500">
            </div>
          </label>
        </div>

        {form.notificationsEnabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recordar con anticipación
            </label>
            <select name="reminderMinutesBefore" value={form.reminderMinutesBefore}
              onChange={handleChange} className={inputClass}>
              {REMINDER_OPTIONS.map(m => (
                <option key={m} value={m}>{m} minutos antes</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Goals */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Objetivos de entrenamiento</label>
        <textarea name="goals" placeholder="Ej: Ganar masa muscular, mejorar resistencia..."
          value={form.goals} onChange={handleChange} rows={3} className={inputClass} />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit"
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition font-semibold">
          Guardar perfil
        </button>
        <button type="button" onClick={onCancel}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default ProfileForm;
