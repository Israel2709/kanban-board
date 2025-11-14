import { getDatabase, ref, set, get, push, update, remove, onValue } from "firebase/database";
import app from "../firebase/config";

const db = getDatabase(app);

// Estructura: /boards/{boardId}
export const createBoard = async (boardData) => {
  try {
    if (!boardData || !boardData.title) {
      throw new Error("El título del tablero es requerido");
    }
    
    if (!boardData.columns || boardData.columns.length === 0) {
      throw new Error("Debe haber al menos una columna");
    }

    const boardsRef = ref(db, "boards");
    const newBoardRef = push(boardsRef);
    const boardId = newBoardRef.key;

    if (!boardId) {
      throw new Error("No se pudo generar el ID del tablero");
    }

    const board = {
      id: boardId,
      title: boardData.title.trim(),
      columns: boardData.columns
        .filter((col) => col.name && col.name.trim())
        .map((col, index) => ({
          id: `col_${index}`,
          name: col.name.trim(),
          color: col.color || "blue",
          order: index,
        })),
      properties: (boardData.properties || [])
        .filter((prop) => prop.name && prop.name.trim())
        .map((prop, index) => ({
          id: `prop_${index}`,
          name: prop.name.trim(),
          type: prop.type || "string",
        })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (board.columns.length === 0) {
      throw new Error("Debe haber al menos una columna válida");
    }

    await set(newBoardRef, board);
    return boardId;
  } catch (error) {
    console.error("Error en createBoard:", error);
    throw error;
  }
};

export const getBoard = async (boardId) => {
  const boardRef = ref(db, `boards/${boardId}`);
  const snapshot = await get(boardRef);
  return snapshot.exists() ? snapshot.val() : null;
};

export const subscribeToBoard = (boardId, callback) => {
  const boardRef = ref(db, `boards/${boardId}`);
  return onValue(boardRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });
};

export const getAllBoards = async () => {
  const boardsRef = ref(db, "boards");
  const snapshot = await get(boardsRef);
  if (!snapshot.exists()) return [];
  
  return Object.entries(snapshot.val()).map(([id, data]) => ({
    id,
    ...data,
  }));
};

export const subscribeToBoards = (callback) => {
  const boardsRef = ref(db, "boards");
  return onValue(boardsRef, (snapshot) => {
    if (snapshot.exists()) {
      const boards = Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...data,
      }));
      callback(boards);
    } else {
      callback([]);
    }
  });
};

export const updateBoard = async (boardId, updates) => {
  const boardRef = ref(db, `boards/${boardId}`);
  await update(boardRef, {
    ...updates,
    updatedAt: Date.now(),
  });
};

export const deleteBoard = async (boardId) => {
  const boardRef = ref(db, `boards/${boardId}`);
  await remove(boardRef);
  
  // También eliminar todas las cards del tablero
  const cardsRef = ref(db, `cards/${boardId}`);
  await remove(cardsRef);
};

export const addColumn = async (boardId, columnData) => {
  try {
    const board = await getBoard(boardId);
    if (!board) {
      throw new Error("Tablero no encontrado");
    }

    const existingColumns = board.columns || [];
    const newColumn = {
      id: `col_${Date.now()}`,
      name: columnData.name.trim(),
      color: columnData.color || "blue",
      order: existingColumns.length,
    };

    const updatedColumns = [...existingColumns, newColumn];

    await updateBoard(boardId, {
      columns: updatedColumns,
    });

    return newColumn;
  } catch (error) {
    console.error("Error en addColumn:", error);
    throw error;
  }
};

export const deleteColumn = async (boardId, columnId) => {
  try {
    const board = await getBoard(boardId);
    if (!board) {
      throw new Error("Tablero no encontrado");
    }

    const existingColumns = board.columns || [];
    
    if (existingColumns.length <= 1) {
      throw new Error("No se puede eliminar la última columna del tablero");
    }

    // Filtrar la columna a eliminar
    const updatedColumns = existingColumns
      .filter((col) => col.id !== columnId)
      .map((col, index) => ({
        ...col,
        order: index,
      }));

    await updateBoard(boardId, {
      columns: updatedColumns,
    });

    // Eliminar todas las cards de esta columna
    const cardsRef = ref(db, `cards/${boardId}/${columnId}`);
    await remove(cardsRef);

    return true;
  } catch (error) {
    console.error("Error en deleteColumn:", error);
    throw error;
  }
};

