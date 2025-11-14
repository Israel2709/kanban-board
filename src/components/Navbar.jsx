import { useDarkMode } from "../hooks/useDarkMode";
import Button from "./Button";
import { FaMoon, FaSun } from "react-icons/fa";

const Navbar = () => {
  const [isDark, toggleDarkMode] = useDarkMode();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors w-full p-4">
      <div className="w-full">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Tablero Kanban
            </h1>
          </div>
          <div className="flex items-center space-x-4">
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
  );
};

export default Navbar;
