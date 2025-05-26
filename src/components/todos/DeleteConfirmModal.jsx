"use client"

import { useState } from "react"
import { Modal, Button, Alert } from "react-bootstrap"

const DeleteConfirmModal = ({ show, onHide, onConfirm, task }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleConfirm = async () => {
    setLoading(true)
    setError("")

    try {
      await onConfirm()
      setError("")
    } catch (err) {
      setError("Failed to delete task")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError("")
    onHide()
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <p>
          Are you sure you want to delete the task <strong>"{task?.title}"</strong>?
        </p>
        <p className="text-muted small">This action cannot be undone.</p>

        <div className="d-flex gap-2 justify-content-end">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default DeleteConfirmModal
