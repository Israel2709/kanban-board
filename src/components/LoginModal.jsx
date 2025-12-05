import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import Modal from "./Modal";
import Button from "./Button";
import { signInWithEmail, signUpWithEmail } from "../services/authService";
import AlertModal from "./AlertModal";
import { FaUser, FaImage } from "react-icons/fa";

const LoginModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const fileInputRef = useRef(null);
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setErrorModal({
          isOpen: true,
          message: "Por favor, selecciona un archivo de imagen válido.",
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorModal({
          isOpen: true,
          message: "La imagen es demasiado grande. El tamaño máximo es 5MB.",
        });
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      if (isSignUp) {
        await signUpWithEmail(data.email, data.password, data.username, photoFile);
      } else {
        await signInWithEmail(data.email, data.password, data.rememberMe);
      }
      reset();
      setPhotoFile(null);
      setPhotoPreview(null);
      onClose();
    } catch (error) {
      console.error("Error al autenticar:", error);
      let errorMessage = "Error al autenticar. Por favor, intenta de nuevo.";
      
      // Traducir mensajes de error comunes de Firebase
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este correo electrónico ya está registrado. Inicia sesión en su lugar.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "El correo electrónico no es válido.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "La contraseña es demasiado débil. Debe tener al menos 6 caracteres.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No se encontró una cuenta con este correo electrónico.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "La contraseña es incorrecta.";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Credenciales inválidas. Verifica tu correo y contraseña.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrorModal({
        isOpen: true,
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setIsSignUp(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    reset();
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={isSignUp ? "Registrarse" : "Iniciar Sesión"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isSignUp && (
            <>
              {/* Campo de nombre de usuario */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Usuario *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    {...register("username", {
                      required: "El nombre de usuario es requerido",
                      minLength: {
                        value: 3,
                        message: "El nombre de usuario debe tener al menos 3 caracteres",
                      },
                      maxLength: {
                        value: 30,
                        message: "El nombre de usuario no puede tener más de 30 caracteres",
                      },
                    })}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre de usuario"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Campo de foto de perfil */}
              <div>
                <label
                  htmlFor="photo"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Foto de perfil
                </label>
                <div className="space-y-2">
                  {photoPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={photoPreview}
                        alt="Vista previa"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="photo"
                      className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-full cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                    >
                      <FaImage className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">
                        Foto
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="photo"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                  {!photoPreview && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Opcional. Máximo 5MB
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Campo de email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Correo electrónico *
            </label>
            <input
              type="email"
              id="email"
              {...register("email", {
                required: "El correo electrónico es requerido",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "El correo electrónico no es válido",
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tu@ejemplo.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Campo de contraseña */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Contraseña *
            </label>
            <input
              type="password"
              id="password"
              {...register("password", {
                required: "La contraseña es requerida",
                minLength: {
                  value: 6,
                  message: "La contraseña debe tener al menos 6 caracteres",
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Checkbox Recuérdame */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              {...register("rememberMe")}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Recuérdame
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading 
                ? (isSignUp ? "Registrando..." : "Iniciando sesión...") 
                : (isSignUp ? "Registrarse" : "Iniciar sesión")
              }
            </Button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {isSignUp 
                  ? "¿Ya tienes una cuenta? Inicia sesión" 
                  : "¿No tienes una cuenta? Regístrate"
                }
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <AlertModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title="Error"
        message={errorModal.message}
        type="error"
      />
    </>
  );
};

export default LoginModal;

