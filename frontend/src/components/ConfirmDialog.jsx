import { createContext, useContext, useState } from "react";
import { Dialog } from "@headlessui/react"; // or use daisyUI, chakra-ui, etc.

const ConfirmDialogContext = createContext();

export const ConfirmDialogProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState({
    title: "Are you sure?",
    description: "",
    onConfirm: () => {},
  });

  const showConfirm = ({ title, description, onConfirm }) => {
    setOptions({ title, description, onConfirm });
    setIsOpen(true);
  };

  const confirm = () => {
    options.onConfirm();
    setIsOpen(false);
  };

  const cancel = () => {
    setIsOpen(false);
  };

  return (
    <ConfirmDialogContext.Provider value={{ showConfirm }}>
      {children}
      <Dialog open={isOpen} onClose={cancel} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4 bg-black/30">
          <Dialog.Panel className="bg-white dark:bg-base-200 p-6 rounded-xl w-full max-w-md shadow-xl">
            <Dialog.Title className="text-xl font-bold mb-2">{options.title}</Dialog.Title>
            {options.description && <p className="mb-4 text-gray-500">{options.description}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={cancel} className="btn btn-outline">Cancel</button>
              <button onClick={confirm} className="btn btn-error">Confirm</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
};

export const useConfirmDialog = () => useContext(ConfirmDialogContext);
