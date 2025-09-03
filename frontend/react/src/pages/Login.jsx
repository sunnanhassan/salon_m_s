import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button"; // Corrected path

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }
    try {
      await dispatch(loginUser({ username, password }));
      navigate("/salons"); // redirect after login
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-lg border border-slate-200 rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-slate-900">
            Sign In
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
                placeholder="Enter your username"
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
                placeholder="Enter your password"
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white"
            >
              Sign In
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm text-slate-600">
          Don’t have an account?{" "}
          <a href="/register" className="ml-1 text-sky-600 hover:underline">
            Register
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
