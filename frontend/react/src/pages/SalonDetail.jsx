import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getSalon, getServicesForSalon } from "../api/salons";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Clock, DollarSign } from "lucide-react";

export default function SalonDetail() {
  const { id } = useParams();
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await getSalon(id);
        setSalon(s);
        const sv = await getServicesForSalon(id);
        setServices(sv);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [id]);

  if (err) return <div className="p-6 text-red-600 text-center">{err}</div>;
  if (!salon) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* Salon Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-slate-900">{salon.name}</h1>
        <p className="text-sm text-slate-500 mt-1">{salon.address}</p>
        <div className="mt-3 flex justify-center gap-2">
          <Badge className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
            Salon
          </Badge>
        </div>
      </div>

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.length === 0 && (
          <div className="col-span-2 text-center text-gray-600">
            No services available yet.
          </div>
        )}
        {services.map((s) => (
          <Card
            key={s.id}
            className="flex flex-col justify-between h-full shadow-md border border-slate-200 rounded-xl hover:shadow-xl transition-transform transform hover:-translate-y-1"
          >
            <CardHeader className="p-5 border-b border-slate-200">
              <CardTitle className="text-lg font-semibold text-slate-900 mb-2">
                {s.name}
              </CardTitle>
              <p className="text-sm text-slate-600">{s.description}</p>
            </CardHeader>

            <CardContent className="flex flex-col justify-between p-5 space-y-4">
              <div className="flex items-center justify-between text-slate-700 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  {s.duration_minutes} min
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-500" />${s.price}
                </div>
              </div>

              <Link
                to={`/book/${salon.id}/${s.id}`}
                className="inline-block mt-3 text-center px-4 py-2 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition"
              >
                Book Now
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
