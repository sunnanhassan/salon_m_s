import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getServicesForSalon,
  createService,
  updateService,
  deleteService,
} from "../../api/salons";
import Input from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export default function OwnerServices() {
  const { id } = useParams(); // salon ID
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    duration_minutes: 30,
    price: "",
    is_home_service: false,
  });
  const [editingId, setEditingId] = useState(null); // service being edited
  const [err, setErr] = useState(null);

  // Fetch services
  useEffect(() => {
    (async () => {
      try {
        const sv = await getServicesForSalon(id);
        setServices(sv);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [id]);

  // Reset form
  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      duration_minutes: 30,
      price: "",
      is_home_service: false,
    });
    setEditingId(null);
  };

  // Add / Update service
  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update existing service
        const updated = await updateService(editingId, form);
        setServices((prev) =>
          prev.map((s) => (s.id === editingId ? updated : s))
        );
      } else {
        // Create new service
        const newService = await createService(Number(id), form);
        setServices((prev) => [newService, ...prev]);
      }
      resetForm();
    } catch (e) {
      setErr(e.message || "Operation failed");
    }
  };

  const handleEdit = (service) => {
    setForm({
      name: service.name,
      description: service.description,
      duration_minutes: service.duration_minutes,
      price: service.price,
      is_home_service: service.is_home_service,
    });
    setEditingId(service.id);
  };

  const handleDelete = async (serviceId) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await deleteService(serviceId);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    } catch (e) {
      setErr(e.message || "Delete failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-3xl font-bold text-slate-900 mb-6">
        Manage Services
      </h2>
      {err && <div className="text-red-600 mb-2">{err}</div>}

      {/* Add / Edit Service Form */}
      <form
        onSubmit={submit}
        className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8 space-y-4"
      >
        <h3 className="text-xl font-semibold text-slate-800 mb-4">
          {editingId ? "Edit Service" : "Add New Service"}
        </h3>
        <Input
          placeholder="Service name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            placeholder="Duration (minutes)"
            value={form.duration_minutes}
            onChange={(e) =>
              setForm({ ...form, duration_minutes: Number(e.target.value) })
            }
          />
          <Input
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>
        <label className="flex items-center space-x-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.is_home_service}
            onChange={(e) =>
              setForm({ ...form, is_home_service: e.target.checked })
            }
            className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
          />
          <span>Home service available</span>
        </label>
        <div className="flex gap-4">
          <Button
            type="submit"
            className="flex-1 bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md"
          >
            {editingId ? "Update Service" : "Add Service"}
          </Button>
          {editingId && (
            <Button
              type="Button"
              onClick={resetForm}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-slate-800 rounded-xl"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* Service List */}
      <h3 className="text-xl font-semibold text-slate-800 mb-4">
        Existing Services
      </h3>
      <div className="space-y-4">
        {services.map((s) => (
          <div
            key={s.id}
            className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 flex justify-between items-center"
          >
            <div>
              <div className="font-semibold text-lg text-slate-900">
                {s.name}
              </div>
              <div className="text-gray-600 text-sm">{s.description}</div>
              <div className="text-xs text-slate-500 mt-1">
                {s.duration_minutes} min • ${s.price}{" "}
                {s.is_home_service && (
                  <span className="ml-2 text-sky-600 font-medium">
                    (Home Service)
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleEdit(s)}
                className="bg-sky-600 hover:bg-sky-700 text-white text-sm rounded-xl px-4 py-2"
              >
                Edit
              </Button>
              <Button
                onClick={() => handleDelete(s.id)}
                className="bg-red-500 hover:bg-red-600 text-white text-sm rounded-xl px-4 py-2"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
