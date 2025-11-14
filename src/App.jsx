import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import CreateBoardModal from "./components/CreateBoardModal";
import BoardView from "./pages/BoardView";
import Button from "./components/Button";
import {
  createBoard,
  subscribeToBoards,
  deleteBoard,
} from "./services/boardService";
import { FaPlus, FaTrash } from "react-icons/fa";
import AlertModal from "./components/AlertModal";
import "./App.css";

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false,
    boardId: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeToBoards((boardsData) => {
      setBoards(boardsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateBoard = async (data) => {
    try {
      const boardId = await createBoard(data);
      setIsModalOpen(false);
      navigate(`/board/${boardId}`);
    } catch (error) {
      console.error("Error al crear tablero:", error);
      const errorMessage =
        error.message || "Error desconocido al crear el tablero";
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: `Error al crear el tablero: ${errorMessage}`,
        type: "error",
      });
    }
  };

  const handleBoardClick = (boardId) => {
    navigate(`/board/${boardId}`);
  };

  const handleDeleteBoard = async (boardId, e) => {
    e.stopPropagation(); // Prevenir navegación al hacer click en el botón
    setDeleteConfirmModal({ isOpen: true, boardId });
  };

  const confirmDeleteBoard = async () => {
    if (!deleteConfirmModal.boardId) return;

    try {
      await deleteBoard(deleteConfirmModal.boardId);
      setDeleteConfirmModal({ isOpen: false, boardId: null });
    } catch (error) {
      console.error("Error al eliminar tablero:", error);
      const errorMessage =
        error.message || "Error desconocido al eliminar el tablero";
      setDeleteConfirmModal({ isOpen: false, boardId: null });
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: `Error al eliminar el tablero: ${errorMessage}`,
        type: "error",
      });
    }
  };

  return (
    <div className="h-full w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Tableros
        </h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          className="flex items-center gap-4"
        >
          <FaPlus className="w-4 h-4" />
          Crear tablero
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600 dark:text-gray-400">
            Cargando tableros...
          </p>
        </div>
      ) : boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No hay tableros aún. Crea tu primer tablero para comenzar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {boards.map((board) => (
            <div
              key={board.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 relative group"
            >
              <div
                onClick={() => handleBoardClick(board.id)}
                className="cursor-pointer p-4"
              >
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {board.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {board.columns?.length || 0} columnas
                </p>
              </div>
              <Button
                onClick={(e) => handleDeleteBoard(board.id, e)}
                variant="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                aria-label="Eliminar tablero"
              >
                <FaTrash className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <CreateBoardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateBoard}
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />

      <AlertModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal({ isOpen: false, boardId: null })}
        title="Eliminar Tablero"
        message="¿Estás seguro de que quieres eliminar este tablero? Se eliminarán todas las columnas y cards dentro de él."
        type="confirm"
        onConfirm={confirmDeleteBoard}
      />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="h-screen w-full bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col overflow-hidden">
          <Navbar />
          <div className="flex-1 overflow-auto p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/board/:boardId" element={<BoardView />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
