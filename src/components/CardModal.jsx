import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "./Modal";
import AlertModal from "./AlertModal";
import Button from "./Button";

const CardModal = ({ isOpen, onClose, onSubmit, onDelete, card }) => {
  const isEditing = !!card;
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      title: card?.title || "",
      content: card?.content || "",
    },
  });

  useEffect(() => {
    if (card) {
      reset({
        title: card.title || "",
        content: card.content || "",
      });
    } else {
      reset({
        title: "",
        content: "",
      });
    }
  }, [card, reset]);

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error("Error en handleFormSubmit:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Editar Card" : "Nueva Card"}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Título */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4"
          >
            Título *
          </label>
          <input
            type="text"
            id="title"
            {...register("title", { required: "El título es requerido" })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Título de la card"
          />
          {errors.title && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Contenido */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4"
          >
            Contenido
          </label>
          <textarea
            id="content"
            {...register("content")}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contenido de la card"
          />
        </div>

        {/* Botones */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            {isEditing && onDelete && (
              <Button
                type="button"
                onClick={() => setDeleteConfirm(true)}
                variant="danger"
                className="text-sm"
              >
                Eliminar
              </Button>
            )}
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="secondary"
              className="text-sm"
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="text-sm">
              {isEditing ? "Guardar" : "Crear"}
            </Button>
          </div>
        </div>
      </form>

      <AlertModal
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        title="Eliminar Card"
        message="¿Estás seguro de que quieres eliminar esta card?"
        type="confirm"
        onConfirm={async () => {
          try {
            await onDelete();
            handleClose();
          } catch (error) {
            console.error("Error al eliminar card:", error);
            setDeleteConfirm(false);
            setErrorModal({
              isOpen: true,
              message: "Error al eliminar la card. Por favor, intenta de nuevo.",
            });
          }
        }}
      />

      <AlertModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title="Error"
        message={errorModal.message}
        type="error"
      />
    </Modal>
  );
};

export default CardModal;

