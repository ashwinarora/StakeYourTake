"use client"

import React from 'react'

type CreateDebateModalProps = {
  isOpen: boolean
  onClose: () => void
  children?: React.ReactNode
}

const CreateDebateModal: React.FC<CreateDebateModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded bg-white p-4 shadow dark:bg-gray-900">
          {children ?? null}
        </div>
      </div>
    </div>
  )
}

export default CreateDebateModal


