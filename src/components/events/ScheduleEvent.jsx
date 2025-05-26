"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Table } from "react-bootstrap"
import { ArrowLeft, Plus, Calendar, Clock, MapPin, Bell, Edit, Trash2, Eye } from "lucide-react"
import { eventsAPI } from "../../services/api"
import ScheduleEventModal from "./ScheduleEventModal"
import EditEventModal from "./EditEventModal"
import EventDetailsModal from "./EventDetailsModal"
import DeleteEventModal from "./DeleteEventModal"

const ScheduleEvent = ({ onGoBack }) => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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

  const handleViewEvent = (event) => {
    setSelectedEvent(event)
    setShowDetailsModal(true)
  }

  const handleEditClick = (event) => {
    console.log("Edit clicked for event:", event) // Debug log
    setSelectedEvent(event)
    setShowEditModal(true)
  }

  const handleDeleteClick = (event) => {
    console.log("Delete clicked for event:", event) // Debug log
    setSelectedEvent(event)
    setShowDeleteModal(true)
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not specified"
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date()
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
                  <Calendar size={24} className="text-coral me-2" />
                  Schedule Event
                </h3>
                <small className="text-muted">Manage your scheduled events</small>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button className="btn-coral" onClick={() => setShowCreateModal(true)}>
                <Plus size={16} className="me-1" />
                New Event
              </Button>
              <Button variant="link" className="text-muted text-decoration-none" onClick={onGoBack}>
                Go Back
              </Button>
            </div>
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

      {/* Events List */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-semibold text-dark mb-0">All Events</h5>
                <Badge bg="info">{events.length} Total Events</Badge>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-5">
                  <Calendar size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No events scheduled</h5>
                  <p className="text-muted">Create your first event to get started!</p>
                  <Button className="btn-coral" onClick={() => setShowCreateModal(true)}>
                    <Plus size={16} className="me-1" />
                    Schedule Event
                  </Button>
                </div>
              ) : (
                <Table responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Event</th>
                      <th>Date & Time</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id}>
                        <td>
                          <div>
                            <h6 className="fw-semibold text-dark mb-1">{event.title}</h6>
                            {event.description && (
                              <small className="text-muted">
                                {event.description.length > 50
                                  ? `${event.description.substring(0, 50)}...`
                                  : event.description}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Clock size={14} className="text-muted me-1" />
                            <small>
                              {event.is_all_day
                                ? formatDate(event.start_datetime)
                                : formatDateTime(event.start_datetime)}
                            </small>
                          </div>
                          {event.end_datetime && (
                            <small className="text-muted">
                              to{" "}
                              {event.is_all_day ? formatDate(event.end_datetime) : formatDateTime(event.end_datetime)}
                            </small>
                          )}
                        </td>
                        <td>
                          {event.location ? (
                            <div className="d-flex align-items-center">
                              <MapPin size={14} className="text-muted me-1" />
                              <small>{event.location}</small>
                            </div>
                          ) : (
                            <small className="text-muted">No location</small>
                          )}
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {event.is_all_day && (
                              <Badge bg="info" className="small">
                                All Day
                              </Badge>
                            )}
                            {event.reminder && (
                              <Badge bg="warning" className="small">
                                <Bell size={10} className="me-1" />
                                Reminder
                              </Badge>
                            )}
                            <Badge bg={isUpcoming(event.start_datetime) ? "success" : "secondary"} className="small">
                              {isUpcoming(event.start_datetime) ? "Upcoming" : "Past"}
                            </Badge>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewEvent(event)
                              }}
                              title="View Details"
                            >
                              <Eye size={14} />
                            </Button>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditClick(event)
                              }}
                              title="Edit Event"
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteClick(event)
                              }}
                              title="Delete Event"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Create Event Modal */}
      <ScheduleEventModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSubmit={handleCreateEvent}
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
