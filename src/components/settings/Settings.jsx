"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button, Nav, Tab, Form, Alert, Modal, Spinner } from "react-bootstrap"
import {
  User,
  Lock,
  Bell,
  Palette,
  Shield,
  SettingsIcon,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Download,
  Moon,
  Sun,
  Camera,
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import api from "../../services/api"
import { getFullImageUrl } from "../../utils/imageUtils"

const Settings = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", type: "" })

  // Profile state matching API response
  const [profile, setProfile] = useState({
    id: null,
    email: "",
    first_name: "",
    last_name: "",
    user_name: "",
    phone: "",
    position: "",
    image: null,
    is_user: false,
    is_active: false,
    is_admin: false,
  })
  const [editingProfile, setEditingProfile] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // Password state
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      email_notifications: true,
      push_notifications: true,
      task_reminders: true,
      event_alerts: true,
    },
    appearance: {
      theme: "light",
      color_scheme: "coral",
      font_size: "medium",
    },
    privacy: {
      profile_visibility: "private",
      data_sharing: false,
    },
  })

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deletePassword, setDeletePassword] = useState("")

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get("/account/")
      setProfile(response.data)

      // Use imageUtils to get the full image URL
      if (response.data.image) {
        const fullImageUrl = getFullImageUrl(response.data.image)
        setImagePreview(fullImageUrl)
      }
    } catch (error) {
      showAlert("Failed to fetch profile data", "danger")
    } finally {
      setLoading(false)
    }
  }

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 5000)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        showAlert("Image size should be less than 5MB", "danger")
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result) // This will be a blob URL for preview
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileUpdate = async () => {
    try {
      setLoading(true)

      // Create FormData for file upload
      const formData = new FormData()
      formData.append("first_name", profile.first_name || "")
      formData.append("last_name", profile.last_name || "")
      formData.append("user_name", profile.user_name || "")
      formData.append("phone", profile.phone || "")
      formData.append("position", profile.position || "")

      if (imageFile) {
        formData.append("image", imageFile)
      }

      await api.put("/account/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setEditingProfile(false)
      setImageFile(null)
      showAlert("Profile updated successfully!", "success")
      fetchUserProfile() // Refresh profile data
    } catch (error) {
      showAlert("Failed to update profile", "danger")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      showAlert("New passwords do not match", "danger")
      return
    }

    if (passwordData.new_password.length < 8) {
      showAlert("Password must be at least 8 characters long", "danger")
      return
    }

    try {
      setLoading(true)
      await api.post("/account/change-password/", {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      })
      setPasswordData({ old_password: "", new_password: "", confirm_password: "" })
      showAlert("Password changed successfully!", "success")
    } catch (error) {
      showAlert("Failed to change password. Please check your current password.", "danger")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      showAlert("Please type DELETE to confirm account deletion", "danger")
      return
    }

    if (!deletePassword) {
      showAlert("Password is required to delete account", "danger")
      return
    }

    try {
      setLoading(true)
      await api.post("/account/deactivate-user/", {
        password: deletePassword,
      })
      showAlert("Account deleted successfully. You will be logged out.", "success")
      setTimeout(() => {
        logout()
      }, 2000)
    } catch (error) {
      showAlert("Failed to delete account. Please check your password.", "danger")
    } finally {
      setLoading(false)
      setShowDeleteModal(false)
      setDeletePassword("")
      setDeleteConfirmText("")
    }
  }

  const exportUserData = async () => {
    try {
      setLoading(true)
      showAlert("Data export initiated. You will receive an email with your data.", "info")
    } catch (error) {
      showAlert("Failed to export data", "danger")
    } finally {
      setLoading(false)
    }
  }

  const getUserInitials = () => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase()
    }
    if (profile.user_name) {
      return profile.user_name.charAt(0).toUpperCase()
    }
    return profile.email ? profile.email.charAt(0).toUpperCase() : "U"
  }

  const getUserDisplayName = () => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    if (profile.user_name) {
      return profile.user_name
    }
    return profile.email
  }

  // Get profile image URL using imageUtils
  const getProfileImageUrl = () => {
    if (imagePreview) {
      // If we have a preview (either blob URL or full URL), return it
      return imagePreview
    }
    if (profile.image) {
      // Use imageUtils to get the full URL
      return getFullImageUrl(profile.image)
    }
    return null
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center">
            <SettingsIcon size={28} className="text-coral me-3" />
            <div>
              <h2 className="fw-bold mb-0">Settings</h2>
              <p className="text-muted mb-0">Manage your account and preferences</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Alert */}
      {alert.show && (
        <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false, message: "", type: "" })}>
          {alert.message}
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Row>
          <Col lg={3} className="mb-4">
            <Card className="shadow-sm">
              <Card.Body className="p-0">
                <Nav variant="pills" className="settings-nav flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="profile" className="d-flex align-items-center px-4 py-3 border-0">
                      <User size={18} className="me-3" />
                      Profile
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="security" className="d-flex align-items-center px-4 py-3 border-0">
                      <Lock size={18} className="me-3" />
                      Security
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="notifications" className="d-flex align-items-center px-4 py-3 border-0">
                      <Bell size={18} className="me-3" />
                      Notifications
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="appearance" className="d-flex align-items-center px-4 py-3 border-0">
                      <Palette size={18} className="me-3" />
                      Appearance
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="privacy" className="d-flex align-items-center px-4 py-3 border-0">
                      <Shield size={18} className="me-3" />
                      Privacy & Data
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={9}>
            <Tab.Content>
              {/* Profile Tab */}
              <Tab.Pane eventKey="profile">
                <Card className="shadow-sm">
                  <Card.Header className="bg-white border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Profile Information</h5>
                      <Button
                        variant={editingProfile ? "outline-secondary" : "coral"}
                        size="sm"
                        onClick={() => setEditingProfile(!editingProfile)}
                      >
                        {editingProfile ? <X size={16} /> : <Edit3 size={16} />}
                        {editingProfile ? " Cancel" : " Edit"}
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={4} className="text-center mb-4">
                        <div className="profile-image-container position-relative mx-auto mb-3">
                          {getProfileImageUrl() ? (
                            <img
                              src={getProfileImageUrl() || "/placeholder.svg"}
                              alt="Profile"
                              className="profile-image"
                              onError={(e) => {
                                // Fallback to avatar if image fails to load
                                e.target.style.display = "none"
                                e.target.nextSibling.style.display = "flex"
                              }}
                            />
                          ) : null}
                          {!getProfileImageUrl() && <div className="profile-avatar">{getUserInitials()}</div>}
                          {/* Hidden fallback avatar */}
                          <div className="profile-avatar" style={{ display: "none" }}>
                            {getUserInitials()}
                          </div>
                          {editingProfile && (
                            <div className="profile-image-overlay">
                              <label htmlFor="image-upload" className="btn btn-coral btn-sm">
                                <Camera size={16} />
                              </label>
                              <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="d-none"
                              />
                            </div>
                          )}
                        </div>
                        <h6 className="mb-0">{getUserDisplayName()}</h6>
                        <small className="text-muted">{profile.email}</small>
                        {profile.position && (
                          <div className="mt-1">
                            <small className="badge bg-light text-dark">{profile.position}</small>
                          </div>
                        )}
                        <div className="mt-2">
                          {profile.is_admin && <span className="badge bg-danger me-1">Admin</span>}
                          {profile.is_active && <span className="badge bg-success me-1">Active</span>}
                        </div>
                      </Col>
                      <Col md={8}>
                        <Form>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={profile.first_name || ""}
                                  onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                                  disabled={!editingProfile}
                                  maxLength={50}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={profile.last_name || ""}
                                  onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                                  disabled={!editingProfile}
                                  maxLength={50}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                              type="text"
                              value={profile.user_name || ""}
                              onChange={(e) => setProfile({ ...profile, user_name: e.target.value })}
                              disabled={!editingProfile}
                              maxLength={50}
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" value={profile.email || ""} disabled className="bg-light" />
                            <Form.Text className="text-muted">Email cannot be changed</Form.Text>
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control
                              type="tel"
                              value={profile.phone || ""}
                              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                              disabled={!editingProfile}
                              maxLength={50}
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Position</Form.Label>
                            <Form.Control
                              type="text"
                              value={profile.position || ""}
                              onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                              disabled={!editingProfile}
                              maxLength={50}
                            />
                          </Form.Group>
                          {editingProfile && (
                            <Button variant="coral" onClick={handleProfileUpdate} disabled={loading}>
                              {loading ? <Spinner size="sm" className="me-2" /> : <Save size={16} className="me-2" />}
                              Save Changes
                            </Button>
                          )}
                        </Form>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Security Tab */}
              <Tab.Pane eventKey="security">
                <Row>
                  <Col md={8}>
                    <Card className="shadow-sm mb-4">
                      <Card.Header className="bg-white border-bottom">
                        <h5 className="mb-0">Change Password</h5>
                      </Card.Header>
                      <Card.Body>
                        <Form>
                          <Form.Group className="mb-3">
                            <Form.Label>Old Password</Form.Label>
                            <div className="position-relative">
                              <Form.Control
                                type={showPasswords.current ? "text" : "password"}
                                value={passwordData.old_password}
                                onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                              />
                              <Button
                                variant="link"
                                className="position-absolute end-0 top-50 translate-middle-y border-0 password-toggle"
                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                              >
                                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                              </Button>
                            </div>
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>New Password</Form.Label>
                            <div className="position-relative">
                              <Form.Control
                                type={showPasswords.new ? "text" : "password"}
                                value={passwordData.new_password}
                                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                              />
                              <Button
                                variant="link"
                                className="position-absolute end-0 top-50 translate-middle-y border-0 password-toggle"
                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                              >
                                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                              </Button>
                            </div>
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Confirm New Password</Form.Label>
                            <div className="position-relative">
                              <Form.Control
                                type={showPasswords.confirm ? "text" : "password"}
                                value={passwordData.confirm_password}
                                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                              />
                              <Button
                                variant="link"
                                className="position-absolute end-0 top-50 translate-middle-y border-0 password-toggle"
                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                              >
                                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                              </Button>
                            </div>
                          </Form.Group>
                          <Button variant="coral" onClick={handlePasswordChange} disabled={loading}>
                            {loading ? <Spinner size="sm" className="me-2" /> : <Lock size={16} className="me-2" />}
                            Change Password
                          </Button>
                        </Form>
                      </Card.Body>
                    </Card>

                    <Card className="shadow-sm border-danger">
                      <Card.Header className="bg-danger text-white">
                        <h5 className="mb-0">Danger Zone</h5>
                      </Card.Header>
                      <Card.Body>
                        <h6>Delete Account</h6>
                        <p className="text-muted mb-3">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <Button variant="outline-danger" onClick={() => setShowDeleteModal(true)}>
                          <Trash2 size={16} className="me-2" />
                          Delete Account
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Notifications Tab */}
              <Tab.Pane eventKey="notifications">
                <Card className="shadow-sm">
                  <Card.Header className="bg-white border-bottom">
                    <h5 className="mb-0">Notification Preferences</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <div className="mb-4">
                        <h6>Email Notifications</h6>
                        <Form.Check
                          type="switch"
                          id="email-notifications"
                          label="Receive email notifications"
                          checked={settings.notifications.email_notifications}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, email_notifications: e.target.checked },
                            })
                          }
                        />
                      </div>
                      <div className="mb-4">
                        <h6>Push Notifications</h6>
                        <Form.Check
                          type="switch"
                          id="push-notifications"
                          label="Enable push notifications"
                          checked={settings.notifications.push_notifications}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, push_notifications: e.target.checked },
                            })
                          }
                        />
                      </div>
                      <div className="mb-4">
                        <h6>Task Reminders</h6>
                        <Form.Check
                          type="switch"
                          id="task-reminders"
                          label="Get reminders for upcoming tasks"
                          checked={settings.notifications.task_reminders}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, task_reminders: e.target.checked },
                            })
                          }
                        />
                      </div>
                      <div className="mb-4">
                        <h6>Event Alerts</h6>
                        <Form.Check
                          type="switch"
                          id="event-alerts"
                          label="Receive alerts for calendar events"
                          checked={settings.notifications.event_alerts}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, event_alerts: e.target.checked },
                            })
                          }
                        />
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Appearance Tab */}
              <Tab.Pane eventKey="appearance">
                <Card className="shadow-sm">
                  <Card.Header className="bg-white border-bottom">
                    <h5 className="mb-0">Appearance Settings</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <div className="mb-4">
                        <h6>Theme</h6>
                        <div className="d-flex gap-3">
                          <Form.Check
                            type="radio"
                            id="theme-light"
                            name="theme"
                            label={
                              <>
                                <Sun size={16} className="me-2" />
                                Light
                              </>
                            }
                            checked={settings.appearance.theme === "light"}
                            onChange={() =>
                              setSettings({
                                ...settings,
                                appearance: { ...settings.appearance, theme: "light" },
                              })
                            }
                          />
                          <Form.Check
                            type="radio"
                            id="theme-dark"
                            name="theme"
                            label={
                              <>
                                <Moon size={16} className="me-2" />
                                Dark
                              </>
                            }
                            checked={settings.appearance.theme === "dark"}
                            onChange={() =>
                              setSettings({
                                ...settings,
                                appearance: { ...settings.appearance, theme: "dark" },
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <h6>Color Scheme</h6>
                        <Form.Select
                          value={settings.appearance.color_scheme}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              appearance: { ...settings.appearance, color_scheme: e.target.value },
                            })
                          }
                        >
                          <option value="coral">Coral (Default)</option>
                          <option value="blue">Blue</option>
                          <option value="green">Green</option>
                          <option value="purple">Purple</option>
                        </Form.Select>
                      </div>
                      <div className="mb-4">
                        <h6>Font Size</h6>
                        <Form.Select
                          value={settings.appearance.font_size}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              appearance: { ...settings.appearance, font_size: e.target.value },
                            })
                          }
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </Form.Select>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Privacy Tab */}
              <Tab.Pane eventKey="privacy">
                <Card className="shadow-sm">
                  <Card.Header className="bg-white border-bottom">
                    <h5 className="mb-0">Privacy & Data</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-4">
                      <h6>Profile Visibility</h6>
                      <Form.Select
                        value={settings.privacy.profile_visibility}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            privacy: { ...settings.privacy, profile_visibility: e.target.value },
                          })
                        }
                      >
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                      </Form.Select>
                    </div>
                    <div className="mb-4">
                      <h6>Data Sharing</h6>
                      <Form.Check
                        type="switch"
                        id="data-sharing"
                        label="Allow anonymous usage data collection"
                        checked={settings.privacy.data_sharing}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            privacy: { ...settings.privacy, data_sharing: e.target.checked },
                          })
                        }
                      />
                    </div>
                    <div className="mb-4">
                      <h6>Data Export</h6>
                      <p className="text-muted">Download a copy of your data</p>
                      <Button variant="outline-coral" onClick={exportUserData} disabled={loading}>
                        {loading ? <Spinner size="sm" className="me-2" /> : <Download size={16} className="me-2" />}
                        Export Data
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>

      {/* Delete Account Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-danger">Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <div
              className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center"
              style={{ width: "80px", height: "80px" }}
            >
              <Trash2 size={32} className="text-danger" />
            </div>
          </div>
          <h5 className="text-center mb-3">Are you absolutely sure?</h5>
          <p className="text-muted text-center mb-4">
            This action cannot be undone. This will permanently delete your account and remove all your data from our
            servers.
          </p>
          <Form.Group className="mb-3">
            <Form.Label>Enter your password to confirm:</Form.Label>
            <Form.Control
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Your password"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>
              Type <strong>DELETE</strong> to confirm:
            </Form.Label>
            <Form.Control
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            disabled={loading || deleteConfirmText !== "DELETE" || !deletePassword}
          >
            {loading ? <Spinner size="sm" className="me-2" /> : <Trash2 size={16} className="me-2" />}
            Delete Account
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Settings
