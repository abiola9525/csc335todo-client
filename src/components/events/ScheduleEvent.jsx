"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button, Alert, Spinner } from "react-bootstrap"
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, CalendarIcon } from "lucide-react"
import { eventsAPI } from "../../services/api"
import ScheduleEventModal from "./ScheduleEventModal"
import EditEventModal from "./EditEventModal"
import EventDetailsModal from "./EventDetailsModal"
import DeleteEventModal from "./DeleteEventModal"

const ScheduleEvent = ({ onGoBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedDate, setSelectedDate] = useState(null)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await eventsAPI.getAll()
      setEvents(response.data)
      setError("")
    } catch (err) {
      setError("Failed to fetch events")
      console.error("Error fetching events:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (eventData) => {
    try {
      await eventsAPI.create(eventData)
      setSuccess("Event created successfully!")
      setShowCreateModal(false)
      setSelectedDate(null)
      fetchEvents()
    } catch (err) {
      setError("Failed to create event")
      console.error("Error creating event:", err)
    }
  }

  const handleEditEvent = async (eventData) => {
    try {
      if (!selectedEvent?.id) {
        setError("No event selected for editing")
        return
      }

      await eventsAPI.update(selectedEvent.id, eventData)
      setSuccess("Event updated successfully!")
      setShowEditModal(false)
      setSelectedEvent(null)
      fetchEvents()
    } catch (err) {
      setError("Failed to update event")
      console.error("Error updating event:", err)
    }
  }

  const handleDeleteEvent = async () => {
    try {
      if (!selectedEvent?.id) {
        setError("No event selected for deletion")
        return
      }

      await eventsAPI.delete(selectedEvent.id)
      setSuccess("Event deleted successfully!")
      setShowDeleteModal(false)
      setSelectedEvent(null)
      fetchEvents()
    } catch (err) {
      setError("Failed to delete event")
      console.error("Error deleting event:", err)
    }
  }

  const handleDateClick = (date) => {
    setSelectedDate(date)
    setShowCreateModal(true)
  }

  const handleEventClick = (event, e) => {
    e.stopPropagation()
    setSelectedEvent(event)
    setShowDetailsModal(true)
  }

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
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
      const prevMonthDate = new Date(year, month, 0 - (startingDayOfWeek - 1 - i))
      days.push({ date: prevMonthDate, isCurrentMonth: false })
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true })
    }

    // Add days from next month to fill the grid
    const remainingCells = 42 - days.length // 6 rows × 7 days
    for (let day = 1; day <= remainingCells; day++) {
      const nextMonthDate = new Date(year, month + 1, day)
      days.push({ date: nextMonthDate, isCurrentMonth: false })
    }

    return days
  }

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0]
    return events.filter((event) => {
      const eventDate = new Date(event.start_datetime).toISOString().split("T")[0]
      return eventDate === dateStr
    })
  }

  const isToday = (date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
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

  const eventColors = [
    "bg-primary",
    "bg-success",
    "bg-warning",
    "bg-info",
    "bg-secondary",
    "bg-coral",
    "bg-purple",
    "bg-teal",
  ]

  const getEventColor = (eventId) => {
    return eventColors[eventId % eventColors.length]
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
              <Button variant="link" className="text-coral p-0 me-3" onClick={onGoBack}>
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h3 className="fw-bold text-dark mb-0 d-flex align-items-center">
                  <CalendarIcon size={24} className="text-coral me-2" />
                  Event Calendar
                </h3>
                <small className="text-muted">Click on any date to schedule an event</small>
              </div>
            </div>
            <Button variant="link" className="text-muted text-decoration-none" onClick={onGoBack}>
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
        {/* Left Sidebar - Mini Calendar */}
        <Col lg={3} className="mb-4 mb-lg-0">
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h6 className="fw-semibold text-dark mb-3">Quick Actions</h6>
              <div className="d-grid gap-2">
                <Button className="btn-coral" onClick={() => setShowCreateModal(true)}>
                  <Plus size={16} className="me-1" />
                  New Event
                </Button>
                <Button variant="outline-secondary" onClick={goToToday}>
                  <CalendarIcon size={16} className="me-1" />
                  Today
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Mini Calendar */}
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-semibold text-dark mb-0">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h6>
                <div className="d-flex gap-1">
                  <Button variant="outline-secondary" size="sm" onClick={() => navigateMonth(-1)}>
                    <ChevronLeft size={14} />
                  </Button>
                  <Button variant="outline-secondary" size="sm" onClick={() => navigateMonth(1)}>
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>

              {/* Mini calendar grid */}
              <div className="mini-calendar">
                <div className="d-grid mb-2" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
                  {dayNames.map((day) => (
                    <div key={day} className="text-center text-muted small fw-semibold py-1">
                      {day.charAt(0)}
                    </div>
                  ))}
                </div>
                <div className="d-grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
                  {days.slice(0, 35).map((dayObj, index) => (
                    <div
                      key={index}
                      className={`text-center p-1 small rounded cursor-pointer ${
                        dayObj.isCurrentMonth ? "text-dark" : "text-muted"
                      } ${isToday(dayObj.date) ? "bg-coral text-white fw-bold" : ""} ${
                        getEventsForDate(dayObj.date).length > 0 ? "bg-light" : ""
                      }`}
                      onClick={() => handleDateClick(dayObj.date)}
                      style={{ cursor: "pointer", minHeight: "24px" }}
                    >
                      {dayObj.date.getDate()}
                    </div>
                  ))}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Main Calendar */}
        <Col lg={9}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <Button variant="outline-secondary" onClick={() => navigateMonth(-1)}>
                    <ChevronLeft size={16} />
                  </Button>
                  <h4 className="fw-bold text-dark mb-0">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h4>
                  <Button variant="outline-secondary" onClick={() => navigateMonth(1)}>
                    <ChevronRight size={16} />
                  </Button>
                </div>
                <div className="d-flex gap-2">
                  <Button variant="outline-primary" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                  <Button className="btn-coral" size="sm" onClick={() => setShowCreateModal(true)}>
                    <Plus size={16} className="me-1" />
                    Add Event
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {/* Calendar Grid */}
              <div className="calendar-main">
                {/* Day Headers */}
                <div className="d-grid border-bottom" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
                  {dayNames.map((day) => (
                    <div key={day} className="text-center fw-semibold text-muted py-3 border-end">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="d-grid" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
                  {days.map((dayObj, index) => {
                    const dayEvents = getEventsForDate(dayObj.date)
                    return (
                      <div
                        key={index}
                        className={`calendar-day-cell border-end border-bottom p-2 ${
                          dayObj.isCurrentMonth ? "" : "bg-light"
                        } ${isToday(dayObj.date) ? "today-cell" : ""}`}
                        onClick={() => handleDateClick(dayObj.date)}
                        style={{
                          minHeight: "120px",
                          cursor: "pointer",
                          position: "relative",
                        }}
                      >
                        <div
                          className={`fw-semibold mb-2 ${
                            dayObj.isCurrentMonth ? "text-dark" : "text-muted"
                          } ${isToday(dayObj.date) ? "text-coral" : ""}`}
                        >
                          {dayObj.date.getDate()}
                        </div>

                        {/* Events */}
                        <div className="d-flex flex-column gap-1">
                          {dayEvents.slice(0, 3).map((event, eventIndex) => (
                            <div
                              key={event.id}
                              className={`event-item small text-white rounded px-2 py-1 ${getEventColor(
                                event.id,
                              )} cursor-pointer`}
                              onClick={(e) => handleEventClick(event, e)}
                              style={{
                                fontSize: "0.75rem",
                                cursor: "pointer",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && <div className="small text-muted">+{dayEvents.length - 3} more</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Create Event Modal */}
      <ScheduleEventModal
        show={showCreateModal}
        onHide={() => {
          setShowCreateModal(false)
          setSelectedDate(null)
        }}
        onSubmit={handleCreateEvent}
        selectedDate={selectedDate}
      />

      {/* Edit Event Modal */}
      <EditEventModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false)
          setSelectedEvent(null)
        }}
        onSubmit={handleEditEvent}
        event={selectedEvent}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        show={showDetailsModal}
        onHide={() => {
          setShowDetailsModal(false)
          setSelectedEvent(null)
        }}
        event={selectedEvent}
        onEdit={(event) => {
          setSelectedEvent(event)
          setShowDetailsModal(false)
          setShowEditModal(true)
        }}
        onDelete={(event) => {
          setSelectedEvent(event)
          setShowDetailsModal(false)
          setShowDeleteModal(true)
        }}
      />

      {/* Delete Event Modal */}
      <DeleteEventModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false)
          setSelectedEvent(null)
        }}
        onConfirm={handleDeleteEvent}
        event={selectedEvent}
      />
    </Container>
  )
}

export default ScheduleEvent
