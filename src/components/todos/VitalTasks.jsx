"use client"

import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from "react-bootstrap"
import { ArrowLeft, Eye, AlertTriangle } from "lucide-react"
import { todosAPI, statusAPI, priorityAPI } from "../../services/api"

const VitalTasks = ({ onGoBack, onViewTask }) => {
  const navigate = useNavigate()
  const [todos, setTodos] = useState([])
  const [statuses, setStatuses] = useState([])
  const [priorities, setPriorities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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

  const getVitalTasks = () => {
    const highPriority = priorities.find(
      (p) => p.name.toLowerCase().includes("high") || p.name.toLowerCase().includes("extreme"),
    )
    const completedStatus = statuses.find((s) => s.name.toLowerCase() === "completed")

    return todos
      .filter((todo) => {
        const todoPriorityId = typeof todo.priority === "object" ? todo.priority.id : todo.priority_id
        const todoStatusId = typeof todo.status === "object" ? todo.status.id : todo.status_id

        const isHighPriority = todoPriorityId === highPriority?.id
        const isNotCompleted = todoStatusId !== completedStatus?.id
        const isOverdue = todo.due_date && new Date(todo.due_date) < new Date()

        return (isHighPriority || isOverdue) && isNotCompleted
      })
      .sort((a, b) => {
        // Sort by due date (overdue first), then by priority
        const aOverdue = a.due_date && new Date(a.due_date) < new Date()
        const bOverdue = b.due_date && new Date(b.due_date) < new Date()

        if (aOverdue && !bOverdue) return -1
        if (!aOverdue && bOverdue) return 1

        return new Date(a.due_date || "9999-12-31") - new Date(b.due_date || "9999-12-31")
      })
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No due date"
    return new Date(dateString).toLocaleDateString()
  }

  const isOverdue = (dateString) => {
    if (!dateString) return false
    return new Date(dateString) < new Date()
  }

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <Spinner animation="border" variant="danger" />
      </Container>
    )
  }

  const vitalTasks = getVitalTasks()

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
              <div>
                <h3 className="fw-bold text-dark mb-0 d-flex align-items-center">
                  <AlertTriangle size={24} className="text-danger me-2" />
                  Vital Tasks
                </h3>
                <small className="text-muted">High priority and overdue tasks</small>
              </div>
            </div>
            <Button variant="link" className="text-muted text-decoration-none" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </Col>
      </Row>

      {/* Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Vital Tasks */}
      <Row>
        {vitalTasks.length === 0 ? (
          <Col>
            <Card className="text-center py-5 border-0 shadow-sm">
              <Card.Body>
                <AlertTriangle size={48} className="text-success mb-3" />
                <h5 className="text-success">Great! No vital tasks</h5>
                <p className="text-muted">You have no high priority or overdue tasks at the moment.</p>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          vitalTasks.map((task) => (
            <Col lg={6} xl={4} key={task.id} className="mb-4">
              <Card className="h-100 task-card border-0 shadow-sm border-start border-danger border-4">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h6 className="fw-semibold text-dark mb-0 flex-grow-1">{task.title}</h6>
                    <div className="d-flex gap-1 ms-2">
                      <Button variant="outline-primary" size="sm" onClick={() => onViewTask(task)} title="View Details">
                        <Eye size={14} />
                      </Button>
                    </div>
                  </div>

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
                    {isOverdue(task.due_date) && (
                      <Badge bg="danger" className="small d-flex align-items-center">
                        <AlertTriangle size={12} className="me-1" />
                        Overdue
                      </Badge>
                    )}
                  </div>

                  <div className="mt-auto">
                    <small className={`${isOverdue(task.due_date) ? "text-danger fw-bold" : "text-muted"}`}>
                      Due: {formatDate(task.due_date)}
                    </small>
                    <br />
                    <small className="text-muted">Created: {formatDate(task.created_at)}</small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Summary Stats */}
      {vitalTasks.length > 0 && (
        <Row className="mt-4">
          <Col>
            <Card className="border-0 shadow-sm bg-light">
              <Card.Body>
                <h6 className="fw-semibold text-dark mb-3">Vital Tasks Summary</h6>
                <Row className="text-center">
                  <Col md={4}>
                    <div className="text-danger">
                      <h4 className="fw-bold mb-1">{vitalTasks.filter((t) => isOverdue(t.due_date)).length}</h4>
                      <small className="text-muted">Overdue Tasks</small>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-warning">
                      <h4 className="fw-bold mb-1">
                        {
                          vitalTasks.filter((t) => {
                            const highPriority = priorities.find(
                              (p) => p.name.toLowerCase().includes("high") || p.name.toLowerCase().includes("extreme"),
                            )
                            const taskPriorityId = typeof t.priority === "object" ? t.priority.id : t.priority_id
                            return taskPriorityId === highPriority?.id
                          }).length
                        }
                      </h4>
                      <small className="text-muted">High Priority</small>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-info">
                      <h4 className="fw-bold mb-1">{vitalTasks.length}</h4>
                      <small className="text-muted">Total Vital</small>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  )
}

export default VitalTasks
