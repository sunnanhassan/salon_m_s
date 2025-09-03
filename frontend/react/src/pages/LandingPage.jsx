// src/pages/LandingPage.jsx
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Scissors, MapPin, Calendar } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-6 py-24 bg-gradient-to-r from-sky-500 to-indigo-600 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Discover & Book Salons Near You
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-100 mb-8">
            From trending hairstyles to quick grooming services — book
            appointments instantly at the best salons in your city.
          </p>
          <Link to="/salons">
            <Button
              size="lg"
              className="bg-white text-sky-600 hover:bg-slate-100 shadow-md"
            >
              Browse Salons
            </Button>
          </Link>
        </div>

        {/* Decorative gradient circles */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Why Choose Us?
          </h2>
          <p className="text-slate-600 mt-3">
            Everything you need to find, compare, and book salon services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <div className="p-8 rounded-2xl shadow-md bg-slate-50 hover:shadow-lg transition">
            <MapPin className="w-10 h-10 text-sky-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nearby Discovery</h3>
            <p className="text-slate-600">
              Instantly find salons closest to your current location.
            </p>
          </div>

          <div className="p-8 rounded-2xl shadow-md bg-slate-50 hover:shadow-lg transition">
            <Calendar className="w-10 h-10 text-sky-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Effortless Booking</h3>
            <p className="text-slate-600">
              Reserve your time slot in just a few clicks — no calls needed.
            </p>
          </div>

          <div className="p-8 rounded-2xl shadow-md bg-slate-50 hover:shadow-lg transition">
            <Scissors className="w-10 h-10 text-sky-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Live Salon Status</h3>
            <p className="text-slate-600">
              Check which salons are open right now and plan ahead.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-r from-sky-600 to-indigo-700 text-white text-center relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready for Your Next Look?
          </h2>
          <p className="text-lg text-slate-200 mb-8">
            Join thousands of users who book salon appointments with ease.
          </p>
          <Link to="/salons">
            <Button
              size="lg"
              className="bg-white text-sky-700 hover:bg-slate-100 shadow-lg"
            >
              Start Browsing
            </Button>
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('https://www.toptal.com/designers/subtlepatterns/patterns/memphis-mini.png')] opacity-10"></div>
      </section>
    </div>
  );
}
