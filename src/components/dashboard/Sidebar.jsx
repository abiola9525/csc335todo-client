"use client"

import { useAuth } from "../../context/AuthContext"
import { LayoutDashboard, Zap, CheckSquare, FolderOpen, Settings, HelpCircle, LogOut, X } from "lucide-react"
import { Nav, Button } from "react-bootstrap"

const Sidebar = ({ mobile = false, onClose, onNavigate, activeView = "dashboard" }) => {
  const { user, logout } = useAuth()

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
    { icon: Zap, label: "Vital Task", key: "vital-task" },
    { icon: CheckSquare, label: "My Task", key: "my-task" },
    { icon: FolderOpen, label: "Task Categories", key: "task-categories" },
    { icon: Settings, label: "Settings", key: "settings" },
    { icon: HelpCircle, label: "Help", key: "help" },
  ]

  // Generate user initials for avatar
  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    }
    if (user?.first_name) {
      return user.first_name.charAt(0).toUpperCase()
    }
    if (user?.user_name) {
      return user.user_name.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return "U"
  }

  const getUserDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    if (user?.first_name) {
      return user.first_name
    }
    if (user?.user_name) {
      return user.user_name
    }
    if (user?.email) {
      return user.email.split("@")[0]
    }
    return "User"
  }

  const handleLogout = () => {
    logout()
    if (mobile && onClose) {
      onClose()
    }
  }

  const handleMenuClick = (key) => {
    if (onNavigate) {
      onNavigate(key)
    }
    if (mobile && onClose) {
      onClose()
    }
  }

  return (
    <div className="sidebar-coral h-100 text-white d-flex flex-column">
      {/* Mobile Close Button */}
      {mobile && (
        <div className="d-flex justify-content-end p-3">
          <Button variant="link" className="text-white p-0" onClick={onClose}>
            <X size={24} />
          </Button>
        </div>
      )}

      {/* User Profile Section */}
      <div className="p-4 border-bottom border-light border-opacity-25">
        <div className="d-flex align-items-center">
          <div className="user-avatar rounded-circle me-3">{getUserInitials()}</div>
          <div className="flex-grow-1">
            <h6 className="mb-0 fw-semibold text-white">{getUserDisplayName()}</h6>
            <small className="text-white-50 d-block text-truncate" style={{ maxWidth: "150px" }}>
              {user?.email || "Loading..."}
            </small>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <Nav className="flex-column flex-grow-1 py-3">
        {menuItems.map((item, index) => (
          <Nav.Link
            key={index}
            className={`sidebar-item d-flex align-items-center px-4 py-3 text-white text-decoration-none ${
              activeView === item.key ? "active" : ""
            }`}
            href="#"
            onClick={(e) => {
              e.preventDefault()
              handleMenuClick(item.key)
            }}
          >
            <item.icon size={20} className="me-3 nav-icon" />
            <span>{item.label}</span>
          </Nav.Link>
        ))}
      </Nav>

      {/* Logout Button */}
      <div className="p-3 border-top border-light border-opacity-25">
        <Nav.Link
          onClick={(e) => {
            e.preventDefault()
            handleLogout()
          }}
          className="sidebar-item d-flex align-items-center px-4 py-3 rounded text-white text-decoration-none"
          href="#"
        >
          <LogOut size={20} className="me-3 nav-icon" />
          <span>Logout</span>
        </Nav.Link>
      </div>
    </div>
  )
}

export default Sidebar
