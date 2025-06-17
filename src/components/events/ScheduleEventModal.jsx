"use client"

import { useState, useEffect } from "react"
import { Modal, Form, Button, Alert, Row, Col } from "react-bootstrap"
import { Calendar, MapPin, Bell } from "lucide-react"

const ScheduleEventModal = ({ show, onHide, onSubmit, selectedDate }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_datetime: "",
    location: "",
    reminder: false,
    is_all_day: true, // Default to all day since no time selection
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Format date for input field (timezone-safe)
  const formatDateForInput = (date) => {
    if (!date) return ""
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Auto-fill date when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const dateStr = formatDateForInput(selectedDate)
      setFormData((prev) => ({
        ...prev,
        start_datetime: dateStr,
      }))
    }
  }, [selectedDate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      setError("Title is required")
      return
    }

    if (!formData.start_datetime) {
      setError("Date is required")
      return
    }

    setLoading(true)
    setError("")

    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description || "",
        start_datetime: formData.start_datetime,
        location: formData.location || "",
        reminder: formData.reminder,
        is_all_day: true, // Always all day for this implementation
      }

      await onSubmit(submitData)

      // Reset form
      setFormData({
        title: "",
        description: "",
        start_datetime: "",
        location: "",
        reminder: false,
        is_all_day: true,
      })
      setError("")
    } catch (err) {
      setError("Failed to create event")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      start_datetime: "",
      location: "",
      reminder: false,
      is_all_day: true,
    })
    setError("")
    onHide()
  }

  const formatSelectedDate = () => {
    if (!selectedDate) return ""
    return selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <Calendar size={20} className="me-2 text-coral" />
          Schedule New Event
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        {selectedDate && (
          <Alert variant="info" className="d-flex align-items-center">
            <Calendar size={16} className="me-2" />
            <strong>Selected Date:</strong> <span className="ms-2">{formatSelectedDate()}</span>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Event Title *</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter event title"
                  required
                  autoFocus
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="start_datetime"
                  value={formData.start_datetime}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label className="d-flex align-items-center">
                  <MapPin size={16} className="me-1" />
                  Location
                </Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter event location (optional)"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <div className="mt-4">
                  <Form.Check
                    type="checkbox"
                    name="reminder"
                    label={
                      <span className="d-flex align-items-center">
                        <Bell size={16} className="me-1" />
                        Set Reminder
                      </span>
                    }
                    checked={formData.reminder}
                    onChange={handleChange}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Label>Event Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter event description..."
            />
          </Form.Group>

          <div className="d-flex gap-2">
            <Button type="submit" className="btn-coral" disabled={loading}>
              {loading ? "Creating..." : "Schedule Event"}
            </Button>
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default ScheduleEventModal
