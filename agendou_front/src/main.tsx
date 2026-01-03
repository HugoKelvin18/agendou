import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import { BusinessProvider } from "./context/BusinessContext.tsx";
import "./style/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <BusinessProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BusinessProvider>
    </BrowserRouter>
  </React.StrictMode>
);
