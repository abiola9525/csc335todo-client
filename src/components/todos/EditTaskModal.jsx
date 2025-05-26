"use client"

import { useState, useEffect } from "react"
import { Modal, Form, Button, Alert, Row, Col } from "react-bootstrap"
import { Upload, X, Plus } from "lucide-react"
import { statusAPI, priorityAPI } from "../../services/api"
import { getFullImageUrl } from "../../utils/imageUtils"
import FileUploadModal from "./FileUploadModal"
import QuickCreateCategoryModal from "./QuickCreateCategoryModal"

const EditTaskModal = ({ show, onHide, onSubmit, task, statuses, priorities }) => {
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
  const [existingImage, setExistingImage] = useState(null)

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

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status_id: typeof task.status === "object" ? task.status.id : task.status_id || "",
        priority_id: typeof task.priority === "object" ? task.priority.id : task.priority_id || "",
        due_date: task.due_date ? task.due_date.split("T")[0] : "",
        image: null,
      })

      // Set existing image if available
      if (task.image) {
        setExistingImage({
          url: getFullImageUrl(task.image),
          name: "Current Image",
          originalPath: task.image,
        })
        setUploadedImage(null)
      } else {
        setExistingImage(null)
        setUploadedImage(null)
      }
    }
  }, [task])

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
    setExistingImage(null) // Clear existing image when new one is uploaded
    setShowFileUpload(false)
  }

  const removeUploadedImage = () => {
    setUploadedImage(null)
    setFormData((prev) => ({ ...prev, image: null }))
  }

  const removeExistingImage = () => {
    setExistingImage(null)
    setFormData((prev) => ({ ...prev, image: null }))
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

      // Handle image upload
      if (uploadedImage && uploadedImage.file) {
        // New image uploaded
        submitData.append("image", uploadedImage.file)
      } else if (!existingImage && !uploadedImage) {
        // Image was removed - send empty string or null
        submitData.append("image", "")
      }
      // If existingImage exists and no new image, don't append image field (keep existing)

      await onSubmit(submitData)
      setError("")
    } catch (err) {
      setError("Failed to update task")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError("")
    onHide()
  }

  const currentImage = uploadedImage || existingImage

  return (
    <>
      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
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
              {currentImage ? (
                <div className="border rounded p-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="fw-semibold">
                      {uploadedImage ? `New Image: ${uploadedImage.name}` : `Current Image: ${existingImage.name}`}
                    </span>
                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" size="sm" onClick={() => setShowFileUpload(true)}>
                        <Upload size={16} className="me-1" />
                        Change
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={uploadedImage ? removeUploadedImage : removeExistingImage}
                      >
                        <X size={16} className="me-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                  <img
                    src={currentImage.url || "/placeholder.svg"}
                    alt="Task preview"
                    className="img-fluid rounded"
                    style={{ maxHeight: "150px", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=150&width=200"
                    }}
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
                {loading ? "Updating..." : "Update Task"}
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

export default EditTaskModal
