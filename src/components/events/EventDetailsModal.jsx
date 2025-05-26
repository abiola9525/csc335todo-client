"use client"

import { Modal, Badge, Button } from "react-bootstrap"
import { Calendar, Clock, MapPin, Bell, Edit, Trash2 } from 'lucide-react'

const EventDetailsModal = ({ show, onHide, event, onEdit, onDelete }) => {
  if (!event) return null

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not specified"
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <Calendar size={20} className="me-2 text-coral" />
          Event Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4">
          <h5 className="fw-bold text-dark mb-2">{event.title}</h5>
          {event.description && <p className="text-muted mb-3">{event.description}</p>}

          <div className="d-flex flex-wrap gap-2 mb-3">
            {event.is_all_day && (
              <Badge bg="info" className="d-flex align-items-center">
                <Calendar size={12} className="me-1" />
                All Day
              </Badge>
            )}
            {event.reminder && (
              <Badge bg="warning" className="d-flex align-items-center">
                <Bell size={12} className="me-1" />
                Reminder Set
              </Badge>
            )}
          </div>

          <div className="border rounded p-3 bg-light">
            <div className="d-flex align-items-center mb-2">
              <Clock size={16} className="text-muted me-2" />
              <strong>Start:</strong>
              <span className="ms-2">
                {event.is_all_day ? formatDate(event.start_datetime) : formatDateTime(event.start_datetime)}
              </span>
            </div>

            {event.end_datetime && (
              <div className="d-flex align-items-center mb-2">
                <Clock size={16} className="text-muted me-2" />
                <strong>End:</strong>
                <span className="ms-2">
                  {event.is_all_day ? formatDate(event.end_datetime) : formatDateTime(event.end_datetime)}
                </span>
              </div>
            )}

            {event.location && (
              <div className="d-flex align-items-center">
                <MapPin size={16} className="text-muted me-2" />
                <strong>Location:</strong>
                <span className="ms-2">{event.location}</span>
              </div>
            )}
          </div>
        </div>

        <div className="d-flex gap-2">
          <Button variant="outline-warning" onClick={() => onEdit(event)} className="flex-grow-1">
            <Edit size={16} className="me-1" />
            Edit Event
          </Button>
          <Button variant="outline-danger" onClick={() => onDelete(event)} className="flex-grow-1">
            <Trash2 size={16} className="me-1" />
            Delete Event
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default EventDetailsModal
