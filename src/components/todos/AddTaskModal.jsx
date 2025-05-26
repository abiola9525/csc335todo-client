"use client"

import { useState } from "react"
import { Modal, Form, Button, Alert, Row, Col } from "react-bootstrap"
import { Upload, X } from "lucide-react"
import FileUploadModal from "./FileUploadModal"

const AddTaskModal = ({ show, onHide, onSubmit, statuses, priorities }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status_id: "",
    priority_id: "",
    due_date: "",
    image: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      setError("Title is required")
      return
    }

    if (!formData.status_id) {
      setError("Status is required")
      return
    }

    if (!formData.priority_id) {
      setError("Priority is required")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append("title", formData.title.trim())
      submitData.append("description", formData.description || "")
      submitData.append("status_id", Number.parseInt(formData.status_id))
      submitData.append("priority_id", Number.parseInt(formData.priority_id))
      if (formData.due_date) {
        submitData.append("due_date", formData.due_date)
      }

      // Add image file if uploaded
      if (uploadedImage && uploadedImage.file) {
        submitData.append("image", uploadedImage.file)
      }

      await onSubmit(submitData)

      // Reset form
      setFormData({
        title: "",
        description: "",
        status_id: "",
        priority_id: "",
        due_date: "",
        image: null,
      })
      setUploadedImage(null)
      setError("")
    } catch (err) {
      setError("Failed to create task")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (fileUrl, fileName, file) => {
    setUploadedImage({ url: fileUrl, name: fileName, file: file })
    setFormData((prev) => ({ ...prev, image: file }))
    setShowFileUpload(false)
  }

  const removeUploadedImage = () => {
    setUploadedImage(null)
    setFormData((prev) => ({ ...prev, image: null }))
  }

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      status_id: "",
      priority_id: "",
      due_date: "",
      image: null,
    })
    setUploadedImage(null)
    setError("")
    onHide()
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Title *</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter task title"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Due Date</Form.Label>
                <Form.Control type="date" name="due_date" value={formData.due_date} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Priority *</Form.Label>
                <Form.Select name="priority_id" value={formData.priority_id} onChange={handleChange} required>
                  <option value="">Select Priority</option>
                  {priorities.map((priority) => (
                    <option key={priority.id} value={priority.id}>
                      {priority.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status *</Form.Label>
                <Form.Select name="status_id" value={formData.status_id} onChange={handleChange} required>
                  <option value="">Select Status</option>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Label>Task Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description..."
            />
          </Form.Group>

          {/* Upload Image Section */}
          <div className="mb-4">
            <Form.Label>Task Image</Form.Label>
            {uploadedImage ? (
              <div className="border rounded p-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-semibold">Uploaded Image: {uploadedImage.name}</span>
                  <Button variant="outline-danger" size="sm" onClick={removeUploadedImage}>
                    <X size={16} className="me-1" />
                    Remove
                  </Button>
                </div>
                <img
                  src={uploadedImage.url || "/placeholder.svg"}
                  alt="Task preview"
                  className="img-fluid rounded"
                  style={{ maxHeight: "150px", objectFit: "cover" }}
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-secondary rounded p-4 text-center">
                <Upload size={32} className="text-muted mb-2" />
                <p className="text-muted mb-2">No image uploaded</p>
                <Button variant="outline-primary" size="sm" onClick={() => setShowFileUpload(true)}>
                  <Upload size={16} className="me-1" />
                  Upload Image
                </Button>
              </div>
            )}
          </div>

          <div className="d-flex gap-2">
            <Button type="submit" className="btn-coral" disabled={loading}>
              {loading ? "Creating..." : "Create Task"}
            </Button>
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal.Body>

      <FileUploadModal show={showFileUpload} onHide={() => setShowFileUpload(false)} onUpload={handleFileUpload} />
    </Modal>
  )
}

export default AddTaskModal
