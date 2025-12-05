import { useState } from "react";
import { useDarkMode } from "../hooks/useDarkMode";
import Button from "./Button";
import LoginModal from "./LoginModal";
import { FaMoon, FaSun, FaSignInAlt, FaSignOutAlt, FaUser } from "react-icons/fa";
import { logout } from "../services/authService";
import AlertModal from "./AlertModal";

const Navbar = ({ user, onAuthChange }) => {
  const [isDark, toggleDarkMode] = useDarkMode();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setErrorModal({
        isOpen: true,
        message: "Error al cerrar sesión. Por favor, intenta de nuevo.",
      });
    }
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors w-full p-4">
        <div className="w-full">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                Tablero Kanban
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || user.email?.split('@')[0] || 'Usuario'}
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                        <FaUser className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
                      {user.displayName || user.email?.split('@')[0] || 'Usuario'}
                    </span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="secondary"
                    className="flex items-center gap-2 text-sm"
                    title="Cerrar sesión"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    <span className="hidden md:inline">Cerrar sesión</span>
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsLoginModalOpen(true)}
                  variant="primary"
                  className="flex items-center gap-2 text-sm"
                >
                  <FaSignInAlt className="w-4 h-4" />
                  Iniciar sesión
                </Button>
              )}
              <Button
                onClick={toggleDarkMode}
                variant="icon"
                aria-label="Alternar modo oscuro"
              >
                {isDark ? (
                  <FaSun className="w-5 h-5" />
                ) : (
                  <FaMoon className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <AlertModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title="Error"
        message={errorModal.message}
        type="error"
      />
    </>
  );
};

export default Navbar;
