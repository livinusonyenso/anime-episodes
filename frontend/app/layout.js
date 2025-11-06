import "./globals.css";
import Navbar from "../components/Navbar";
import { AppProvider } from "../context/AppContext";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Anime Episodes",
  description: "Browse anime episodes and track watched status",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <Navbar />
          <main className="max-w-5xl mx-auto px-4 py-6">
            {children}
            <Toaster position="top-right" />
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
