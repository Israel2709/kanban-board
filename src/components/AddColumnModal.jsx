import { useForm } from "react-hook-form";
import Modal from "./Modal";
import Button from "./Button";

const TAILWIND_COLORS = [
  { value: "blue", label: "Azul", class: "bg-blue-500" },
  { value: "green", label: "Verde", class: "bg-green-500" },
  { value: "red", label: "Rojo", class: "bg-red-500" },
  { value: "yellow", label: "Amarillo", class: "bg-yellow-500" },
  { value: "purple", label: "Morado", class: "bg-purple-500" },
  { value: "pink", label: "Rosa", class: "bg-pink-500" },
  { value: "indigo", label: "Índigo", class: "bg-indigo-500" },
  { value: "gray", label: "Gris", class: "bg-gray-500" },
  { value: "orange", label: "Naranja", class: "bg-orange-500" },
  { value: "teal", label: "Verde azulado", class: "bg-teal-500" },
  { value: "cyan", label: "Cian", class: "bg-cyan-500" },
  { value: "lime", label: "Lima", class: "bg-lime-500" },
  { value: "amber", label: "Ámbar", class: "bg-amber-500" },
  { value: "violet", label: "Violeta", class: "bg-violet-500" },
  { value: "fuchsia", label: "Fucsia", class: "bg-fuchsia-500" },
];

const AddColumnModal = ({ isOpen, onClose, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      color: "blue",
    },
  });

  const watchedColor = watch("color", "blue");

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit({
        name: data.name.trim(),
        color: data.color,
      });
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Agregar Columna">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Nombre de la columna */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4"
          >
            Nombre de la columna *
          </label>
          <input
            type="text"
            id="name"
            {...register("name", {
              required: "El nombre de la columna es requerido",
            })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre de la columna"
          />
          {errors.name && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Color */}
        <div>
          <label
            htmlFor="color"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4"
          >
            Color *
          </label>
          <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
            {TAILWIND_COLORS.map((color) => (
              <label
                key={color.value}
                className="flex flex-col items-center cursor-pointer"
              >
                <input
                  type="radio"
                  {...register("color", {
                    required: "El color es requerido",
                  })}
                  value={color.value}
                  className="sr-only"
                />
                <div
                  className={`w-12 h-12 rounded-full ${color.class} border-4 transition-all ${
                    watchedColor === color.value
                      ? "border-blue-600 dark:border-blue-400 scale-110"
                      : "border-transparent hover:border-gray-400"
                  }`}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {color.label}
                </span>
              </label>
            ))}
          </div>
          {errors.color && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">
              {errors.color.message}
            </p>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4 p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            onClick={handleClose}
            variant="secondary"
            className="text-sm"
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" className="text-sm">
            Agregar Columna
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddColumnModal;

