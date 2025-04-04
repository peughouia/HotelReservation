import React from 'react'

export default function Modal({isOpen, onClose, onConfirm, title, message}) {
    if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 p-2 z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col justify-center w-full max-w-md">
        <h3 className="text-2xl font-semibold">{title}</h3>
        <p className="mt-2 font-bold text-gray-500">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-error text-white text-lg px-4 py-2 rounded">
            Annuler
          </button>
          <button onClick={onConfirm} className="btn btn-success text-white text-lg px-4 py-2 rounded">
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}
