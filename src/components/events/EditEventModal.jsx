"use client"

import { useState, useEffect } from "react"
import { Modal, Form, Button, Alert, Row, Col } from "react-bootstrap"
import { Calendar, Clock, MapPin, Bell } from 'lucide-react'

const EditEventModal = ({ show, onHide, onSubmit, event }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_datetime: "",
    end_datetime: "",
    location: "",
    reminder: false,
    is_all_day: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (event) {
      // Format datetime for input fields
      const formatDateTimeForInput = (dateString) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return date.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:MM
      }

      const formatDateForInput = (dateString) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return date.toISOString().slice(0, 10) // Format: YYYY-MM-DD
      }

      setFormData({
        title: event.title || "",
        description: event.description || "",
        start_datetime: event.is_all_day 
          ? formatDateForInput(event.start_datetime)
          : formatDateTimeForInput(event.start_datetime),
        end_datetime: event.end_datetime 
          ? (event.is_all_day 
              ? formatDateForInput(event.end_datetime)
              : formatDateTimeForInput(event.end_datetime))
          : "",
        location: event.location || "",
        reminder: event.reminder || false,
        is_all_day: event.is_all_day || false,
      })
    }
  }, [event])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleAllDayChange = (e) => {
    const isAllDay = e.target.checked
    setFormData((prev) => ({
      ...prev,
      is_all_day: isAllDay,
      end_datetime: isAllDay ? "" : prev.end_datetime,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      setError("Title is required")
      return
    }

    if (!formData.start_datetime) {
      setError("Start date and time is required")
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
        is_all_day: formData.is_all_day,
      }

      // Only include end_datetime if not all day and has value
      if (!formData.is_all_day && formData.end_datetime) {
        submitData.end_datetime = formData.end_datetime
      }

      await onSubmit(submitData)
      setError("")
    } catch (err) {
      setError("Failed to update event")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError("")
    onHide()
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <Calendar size={20} className="me-2 text-coral" />
          Edit Event
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Event Title *</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter event title"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="d-flex align-items-center">
                  <Clock size={16} className="me-1" />
                  Start Date & Time *
                </Form.Label>
                <Form.Control
                  type={formData.is_all_day ? "date" : "datetime-local"}
                  name="start_datetime"
                  value={formData.start_datetime}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="d-flex align-items-center">
                  <Clock size={16} className="me-1" />
                  End Date & Time
                </Form.Label>
                <Form.Control
                  type={formData.is_all_day ? "date" : "datetime-local"}
                  name="end_datetime"
                  value={formData.end_datetime}
                  onChange={handleChange}
                  disabled={formData.is_all_day}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="is_all_day"
                  label="All Day Event"
                  checked={formData.is_all_day}
                  onChange={handleAllDayChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
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
              </Form.Group>
            </Col>
          </Row>

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
              {loading ? "Updating..." : "Update Event"}
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

export default EditEventModal
