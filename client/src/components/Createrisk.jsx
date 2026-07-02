import { useState } from "react";

function CreateRiskForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    likelihood: 3,
    impact: 3,
    status: "Open",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const score =
    Number(formData.likelihood) * Number(formData.impact);

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit?.({
      ...formData,
      score,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Title */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Risk Title
        </label>

        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-700 bg-black/30 px-4 py-2 text-white"
          placeholder="Vendor lacks DPA..."
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Description
        </label>

        <textarea
          name="description"
          rows="4"
          value={formData.description}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-700 bg-black/30 px-4 py-2 text-white"
        />
      </div>

      {/* Likelihood */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Likelihood
        </label>

        <input
          type="range"
          min="1"
          max="5"
          name="likelihood"
          value={formData.likelihood}
          onChange={handleChange}
          className="w-full"
        />

        <p className="text-gray-400 mt-1">
          {formData.likelihood}/5
        </p>
      </div>

      {/* Impact */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Impact
        </label>

        <input
          type="range"
          min="1"
          max="5"
          name="impact"
          value={formData.impact}
          onChange={handleChange}
          className="w-full"
        />

        <p className="text-gray-400 mt-1">
          {formData.impact}/5
        </p>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Status
        </label>

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-700 bg-black/30 px-4 py-2 text-white"
        >
          <option>Open</option>
          <option>Mitigated</option>
          <option>Accepted</option>
        </select>
      </div>

      {/* Score */}
      <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">

        <p className="text-sm text-gray-400">
          Calculated Risk Score
        </p>

        <h2 className="mt-2 text-3xl font-bold text-blue-400">
          {score}
        </h2>

      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 transition"
        >
          Create Risk
        </button>
      </div>

    </form>
  );
}

export default CreateRiskForm;