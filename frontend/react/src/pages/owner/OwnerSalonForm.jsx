// src/pages/owner/OwnerSalonForm.jsx
import React, { useState, useEffect } from "react";
import { createSalon, getSalon, updateSalon } from "../../api/salons";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../../components/ui/Input";
import { Button } from "../../components/ui/button";

export default function OwnerSalonForm() {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    address: "",
    lat: "",
    lng: "",
    open_time: "",
    close_time: "",
  });
  const [err, setErr] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const s = await getSalon(id);
          setForm({
            name: s.name || "",
            address: s.address || "",
            lat: s.lat || "",
            lng: s.lng || "",
            open_time: s.open_time || "",
            close_time: s.close_time || "",
          });
        } catch (e) {
          setErr(e.message);
        }
      })();
    }
  }, [id]);

  const handle = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await updateSalon(id, form);
      } else {
        await createSalon(form);
      }
      nav("/owner");
    } catch (e) {
      setErr(e.message || "Failed");
    }
  };

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">
          {id ? "Edit Salon" : "Create Salon"}
        </h2>
        {err && <div className="text-red-600 mb-4">{err}</div>}

        <form onSubmit={submit} className="space-y-4">
          <Input
            placeholder="Salon name"
            value={form.name}
            onChange={(e) => handle("name", e.target.value)}
          />
          <Input
            placeholder="Address"
            value={form.address}
            onChange={(e) => handle("address", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Latitude"
              value={form.lat}
              onChange={(e) => handle("lat", e.target.value)}
            />
            <Input
              placeholder="Longitude"
              value={form.lng}
              onChange={(e) => handle("lng", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="time"
              value={form.open_time}
              onChange={(e) => handle("open_time", e.target.value)}
            />
            <Input
              type="time"
              value={form.close_time}
              onChange={(e) => handle("close_time", e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md"
          >
            {id ? "Save Changes" : "Create Salon"}
          </Button>
        </form>
      </div>
    </div>
  );
}
