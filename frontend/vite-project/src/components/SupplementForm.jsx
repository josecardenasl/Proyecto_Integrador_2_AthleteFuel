import { useState } from "react";

const TIMING_OPTIONS = [
  "Mañana",
  "Pre-entrenamiento",
  "Post-entrenamiento",
  "Noche",
  "Otro",
];

function SupplementForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    dose: "",
    timing: "Post-entrenamiento",
    notes: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.dose) return;
    onSubmit(form);
  }

  const inputClass =
    "border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del suplemento *
        </label>
        <input
          type="text"
          name="name"
          placeholder="Ej: Whey Protein"
          value={form.name}
          onChange={handleChange}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dosis *
        </label>
        <input
          type="text"
          name="dose"
          placeholder="Ej: 25g"
          value={form.dose}
          onChange={handleChange}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Momento del día
        </label>
        <select
          name="timing"
          value={form.timing}
          onChange={handleChange}
          className={inputClass}
        >
          {TIMING_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas
        </label>
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
        <button
          type="submit"
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition font-semibold"
        >
          Guardar
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

export default SupplementForm;
