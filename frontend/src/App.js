import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { SettingsProvider } from "./hooks/useSettings";
import Home from "./pages/Home";
import About from "./pages/About";
import Settings from "./pages/Settings";
import AuthPage from "./pages/Auth";

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
