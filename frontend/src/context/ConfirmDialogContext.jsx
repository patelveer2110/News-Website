import { createContext, useContext, useState } from "react";
import { Dialog } from "@headlessui/react";

const ConfirmDialogContext = createContext();

export const ConfirmDialogProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState({
    title: "Are you sure?",
    description: "",
    onConfirm: () => {},
  });

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertOptions, setAlertOptions] = useState({
    title: "",
    description: "",
  });

  const showConfirm = ({ title, description }) => {
    return new Promise((resolve) => {
      setOptions({
        title,
        description,
        onConfirm: () => {
          resolve(true);
          setIsOpen(false);
        },
        onCancel: () => {
          resolve(false);
          setIsOpen(false);
        },
      });
      setIsOpen(true);
    });
  };

  const showAlert = ({ title, description }) => {
    return new Promise((resolve) => {
      setAlertOptions({ title, description });

      setAlertOpen(true);

      const handleClose = () => {
        setAlertOpen(false);
        resolve();
      };

      setAlertOptions((prev) => ({
        ...prev,
        onClose: handleClose,
      }));
    });
  };

  const cancel = () => {
    options.onCancel?.();
    setIsOpen(false);
  };

  const confirm = () => {
    options.onConfirm();
    setIsOpen(false);
  };

  const closeAlert = () => {
    alertOptions.onClose?.();
    setAlertOpen(false);
  };

  return (
    <ConfirmDialogContext.Provider value={{ showConfirm, showAlert }}>
      {children}

      {/* Confirm Dialog */}
      <Dialog
        open={isOpen}
        onClose={cancel}
        className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40 flex items-center justify-center p-4"
      >
        <Dialog.Panel
          className="
            bg-white dark:bg-base-200
            rounded-lg shadow-lg
            w-full max-w-md
            mx-auto
            p-6
            outline-none
            "
        >
          <Dialog.Title className="text-xl font-semibold text-base-content mb-3">
            {options.title}
          </Dialog.Title>

          {options.description && (
            <p className="text-base-content text-opacity-70 mb-6 whitespace-pre-line">
              {options.description}
            </p>
          )}

          <div className="flex justify-end gap-3 flex-wrap sm:flex-nowrap">
            <button
              onClick={cancel}
              className="btn btn-outline btn-sm w-full sm:w-auto"
              autoFocus
            >
              Cancel
            </button>
            <button
              onClick={confirm}
              className="btn btn-error btn-sm w-full sm:w-auto"
            >
              Confirm
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>

      {/* Alert Dialog */}
      <Dialog
        open={alertOpen}
        onClose={closeAlert}
        className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40 flex items-center justify-center p-4"
      >
        <Dialog.Panel
          className="
            bg-white dark:bg-base-200
            rounded-lg shadow-lg
            w-full max-w-md
            mx-auto
            p-6
            outline-none
          "
        >
          <Dialog.Title className="text-xl font-semibold text-base-content mb-3">
            {alertOptions.title}
          </Dialog.Title>

          {alertOptions.description && (
            <p className="text-base-content text-opacity-70 mb-6 whitespace-pre-line">
              {alertOptions.description}
            </p>
          )}

          <div className="flex justify-end">
            <button
              onClick={closeAlert}
              className="btn btn-primary btn-sm w-full sm:w-auto"
              autoFocus
            >
              OK
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
};

export const useConfirmDialog = () => useContext(ConfirmDialogContext);
