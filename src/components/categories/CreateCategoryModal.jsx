"use client"

import { useState } from "react"
import { Modal, Form, Button, Alert } from "react-bootstrap"

const CreateCategoryModal = ({ show, onHide, onSubmit, type }) => {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Name is required")
      return
    }

    setLoading(true)
    setError("")

    try {
      await onSubmit(name.trim())
      setName("")
      setError("")
    } catch (err) {
      setError("Failed to create category")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName("")
    setError("")
    onHide()
  }

  const getTitle = () => {
    return type === "status" ? "Create Categories" : "Add Task Priority"
  }

  const getLabel = () => {
    return type === "status" ? "Category Name" : "Task Priority Title"
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{getTitle()}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>{getLabel()}</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${getLabel().toLowerCase()}`}
              required
            />
          </Form.Group>

          <div className="d-flex gap-2">
            <Button type="submit" className="btn-coral" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default CreateCategoryModal
