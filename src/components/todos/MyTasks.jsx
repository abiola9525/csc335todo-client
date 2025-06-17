"use client"

import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, InputGroup, Form, Dropdown } from "react-bootstrap"
import { ArrowLeft, Plus, Eye, Edit, Trash2, Search } from "lucide-react"
import { todosAPI, statusAPI, priorityAPI } from "../../services/api"
import { getImageUrlOrPlaceholder } from "../../utils/imageUtils"
import AddTaskModal from "./AddTaskModal"
import EditTaskModal from "./EditTaskModal"
import DeleteConfirmModal from "./DeleteConfirmModal"

const MyTasks = ({ onGoBack, onViewTask }) => {
  const navigate = useNavigate()
  const [todos, setTodos] = useState([])
  const [statuses, setStatuses] = useState([])
  const [priorities, setPriorities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [dueDateFilter, setDueDateFilter] = useState("")
  const [selectedTasks, setSelectedTasks] = useState([])
  const [showBulkActions, setShowBulkActions] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [todosResponse, statusResponse, priorityResponse] = await Promise.all([
        todosAPI.getAll(),
        statusAPI.getAll(),
        priorityAPI.getAll(),
      ])

      setTodos(todosResponse.data)
      setStatuses(statusResponse.data)
      setPriorities(priorityResponse.data)
      setError("")
    } catch (err) {
      setError("Failed to fetch tasks")
      console.error("Error fetching tasks:", err)
    } finally {
      setLoading(false)
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

  const getFilteredTodos = () => {
    return todos.filter((todo) => {
      const matchesSearch =
        todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(searchTerm.toLowerCase()))

      const todoStatusId = typeof todo.status === "object" ? todo.status.id : todo.status_id
      const todoPriorityId = typeof todo.priority === "object" ? todo.priority.id : todo.priority_id

      const matchesStatus = !statusFilter || todoStatusId.toString() === statusFilter
      const matchesPriority = !priorityFilter || todoPriorityId.toString() === priorityFilter

      let matchesDueDate = true
      if (dueDateFilter) {
        const today = new Date()
        const taskDueDate = todo.due_date ? new Date(todo.due_date) : null

        switch (dueDateFilter) {
          case "overdue":
            matchesDueDate = taskDueDate && taskDueDate < today
            break
          case "today":
            matchesDueDate = taskDueDate && taskDueDate.toDateString() === today.toDateString()
            break
          case "week":
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
            matchesDueDate = taskDueDate && taskDueDate <= weekFromNow && taskDueDate >= today
            break
          case "no-date":
            matchesDueDate = !taskDueDate
            break
        }
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesDueDate
    })
  }

  const handleSelectTask = (taskId) => {
    setSelectedTasks((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]))
  }

  const handleSelectAll = () => {
    const filteredTodos = getFilteredTodos()
    if (selectedTasks.length === filteredTodos.length) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(filteredTodos.map((todo) => todo.id))
    }
  }

  const handleBulkStatusUpdate = async (newStatusId) => {
    try {
      await Promise.all(
        selectedTasks.map((taskId) => {
          const task = todos.find((t) => t.id === taskId)
          return todosAPI.update(taskId, { ...task, status_id: newStatusId })
        }),
      )
      setSuccess(`Updated ${selectedTasks.length} tasks successfully!`)
      setSelectedTasks([])
      setShowBulkActions(false)
      fetchData()
    } catch (err) {
      setError("Failed to update tasks")
    }
  }

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedTasks.map((taskId) => todosAPI.delete(taskId)))
      setSuccess(`Deleted ${selectedTasks.length} tasks successfully!`)
      setSelectedTasks([])
      setShowBulkActions(false)
      fetchData()
    } catch (err) {
      setError("Failed to delete tasks")
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("")
    setPriorityFilter("")
    setDueDateFilter("")
  }

  const handleAddTask = async (taskData) => {
    try {
      await todosAPI.create(taskData)
      setSuccess("Task created successfully!")
      setShowAddModal(false)
      fetchData()
    } catch (err) {
      setError("Failed to create task")
      console.error("Error creating task:", err)
    }
  }

  const handleEditTask = async (taskData) => {
    try {
      await todosAPI.update(selectedTask.id, taskData)
      setSuccess("Task updated successfully!")
      setShowEditModal(false)
      setSelectedTask(null)
      fetchData()
    } catch (err) {
      setError("Failed to update task")
      console.error("Error updating task:", err)
    }
  }

  const handleDeleteTask = async () => {
    try {
      await todosAPI.delete(selectedTask.id)
      setSuccess("Task deleted successfully!")
      setShowDeleteModal(false)
      setSelectedTask(null)
      fetchData()
    } catch (err) {
      setError("Failed to delete task")
      console.error("Error deleting task:", err)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No due date"
    return new Date(dateString).toLocaleDateString()
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
      {/* Enhanced Header with Search and Filters */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <Button variant="link" className="text-coral p-0 me-3" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
              </Button>
              <h3 className="fw-bold text-dark mb-0">My Tasks</h3>
            </div>
            <div className="d-flex gap-2">
              <Button className="btn-coral" onClick={() => setShowAddModal(true)}>
                <Plus size={16} className="me-1" />
                Add Task
              </Button>
              <Button variant="link" className="text-muted text-decoration-none" onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="border-0 shadow-sm mb-3">
            <Card.Body>
              <Row className="g-3">
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <Search size={16} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={2}>
                  <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Status</option>
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                    <option value="">All Priority</option>
                    {priorities.map((priority) => (
                      <option key={priority.id} value={priority.id}>
                        {priority.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Select value={dueDateFilter} onChange={(e) => setDueDateFilter(e.target.value)}>
                    <option value="">All Dates</option>
                    <option value="overdue">Overdue</option>
                    <option value="today">Due Today</option>
                    <option value="week">Due This Week</option>
                    <option value="no-date">No Due Date</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Button variant="outline-secondary" onClick={clearFilters} className="w-100">
                    Clear Filters
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Bulk Actions */}
          {selectedTasks.length > 0 && (
            <Card className="border-0 shadow-sm mb-3 bg-light">
              <Card.Body className="py-2">
                <div className="d-flex align-items-center justify-content-between">
                  <span className="fw-semibold">{selectedTasks.length} tasks selected</span>
                  <div className="d-flex gap-2">
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-primary" size="sm">
                        Update Status
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {statuses.map((status) => (
                          <Dropdown.Item key={status.id} onClick={() => handleBulkStatusUpdate(status.id)}>
                            {status.name}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                    <Button variant="outline-danger" size="sm" onClick={handleBulkDelete}>
                      Delete Selected
                    </Button>
                    <Button variant="outline-secondary" size="sm" onClick={() => setSelectedTasks([])}>
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
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

      {/* Tasks Grid */}
      <Row>
        {getFilteredTodos().length === 0 ? (
          <Col>
            <Card className="text-center py-5">
              <Card.Body>
                <h5 className="text-muted">
                  {searchTerm || statusFilter || priorityFilter || dueDateFilter
                    ? "No tasks match your filters"
                    : "No tasks found"}
                </h5>
                <p className="text-muted">
                  {searchTerm || statusFilter || priorityFilter || dueDateFilter
                    ? "Try adjusting your search criteria"
                    : "Create your first task to get started!"}
                </p>
                {!(searchTerm || statusFilter || priorityFilter || dueDateFilter) && (
                  <Button className="btn-coral" onClick={() => setShowAddModal(true)}>
                    <Plus size={16} className="me-1" />
                    Add Task
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        ) : (
          <>
            {/* Select All Checkbox */}
            <Col xs={12} className="mb-3">
              <Form.Check
                type="checkbox"
                label={`Select All (${getFilteredTodos().length} tasks)`}
                checked={selectedTasks.length === getFilteredTodos().length && getFilteredTodos().length > 0}
                onChange={handleSelectAll}
              />
            </Col>

            {getFilteredTodos().map((task) => (
              <Col lg={6} xl={4} key={task.id} className="mb-4">
                <Card
                  className={`h-100 task-card border-0 shadow-sm ${selectedTasks.includes(task.id) ? "border-primary" : ""}`}
                >
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-start flex-grow-1">
                        <Form.Check
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={() => handleSelectTask(task.id)}
                          className="me-2 mt-1"
                        />
                        <h6 className="fw-semibold text-dark mb-0 flex-grow-1">{task.title}</h6>
                      </div>
                      <div className="d-flex gap-1 ms-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => onViewTask(task)}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => {
                            setSelectedTask(task)
                            setShowEditModal(true)
                          }}
                          title="Edit Task"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setSelectedTask(task)
                            setShowDeleteModal(true)
                          }}
                          title="Delete Task"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>

                    {/* Task Image */}
                    {task.image && (
                      <div className="mb-3">
                        <img
                          src={getImageUrlOrPlaceholder(task.image, 300, 150) || "/placeholder.svg"}
                          alt={task.title}
                          className="img-fluid rounded"
                          style={{ height: "120px", width: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            e.target.src = "/placeholder.svg?height=120&width=300"
                          }}
                        />
                      </div>
                    )}

                    <p className="text-muted small mb-3 flex-grow-1">
                      {task.description?.length > 100
                        ? `${task.description.substring(0, 100)}...`
                        : task.description || "No description"}
                    </p>

                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <Badge className={`small ${getPriorityClass(task.priority)}`}>
                        {getPriorityName(task.priority)}
                      </Badge>
                      <Badge className={`small ${getStatusClass(task.status)}`}>{getStatusName(task.status)}</Badge>
                      {task.due_date && new Date(task.due_date) < new Date() && (
                        <Badge bg="danger" className="small">
                          Overdue
                        </Badge>
                      )}
                    </div>

                    <div className="mt-auto">
                      <small className="text-muted">Due: {formatDate(task.due_date)}</small>
                      <br />
                      <small className="text-muted">Created: {formatDate(task.created_at)}</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </>
        )}
      </Row>

      {/* Modals */}
      <AddTaskModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSubmit={handleAddTask}
        statuses={statuses}
        priorities={priorities}
      />

      <EditTaskModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false)
          setSelectedTask(null)
        }}
        onSubmit={handleEditTask}
        task={selectedTask}
        statuses={statuses}
        priorities={priorities}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false)
          setSelectedTask(null)
        }}
        onConfirm={handleDeleteTask}
        task={selectedTask}
      />
    </Container>
  )
}

export default MyTasks
