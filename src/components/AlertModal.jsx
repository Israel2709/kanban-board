import Modal from "./Modal";
import Button from "./Button";

const AlertModal = ({ isOpen, onClose, title, message, type = "info", onConfirm }) => {
  const isConfirm = type === "confirm";

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleClose = () => {
    if (!isConfirm) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={isConfirm ? undefined : handleClose} title={title}>
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">{message}</p>
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {isConfirm ? (
            <>
              <Button onClick={onClose} variant="secondary" className="text-sm">
                Cancelar
              </Button>
              <Button onClick={handleConfirm} variant="danger" className="text-sm">
                Confirmar
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} variant="primary" className="text-sm">
              Aceptar
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AlertModal;

