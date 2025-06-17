import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/common/ProtectedRoute"
import SignUp from "./components/auth/SignUp"
import SignIn from "./components/auth/SignIn"
import Layout from "./components/layout/Layout"
import Dashboard from "./components/dashboard/Dashboard"
import VitalTasks from "./components/todos/VitalTasks"
import MyTasks from "./components/todos/MyTasks"
import ScheduleEvent from "./components/events/ScheduleEvent"
import TaskCategories from "./components/categories/TaskCategories"
import Settings from "./components/settings/Settings"
import Help from "./components/settings/Help"
import TaskDetail from "./components/todos/TaskDetail"
import "./App.css"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />

            {/* Protected Routes with Layout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/vital-tasks" element={<VitalTasks />} />
                      <Route path="/my-tasks" element={<MyTasks />} />
                      <Route path="/schedule-event" element={<ScheduleEvent />} />
                      <Route path="/task-categories" element={<TaskCategories />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/help" element={<Help />} />
                      <Route path="/task/:id" element={<TaskDetail />} />
                      <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
