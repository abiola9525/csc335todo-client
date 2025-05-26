"use client"

import { useState, useEffect } from "react"
import { Modal, Button, Alert, Spinner } from "react-bootstrap"
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { eventsAPI, todosAPI } from "../../services/api"
import ScheduleEventModal from "../events/ScheduleEventModal"
import EditEventModal from "../events/EditEventModal"
import EventDetailsModal from "../events/EventDetailsModal"
import DeleteEventModal from "../events/DeleteEventModal"
import AddTaskModal from "../todos/AddTaskModal"

const CalendarWidget = ({ show, onHide, statuses, priorities }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Modal states
  const [showEventModal, setShowEventModal] = useState(false)
  const [showEditEventModal, setShowEditEventModal] = useState(false)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [showDeleteEventModal, setShowDeleteEventModal] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    if (show) {
      fetchData()
    }
  }, [show])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [eventsResponse, todosResponse] = await Promise.all([eventsAPI.getAll(), todosAPI.getAll()])

      setEvents(eventsResponse.data)
      setTodos(todosResponse.data)
      setError("")
    } catch (err) {
      setError("Failed to fetch calendar data")
      console.error("Error fetching calendar data:", err)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getEventsForDate = (date) => {
    if (!date) return []
    const dateStr = date.toISOString().split("T")[0]

    return events.filter((event) => {
      const eventDate = new Date(event.start_datetime).toISOString().split("T")[0]
      return eventDate === dateStr
    })
  }

  const getTodosForDate = (date) => {
    if (!date) return []
    const dateStr = date.toISOString().split("T")[0]

    return todos.filter((todo) => {
      if (!todo.due_date) return false
      const todoDate = new Date(todo.due_date).toISOString().split("T")[0]
      return todoDate === dateStr
    })
  }

  const hasItemsOnDate = (date) => {
    return getEventsForDate(date).length > 0 || getTodosForDate(date).length > 0
  }

  const getDateIndicators = (date) => {
    const dateEvents = getEventsForDate(date)
    const dateTodos = getTodosForDate(date)

    return {
      hasEvents: dateEvents.length > 0,
      hasTodos: dateTodos.length > 0,
      eventCount: dateEvents.length,
      todoCount: dateTodos.length,
    }
  }

  const handleDateClick = (date) => {
    const dateEvents = getEventsForDate(date)
    const dateTodos = getTodosForDate(date)

    if (dateEvents.length > 0) {
      setSelectedEvent(dateEvents[0]) // Show first event
      setShowEventDetails(true)
    } else if (dateTodos.length > 0) {
      // Could show todo details or just highlight
      setSelectedDate(date)
    } else {
      setSelectedDate(date)
    }
  }

  const handleCreateEvent = async (eventData) => {
    try {
      await eventsAPI.create(eventData)
      setSuccess("Event created successfully!")
      setShowEventModal(false)
      fetchData()
    } catch (err) {
      setError("Failed to create event")
      console.error("Error creating event:", err)
    }
  }

  const handleEditEvent = async (eventData) => {
    try {
      await eventsAPI.update(selectedEvent.id, eventData)
      setSuccess("Event updated successfully!")
      setShowEditEventModal(false)
      setSelectedEvent(null)
      fetchData()
    } catch (err) {
      setError("Failed to update event")
      console.error("Error updating event:", err)
    }
  }

  const handleDeleteEvent = async () => {
    try {
      await eventsAPI.delete(selectedEvent.id)
      setSuccess("Event deleted successfully!")
      setShowDeleteEventModal(false)
      setSelectedEvent(null)
      fetchData()
    } catch (err) {
      setError("Failed to delete event")
      console.error("Error deleting event:", err)
    }
  }

  const handleCreateTask = async (taskData) => {
    try {
      await todosAPI.create(taskData)
      setSuccess("Task created successfully!")
      setShowAddTask(false)
      fetchData()
    } catch (err) {
      setError("Failed to create task")
      console.error("Error creating task:", err)
    }
  }

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const days = getDaysInMonth(currentDate)

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <Calendar size={20} className="me-2 text-coral" />
            Calendar
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
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

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="danger" />
            </div>
          ) : (
            <>
              {/* Calendar Header */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <Button variant="outline-secondary" size="sm" onClick={() => navigateMonth(-1)}>
                  <ChevronLeft size={16} />
                </Button>
                <h5 className="fw-bold mb-0">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h5>
                <Button variant="outline-secondary" size="sm" onClick={() => navigateMonth(1)}>
                  <ChevronRight size={16} />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-2 mb-4">
                <Button className="btn-coral" size="sm" onClick={() => setShowEventModal(true)}>
                  <Calendar size={16} className="me-1" />
                  Schedule Event
                </Button>
                <Button variant="outline-primary" size="sm" onClick={() => setShowAddTask(true)}>
                  <Plus size={16} className="me-1" />
                  Add Task
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="calendar-grid">
                {/* Day Headers */}
                <div className="d-grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: "1px" }}>
                  {dayNames.map((day) => (
                    <div key={day} className="text-center fw-semibold text-muted py-2 small">
                      {day}
                    </div>
                  ))}

                  {/* Calendar Days */}
                  {days.map((day, index) => {
                    const indicators = day ? getDateIndicators(day) : { hasEvents: false, hasTodos: false }

                    return (
                      <div
                        key={index}
                        className={`calendar-day text-center p-2 border rounded position-relative ${
                          day ? "calendar-day-active" : ""
                        } ${day && (indicators.hasEvents || indicators.hasTodos) ? "has-events" : ""}`}
                        onClick={() => day && handleDateClick(day)}
                        style={{
                          minHeight: "40px",
                          cursor: day ? "pointer" : "default",
                          backgroundColor: day ? "#fff" : "#f8f9fa",
                        }}
                      >
                        {day && (
                          <>
                            <span className="fw-semibold">{day.getDate()}</span>
                            {/* Event and Task Indicators */}
                            <div className="position-absolute top-0 end-0 me-1 mt-1 d-flex flex-column gap-1">
                              {indicators.hasEvents && (
                                <div
                                  className="rounded-circle bg-coral"
                                  style={{ width: "6px", height: "6px" }}
                                  title={`${indicators.eventCount} event(s)`}
                                ></div>
                              )}
                              {indicators.hasTodos && (
                                <div
                                  className="rounded-circle bg-primary"
                                  style={{ width: "6px", height: "6px" }}
                                  title={`${indicators.todoCount} task(s)`}
                                ></div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-3 d-flex align-items-center gap-3 small text-muted">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle bg-coral me-1" style={{ width: "6px", height: "6px" }}></div>
                  Events
                </div>
                <div className="d-flex align-items-center">
                  <div className="rounded-circle bg-primary me-1" style={{ width: "6px", height: "6px" }}></div>
                  Tasks
                </div>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Schedule Event Modal */}
      <ScheduleEventModal show={showEventModal} onHide={() => setShowEventModal(false)} onSubmit={handleCreateEvent} />

      {/* Edit Event Modal */}
      <EditEventModal
        show={showEditEventModal}
        onHide={() => {
          setShowEditEventModal(false)
          setSelectedEvent(null)
        }}
        onSubmit={handleEditEvent}
        event={selectedEvent}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        show={showEventDetails}
        onHide={() => {
          setShowEventDetails(false)
          setSelectedEvent(null)
        }}
        event={selectedEvent}
        onEdit={(event) => {
          setSelectedEvent(event)
          setShowEventDetails(false)
          setShowEditEventModal(true)
        }}
        onDelete={(event) => {
          setSelectedEvent(event)
          setShowEventDetails(false)
          setShowDeleteEventModal(true)
        }}
      />

      {/* Delete Event Modal */}
      <DeleteEventModal
        show={showDeleteEventModal}
        onHide={() => {
          setShowDeleteEventModal(false)
          setSelectedEvent(null)
        }}
        onConfirm={handleDeleteEvent}
        event={selectedEvent}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        show={showAddTask}
        onHide={() => setShowAddTask(false)}
        onSubmit={handleCreateTask}
        statuses={statuses}
        priorities={priorities}
      />
    </>
  )
}

export default CalendarWidget
