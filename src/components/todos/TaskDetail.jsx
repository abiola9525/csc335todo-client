"use client"

import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button, Badge, Alert, Dropdown } from "react-bootstrap"
import { ArrowLeft, Edit, Trash2, Calendar, Clock } from "lucide-react"
import { todosAPI, statusAPI, priorityAPI } from "../../services/api"
import { getImageUrlOrPlaceholder } from "../../utils/imageUtils"
import EditTaskModal from "./EditTaskModal"
import DeleteConfirmModal from "./DeleteConfirmModal"

const TaskDetail = ({ task, onGoBack, onTaskUpdated }) => {
  const navigate = useNavigate()
  const [currentTask, setCurrentTask] = useState(task)
  const [statuses, setStatuses] = useState([])
  const [priorities, setPriorities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    fetchCategoriesData()
  }, [])

  const fetchCategoriesData = async () => {
    try {
      const [statusResponse, priorityResponse] = await Promise.all([statusAPI.getAll(), priorityAPI.getAll()])

      setStatuses(statusResponse.data)
      setPriorities(priorityResponse.data)
    } catch (err) {
      setError("Failed to fetch categories")
      console.error("Error fetching categories:", err)
    }
  }

  const getStatusName = (status) => {
    if (typeof status === "object" && status?.name) {
      return status.name
    }
    const statusObj = statuses.find((s) => s.id === status)
    return statusObj ? statusObj.name : "Unknown"
  }

  const getPriorityName = (priority) => {
    if (typeof priority === "object" && priority?.name) {
      return priority.name
    }
    const priorityObj = priorities.find((p) => p.id === priority)
    return priorityObj ? priorityObj.name : "Unknown"
  }

  const getPriorityClass = (priority) => {
    let priorityName = ""
    if (typeof priority === "object" && priority?.name) {
      priorityName = priority.name
    } else {
      const priorityObj = priorities.find((p) => p.id === priority)
      priorityName = priorityObj ? priorityObj.name : ""
    }

    switch (priorityName.toLowerCase()) {
      case "high":
      case "extreme":
        return "bg-danger"
      case "medium":
      case "moderate":
        return "bg-warning text-dark"
      case "low":
        return "bg-success"
      default:
        return "bg-secondary"
    }
  }

  const getStatusClass = (status) => {
    let statusName = ""
    if (typeof status === "object" && status?.name) {
      statusName = status.name
    } else {
      const statusObj = statuses.find((s) => s.id === status)
      statusName = statusObj ? statusObj.name : ""
    }

    switch (statusName.toLowerCase()) {
      case "completed":
        return "bg-success"
      case "in progress":
      case "on going":
        return "bg-primary"
      case "not started":
        return "bg-danger"
      default:
        return "bg-secondary"
    }
  }

  const handleStatusChange = async (newStatusId) => {
    try {
      setLoading(true)

      // Prepare the update data with all existing fields
      const updateData = {
        title: currentTask.title,
        description: currentTask.description || "",
        status_id: newStatusId,
        priority_id: typeof currentTask.priority === "object" ? currentTask.priority.id : currentTask.priority_id,
        due_date: currentTask.due_date || null,
      }

      // Don't include image in the update unless we're changing it
      // The API should preserve the existing image if not provided

      const response = await todosAPI.update(currentTask.id, updateData)

      // Update the current task with the response data
      const updatedTask = response.data
      setCurrentTask(updatedTask)
      setSuccess("Task status updated successfully!")

      // Update the parent component if callback is provided
      if (onTaskUpdated) {
        onTaskUpdated(updatedTask)
      }
    } catch (err) {
      console.error("Error updating task status:", err)
      let errorMessage = "Failed to update task status"

      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message
        } else {
          // Handle field-specific errors
          const errors = []
          Object.keys(err.response.data).forEach((key) => {
            if (Array.isArray(err.response.data[key])) {
              errors.push(`${key}: ${err.response.data[key].join(", ")}`)
            } else {
              errors.push(`${key}: ${err.response.data[key]}`)
            }
          })
          if (errors.length > 0) {
            errorMessage = errors.join("; ")
          }
        }
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleEditTask = async (taskData) => {
    try {
      const updatedTask = await todosAPI.update(currentTask.id, taskData)
      setCurrentTask(updatedTask.data)
      setSuccess("Task updated successfully!")
      setShowEditModal(false)
      if (onTaskUpdated) onTaskUpdated(updatedTask.data)
    } catch (err) {
      setError("Failed to update task")
      console.error("Error updating task:", err)
    }
  }

  const handleDeleteTask = async () => {
    try {
      await todosAPI.delete(currentTask.id)
      setSuccess("Task deleted successfully!")
      setShowDeleteModal(false)
      setTimeout(() => onGoBack(), 1500)
    } catch (err) {
      setError("Failed to delete task")
      console.error("Error deleting task:", err)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No due date"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "Unknown"
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Container fluid className="p-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <Button variant="link" className="text-coral p-0 me-3" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
              </Button>
              <h3 className="fw-bold text-dark mb-0">{currentTask.title}</h3>
            </div>
            <Button variant="link" className="text-muted text-decoration-none" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </Col>
      </Row>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Row>
        {/* Task Image */}
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm">
            <div
              className="bg-light d-flex align-items-center justify-content-center"
              style={{ height: "250px", borderRadius: "8px 8px 0 0" }}
            >
              <img
                src={getImageUrlOrPlaceholder(currentTask.image, 300, 200) || "/placeholder.svg"}
                alt={currentTask.title}
                className="img-fluid rounded"
                style={{ maxHeight: "200px", objectFit: "cover" }}
                onError={(e) => {
                  e.target.src = "/placeholder.svg?height=200&width=300"
                }}
              />
            </div>
            <Card.Body>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <Badge className={`${getPriorityClass(currentTask.priority)}`}>
                  Priority: {getPriorityName(currentTask.priority)}
                </Badge>
                <Dropdown>
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    size="sm"
                    className={`${getStatusClass(currentTask.status)} border-0 text-white`}
                    disabled={loading}
                  >
                    {loading ? "Updating..." : `Status: ${getStatusName(currentTask.status)}`}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {statuses.map((status) => (
                      <Dropdown.Item
                        key={status.id}
                        onClick={() => handleStatusChange(status.id)}
                        active={
                          status.id ===
                          (typeof currentTask.status === "object" ? currentTask.status.id : currentTask.status_id)
                        }
                        disabled={loading}
                      >
                        {status.name}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <div className="d-flex gap-2">
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                  className="flex-grow-1"
                >
                  <Edit size={14} className="me-1" />
                  Edit
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  className="flex-grow-1"
                >
                  <Trash2 size={14} className="me-1" />
                  Delete
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Task Details */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Calendar size={16} className="text-muted" />
                  <small className="text-muted">Created on: {formatDateTime(currentTask.created_at)}</small>
                </div>
                {currentTask.due_date && (
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Clock size={16} className="text-muted" />
                    <small className="text-muted">Due date: {formatDate(currentTask.due_date)}</small>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h5 className="fw-semibold text-dark mb-3">Task Description:</h5>
                <div className="bg-light p-3 rounded">
                  {currentTask.description ? (
                    <div>
                      {currentTask.description.split("\n").map((line, index) => (
                        <p key={index} className="mb-2">
                          {line}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted mb-0">No description provided</p>
                  )}
                </div>
              </div>

              {/* Task Objective */}
              <div className="mb-4">
                <h6 className="fw-semibold text-dark mb-2">Objective:</h6>
                <p className="text-muted">
                  Complete this task according to the specified requirements and within the given timeframe.
                </p>
              </div>

              {/* Additional Notes */}
              <div className="mb-4">
                <h6 className="fw-semibold text-dark mb-2">Additional Notes:</h6>
                <ul className="text-muted">
                  <li>Ensure all requirements are met before marking as complete</li>
                  <li>Update status regularly to track progress</li>
                  <li>Contact team members if assistance is needed</li>
                </ul>
              </div>

              {currentTask.due_date && (
                <div className="alert alert-info">
                  <strong>Deadline for Completion:</strong> {formatDate(currentTask.due_date)}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modals */}
      <EditTaskModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        onSubmit={handleEditTask}
        task={currentTask}
        statuses={statuses}
        priorities={priorities}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteTask}
        task={currentTask}
      />
    </Container>
  )
}

export default TaskDetail
