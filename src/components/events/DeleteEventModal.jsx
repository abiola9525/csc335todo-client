"use client"

import { useState } from "react"
import { Modal, Button, Alert } from "react-bootstrap"
import { Calendar, Trash2 } from 'lucide-react'

const DeleteEventModal = ({ show, onHide, onConfirm, event }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleConfirm = async () => {
    setLoading(true)
    setError("")

    try {
      await onConfirm()
      setError("")
    } catch (err) {
      setError("Failed to delete event")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError("")
    onHide()
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not specified"
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center text-danger">
          <Trash2 size={20} className="me-2" />
          Delete Event
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <div className="text-center mb-4">
          <Calendar size={48} className="text-danger mb-3" />
          <h5 className="text-dark">Are you sure you want to delete this event?</h5>
        </div>

        {event && (
          <div className="border rounded p-3 bg-light mb-4">
            <h6 className="fw-bold text-dark mb-2">{event.title}</h6>
            {event.description && (
              <p className="text-muted small mb-2">{event.description}</p>
            )}
            <div className="small text-muted">
              <div className="mb-1">
                <strong>Start:</strong> {event.is_all_day 
                  ? new Date(event.start_datetime).toLocaleDateString()
                  : formatDateTime(event.start_datetime)
                }
              </div>
              {event.end_datetime && (
                <div className="mb-1">
                  <strong>End:</strong> {event.is_all_day 
                    ? new Date(event.end_datetime).toLocaleDateString()
                    : formatDateTime(event.end_datetime)
                  }
                </div>
              )}
              {event.location && (
                <div>
                  <strong>Location:</strong> {event.location}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="alert alert-warning">
          <small>
            <strong>Warning:</strong> This action cannot be undone. The event will be permanently deleted.
          </small>
        </div>

        <div className="d-flex gap-2 justify-content-end">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Delete Event"}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default DeleteEventModal
