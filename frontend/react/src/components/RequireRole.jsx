// src/components/RequireRole.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function RequireRole({ role, children }) {
  const auth = useSelector((s) => s.auth);
  if (!auth || !auth.access) return <Navigate to="/login" replace />;
  if (auth.user?.role !== role) return <Navigate to="/salons" replace />;
  return children;
}
