import { useState } from "react";

const WORKOUT_TYPES = ["Cardio", "Fuerza", "HIIT", "Flexibilidad", "Otro"];

function WorkoutForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    type: initial?.type || "Cardio",
    duration: initial?.duration || "",
    notes: initial?.notes || "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.duration) return;
    onSubmit({ ...form, duration: Number(form.duration) });
  }

  const inputClass =
    "border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del entrenamiento *
        </label>
        <input
          type="text"
          name="name"
          placeholder="Ej: Día de pecho"
          value={form.name}
          onChange={handleChange}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
        <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
          {WORKOUT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Duración (minutos) *
        </label>
        <input
          type="number"
          name="duration"
          placeholder="Ej: 45"
          value={form.duration}
          onChange={handleChange}
          min="1"
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea
          name="notes"
          placeholder="Observaciones opcionales..."
          value={form.notes}
          onChange={handleChange}
          rows={3}
          className={inputClass}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition font-semibold">
          {initial ? "Guardar cambios" : "Guardar"}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default WorkoutForm;
