"use client"

import { useState } from "react"
import { Modal, Form, Button, Alert } from "react-bootstrap"
import { Plus, Tag } from "lucide-react"

const QuickCreateCategoryModal = ({ show, onHide, onSubmit, type, title, label, placeholder }) => {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError(`${label} is required`)
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await onSubmit(name.trim())
      if (result.success) {
        setName("")
        setError("")
        // Modal will be closed by parent component
      } else {
        setError(result.error || `Failed to create ${type}`)
      }
    } catch (err) {
      setError(`Failed to create ${type}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName("")
    setError("")
    onHide()
  }

  const getIcon = () => {
    switch (type) {
      case "status":
        return <Tag size={20} className="text-primary" />
      case "priority":
        return <Tag size={20} className="text-warning" />
      default:
        return <Plus size={20} className="text-success" />
    }
  }

  const getExamples = () => {
    switch (type) {
      case "status":
        return ["In Review", "Testing", "Pending Approval", "On Hold", "Cancelled"]
      case "priority":
        return ["Urgent", "Critical", "Normal", "Optional", "Deferred"]
      default:
        return []
    }
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          {getIcon()}
          <span className="ms-2">{title}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>{label} *</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={placeholder}
              required
              autoFocus
            />
          </Form.Group>

          {/* Examples */}
          <div className="mb-4">
            <small className="text-muted">
              <strong>Examples:</strong> {getExamples().join(", ")}
            </small>
          </div>

          <div className="d-flex gap-2">
            <Button type="submit" className="btn-coral" disabled={loading}>
              {loading ? "Creating..." : `Create ${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </Button>
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </Form>

        {/* Quick Tips */}
        <div className="mt-3 p-3 bg-light rounded">
          <small className="text-muted">
            <strong>💡 Tip:</strong> The new {type} will be automatically selected for your task and will be available
            for future tasks.
          </small>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default QuickCreateCategoryModal
