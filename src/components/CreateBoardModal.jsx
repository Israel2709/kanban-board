import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Modal from "./Modal";
import Button from "./Button";
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaArrowRight, FaArrowLeft } from "react-icons/fa";

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

const PROPERTY_TYPES = [
  { value: "string", label: "Texto (String)" },
  { value: "email", label: "Email" },
  { value: "number", label: "Número" },
  { value: "currency", label: "Moneda (Currency)" },
  { value: "date", label: "Fecha" },
  { value: "select", label: "Selección (Select)" },
  { value: "multiselect", label: "Selección múltiple" },
  { value: "checkbox", label: "Casilla (Checkbox)" },
  { value: "url", label: "URL" },
  { value: "phone", label: "Teléfono" },
  { value: "textarea", label: "Área de texto" },
];

const CreateBoardModal = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState(null);

  const step1Form = useForm({
    defaultValues: {
      title: "",
      columns: [{ 
        name: "", 
        color: TAILWIND_COLORS[Math.floor(Math.random() * TAILWIND_COLORS.length)].value, 
        order: 0 
      }],
    },
  });

  const step2Form = useForm({
    defaultValues: {
      properties: [{ name: "", type: "string" }],
    },
  });

  const { 
    register: registerStep1, 
    control: controlStep1, 
    handleSubmit: handleSubmitStep1, 
    formState: { errors: errorsStep1 }, 
    watch: watchStep1,
  } = step1Form;

  const { 
    register: registerStep2, 
    control: controlStep2, 
    handleSubmit: handleSubmitStep2, 
    formState: { errors: errorsStep2 }, 
  } = step2Form;

  const watchedColumns = watchStep1("columns");
  const { fields: columnFields, append: appendColumn, remove: removeColumn, move: moveColumn } = useFieldArray({
    control: controlStep1,
    name: "columns",
  });

  const { fields: propertyFields, append: appendProperty, remove: removeProperty } = useFieldArray({
    control: controlStep2,
    name: "properties",
  });

  const handleStep1Submit = (data) => {
    setStep1Data(data);
    setStep(2);
  };

  const handleStep2Submit = async (data) => {
    try {
      const sortedColumns = step1Data.columns
        .map((col, index) => ({ ...col, order: index }))
        .sort((a, b) => a.order - b.order);
      
      await onSubmit({
        title: step1Data.title,
        columns: sortedColumns,
        properties: data.properties.filter(prop => prop.name && prop.name.trim()),
      });
      resetForms();
      onClose();
    } catch (error) {
      console.error("Error en handleStep2Submit:", error);
    }
  };

  const resetForms = () => {
    step1Form.reset();
    step2Form.reset();
    setStep(1);
    setStep1Data(null);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  const handleBack = () => {
    setStep(1);
  };

  const moveColumnFunc = (index, direction) => {
    if (direction === "up" && index > 0) {
      moveColumn(index, index - 1);
    } else if (direction === "down" && index < columnFields.length - 1) {
      moveColumn(index, index + 1);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Crear Tablero - Paso ${step} de 2`}>
      {step === 1 ? (
        <form onSubmit={handleSubmitStep1(handleStep1Submit)} className="space-y-4">
          {/* Título del tablero */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4"
            >
              Título del tablero *
            </label>
            <input
              type="text"
              id="title"
              {...registerStep1("title", {
                required: "El título del tablero es requerido",
              })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingresa el título del tablero"
            />
            {errorsStep1.title && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                {errorsStep1.title.message}
              </p>
            )}
          </div>

          {/* Columnas */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Columnas *
              </label>
              <Button
                type="button"
                onClick={() => {
                  const randomColor = TAILWIND_COLORS[Math.floor(Math.random() * TAILWIND_COLORS.length)];
                  appendColumn({ name: "", color: randomColor.value, order: columnFields.length });
                }}
                variant="text"
                className="flex items-center gap-4 text-sm"
              >
                <FaPlus className="w-4 h-4" />
                Agregar columna
              </Button>
            </div>

            <div className="space-y-4">
              {columnFields.map((field, index) => {
                const watchedColor = watchedColumns?.[index]?.color || field.color || "blue";

                return (
                  <div
                    key={field.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-4">
                        <div>
                          <label
                            htmlFor={`columns.${index}.name`}
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4"
                          >
                            Nombre de la columna *
                          </label>
                          <input
                            type="text"
                            {...registerStep1(`columns.${index}.name`, {
                              required: "El nombre de la columna es requerido",
                            })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nombre de la columna"
                          />
                          {errorsStep1.columns?.[index]?.name && (
                            <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                              {errorsStep1.columns[index].name.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor={`columns.${index}.color`}
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4"
                          >
                            Color *
                          </label>
                          <div className="flex items-center gap-4">
                            <select
                              {...registerStep1(`columns.${index}.color`, {
                                required: "El color es requerido",
                              })}
                              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {TAILWIND_COLORS.map((color) => (
                                <option key={color.value} value={color.value}>
                                  {color.label}
                                </option>
                              ))}
                            </select>
                            <div
                              className={`w-12 h-12 rounded-full ${TAILWIND_COLORS.find(c => c.value === watchedColor)?.class || 'bg-gray-500'} border-2 border-gray-300 dark:border-gray-600 flex-shrink-0`}
                            />
                          </div>
                          {errorsStep1.columns?.[index]?.color && (
                            <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                              {errorsStep1.columns[index].color.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-8">
                        <Button
                          type="button"
                          onClick={() => moveColumnFunc(index, "up")}
                          variant="icon"
                          disabled={index === 0}
                          className="flex items-center justify-center"
                          aria-label="Mover arriba"
                        >
                          <FaArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          onClick={() => moveColumnFunc(index, "down")}
                          variant="icon"
                          disabled={index === columnFields.length - 1}
                          className="flex items-center justify-center"
                          aria-label="Mover abajo"
                        >
                          <FaArrowDown className="w-4 h-4" />
                        </Button>
                        {columnFields.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeColumn(index)}
                            variant="icon"
                            className="flex items-center justify-center text-red-600 dark:text-red-400"
                            aria-label="Eliminar columna"
                          >
                            <FaTrash className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {columnFields.length === 0 && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Debes agregar al menos una columna
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
            <Button type="submit" variant="primary" className="text-sm flex items-center gap-4">
              Siguiente
              <FaArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmitStep2(handleStep2Submit)} className="space-y-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Define las propiedades que tendrán las cards en este tablero. Por ejemplo: "Título - String", "Correo - Email", "Costo - Currency", etc.
            </p>
          </div>

          {/* Propiedades */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Propiedades de las Cards
              </label>
              <Button
                type="button"
                onClick={() => appendProperty({ name: "", type: "string" })}
                variant="text"
                className="flex items-center gap-4 text-sm"
              >
                <FaPlus className="w-4 h-4" />
                Agregar propiedad
              </Button>
            </div>

            <div className="space-y-4">
              {propertyFields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-4">
                      <div>
                        <label
                          htmlFor={`properties.${index}.name`}
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4"
                        >
                          Nombre de la propiedad *
                        </label>
                        <input
                          type="text"
                          {...registerStep2(`properties.${index}.name`, {
                            required: "El nombre de la propiedad es requerido",
                          })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ej: Título, Correo, Costo, etc."
                        />
                        {errorsStep2.properties?.[index]?.name && (
                          <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                            {errorsStep2.properties[index].name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor={`properties.${index}.type`}
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4"
                        >
                          Tipo de dato *
                        </label>
                        <select
                          {...registerStep2(`properties.${index}.type`, {
                            required: "El tipo de dato es requerido",
                          })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {PROPERTY_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        {errorsStep2.properties?.[index]?.type && (
                          <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                            {errorsStep2.properties[index].type.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {propertyFields.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeProperty(index)}
                        variant="icon"
                        className="mt-8 flex items-center justify-center text-red-600 dark:text-red-400"
                        aria-label="Eliminar propiedad"
                      >
                        <FaTrash className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-between gap-4 p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              onClick={handleBack}
              variant="secondary"
              className="text-sm flex items-center gap-4"
            >
              <FaArrowLeft className="w-4 h-4" />
              Anterior
            </Button>
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
                Crear Tablero
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default CreateBoardModal;
