import { useState } from "react";

function ProfileForm({ currentGoals, onSubmit, onCancel }) {
  const [goals, setGoals] = useState(currentGoals || "");

  function handleSubmit(e) {
    e.preventDefault();
    if (!goals.trim()) return;
    onSubmit({ goals });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Training Goals *
        </label>
        <textarea
          placeholder="Ex: Gain muscle mass, improve endurance, lose weight..."
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          rows={4}
          required
          className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition font-semibold"
        >
          Save Profile
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ProfileForm;
