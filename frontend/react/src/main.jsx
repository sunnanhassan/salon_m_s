// src/index.js
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App";
import store from "./store";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        {/* Global Toast Container */}
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
