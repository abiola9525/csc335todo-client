"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { Search, Plus, Calendar, Edit, Trash2, X, ChevronDown } from "lucide-react"
import { Row, Col, Card, Form, Button, Badge, InputGroup, Dropdown, Alert, Spinner } from "react-bootstrap"
import { todosAPI, statusAPI, priorityAPI } from "../../services/api"
import { getImageUrlOrPlaceholder } from "../../utils/imageUtils"
import CalendarWidget from "../calendar/CalendarWidget"
import AddTaskModal from "../todos/AddTaskModal"
import EditTaskModal from "../todos/EditTaskModal"
import DeleteConfirmModal from "../todos/DeleteConfirmModal"

const MainContent = () => {
  const { user } = useAuth()
  const [todos, setTodos] = useState([])
  const [statuses, setStatuses] = useState([])
  const [priorities, setPriorities] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  // Search and selection states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTasks, setSelectedTasks] = useState([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState({})

  useEffect(() => {
    fetchDashboardData()

    // Update the date every minute to keep it current
    const dateInterval = setInterval(() => {
      setCurrentDate(new Date())
    }, 60000) // Update every minute

    // Cleanup interval on component unmount
    return () => clearInterval(dateInterval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [todosResponse, statusResponse, priorityResponse] = await Promise.all([
        todosAPI.getAll(),
        statusAPI.getAll(),
        priorityAPI.getAll(),
      ])

      setTodos(todosResponse.data)
      setStatuses(statusResponse.data)
      setPriorities(priorityResponse.data)
    } catch (err) {
      setError("Failed to fetch dashboard data")
      console.error("Error fetching dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (taskData) => {
    try {
      await todosAPI.create(taskData)
      setSuccess("Task created successfully!")
      setShowAddTask(false)
      fetchDashboardData()
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
      fetchDashboardData()
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
      fetchDashboardData()
    } catch (err) {
      setError("Failed to delete task")
      console.error("Error deleting task:", err)
    }
  }

  const handleStatusUpdate = async (taskId, newStatusId) => {
    try {
      setUpdatingStatus((prev) => ({ ...prev, [taskId]: true }))

      const task = todos.find((t) => t.id === taskId)
      const updateData = {
        title: task.title,
        description: task.description || "",
        status_id: newStatusId,
        priority_id: typeof task.priority === "object" ? task.priority.id : task.priority_id,
        due_date: task.due_date || null,
      }

      await todosAPI.update(taskId, updateData)
      setSuccess("Task status updated successfully!")
      fetchDashboardData()
    } catch (err) {
      setError("Failed to update task status")
      console.error("Error updating task status:", err)
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [taskId]: false }))
    }
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
      setLoading(true)

      // Process each task individually with proper data structure
      const updatePromises = selectedTasks.map(async (taskId) => {
        const task = todos.find((t) => t.id === taskId)
        if (!task) return Promise.resolve()

        const updateData = {
          title: task.title,
          description: task.description || "",
          status_id: Number.parseInt(newStatusId),
          priority_id: typeof task.priority === "object" ? task.priority.id : task.priority_id || task.priority,
          due_date: task.due_date || null,
        }

        return todosAPI.update(taskId, updateData)
      })

      await Promise.all(updatePromises)
      setSuccess(`Updated ${selectedTasks.length} tasks successfully!`)
      setSelectedTasks([])
      fetchDashboardData()
    } catch (err) {
      setError("Failed to update tasks")
      console.error("Bulk update error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    try {
      setLoading(true)
      await Promise.all(selectedTasks.map((taskId) => todosAPI.delete(taskId)))
      setSuccess(`Deleted ${selectedTasks.length} tasks successfully!`)
      setSelectedTasks([])
      fetchDashboardData()
    } catch (err) {
      setError("Failed to delete tasks")
    } finally {
      setLoading(false)
    }
  }

  const getFilteredTodos = () => {
    if (!searchTerm) return todos

    return todos.filter(
      (todo) =>
        todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }

  // Format current date and day
  const getCurrentDay = () => {
    return currentDate.toLocaleDateString("en-US", { weekday: "long" })
  }

  const getCurrentDate = () => {
    return currentDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getTodayDateForTodoSection = () => {
    return currentDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      weekday: "long",
    })
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
        return "priority-high"
      case "medium":
      case "moderate":
        return "priority-medium"
      case "low":
        return "priority-low"
      default:
        return "priority-medium"
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

  // Calculate statistics
  const getTaskStats = () => {
    const filteredTodos = getFilteredTodos()
    if (filteredTodos.length === 0) return { completed: 0, inProgress: 0, notStarted: 0 }

    const completedStatus = statuses.find((s) => s.name.toLowerCase() === "completed")
    const inProgressStatus = statuses.find((s) => s.name.toLowerCase().includes("progress"))
    const notStartedStatus = statuses.find((s) => s.name.toLowerCase().includes("not started"))

    const completed = filteredTodos.filter((t) => {
      const taskStatusId = typeof t.status === "object" ? t.status.id : t.status_id
      return taskStatusId === completedStatus?.id
    }).length

    const inProgress = filteredTodos.filter((t) => {
      const taskStatusId = typeof t.status === "object" ? t.status.id : t.status_id
      return taskStatusId === inProgressStatus?.id
    }).length

    const notStarted = filteredTodos.filter((t) => {
      const taskStatusId = typeof t.status === "object" ? t.status.id : t.status_id
      return taskStatusId === notStartedStatus?.id
    }).length

    const total = filteredTodos.length
    return {
      completed: total > 0 ? Math.round((completed / total) * 100) : 0,
      inProgress: total > 0 ? Math.round((inProgress / total) * 100) : 0,
      notStarted: total > 0 ? Math.round((notStarted / total) * 100) : 0,
    }
  }

  const getActiveTasks = () => {
    const completedStatus = statuses.find((s) => s.name.toLowerCase() === "completed")
    const filteredTodos = getFilteredTodos()
    return filteredTodos
      .filter((t) => {
        const taskStatusId = typeof t.status === "object" ? t.status.id : t.status_id
        return taskStatusId !== completedStatus?.id
      })
      .slice(0, 5) // Show more tasks
  }

  const getCompletedTasks = () => {
    const completedStatus = statuses.find((s) => s.name.toLowerCase() === "completed")
    const filteredTodos = getFilteredTodos()
    return filteredTodos
      .filter((t) => {
        const taskStatusId = typeof t.status === "object" ? t.status.id : t.status_id
        return taskStatusId === completedStatus?.id
      })
      .slice(0, 3) // Show more completed tasks
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No due date"
    return new Date(dateString).toLocaleDateString()
  }

  const stats = getTaskStats()
  const activeTasks = getActiveTasks()
  const completedTasks = getCompletedTasks()
  const filteredTodos = getFilteredTodos()

  return (
    <div className="h-100 d-flex flex-column">
      {/* Header - Hidden on mobile */}
      <div className="bg-white shadow-sm border-bottom p-4 d-none d-md-block">
        <Row className="align-items-center">
          <Col>
            <h2 className="fw-bold text-dark mb-0">Dashboard</h2>
          </Col>
          <Col xs="auto">
            <div className="d-flex align-items-center gap-3">
              <InputGroup className="search-input" style={{ width: "300px" }}>
                <InputGroup.Text>
                  <Search size={16} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search your tasks here..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button variant="outline-secondary" onClick={() => setSearchTerm("")}>
                    <X size={16} />
                  </Button>
                )}
              </InputGroup>
              <Button className="btn-coral" onClick={() => setShowAddTask(true)} title="Add New Task">
                <Plus size={20} />
              </Button>
              <Button className="btn-coral" onClick={() => setShowCalendar(true)} title="Open Calendar">
                <Calendar size={20} />
              </Button>
              <div className="text-end">
                <div className="small text-muted">{getCurrentDay()}</div>
                <div className="small fw-semibold">{getCurrentDate()}</div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Mobile Search Bar */}
      <div className="bg-white border-bottom p-3 d-md-none">
        <InputGroup>
          <InputGroup.Text>
            <Search size={16} className="text-muted" />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search your tasks here..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button variant="outline-secondary" onClick={() => setSearchTerm("")}>
              <X size={16} />
            </Button>
          )}
          <Button className="btn-coral" onClick={() => setShowAddTask(true)}>
            <Plus size={18} />
          </Button>
        </InputGroup>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")} className="mx-3 mt-3">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess("")} className="mx-3 mt-3">
          {success}
        </Alert>
      )}

      {/* Search Results Info */}
      {searchTerm && (
        <div className="px-3 pt-3">
          <Alert variant="info" className="d-flex align-items-center justify-content-between">
            <span>
              <Search size={16} className="me-2" />
              Found {filteredTodos.length} task(s) matching "{searchTerm}"
            </span>
            <Button variant="outline-info" size="sm" onClick={() => setSearchTerm("")}>
              Clear Search
            </Button>
          </Alert>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedTasks.length > 0 && (
        <div className="px-3 pt-3">
          <Card className="border-0 shadow-sm bg-light">
            <Card.Body className="py-2">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <span className="fw-semibold">{selectedTasks.length} task(s) selected</span>
                <div className="d-flex gap-2 flex-wrap">
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-primary" size="sm" className="d-flex align-items-center">
                      Update Status <ChevronDown size={14} className="ms-1" />
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
                    Clear
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-grow-1 p-3 p-md-4 overflow-auto">
        <Row>
          {/* Left Column - Tasks */}
          <Col lg={8} className="mb-4 mb-lg-0">
            {/* Welcome Section */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Body>
                <h4 className="fw-semibold text-dark mb-0">
                  Hello, {user?.user_name}! <span className="fs-5">👋</span>
                </h4>
                {searchTerm && <small className="text-muted">Showing search results for "{searchTerm}"</small>}
              </Card.Body>
            </Card>

            {/* To-Do Section */}
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                  <h5 className="fw-semibold text-dark mb-0">{searchTerm ? "Search Results" : "To-Do"}</h5>
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    {activeTasks.length > 0 && (
                      <Form.Check
                        type="checkbox"
                        label="Select All"
                        checked={selectedTasks.length === activeTasks.length && activeTasks.length > 0}
                        onChange={handleSelectAll}
                      />
                    )}
                    <small className="text-muted d-none d-md-block">{getTodayDateForTodoSection()}</small>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="danger" />
                  </div>
                ) : activeTasks.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">
                      {searchTerm ? `No tasks found matching "${searchTerm}"` : "No active tasks found"}
                    </p>
                    {!searchTerm && (
                      <Button className="btn-coral" onClick={() => setShowAddTask(true)}>
                        <Plus size={16} className="me-1" />
                        Add Your First Task
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="d-grid gap-3">
                    {activeTasks.map((task) => (
                      <Card
                        key={task.id}
                        className={`task-card border ${selectedTasks.includes(task.id) ? "border-primary" : ""}`}
                      >
                        <Card.Body>
                          <Row className="align-items-start">
                            <Col xs="auto">
                              <Form.Check
                                type="checkbox"
                                checked={selectedTasks.includes(task.id)}
                                onChange={() => handleSelectTask(task.id)}
                                className="mt-2"
                              />
                            </Col>
                            <Col xs="auto" className="d-none d-md-block">
                              <div
                                className="rounded-circle border border-2 border-danger"
                                style={{ width: "12px", height: "12px", marginTop: "8px" }}
                              ></div>
                            </Col>
                            <Col>
                              <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                                <h6 className="fw-semibold text-dark mb-0 flex-grow-1">{task.title}</h6>
                                <div className="d-flex gap-1">
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
                              <p className="text-muted small mb-2">
                                {task.description?.length > 100
                                  ? `${task.description.substring(0, 100)}...`
                                  : task.description || "No description"}
                              </p>
                              <div className="d-flex flex-wrap gap-2 mb-2">
                                <Badge className={`small ${getPriorityClass(task.priority)}`}>
                                  Priority: {getPriorityName(task.priority)}
                                </Badge>

                                {/* Mobile-Optimized Status Update Dropdown */}
                                <Dropdown>
                                  <Dropdown.Toggle
                                    variant="outline-info"
                                    size="sm"
                                    disabled={updatingStatus[task.id]}
                                    className="d-flex align-items-center mobile-status-dropdown"
                                  >
                                    {updatingStatus[task.id] ? (
                                      <Spinner animation="border" size="sm" />
                                    ) : (
                                      <>
                                        <span className="d-none d-md-inline">Status: </span>
                                        {getStatusName(task.status)}
                                        <ChevronDown size={12} className="ms-1" />
                                      </>
                                    )}
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu align="end" className="mobile-dropdown-menu">
                                    {statuses.map((status) => (
                                      <Dropdown.Item
                                        key={status.id}
                                        onClick={() => handleStatusUpdate(task.id, status.id)}
                                        active={
                                          status.id ===
                                          (typeof task.status === "object" ? task.status.id : task.status_id)
                                        }
                                        className="d-flex align-items-center"
                                      >
                                        <span
                                          className={`status-indicator ${getStatusClass(status)} me-2`}
                                          style={{
                                            width: "8px",
                                            height: "8px",
                                            borderRadius: "50%",
                                            display: "inline-block",
                                          }}
                                        ></span>
                                        {status.name}
                                      </Dropdown.Item>
                                    ))}
                                  </Dropdown.Menu>
                                </Dropdown>
                              </div>
                              <small className="text-muted">Due: {formatDate(task.due_date)}</small>
                            </Col>
                            <Col xs="auto" className="d-none d-sm-block">
                              <img
                                src={getImageUrlOrPlaceholder(task.image, 48, 48) || "/placeholder.svg"}
                                alt="Task"
                                width={48}
                                height={48}
                                className="rounded"
                                onError={(e) => {
                                  e.target.src = "/placeholder.svg?height=48&width=48"
                                }}
                              />
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Stats and Completed Tasks */}
          <Col lg={4}>
            {/* Task Statistics */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Body>
                <h5 className="fw-semibold text-dark mb-4">
                  Task Status {searchTerm && <small className="text-muted">(Filtered)</small>}
                </h5>

                <div className="d-grid gap-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <span className="status-indicator status-completed me-3"></span>
                      <small className="text-muted">Completed</small>
                    </div>
                    <span className="fw-semibold">{stats.completed}%</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <span className="status-indicator status-progress me-3"></span>
                      <small className="text-muted">In Progress</small>
                    </div>
                    <span className="fw-semibold">{stats.inProgress}%</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <span className="status-indicator status-not-started me-3"></span>
                      <small className="text-muted">Not Started</small>
                    </div>
                    <span className="fw-semibold">{stats.notStarted}%</span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Completed Tasks */}
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="fw-semibold text-dark mb-4">
                  Completed Tasks {searchTerm && <small className="text-muted">(Filtered)</small>}
                </h5>

                {completedTasks.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-muted small">
                      {searchTerm ? "No completed tasks in search results" : "No completed tasks yet"}
                    </p>
                  </div>
                ) : (
                  <div className="d-grid gap-2">
                    {completedTasks.map((task) => (
                      <div key={task.id} className="d-flex align-items-center p-3 bg-light rounded">
                        <span className="status-indicator status-completed me-3"></span>
                        <div className="flex-grow-1">
                          <h6 className="small fw-semibold text-dark mb-1">{task.title}</h6>
                          <p className="small text-muted mb-0">
                            {task.description?.length > 50
                              ? `${task.description.substring(0, 50)}...`
                              : task.description || "No description"}
                          </p>
                        </div>
                        <img
                          src={getImageUrlOrPlaceholder(task.image, 32, 32) || "/placeholder.svg"}
                          alt="Task"
                          width={32}
                          height={32}
                          className="rounded d-none d-sm-block"
                          onError={(e) => {
                            e.target.src = "/placeholder.svg?height=32&width=32"
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Calendar Widget */}
      <CalendarWidget
        show={showCalendar}
        onHide={() => setShowCalendar(false)}
        statuses={statuses}
        priorities={priorities}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        show={showAddTask}
        onHide={() => setShowAddTask(false)}
        onSubmit={handleCreateTask}
        statuses={statuses}
        priorities={priorities}
      />

      {/* Edit Task Modal */}
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

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false)
          setSelectedTask(null)
        }}
        onConfirm={handleDeleteTask}
        task={selectedTask}
      />
    </div>
  )
}

export default MainContent
