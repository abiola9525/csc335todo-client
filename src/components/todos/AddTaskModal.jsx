"use client"

import { useState, useEffect } from "react"
import { Modal, Form, Button, Alert, Row, Col } from "react-bootstrap"
import { Upload, X, Plus } from "lucide-react"
import { statusAPI, priorityAPI } from "../../services/api"
import FileUploadModal from "./FileUploadModal"
import QuickCreateCategoryModal from "./QuickCreateCategoryModal"

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

  // Quick create category states
  const [showCreateStatus, setShowCreateStatus] = useState(false)
  const [showCreatePriority, setShowCreatePriority] = useState(false)
  const [localStatuses, setLocalStatuses] = useState([])
  const [localPriorities, setLocalPriorities] = useState([])

  // Update local states when props change
  useEffect(() => {
    setLocalStatuses(statuses || [])
    setLocalPriorities(priorities || [])
  }, [statuses, priorities])

  const handleChange = (e) => {
    const { name, value } = e.target

    // Handle special "add new" options
    if (name === "status_id" && value === "add_new") {
      setShowCreateStatus(true)
      return
    }
    if (name === "priority_id" && value === "add_new") {
      setShowCreatePriority(true)
      return
    }

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

  const handleCreateStatus = async (statusName) => {
    try {
      const response = await statusAPI.create({ name: statusName })
      const newStatus = response.data

      // Update local statuses
      setLocalStatuses((prev) => [...prev, newStatus])

      // Auto-select the newly created status
      setFormData((prev) => ({
        ...prev,
        status_id: newStatus.id.toString(),
      }))

      setShowCreateStatus(false)
      return { success: true }
    } catch (err) {
      console.error("Error creating status:", err)
      return { success: false, error: "Failed to create status" }
    }
  }

  const handleCreatePriority = async (priorityName) => {
    try {
      const response = await priorityAPI.create({ name: priorityName })
      const newPriority = response.data

      // Update local priorities
      setLocalPriorities((prev) => [...prev, newPriority])

      // Auto-select the newly created priority
      setFormData((prev) => ({
        ...prev,
        priority_id: newPriority.id.toString(),
      }))

      setShowCreatePriority(false)
      return { success: true }
    } catch (err) {
      console.error("Error creating priority:", err)
      return { success: false, error: "Failed to create priority" }
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
    <>
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
                    <option value="add_new" className="text-primary fw-bold">
                      <Plus size={14} /> Add New Priority
                    </option>
                    {localPriorities.length > 0 && <option disabled>──────────</option>}
                    {localPriorities.map((priority) => (
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
                    <option value="add_new" className="text-primary fw-bold">
                      <Plus size={14} /> Add New Status
                    </option>
                    {localStatuses.length > 0 && <option disabled>──────────</option>}
                    {localStatuses.map((status) => (
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
      </Modal>

      {/* File Upload Modal */}
      <FileUploadModal show={showFileUpload} onHide={() => setShowFileUpload(false)} onUpload={handleFileUpload} />

      {/* Quick Create Status Modal */}
      <QuickCreateCategoryModal
        show={showCreateStatus}
        onHide={() => setShowCreateStatus(false)}
        onSubmit={handleCreateStatus}
        type="status"
        title="Create New Status"
        label="Status Name"
        placeholder="Enter status name (e.g., In Review, Testing)"
      />

      {/* Quick Create Priority Modal */}
      <QuickCreateCategoryModal
        show={showCreatePriority}
        onHide={() => setShowCreatePriority(false)}
        onSubmit={handleCreatePriority}
        type="priority"
        title="Create New Priority"
        label="Priority Name"
        placeholder="Enter priority name (e.g., Urgent, Critical)"
      />
    </>
  )
}

export default AddTaskModal
