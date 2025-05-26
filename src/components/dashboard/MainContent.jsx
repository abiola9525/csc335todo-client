"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { Search, Plus, Calendar } from "lucide-react"
import { Row, Col, Card, Form, Button, Badge, InputGroup } from "react-bootstrap"
import { todosAPI, statusAPI, priorityAPI } from "../../services/api"
import { getImageUrlOrPlaceholder } from "../../utils/imageUtils"

const MainContent = () => {
  const { user } = useAuth()
  const [todos, setTodos] = useState([])
  const [statuses, setStatuses] = useState([])
  const [priorities, setPriorities] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

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
      console.error("Error fetching dashboard data:", err)
    } finally {
      setLoading(false)
    }
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

  // Calculate statistics
  const getTaskStats = () => {
    if (todos.length === 0) return { completed: 0, inProgress: 0, notStarted: 0 }

    const completedStatus = statuses.find((s) => s.name.toLowerCase() === "completed")
    const inProgressStatus = statuses.find((s) => s.name.toLowerCase().includes("progress"))
    const notStartedStatus = statuses.find((s) => s.name.toLowerCase().includes("not started"))

    const completed = todos.filter((t) => {
      const taskStatusId = typeof t.status === "object" ? t.status.id : t.status_id
      return taskStatusId === completedStatus?.id
    }).length

    const inProgress = todos.filter((t) => {
      const taskStatusId = typeof t.status === "object" ? t.status.id : t.status_id
      return taskStatusId === inProgressStatus?.id
    }).length

    const notStarted = todos.filter((t) => {
      const taskStatusId = typeof t.status === "object" ? t.status.id : t.status_id
      return taskStatusId === notStartedStatus?.id
    }).length

    const total = todos.length
    return {
      completed: total > 0 ? Math.round((completed / total) * 100) : 0,
      inProgress: total > 0 ? Math.round((inProgress / total) * 100) : 0,
      notStarted: total > 0 ? Math.round((notStarted / total) * 100) : 0,
    }
  }

  const getActiveTasks = () => {
    const completedStatus = statuses.find((s) => s.name.toLowerCase() === "completed")
    return todos
      .filter((t) => {
        const taskStatusId = typeof t.status === "object" ? t.status.id : t.status_id
        return taskStatusId !== completedStatus?.id
      })
      .slice(0, 3)
  }

  const getCompletedTasks = () => {
    const completedStatus = statuses.find((s) => s.name.toLowerCase() === "completed")
    return todos
      .filter((t) => {
        const taskStatusId = typeof t.status === "object" ? t.status.id : t.status_id
        return taskStatusId === completedStatus?.id
      })
      .slice(0, 2)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No due date"
    return new Date(dateString).toLocaleDateString()
  }

  const stats = getTaskStats()
  const activeTasks = getActiveTasks()
  const completedTasks = getCompletedTasks()

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
                <Form.Control type="text" placeholder="Search your task here..." />
              </InputGroup>
              <Button className="btn-coral">
                <Plus size={20} />
              </Button>
              <Button className="btn-coral">
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
          <Form.Control type="text" placeholder="Search your task here..." />
          <Button className="btn-coral">
            <Plus size={18} />
          </Button>
        </InputGroup>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-3 p-md-4 overflow-auto">
        <Row>
          {/* Left Column - Tasks */}
          <Col lg={8} className="mb-4 mb-lg-0">
            {/* Welcome Section */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Body>
                <h4 className="fw-semibold text-dark mb-0">
                  Welcome back, {user?.first_name}! <span className="fs-5">👋</span>
                </h4>
              </Card.Body>
            </Card>

            {/* To-Do Section */}
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-semibold text-dark mb-0">To-Do</h5>
                  <small className="text-muted">{getTodayDateForTodoSection()}</small>
                </div>

                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-danger" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : activeTasks.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No active tasks found</p>
                  </div>
                ) : (
                  <div className="d-grid gap-3">
                    {activeTasks.map((task) => (
                      <Card key={task.id} className="task-card border">
                        <Card.Body>
                          <Row className="align-items-start">
                            <Col xs="auto">
                              <div
                                className="rounded-circle border border-2 border-danger"
                                style={{ width: "12px", height: "12px", marginTop: "8px" }}
                              ></div>
                            </Col>
                            <Col>
                              <h6 className="fw-semibold text-dark mb-2">{task.title}</h6>
                              <p className="text-muted small mb-2">
                                {task.description?.length > 100
                                  ? `${task.description.substring(0, 100)}...`
                                  : task.description || "No description"}
                              </p>
                              <div className="d-flex flex-wrap gap-2">
                                <Badge className={`small ${getPriorityClass(task.priority)}`}>
                                  Priority: {getPriorityName(task.priority)}
                                </Badge>
                                <Badge bg="info" className="small">
                                  Status: {getStatusName(task.status)}
                                </Badge>
                              </div>
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
                <h5 className="fw-semibold text-dark mb-4">Task Status</h5>

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
                <h5 className="fw-semibold text-dark mb-4">Completed Task</h5>

                {completedTasks.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-muted small">No completed tasks yet</p>
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
    </div>
  )
}

export default MainContent
