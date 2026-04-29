import { useState } from "react";

const TIMEZONES = [
  "America/Bogota",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Mexico_City",
  "America/Lima",
  "America/Santiago",
  "America/Sao_Paulo",
  "America/Buenos_Aires",
  "Europe/London",
  "Europe/Madrid",
  "Europe/Paris",
  "UTC",
];

const GENDERS = ["Masculino", "Femenino", "Prefiero no decir"];

function ProfileForm({ currentProfile, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    goals: currentProfile?.goals || "",
    weight: currentProfile?.weight || "",
    height: currentProfile?.height || "",
    age: currentProfile?.age || "",
    gender: currentProfile?.gender || "",
    timezone: currentProfile?.timezone || "America/Bogota",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const data = { ...form };
    if (data.weight) data.weight = Number(data.weight);
    if (data.height) data.height = Number(data.height);
    if (data.age) data.age = Number(data.age);
    onSubmit(data);
  }

  const inputClass =
    "border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Peso (kg)
          </label>
          <input
            type="number"
            name="weight"
            placeholder="Ej: 70"
            value={form.weight}
            onChange={handleChange}
            min="1"
            max="300"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Altura (cm)
          </label>
          <input
            type="number"
            name="height"
            placeholder="Ej: 175"
            value={form.height}
            onChange={handleChange}
            min="50"
            max="250"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Edad
          </label>
          <input
            type="number"
            name="age"
            placeholder="Ej: 25"
            value={form.age}
            onChange={handleChange}
            min="10"
            max="100"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Género
          </label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Seleccionar...</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Zona horaria
        </label>
        <select
          name="timezone"
          value={form.timezone}
          onChange={handleChange}
          className={inputClass}
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Objetivos de entrenamiento
        </label>
        <textarea
          name="goals"
          placeholder="Ej: Ganar masa muscular, mejorar resistencia..."
          value={form.goals}
          onChange={handleChange}
          rows={3}
          className={inputClass}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition font-semibold"
        >
          Guardar perfil
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default ProfileForm;
