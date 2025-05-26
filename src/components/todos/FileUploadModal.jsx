"use client"

import { useState } from "react"
import { Modal, Form, Button, Alert, ProgressBar } from "react-bootstrap"
import { Upload, X, File } from "lucide-react"

const FileUploadModal = ({ show, onHide, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        setError("Only image files (JPEG, PNG, GIF, WebP) are allowed")
        return
      }

      setSelectedFile(file)
      setError("")

      // Create preview for images
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      // Create a synthetic event object
      const syntheticEvent = {
        target: {
          files: [file],
        },
      }
      handleFileSelect(syntheticEvent)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file")
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setError("")

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Simulate upload completion
      setTimeout(() => {
        setUploadProgress(100)
        const fileUrl = URL.createObjectURL(selectedFile)
        // Pass the actual file object along with URL and name
        onUpload(fileUrl, selectedFile.name, selectedFile)
        handleClose()
      }, 1000)
    } catch (err) {
      setError("Failed to upload file")
      console.error("Upload error:", err)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setPreview(null)
    setUploadProgress(0)
    setError("")
    setUploading(false)
    onHide()
  }

  const removeFile = () => {
    setSelectedFile(null)
    setPreview(null)
    setError("")
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Upload Task Image</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        {!selectedFile ? (
          <div className="text-center py-4">
            <div
              className="border-2 border-dashed border-secondary rounded p-4 mb-3 file-upload-zone"
              style={{ cursor: "pointer" }}
              onClick={() => document.getElementById("fileInput").click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Upload size={48} className="text-muted mb-3" />
              <p className="text-muted mb-2">Click to select an image or drag and drop</p>
              <small className="text-muted">Supports: JPEG, PNG, GIF, WebP (Max 5MB)</small>
            </div>
            <Form.Control
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
          </div>
        ) : (
          <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center">
                <File size={20} className="text-primary me-2" />
                <div>
                  <div className="fw-semibold">{selectedFile.name}</div>
                  <small className="text-muted">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</small>
                </div>
              </div>
              <Button variant="outline-danger" size="sm" onClick={removeFile}>
                <X size={16} />
              </Button>
            </div>

            {preview && (
              <div className="text-center mb-3">
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Preview"
                  className="img-fluid rounded"
                  style={{ maxHeight: "200px", objectFit: "cover" }}
                />
              </div>
            )}

            {uploading && (
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <small>Uploading...</small>
                  <small>{uploadProgress}%</small>
                </div>
                <ProgressBar now={uploadProgress} variant="success" />
              </div>
            )}
          </div>
        )}

        <div className="d-flex gap-2 justify-content-end">
          <Button variant="secondary" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button className="btn-coral" onClick={handleUpload} disabled={!selectedFile || uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default FileUploadModal
