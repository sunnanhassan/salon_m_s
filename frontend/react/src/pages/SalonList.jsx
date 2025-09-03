import React, { useEffect, useState, useRef } from "react";
import { listSalons } from "../api/salons";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { MapPin, Clock, Search } from "lucide-react";
import dayjs from "dayjs";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
  iconSize: [40, 40],
});
const salonIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1673/1673221.png",
  iconSize: [34, 34],
});

export default function LandingPage() {
  const [salons, setSalons] = useState([]);
  const [filteredSalons, setFilteredSalons] = useState([]);
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [activeSalonId, setActiveSalonId] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [showMap, setShowMap] = useState(true);
  const mapRef = useRef(null);
  const mapSectionRef = useRef(null);

  // Fetch salons
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await listSalons();
        setSalons(data);
        setFilteredSalons(data);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Search filter
  useEffect(() => {
    if (!search.trim()) {
      setFilteredSalons(salons);
    } else {
      const lower = search.toLowerCase();
      setFilteredSalons(
        salons.filter(
          (s) =>
            s.name.toLowerCase().includes(lower) ||
            (s.address && s.address.toLowerCase().includes(lower))
        )
      );
    }
  }, [search, salons]);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const sortedSalons =
    userLocation && filteredSalons.length
      ? [...filteredSalons].sort(
          (a, b) =>
            getDistance(userLocation.lat, userLocation.lng, a.lat, a.lng) -
            getDistance(userLocation.lat, userLocation.lng, b.lat, b.lng)
        )
      : filteredSalons;

  const isOpen = (openTime, closeTime) => {
    if (!openTime || !closeTime) return false;
    const now = dayjs();
    const [openH, openM] = openTime.split(":");
    const [closeH, closeM] = closeTime.split(":");
    let open = dayjs().hour(Number(openH)).minute(Number(openM));
    let close = dayjs().hour(Number(closeH)).minute(Number(closeM));
    if (close.isBefore(open)) close = close.add(1, "day");
    return now.isAfter(open) && now.isBefore(close);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setErr("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        if (mapRef.current)
          mapRef.current.flyTo([loc.lat, loc.lng], 14, { animate: true });
      },
      () => setErr("Could not get your location.")
    );
  };

  const fetchRoute = async (destLat, destLng) => {
    if (!userLocation) return;
    try {
      const apiKey = "YOUR_OPENROUTESERVICE_API_KEY";
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${userLocation.lng},${userLocation.lat}&end=${destLng},${destLat}`
      );
      const data = await response.json();
      const coords = data.features[0].geometry.coordinates.map(([lng, lat]) => [
        lat,
        lng,
      ]);
      setRouteCoords(coords);
    } catch (err) {
      console.error("Route fetch error:", err);
      setRouteCoords([]);
    }
  };

  const showSalonOnMap = (s) => {
    setActiveSalonId(s.id);
    setShowMap(true);
    if (mapRef.current && s.lat && s.lng)
      mapRef.current.flyTo([s.lat, s.lng], 15, { animate: true });
    if (userLocation) fetchRoute(s.lat, s.lng);
    if (mapSectionRef.current)
      mapSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  };

  const MapUpdater = () => {
    const map = useMap();
    mapRef.current = map;
    return null;
  };

  const getTimeBadge = (openTimeStr, closeTimeStr) => {
    if (!openTimeStr || !closeTimeStr) return "";
    const now = dayjs();
    let [openH, openM] = openTimeStr.split(":").map(Number);
    let [closeH, closeM] = closeTimeStr.split(":").map(Number);

    let openTime = dayjs().hour(openH).minute(openM);
    let closeTime = dayjs().hour(closeH).minute(closeM);

    if (closeTime.isBefore(openTime)) closeTime = closeTime.add(1, "day");

    let diffMinutes;
    let prefix = "";

    if (now.isAfter(openTime) && now.isBefore(closeTime)) {
      diffMinutes = closeTime.diff(now, "minute");
      prefix = "Closes in ";
    } else {
      if (now.isAfter(closeTime)) openTime = openTime.add(1, "day");
      diffMinutes = openTime.diff(now, "minute");
      prefix = "Opens in ";
    }

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return `${prefix}${hours > 0 ? hours + "h " : ""}${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <section className="relative py-24 text-center bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 text-white shadow-xl">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
            Discover & Book Salons Near You ✨
          </h1>
          <p className="text-lg md:text-xl text-slate-100 mb-10">
            Browse top salons, view services, and reserve your spot instantly.
          </p>

          {/* Search */}
          <div className="flex justify-center mb-6">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search salons by name or location..."
                className="w-full px-4 py-3 rounded-full border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-800"
              />
              <Search className="absolute right-4 top-3.5 w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={detectLocation}
              size="lg"
              className="bg-white text-sky-600 hover:bg-slate-100 font-semibold"
            >
              📍 Detect My Location
            </Button>
            <Button
              onClick={() => setShowMap(!showMap)}
              size="lg"
              className="bg-sky-700 hover:bg-sky-800 text-white"
            >
              {showMap ? "🙈 Hide Map" : "🗺️ Show Map"}
            </Button>
          </div>
        </div>
      </section>

      {/* Map Section */}
      {showMap && (
        <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-10">
          <div
            ref={mapSectionRef}
            className="w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl border bg-white"
          >
            <MapContainer
              center={[20, 0]}
              zoom={2}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapUpdater />
              {userLocation && (
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={userIcon}
                >
                  <Popup>You are here</Popup>
                </Marker>
              )}
              {sortedSalons.map((s) => (
                <Marker key={s.id} position={[s.lat, s.lng]} icon={salonIcon}>
                  <Popup>
                    <strong className="text-sky-700">{s.name}</strong>
                    <br />
                    {s.address}
                    <br />
                    <Link
                      to={`/salons/${s.id}`}
                      className="text-sky-600 hover:underline"
                    >
                      View & Book
                    </Link>
                  </Popup>
                </Marker>
              ))}
              {routeCoords.length > 0 && (
                <Polyline positions={routeCoords} color="blue" weight={4} />
              )}
            </MapContainer>
          </div>
        </div>
      )}

      {/* Salon Cards */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">
          Nearby Salons
        </h2>
        {loading && <p className="text-center text-slate-600">Loading...</p>}
        {err && <p className="text-center text-red-600">{err}</p>}

        {sortedSalons.length === 0 && !loading ? (
          <p className="text-center text-slate-500">No salons found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {sortedSalons.map((s) => {
              const open = isOpen(s.open_time, s.close_time);
              const distance =
                userLocation && s.lat && s.lng
                  ? getDistance(
                      userLocation.lat,
                      userLocation.lng,
                      s.lat,
                      s.lng
                    ).toFixed(2)
                  : null;

              return (
                <Card
                  key={s.id}
                  className="hover:scale-105 hover:shadow-2xl border rounded-2xl transition-transform duration-200 bg-white/90 backdrop-blur"
                >
                  <CardHeader className="bg-slate-50/70 p-4 flex justify-between items-start">
                    <CardTitle className="text-lg font-bold text-slate-900">
                      {s.name}
                    </CardTitle>
                    <Badge
                      className={`text-xs px-2 py-1 rounded-full ${
                        open
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {getTimeBadge(s.open_time, s.close_time)}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span>{s.address || "N/A"}</span>
                    </div>
                    {distance && (
                      <div className="text-sm text-slate-600">
                        🚗 {distance} km away
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>
                        {s.open_time || "N/A"} - {s.close_time || "N/A"}
                      </span>
                    </div>
                    <Button
                      onClick={() => showSalonOnMap(s)}
                      className="w-full bg-sky-500 hover:bg-sky-600"
                    >
                      Show on Map
                    </Button>
                    <Link
                      to={`/salons/${s.id}`}
                      className="block w-full text-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      View Services & Book
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
