import { getDatabase, ref, set, get, push, update, remove, onValue } from "firebase/database";
import app from "../firebase/config";

const db = getDatabase(app);

// Estructura: /cards/{boardId}/{columnId}/{cardId}
export const createCard = async (boardId, columnId, cardData) => {
  const cardsRef = ref(db, `cards/${boardId}/${columnId}`);
  const newCardRef = push(cardsRef);
  const cardId = newCardRef.key;

  const card = {
    id: cardId,
    title: cardData.title || "Sin título",
    content: cardData.content || "",
    order: cardData.order || 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await set(newCardRef, card);
  return cardId;
};

export const getCard = async (boardId, columnId, cardId) => {
  const cardRef = ref(db, `cards/${boardId}/${columnId}/${cardId}`);
  const snapshot = await get(cardRef);
  return snapshot.exists() ? snapshot.val() : null;
};

export const getCardsByBoard = async (boardId) => {
  const cardsRef = ref(db, `cards/${boardId}`);
  const snapshot = await get(cardsRef);
  if (!snapshot.exists()) return {};
  
  const cardsByColumn = {};
  const columns = snapshot.val();
  
  Object.entries(columns).forEach(([columnId, cards]) => {
    cardsByColumn[columnId] = Object.entries(cards).map(([id, data]) => ({
      id,
      ...data,
    }));
  });
  
  return cardsByColumn;
};

export const subscribeToCards = (boardId, callback) => {
  const cardsRef = ref(db, `cards/${boardId}`);
  return onValue(cardsRef, (snapshot) => {
    if (snapshot.exists()) {
      const cardsByColumn = {};
      const columns = snapshot.val();
      
      Object.entries(columns).forEach(([columnId, cards]) => {
        cardsByColumn[columnId] = Object.entries(cards).map(([id, data]) => ({
          id,
          ...data,
        }));
        // Ordenar por order
        cardsByColumn[columnId].sort((a, b) => (a.order || 0) - (b.order || 0));
      });
      
      callback(cardsByColumn);
    } else {
      callback({});
    }
  });
};

export const updateCard = async (boardId, columnId, cardId, updates) => {
  const cardRef = ref(db, `cards/${boardId}/${columnId}/${cardId}`);
  await update(cardRef, {
    ...updates,
    updatedAt: Date.now(),
  });
};

export const deleteCard = async (boardId, columnId, cardId) => {
  const cardRef = ref(db, `cards/${boardId}/${columnId}/${cardId}`);
  await remove(cardRef);
};

// Mover card entre columnas
export const moveCard = async (boardId, sourceColumnId, targetColumnId, cardId, newOrder) => {
  try {
    // Obtener la card original
    const cardRef = ref(db, `cards/${boardId}/${sourceColumnId}/${cardId}`);
    const snapshot = await get(cardRef);
    
    if (!snapshot.exists()) {
      throw new Error("Card no encontrada");
    }
    
    const cardData = snapshot.val();
    
    // Crear en la nueva columna
    const newCardRef = ref(db, `cards/${boardId}/${targetColumnId}/${cardId}`);
    await set(newCardRef, {
      ...cardData,
      order: newOrder,
      updatedAt: Date.now(),
    });
    
    // Eliminar de la columna original
    await remove(cardRef);
    
    // Reordenar cards en la columna destino
    const targetCardsRef = ref(db, `cards/${boardId}/${targetColumnId}`);
    const targetSnapshot = await get(targetCardsRef);
    
    if (targetSnapshot.exists()) {
      const updates = {};
      const cards = targetSnapshot.val();
      let order = 0;
      
      Object.keys(cards).forEach((id) => {
        if (id !== cardId) {
          if (order >= newOrder) {
            updates[`${id}/order`] = order + 1;
          } else {
            updates[`${id}/order`] = order;
          }
          order++;
        }
      });
      
      if (Object.keys(updates).length > 0) {
        await update(targetCardsRef, updates);
      }
    }
  } catch (error) {
    console.error("Error al mover card:", error);
    throw error;
  }
};

// Reordenar cards dentro de la misma columna
export const reorderCards = async (boardId, columnId, cardIds) => {
  try {
    const updates = {};
    cardIds.forEach((cardId, index) => {
      updates[`${cardId}/order`] = index;
      updates[`${cardId}/updatedAt`] = Date.now();
    });
    
    const columnRef = ref(db, `cards/${boardId}/${columnId}`);
    await update(columnRef, updates);
  } catch (error) {
    console.error("Error al reordenar cards:", error);
    throw error;
  }
};

