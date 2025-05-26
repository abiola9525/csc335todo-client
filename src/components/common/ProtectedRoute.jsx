"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Container, Spinner } from "react-bootstrap"

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <Container className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="danger" />
      </Container>
    )
  }

  return isAuthenticated ? children : <Navigate to="/signin" />
}

export default ProtectedRoute
