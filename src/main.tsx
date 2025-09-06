import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App";


const convexUrl = import.meta.env.VITE_CONVEX_URL as string;

if (!convexUrl) {
  console.error("VITE_CONVEX_URL is not set. Please check your environment variables.");
  console.error("Available env vars:", import.meta.env);
  
  // Show a user-friendly error in the DOM
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-family: system-ui, -apple-system, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        margin: 0;
        color: white;
      ">
        <div style="text-align: center; padding: 2rem;">
          <h1 style="margin-bottom: 1rem;">Configuration Error</h1>
          <p style="margin-bottom: 1rem;">VITE_CONVEX_URL environment variable is not set.</p>
          <p style="font-size: 0.9rem; opacity: 0.8;">Please check your Vercel environment variables.</p>
        </div>
      </div>
    `;
  }
  throw new Error("Missing VITE_CONVEX_URL environment variable");
}

const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ConvexAuthProvider client={convex}>
      <App />
    </ConvexAuthProvider>
  </BrowserRouter>,
);
