import { useState, useEffect, useRef } from "react";
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
import { subscribeToBoard, deleteColumn, updateColumnWidth } from "../services/boardService";
import { subscribeToCards, createCard, updateCard, deleteCard, moveCard, reorderCards } from "../services/cardService";
import Card from "../components/Card";
import CardModal from "../components/CardModal";
import AddColumnModal from "../components/AddColumnModal";
import AlertModal from "../components/AlertModal";
import Button from "../components/Button";
import { addColumn } from "../services/boardService";
import { FaPlus, FaArrowLeft, FaTrash, FaDownload, FaUpload } from "react-icons/fa";
import Modal from "../components/Modal";

const SortableCard = ({ card, onCardClick, onDelete, columnColor }) => {
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
    touchAction: 'none', // Previene el scroll nativo en móviles durante el drag
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className="cursor-grab active:cursor-grabbing touch-none"
    >
      <Card card={card} onClick={onCardClick} onDelete={onDelete} columnColor={columnColor} />
    </div>
  );
};

const Column = ({ column, cards, onCardClick, onAddCard, onDeleteCard, onDeleteColumn, onResize, boardId }) => {
  const { setNodeRef } = useDroppable({
    id: `column-${column.id}`,
  });
  const [isResizing, setIsResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(column.width || 250);
  const columnRef = useRef(null);

  useEffect(() => {
    setCurrentWidth(column.width || 250);
  }, [column.width]);

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

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    let finalWidth = currentWidth;

    const handleMouseMove = (e) => {
      if (columnRef.current) {
        const rect = columnRef.current.getBoundingClientRect();
        const newWidth = e.clientX - rect.left;
        const clampedWidth = Math.max(150, Math.min(500, newWidth));
        finalWidth = clampedWidth;
        setCurrentWidth(clampedWidth);
      }
    };

    const handleMouseUp = async () => {
      setIsResizing(false);
      if (onResize && boardId) {
        await onResize(column.id, finalWidth);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, column.id, onResize, boardId]);

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        columnRef.current = node;
      }}
      style={{ width: `${currentWidth}px` }}
      className="flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col h-full relative"
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-4 h-4 rounded-full ${getColorClass(column.color)}`} />
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              {column.name}
            </h3>
            <span className="px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
              {cards.length}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onAddCard(column.id)}
            variant="icon"
            className="opacity-70 hover:opacity-100 transition-opacity"
            title="Agregar item"
            aria-label="Agregar item"
          >
            <FaPlus className="w-4 h-4" />
          </Button>
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
      </div>
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-blue-500 opacity-0 hover:opacity-100 transition-opacity z-10"
        style={{ touchAction: 'none' }}
        aria-label="Redimensionar columna"
      />
      <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto min-h-0">
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              onCardClick={() => onCardClick(card, column.id)}
              onDelete={() => onDeleteCard(card.id, column.id)}
              columnColor={column.color}
            />
          ))}
        </div>
      </SortableContext>
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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requiere 8px de movimiento antes de activar el drag
      },
    }),
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

  const handleResizeColumn = async (columnId, width) => {
    try {
      await updateColumnWidth(boardId, columnId, width);
    } catch (error) {
      console.error("Error al actualizar ancho de columna:", error);
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Error al actualizar el ancho de la columna. Por favor, intenta de nuevo.",
        type: "error",
      });
    }
  };

  const handleExportToCSV = () => {
    if (!board || !sortedColumns) return;

    // Crear encabezados del CSV
    const headers = ["Título", "Contenido", "Columna"];
    const rows = [headers.join(",")];

    // Agregar cada card como una fila
    sortedColumns.forEach((column) => {
      const columnCards = cardsByColumn[column.id] || [];
      columnCards.forEach((card) => {
        const title = `"${(card.title || "Sin título").replace(/"/g, '""')}"`;
        const content = `"${(card.content || "").replace(/"/g, '""')}"`;
        const columnName = `"${column.name.replace(/"/g, '""')}"`;
        rows.push([title, content, columnName].join(","));
      });
    });

    // Crear el contenido CSV con BOM para UTF-8 (permite caracteres especiales y acentos)
    const BOM = "\uFEFF";
    const csvContent = BOM + rows.join("\n");

    // Crear el blob con encoding UTF-8
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${board.title.replace(/[^a-z0-9]/gi, "_")}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTemplate = () => {
    if (!board || !sortedColumns) return;

    // Crear los encabezados para la plantilla
    const headers = ["Título", "Contenido", "Columna"];
    const rows = [headers.join(",")];

    // Agregar filas de ejemplo con las columnas disponibles
    sortedColumns.forEach((column, index) => {
      const exampleTitle = `Ejemplo ${index + 1}`;
      const exampleContent = "Descripción del item";
      const columnName = `"${column.name.replace(/"/g, '""')}"`;
      rows.push([`"${exampleTitle}"`, `"${exampleContent}"`, columnName].join(","));
    });

    // Crear el contenido CSV con BOM para UTF-8
    const BOM = "\uFEFF";
    const csvContent = BOM + rows.join("\n");

    // Crear el blob con encoding UTF-8
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Plantilla_${board.title.replace(/[^a-z0-9]/gi, "_")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (csvText) => {
    const lines = csvText.split("\n").filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error("El archivo CSV debe tener al menos una fila de encabezados y una fila de datos");
    }

    // Parsear encabezados (remover BOM si existe)
    const headerLine = lines[0].replace(/^\uFEFF/, "");
    const headers = headerLine.split(",").map(h => h.trim().replace(/^"|"$/g, ""));

    // Validar encabezados
    const expectedHeaders = ["Título", "Contenido", "Columna"];
    const hasAllHeaders = expectedHeaders.every(h => headers.includes(h));
    if (!hasAllHeaders) {
      throw new Error(`El archivo CSV debe contener las columnas: ${expectedHeaders.join(", ")}`);
    }

    // Parsear datos
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Parsear CSV manualmente (manejar comillas)
      const values = [];
      let currentValue = "";
      let insideQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          if (insideQuotes && line[j + 1] === '"') {
            currentValue += '"';
            j++; // Saltar la siguiente comilla
          } else {
            insideQuotes = !insideQuotes;
          }
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue.trim());
          currentValue = "";
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim());

      if (values.length >= 3) {
        data.push({
          title: values[0].replace(/^"|"$/g, ""),
          content: values[1].replace(/^"|"$/g, ""),
          column: values[2].replace(/^"|"$/g, ""),
        });
      }
    }

    return data;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = parseCSV(text);

      if (data.length === 0) {
        throw new Error("El archivo CSV no contiene datos válidos");
      }

      // Crear un mapa de nombres de columnas a IDs
      const columnMap = {};
      sortedColumns.forEach((column) => {
        columnMap[column.name] = column.id;
      });

      // Crear las cards
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const row of data) {
        const columnId = columnMap[row.column];
        if (!columnId) {
          errorCount++;
          errors.push(`Columna "${row.column}" no encontrada`);
          continue;
        }

        try {
          const columnCards = cardsByColumn[columnId] || [];
          await createCard(boardId, columnId, {
            title: row.title || "Sin título",
            content: row.content || "",
            order: columnCards.length,
          });
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push(`Error al crear card "${row.title}": ${error.message}`);
        }
      }

      setIsImportModalOpen(false);
      
      if (errorCount > 0) {
        setAlertModal({
          isOpen: true,
          title: "Importación completada con errores",
          message: `Se importaron ${successCount} items correctamente. ${errorCount} items tuvieron errores.`,
          type: "error",
        });
      } else {
        setAlertModal({
          isOpen: true,
          title: "Importación exitosa",
          message: `Se importaron ${successCount} items correctamente.`,
          type: "info",
        });
      }

      // Limpiar el input
      event.target.value = "";
    } catch (error) {
      console.error("Error al importar CSV:", error);
      setAlertModal({
        isOpen: true,
        title: "Error al importar CSV",
        message: error.message || "Error desconocido al importar el archivo CSV.",
        type: "error",
      });
      event.target.value = "";
    }
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
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsImportModalOpen(true)}
              variant="secondary"
              className="flex items-center gap-4"
              title="Importar desde CSV"
            >
              <FaUpload className="w-4 h-4" />
              Importar CSV
            </Button>
            <Button
              onClick={handleExportToCSV}
              variant="secondary"
              className="flex items-center gap-4"
              title="Exportar a CSV"
            >
              <FaDownload className="w-4 h-4" />
              Exportar CSV
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
                  onResize={handleResizeColumn}
                  boardId={boardId}
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

        {/* Import CSV Modal */}
        <Modal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          title="Importar desde CSV"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Selecciona una opción para importar datos desde un archivo CSV:
            </p>
            
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <Button
                  onClick={handleDownloadTemplate}
                  variant="primary"
                  className="w-full flex items-center justify-center gap-4 mb-2"
                >
                  <FaDownload className="w-4 h-4" />
                  Descargar plantilla
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Descarga la plantilla necesaria para poder importar datos posteriormente
                </p>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <label className="block">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-file-input"
                  />
                  <Button
                    onClick={() => document.getElementById("csv-file-input")?.click()}
                    variant="primary"
                    className="w-full flex items-center justify-center gap-4 mb-2"
                  >
                    <FaUpload className="w-4 h-4" />
                    Cargar CSV
                  </Button>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Usa esta opción si ya cuentas con la plantilla necesaria
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Columnas disponibles:
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {sortedColumns.map((column) => (
                  <li key={column.id}>• {column.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default BoardView;

