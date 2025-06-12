import React, { useState } from 'react';
import { useConfirmDialog } from '../context/ConfirmDialogContext'; 

const ReportReasonModal = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
 const { showAlert } = useConfirmDialog();
  const handleSubmit = async () => {
    if (!reason.trim()) {
      
      await showAlert({
        title: 'Error',
        description: 'Please provide a reason for reporting.',
      });
      return;
    }
    onSubmit(reason);
    setReason('');
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-base-100 p-6 rounded-xl w-full max-w-md shadow-xl border border-base-300">
            <h2 className="text-xl font-semibold text-error mb-4">
              Report Content
            </h2>
            <textarea
              className="textarea textarea-error w-full h-28"
              placeholder="Please describe your reason for reporting..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-5">
              <button
                className="btn btn-outline btn-base"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="btn btn-error text-white"
                onClick={handleSubmit}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportReasonModal;
