import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import Button from "./Button";
import AlertModal from "./AlertModal";

const Card = ({ card, onClick, onDelete }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setDeleteConfirm(false);
  };

  const handleCardClick = (e) => {
    // No abrir el modal si se hizo click en el botón de eliminar
    if (e.target.closest('button')) {
      return;
    }
    onClick();
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow group relative"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-medium text-gray-800 dark:text-white mb-2">
            {card.title || "Sin título"}
          </h4>
          {card.content && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {card.content}
            </p>
          )}
        </div>
        {onDelete && (
          <div
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className="z-10 relative"
          >
            <Button
              onClick={handleDelete}
              variant="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              aria-label="Eliminar card"
            >
              <FaTrash className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <AlertModal
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        title="Eliminar Card"
        message="¿Estás seguro de que quieres eliminar esta card?"
        type="confirm"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Card;

