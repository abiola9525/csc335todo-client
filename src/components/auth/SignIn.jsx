"use client"

import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from "react-bootstrap"

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const successMessage = location.state?.message

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await login(formData)

    if (result.success) {
      navigate("/dashboard")
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="min-vh-100 bg-gradient-coral d-flex align-items-center justify-content-center p-4">
      <Container>
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
              <Row className="g-0">
                {/* Left side - Form */}
                <Col lg={6}>
                  <Card.Body className="p-5">
                    <div className="text-center mb-4">
                      <div className="mb-3">
                        <h1 className="fw-bold mb-0" style={{ fontSize: "2.5rem" }}>
                          <span style={{ color: "#ff6b6b" }}>Task</span>
                          <span style={{ color: "#ff8e8e" }}>Nest</span>
                        </h1>
                      </div>
                      <h2 className="fw-bold text-dark mb-0">Sign In</h2>
                    </div>

                    {successMessage && <Alert variant="success">{successMessage}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <InputGroup>
                          <InputGroup.Text>
                            <Mail size={18} className="text-muted" />
                          </InputGroup.Text>
                          <Form.Control
                            type="email"
                            name="email"
                            placeholder="Enter Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </InputGroup>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <InputGroup>
                          <InputGroup.Text>
                            <Lock size={18} className="text-muted" />
                          </InputGroup.Text>
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Enter Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                          <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </Button>
                        </InputGroup>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Check
                          type="checkbox"
                          id="rememberMe"
                          label="Remember Me"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                      </Form.Group>

                      <Button type="submit" className="btn-coral w-100 py-2 fw-semibold mb-4" disabled={loading}>
                        {loading ? "Signing In..." : "Login"}
                      </Button>
                    </Form>

                    <div className="text-center mb-4">
                      <p className="text-muted mb-3">Or, Login with</p>
                      <div className="d-flex justify-content-center gap-3">
                        <Button variant="primary" className="rounded-circle" style={{ width: "40px", height: "40px" }}>
                          f
                        </Button>
                        <Button variant="danger" className="rounded-circle" style={{ width: "40px", height: "40px" }}>
                          G
                        </Button>
                        <Button variant="dark" className="rounded-circle" style={{ width: "40px", height: "40px" }}>
                          X
                        </Button>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-muted mb-0">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-coral text-decoration-none fw-semibold">
                          Create One
                        </Link>
                      </p>
                    </div>
                  </Card.Body>
                </Col>

                {/* Right side - Illustration */}
                <Col
                  lg={6}
                  className="d-none d-lg-flex bg-gradient-coral align-items-center justify-content-center p-5"
                >
                  <img src="https://res.cloudinary.com/ddcynxxlr/image/upload/v1748176131/ach3_1_jnshqr.png" alt="Sign in illustration" className="img-fluid" />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default SignIn
