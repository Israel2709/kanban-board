import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import Button from "./Button";
import AlertModal from "./AlertModal";

const Card = ({ card, onClick, onDelete, columnColor }) => {
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

  const getBackgroundColorClass = (color) => {
    const colorMap = {
      blue: "bg-blue-50 dark:bg-blue-950/30",
      green: "bg-green-50 dark:bg-green-950/30",
      red: "bg-red-50 dark:bg-red-950/30",
      yellow: "bg-yellow-50 dark:bg-yellow-950/30",
      purple: "bg-purple-50 dark:bg-purple-950/30",
      pink: "bg-pink-50 dark:bg-pink-950/30",
      indigo: "bg-indigo-50 dark:bg-indigo-950/30",
      gray: "bg-gray-50 dark:bg-gray-950/30",
      orange: "bg-orange-50 dark:bg-orange-950/30",
      teal: "bg-teal-50 dark:bg-teal-950/30",
      cyan: "bg-cyan-50 dark:bg-cyan-950/30",
      lime: "bg-lime-50 dark:bg-lime-950/30",
      amber: "bg-amber-50 dark:bg-amber-950/30",
      violet: "bg-violet-50 dark:bg-violet-950/30",
      fuchsia: "bg-fuchsia-50 dark:bg-fuchsia-950/30",
    };
    return colorMap[color] || "bg-gray-50 dark:bg-gray-950/30";
  };

  const bgColorClass = columnColor ? getBackgroundColorClass(columnColor) : "bg-white dark:bg-gray-800";

  return (
    <div
      onClick={handleCardClick}
      className={`${bgColorClass} rounded-md shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow group relative`}
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

