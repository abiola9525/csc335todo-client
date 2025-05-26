"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from "react-bootstrap"

const SignUp = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    user_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!agreeToTerms) {
      setError("Please agree to the terms and conditions")
      return
    }

    setLoading(true)

    const { confirmPassword, ...registerData } = formData
    const result = await register(registerData)

    if (result.success) {
      navigate("/signin", {
        state: { message: "Registration successful! Please sign in." },
      })
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
                {/* Left side - Illustration */}
                <Col
                  lg={6}
                  className="d-none d-lg-flex bg-gradient-coral align-items-center justify-content-center p-5"
                >
                  <img src="https://res.cloudinary.com/ddcynxxlr/image/upload/v1748175887/R_2_zyjfxj.png" alt="Sign up illustration" className="img-fluid" />
                </Col>

                {/* Right side - Form */}
                <Col lg={6}>
                  <Card.Body className="p-5">
                    <div className="text-center mb-4">
                      <h2 className="fw-bold text-dark mb-0">Sign Up</h2>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <InputGroup>
                              <InputGroup.Text>
                                <User size={18} className="text-muted" />
                              </InputGroup.Text>
                              <Form.Control
                                type="text"
                                name="first_name"
                                placeholder="Enter First Name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                              />
                            </InputGroup>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <InputGroup>
                              <InputGroup.Text>
                                <User size={18} className="text-muted" />
                              </InputGroup.Text>
                              <Form.Control
                                type="text"
                                name="last_name"
                                placeholder="Enter Last Name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                              />
                            </InputGroup>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <InputGroup>
                          <InputGroup.Text>
                            <User size={18} className="text-muted" />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="user_name"
                            placeholder="Enter Username"
                            value={formData.user_name}
                            onChange={handleChange}
                            required
                          />
                        </InputGroup>
                      </Form.Group>

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

                      <Form.Group className="mb-3">
                        <InputGroup>
                          <InputGroup.Text>
                            <Lock size={18} className="text-muted" />
                          </InputGroup.Text>
                          <Form.Control
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                          />
                          <Button
                            variant="outline-secondary"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </Button>
                        </InputGroup>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Check
                          type="checkbox"
                          id="agreeToTerms"
                          label="I agree to all terms"
                          checked={agreeToTerms}
                          onChange={(e) => setAgreeToTerms(e.target.checked)}
                        />
                      </Form.Group>

                      <Button type="submit" className="btn-coral w-100 py-2 fw-semibold" disabled={loading}>
                        {loading ? "Registering..." : "Register"}
                      </Button>
                    </Form>

                    <div className="text-center mt-4">
                      <p className="text-muted mb-0">
                        Already have an account?{" "}
                        <Link to="/signin" className="text-coral text-decoration-none fw-semibold">
                          Sign In
                        </Link>
                      </p>
                    </div>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default SignUp
