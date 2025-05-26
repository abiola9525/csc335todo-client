"use client"

import { useState } from "react"
import Sidebar from "./Sidebar"
import MainContent from "./MainContent"
import TaskCategories from "../categories/TaskCategories"
import MyTasks from "../todos/MyTasks"
import TaskDetail from "../todos/TaskDetail"
import { Row, Col, Button } from "react-bootstrap"
import { Menu } from "lucide-react"
import VitalTasks from "../todos/VitalTasks"

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState("dashboard")
  const [selectedTask, setSelectedTask] = useState(null)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleNavigate = (view) => {
    setCurrentView(view)
    setSelectedTask(null)
  }

  const handleGoBack = () => {
    if (selectedTask) {
      setSelectedTask(null)
      setCurrentView("my-task")
    } else {
      setCurrentView("dashboard")
    }
  }

  const handleViewTask = (task) => {
    setSelectedTask(task)
    setCurrentView("task-detail")
  }

  const handleTaskUpdated = (updatedTask) => {
    setSelectedTask(updatedTask)
  }

  const getPageTitle = () => {
    switch (currentView) {
      case "task-categories":
        return "Task Categories"
      case "my-task":
        return "My Tasks"
      case "vital-task":
        return "Vital Tasks"
      case "task-detail":
        return selectedTask?.title || "Task Detail"
      case "dashboard":
      default:
        return "Dashboard"
    }
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "task-categories":
        return <TaskCategories onGoBack={handleGoBack} />
      case "my-task":
        return <MyTasks onGoBack={handleGoBack} onViewTask={handleViewTask} />
      case "vital-task":
        return <VitalTasks onGoBack={handleGoBack} onViewTask={handleViewTask} />
      case "task-detail":
        return <TaskDetail task={selectedTask} onGoBack={handleGoBack} onTaskUpdated={handleTaskUpdated} />
      case "dashboard":
      default:
        return <MainContent />
    }
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
          <Sidebar onNavigate={handleNavigate} activeView={currentView} />
        </Col>

        {/* Mobile Sidebar */}
        <div className={`sidebar-mobile sidebar-coral ${sidebarOpen ? "show" : ""}`}>
          <Sidebar mobile onClose={toggleSidebar} onNavigate={handleNavigate} activeView={currentView} />
        </div>

        {/* Main Content */}
        <Col md={9} lg={10} className="main-content">
          {renderCurrentView()}
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
