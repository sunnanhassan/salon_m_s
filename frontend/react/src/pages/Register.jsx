import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { registerUser } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import Input from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSalonOwner, setIsSalonOwner] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username || !email || !password || !firstName || !lastName) {
      setError("All fields are required");
      return;
    }

    try {
      const payload = {
        username,
        email,
        password,
        role: isSalonOwner ? "salon_owner" : "customer",
        first_name: firstName,
        last_name: lastName,
        phone: "", // optional, leave empty for now
      };

      await dispatch(registerUser(payload));
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-lg border border-slate-200 rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-slate-900">
            Create Account
          </CardTitle>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  First Name
                </label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Last Name
                </label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isSalonOwner}
                onChange={() => setIsSalonOwner(!isSalonOwner)}
                className="h-4 w-4 text-sky-600 border-gray-300 rounded"
              />
              <label className="text-sm text-slate-700">
                I am a salon owner
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white"
            >
              Register
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm text-slate-600">
          Already have an account?
          <a href="/login" className="ml-1 text-sky-600 hover:underline">
            Sign In
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
