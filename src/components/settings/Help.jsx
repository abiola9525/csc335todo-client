"use client"

import { useNavigate } from "react-router-dom"
import { Container, Row, Col, Card, Button } from "react-bootstrap"
import { ArrowLeft, HelpCircle } from "lucide-react"

const Help = () => {
  const navigate = useNavigate()

  return (
    <Container fluid className="p-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <Button variant="link" className="text-coral p-0 me-3" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h3 className="fw-bold text-dark mb-0 d-flex align-items-center">
                  <HelpCircle size={24} className="text-coral me-2" />
                  Help & Support
                </h3>
                <small className="text-muted">Get help and find answers to your questions</small>
              </div>
            </div>
            <Button variant="link" className="text-muted text-decoration-none" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </Col>
      </Row>

      {/* Help Content */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5">
              <HelpCircle size={64} className="text-muted mb-4" />
              <h4 className="text-dark mb-3">Help & Support</h4>
              <p className="text-muted mb-4">
                Documentation and support resources are being prepared. This section will include comprehensive guides
                and FAQs.
              </p>
              <div className="text-muted">
                <h6>Coming Soon:</h6>
                <ul className="list-unstyled">
                  <li>• User Guide & Tutorials</li>
                  <li>• Frequently Asked Questions</li>
                  <li>• Video Tutorials</li>
                  <li>• Contact Support</li>
                  <li>• Feature Requests</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Help
