// Utility functions for handling image URLs

const API_BASE_URL = "http://127.0.0.1:8000"
// const API_BASE_URL = "https://api-csc335todo.up.railway.app"

/**
 * Converts a relative image path to a full URL
 * @param {string} imagePath - The relative image path from the API
 * @returns {string} - The full image URL
 */
export const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null

  // If it's already a full URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath
  }

  // If it's a blob URL (for newly uploaded images), return as is
  if (imagePath.startsWith("blob:")) {
    return imagePath
  }

  // Remove leading slash if present and construct full URL
  const cleanPath = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath
  return `${API_BASE_URL}/${cleanPath}`
}

/**
 * Gets the image URL or returns a placeholder
 * @param {string} imagePath - The relative image path from the API
 * @param {number} width - Placeholder width
 * @param {number} height - Placeholder height
 * @returns {string} - The full image URL or placeholder
 */
export const getImageUrlOrPlaceholder = (imagePath, width = 300, height = 200) => {
  const fullUrl = getFullImageUrl(imagePath)
  return fullUrl || `/placeholder.svg?height=${height}&width=${width}`
}
