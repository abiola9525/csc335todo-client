"use client"

import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Table, Button, Alert, Spinner } from "react-bootstrap"
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react"
import { statusAPI, priorityAPI } from "../../services/api"
import CreateCategoryModal from "./CreateCategoryModal"
import EditCategoryModal from "./EditCategoryModal"
import DeleteConfirmModal from "./DeleteConfirmModal"

const TaskCategories = ({ onGoBack }) => {
  const navigate = useNavigate()
  const [statuses, setStatuses] = useState([])
  const [priorities, setPriorities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [modalType, setModalType] = useState("") // "status" or "priority"
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statusResponse, priorityResponse] = await Promise.all([statusAPI.getAll(), priorityAPI.getAll()])

      setStatuses(statusResponse.data)
      setPriorities(priorityResponse.data)
      setError("")
    } catch (err) {
      setError("Failed to fetch categories")
      console.error("Error fetching categories:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = (type) => {
    setModalType(type)
    setShowCreateModal(true)
  }

  const handleEdit = (type, item) => {
    setModalType(type)
    setSelectedItem(item)
    setShowEditModal(true)
  }

  const handleDelete = (type, item) => {
    setModalType(type)
    setSelectedItem(item)
    setShowDeleteModal(true)
  }

  const handleCreateSubmit = async (name) => {
    try {
      const data = { name }
      if (modalType === "status") {
        await statusAPI.create(data)
      } else {
        await priorityAPI.create(data)
      }

      setSuccess(`${modalType === "status" ? "Status" : "Priority"} created successfully!`)
      setShowCreateModal(false)
      fetchData()
    } catch (err) {
      setError(`Failed to create ${modalType}`)
      console.error("Error creating category:", err)
    }
  }

  const handleEditSubmit = async (name) => {
    try {
      const data = { name }
      if (modalType === "status") {
        await statusAPI.update(selectedItem.id, data)
      } else {
        await priorityAPI.update(selectedItem.id, data)
      }

      setSuccess(`${modalType === "status" ? "Status" : "Priority"} updated successfully!`)
      setShowEditModal(false)
      setSelectedItem(null)
      fetchData()
    } catch (err) {
      setError(`Failed to update ${modalType}`)
      console.error("Error updating category:", err)
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      if (modalType === "status") {
        await statusAPI.delete(selectedItem.id)
      } else {
        await priorityAPI.delete(selectedItem.id)
      }

      setSuccess(`${modalType === "status" ? "Status" : "Priority"} deleted successfully!`)
      setShowDeleteModal(false)
      setSelectedItem(null)
      fetchData()
    } catch (err) {
      setError(`Failed to delete ${modalType}`)
      console.error("Error deleting category:", err)
    }
  }

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <Spinner animation="border" variant="danger" />
      </Container>
    )
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
              <h3 className="fw-bold text-dark mb-0">Task Categories</h3>
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

      {/* Task Status Section */}
      <Row className="mb-5">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-semibold text-dark mb-0">Task Status</h5>
                <Button className="btn-coral btn-sm" onClick={() => handleCreate("status")}>
                  <Plus size={16} className="me-1" />
                  Add Category
                </Button>
              </div>

              <Table responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "10%" }}>S/N</th>
                    <th style={{ width: "70%" }}>Task Status</th>
                    <th style={{ width: "20%" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {statuses.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center text-muted py-4">
                        No task statuses found
                      </td>
                    </tr>
                  ) : (
                    statuses.map((status, index) => (
                      <tr key={status.id}>
                        <td>{index + 1}</td>
                        <td>{status.name}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button variant="outline-primary" size="sm" onClick={() => handleEdit("status", status)}>
                              <Edit size={14} className="me-1" />
                              Edit
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete("status", status)}>
                              <Trash2 size={14} className="me-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Task Priority Section */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-semibold text-dark mb-0">Task Priority</h5>
                <Button className="btn-coral btn-sm" onClick={() => handleCreate("priority")}>
                  <Plus size={16} className="me-1" />
                  Add Task Priority
                </Button>
              </div>

              <Table responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "10%" }}>S/N</th>
                    <th style={{ width: "70%" }}>Task Priority</th>
                    <th style={{ width: "20%" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {priorities.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center text-muted py-4">
                        No task priorities found
                      </td>
                    </tr>
                  ) : (
                    priorities.map((priority, index) => (
                      <tr key={priority.id}>
                        <td>{index + 1}</td>
                        <td>{priority.name}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEdit("priority", priority)}
                            >
                              <Edit size={14} className="me-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete("priority", priority)}
                            >
                              <Trash2 size={14} className="me-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modals */}
      <CreateCategoryModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
        type={modalType}
      />

      <EditCategoryModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false)
          setSelectedItem(null)
        }}
        onSubmit={handleEditSubmit}
        type={modalType}
        item={selectedItem}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false)
          setSelectedItem(null)
        }}
        onConfirm={handleDeleteConfirm}
        type={modalType}
        item={selectedItem}
      />
    </Container>
  )
}

export default TaskCategories
