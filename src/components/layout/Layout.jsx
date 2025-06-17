"use client"

import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import Sidebar from "../dashboard/Sidebar"
import { Row, Col, Button } from "react-bootstrap"
import { Menu } from "lucide-react"

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const location = useLocation()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const getPageTitle = () => {
    const path = location.pathname
    if (path === "/dashboard") return "Dashboard"
    if (path === "/vital-tasks") return "Vital Tasks"
    if (path === "/my-tasks") return "My Tasks"
    if (path === "/schedule-event") return "Schedule Event"
    if (path === "/task-categories") return "Task Categories"
    if (path === "/settings") return "Settings"
    if (path === "/help") return "Help"
    if (path.startsWith("/task/")) return "Task Detail"
    return "Dashboard"
  }

  return (
    <div className="vh-100 bg-light">
      {/* Mobile Header */}
      <div className="mobile-header d-md-none">
        <div className="d-flex align-items-center justify-content-between p-3">
          <Button variant="link" className="text-coral p-0" onClick={toggleSidebar}>
            <Menu size={24} />
          </Button>
          <h5 className="mb-0 fw-bold">{getPageTitle()}</h5>
          <div style={{ width: "24px" }}></div>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <div className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`} onClick={toggleSidebar}></div>

      <Row className="g-0 h-100">
        {/* Desktop Sidebar */}
        <Col md={3} lg={2} className="desktop-sidebar">
          <Sidebar />
        </Col>

        {/* Mobile Sidebar */}
        <div className={`sidebar-mobile sidebar-coral ${sidebarOpen ? "show" : ""}`}>
          <Sidebar mobile onClose={toggleSidebar} />
        </div>

        {/* Main Content */}
        <Col md={9} lg={10} className={`main-content ${!isMobile ? "main-content-with-sidebar" : ""}`}>
          {children}
        </Col>
      </Row>
    </div>
  )
}

export default Layout
