import React, { Fragment } from "react";
import CommentSection from "./CommentSection";
import { Dialog, Transition } from "@headlessui/react";

const CommentDrawer = ({ isOpen, onClose, postId }) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
        </Transition.Child>

        {/* Floating Panel */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95 translate-y-4"
          enterTo="opacity-100 scale-100 translate-y-0"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100 translate-y-0"
          leaveTo="opacity-0 scale-95 translate-y-4"
        >
         <Dialog.Panel
  className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-[400px] bg-base-100 dark:bg-gray-900 rounded-xl shadow-2xl p-4 z-50 max-h-[70vh] overflow-y-auto"
>

            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-base-content">Comments</h2>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={onClose}
                aria-label="Close drawer"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            <div className="divider m-0" />

            <CommentSection
              postId={postId}
              onNewComment={() => {
                // Optional: handle new comment
              }}
            />
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default CommentDrawer;
