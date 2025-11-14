import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { subscribeToBoard, deleteColumn } from "../services/boardService";
import { subscribeToCards, createCard, updateCard, deleteCard, moveCard, reorderCards } from "../services/cardService";
import Card from "../components/Card";
import CardModal from "../components/CardModal";
import AddColumnModal from "../components/AddColumnModal";
import AlertModal from "../components/AlertModal";
import Button from "../components/Button";
import { addColumn } from "../services/boardService";
import { FaPlus, FaArrowLeft, FaTrash } from "react-icons/fa";

const SortableCard = ({ card, onCardClick, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: card.id,
    data: {
      type: 'card',
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      <Card card={card} onClick={onCardClick} onDelete={onDelete} />
    </div>
  );
};

const Column = ({ column, cards, onCardClick, onAddCard, onDeleteCard, onDeleteColumn }) => {
  const { setNodeRef } = useDroppable({
    id: `column-${column.id}`,
  });

  const getColorClass = (color) => {
    const colorMap = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      red: "bg-red-500",
      yellow: "bg-yellow-500",
      purple: "bg-purple-500",
      pink: "bg-pink-500",
      indigo: "bg-indigo-500",
      gray: "bg-gray-500",
      orange: "bg-orange-500",
      teal: "bg-teal-500",
      cyan: "bg-cyan-500",
      lime: "bg-lime-500",
      amber: "bg-amber-500",
      violet: "bg-violet-500",
      fuchsia: "bg-fuchsia-500",
    };
    return colorMap[color] || "bg-gray-500";
  };

  return (
    <div
      ref={setNodeRef}
      className="w-1/4 min-w-[300px] flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col h-full"
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-4 h-4 rounded-full ${getColorClass(column.color)}`} />
          <h3 className="font-semibold text-gray-800 dark:text-white">
            {column.name}
          </h3>
        </div>
        {onDeleteColumn && (
          <Button
            onClick={() => onDeleteColumn(column.id)}
            variant="icon"
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Eliminar columna"
          >
            <FaTrash className="w-4 h-4" />
          </Button>
        )}
      </div>
      <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto min-h-0">
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              onCardClick={() => onCardClick(card, column.id)}
              onDelete={() => onDeleteCard(card.id, column.id)}
            />
          ))}
        </div>
      </SortableContext>
      <Button
        onClick={() => onAddCard(column.id)}
        variant="text"
        className="w-full mt-4 flex items-center justify-center gap-4 flex-shrink-0"
      >
        <FaPlus className="w-4 h-4" />
        Agregar card
      </Button>
    </div>
  );
};

const BoardView = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [cardsByColumn, setCardsByColumn] = useState({});
  const [loading, setLoading] = useState(true);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedColumnId, setSelectedColumnId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: "", message: "", type: "info" });
  const [deleteColumnConfirm, setDeleteColumnConfirm] = useState({ isOpen: false, columnId: null });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!boardId) return;

    const unsubscribe = subscribeToBoard(boardId, (boardData) => {
      if (!boardData) {
        navigate("/");
        return;
      }
      setBoard(boardData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [boardId, navigate]);

  useEffect(() => {
    if (!boardId) return;

    const unsubscribe = subscribeToCards(boardId, (cardsData) => {
      setCardsByColumn(cardsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [boardId]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !board) return;

    // Encontrar la columna origen y destino
    let sourceColumnId = null;
    let targetColumnId = null;
    let activeCard = null;

    // Buscar en qué columna está la card activa
    Object.entries(cardsByColumn).forEach(([columnId, cards]) => {
      const card = cards.find((c) => c.id === active.id);
      if (card) {
        sourceColumnId = columnId;
        activeCard = card;
      }
    });

    if (!activeCard || !sourceColumnId) return;

    // Determinar columna destino
    if (typeof over.id === 'string' && over.id.startsWith('column-')) {
      targetColumnId = over.id.replace('column-', '');
    } else {
      // Si es una card, obtener su columna
      Object.entries(cardsByColumn).forEach(([columnId, cards]) => {
        const card = cards.find((c) => c.id === over.id);
        if (card) {
          targetColumnId = columnId;
        }
      });
    }

    if (!targetColumnId) return;

    if (sourceColumnId === targetColumnId) {
      // Reordenar dentro de la misma columna
      const columnCards = cardsByColumn[sourceColumnId] || [];
      const oldIndex = columnCards.findIndex((c) => c.id === active.id);
      const overCard = columnCards.find((c) => c.id === over.id);
      
      if (overCard && overCard.id !== active.id) {
        const newIndex = columnCards.findIndex((c) => c.id === over.id);
        if (oldIndex !== newIndex && newIndex !== -1) {
          const reorderedCards = arrayMove(columnCards, oldIndex, newIndex);
          const cardIds = reorderedCards.map(c => c.id);
          await reorderCards(boardId, sourceColumnId, cardIds);
        }
      }
    } else {
      // Mover a otra columna
      const targetCards = cardsByColumn[targetColumnId] || [];
      const newOrder = targetCards.length;
      await moveCard(boardId, sourceColumnId, targetColumnId, active.id, newOrder);
    }
  };

  const handleCreateCard = async (cardData) => {
    try {
      await createCard(boardId, selectedColumnId, {
        ...cardData,
        order: (cardsByColumn[selectedColumnId]?.length || 0),
      });
      setIsCardModalOpen(false);
      setSelectedColumnId(null);
    } catch (error) {
      console.error("Error al crear card:", error);
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Error al crear la card. Por favor, intenta de nuevo.",
        type: "error",
      });
    }
  };

  const handleUpdateCard = async (cardData) => {
    try {
      await updateCard(boardId, selectedColumnId, selectedCard.id, cardData);
      setIsCardModalOpen(false);
      setSelectedCard(null);
      setSelectedColumnId(null);
    } catch (error) {
      console.error("Error al actualizar card:", error);
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Error al actualizar la card. Por favor, intenta de nuevo.",
        type: "error",
      });
    }
  };

  const handleDeleteCard = async () => {
    try {
      await deleteCard(boardId, selectedColumnId, selectedCard.id);
      setIsCardModalOpen(false);
      setSelectedCard(null);
      setSelectedColumnId(null);
    } catch (error) {
      console.error("Error al eliminar card:", error);
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Error al eliminar la card. Por favor, intenta de nuevo.",
        type: "error",
      });
    }
  };

  const handleDeleteCardDirect = async (cardId, columnId) => {
    try {
      await deleteCard(boardId, columnId, cardId);
    } catch (error) {
      console.error("Error al eliminar card:", error);
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Error al eliminar la card. Por favor, intenta de nuevo.",
        type: "error",
      });
    }
  };

  const handleCardClick = (card, columnId) => {
    setSelectedCard(card);
    setSelectedColumnId(columnId);
    setIsCardModalOpen(true);
  };

  const handleAddCard = (columnId) => {
    setSelectedCard(null);
    setSelectedColumnId(columnId);
    setIsCardModalOpen(true);
  };

  const handleAddColumn = async (columnData) => {
    try {
      await addColumn(boardId, columnData);
      setIsAddColumnModalOpen(false);
    } catch (error) {
      console.error("Error al agregar columna:", error);
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Error al agregar la columna. Por favor, intenta de nuevo.",
        type: "error",
      });
    }
  };

  const handleDeleteColumn = async (columnId) => {
    setDeleteColumnConfirm({ isOpen: true, columnId });
  };

  const confirmDeleteColumn = async () => {
    if (!deleteColumnConfirm.columnId) return;

    try {
      await deleteColumn(boardId, deleteColumnConfirm.columnId);
      setDeleteColumnConfirm({ isOpen: false, columnId: null });
    } catch (error) {
      console.error("Error al eliminar columna:", error);
      const errorMessage = error.message || "Error desconocido al eliminar la columna";
      setDeleteColumnConfirm({ isOpen: false, columnId: null });
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: `Error al eliminar la columna: ${errorMessage}`,
        type: "error",
      });
    }
  };

  const activeCard = activeId
    ? Object.values(cardsByColumn)
        .flat()
        .find((c) => c.id === activeId)
    : null;

  if (loading) {
    return (
      <div className="h-full w-full bg-gray-50 dark:bg-gray-900 transition-colors p-4 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Cargando tablero...</p>
      </div>
    );
  }

  if (!board) {
    return null;
  }

  // Ordenar columnas por order
  const sortedColumns = [...(board.columns || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="h-full w-full bg-gray-50 dark:bg-gray-900 transition-colors p-4">
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/")}
              variant="secondary"
              className="flex items-center gap-4"
            >
              <FaArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              {board.title}
            </h1>
            <Button
              onClick={() => setIsAddColumnModalOpen(true)}
              variant="text"
              className="flex items-center gap-4"
            >
              <FaPlus className="w-4 h-4" />
              Agregar columna
            </Button>
          </div>
        </div>

        {/* Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-x-auto overflow-y-hidden min-h-0">
            <div className="flex gap-4 h-full" style={{ width: 'max-content' }}>
              {sortedColumns.map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  cards={cardsByColumn[column.id] || []}
                  onCardClick={handleCardClick}
                  onAddCard={handleAddCard}
                  onDeleteCard={handleDeleteCardDirect}
                  onDeleteColumn={handleDeleteColumn}
                />
              ))}
            </div>
          </div>
          <DragOverlay>
            {activeCard ? (
              <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-64">
                <h4 className="font-medium text-gray-800 dark:text-white">
                  {activeCard.title || "Sin título"}
                </h4>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Card Modal */}
        <CardModal
          isOpen={isCardModalOpen}
          onClose={() => {
            setIsCardModalOpen(false);
            setSelectedCard(null);
            setSelectedColumnId(null);
          }}
          onSubmit={selectedCard ? handleUpdateCard : handleCreateCard}
          onDelete={selectedCard ? handleDeleteCard : null}
          card={selectedCard}
        />

        {/* Add Column Modal */}
        <AddColumnModal
          isOpen={isAddColumnModalOpen}
          onClose={() => setIsAddColumnModalOpen(false)}
          onSubmit={handleAddColumn}
        />

        {/* Alert Modal */}
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
        />

        {/* Delete Column Confirm Modal */}
        <AlertModal
          isOpen={deleteColumnConfirm.isOpen}
          onClose={() => setDeleteColumnConfirm({ isOpen: false, columnId: null })}
          title="Eliminar Columna"
          message="¿Estás seguro de que quieres eliminar esta columna? Se eliminarán todas las cards dentro de ella."
          type="confirm"
          onConfirm={confirmDeleteColumn}
        />
      </div>
    </div>
  );
};

export default BoardView;

