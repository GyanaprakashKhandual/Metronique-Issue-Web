# Bug Tracker File Upload API Documentation

## API Overview

**API Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api/v1`  
**Description:** Complete File Upload Management API with single/multiple file uploads, deletion, filtering, and statistics

### Contact Information
- **Name:** API Support
- **Email:** support@bugtracker.com
- **Website:** https://bugtracker.com

---

## Authentication

All endpoints require JWT Bearer token authentication.

### Authentication Details
- **Type:** Bearer Token (JWT)
- **Scheme:** JWT
- **Header Name:** Authorization
- **Format:** `Authorization: Bearer {token}`
- **Example Token:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MGQ1ZWM0OWMxMjM0NTY3ODkwYWJjMTIiLCJpYXQiOjE2MjQ3NzY3NzcsImV4cCI6MTYyNDg2MzE3N30.abc123`

---

## File Constraints

### Size and Quantity Limits

| Constraint | Value | Details |
|-----------|-------|---------|
| Max File Size | 50 MB | 52,428,800 bytes |
| Max Files (Single Request) | 10 files | For multiple uploads |
| Total Storage Per User | Unlimited | Governed by server capacity |

### Supported File Types

| Category | MIME Types | Extensions |
|----------|-----------|-----------|
| **Image** | image/jpeg, image/png, image/gif, image/webp | jpg, jpeg, png, gif, webp |
| **Video** | video/mp4, video/mpeg, video/quicktime | mp4, mpeg, mov |
| **Document** | application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/plain, application/zip, application/x-rar-compressed | pdf, doc, docx, xls, xlsx, txt, zip, rar |

### Allowed MIME Types (Complete List)

```
image/jpeg
image/png
image/gif
image/webp
video/mp4
video/mpeg
video/quicktime
application/pdf
application/msword
application/vnd.openxmlformats-officedocument.wordprocessingml.document
application/vnd.ms-excel
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
text/plain
application/zip
application/x-rar-compressed
```

---

## Error Responses

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 400 | Bad Request | No file uploaded or validation error |
| 401 | Unauthorized | Missing or invalid authentication token |
| 404 | Not Found | File or resource not found |
| 413 | Payload Too Large | File size exceeds 50MB limit |
| 415 | Unsupported Media Type | File type not allowed |
| 500 | Internal Server Error | Server error during upload/deletion |

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "Additional error details"
}
```

---

# API Endpoints

## 1. Upload Single File

Upload a single file to the server.

**Endpoint:** `POST /files/upload`

**URL:** `http://localhost:5000/api/v1/files/upload`

**Authentication:** ✅ Required (Bearer Token)

**Content-Type:** `multipart/form-data`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | ✅ Yes | File to upload (max 50MB) |

**Accepted File Types:**

- Images: *.jpg, *.jpeg, *.png, *.gif, *.webp
- Videos: *.mp4, *.mpeg, *.mov
- Documents: *.pdf, *.doc, *.docx, *.xls, *.xlsx, *.txt, *.zip, *.rar

**Success Response (201):**

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": "60d5ec49c1234567890abc20",
    "filename": "document.pdf",
    "uploadedFilename": "1705330200000_document.pdf",
    "fileUrl": "http://localhost:5000/uploads/1705330200000_document.pdf",
    "mimeType": "application/pdf",
    "fileType": "document",
    "size": 2048576,
    "sizeFormatted": "2.0 MB",
    "uploadedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique file ID for later retrieval/deletion |
| filename | string | Original filename provided by user |
| uploadedFilename | string | Server-generated filename with timestamp |
| fileUrl | string | URL to access the uploaded file |
| mimeType | string | MIME type of the file |
| fileType | string | Category: image, video, or document |
| size | number | File size in bytes |
| sizeFormatted | string | Human-readable file size (e.g., "2.0 MB") |
| uploadedAt | string | ISO timestamp of upload |

**Error Response (400):**

```json
{
  "success": false,
  "message": "No file uploaded"
}
```

**Error Response (413):**

```json
{
  "success": false,
  "message": "File size exceeds maximum limit of 50MB"
}
```

**Error Response (415):**

```json
{
  "success": false,
  "message": "File type not allowed. Allowed types: jpg, jpeg, png, gif, webp, mp4, mpeg, mov, pdf, doc, docx, xls, xlsx, txt, zip, rar"
}
```

**Use Cases:**

1. **Upload PDF Document**
   - Filename: project_requirements.pdf
   - Size: 1.5 MB
   - Type: application/pdf
   - Outcome: PDF uploaded successfully, accessible via URL

2. **Upload Screenshot Image**
   - Filename: bug_screenshot.png
   - Size: 512 KB
   - Type: image/png
   - Outcome: Image uploaded, accessible for display

3. **Upload Video Recording**
   - Filename: bug_recording.mp4
   - Size: 25 MB
   - Type: video/mp4
   - Outcome: Video uploaded successfully

---

## 2. Upload Multiple Files

Upload up to 10 files at once.

**Endpoint:** `POST /files/upload-multiple`

**URL:** `http://localhost:5000/api/v1/files/upload-multiple`

**Authentication:** ✅ Required (Bearer Token)

**Content-Type:** `multipart/form-data`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| files | file[] | ✅ Yes | Files to upload (max 10 files, 50MB each) |

**Success Response (201):**

```json
{
  "success": true,
  "message": "3 file(s) uploaded successfully",
  "data": [
    {
      "id": "60d5ec49c1234567890abc20",
      "filename": "image1.jpg",
      "uploadedFilename": "1705330200000_image1.jpg",
      "fileUrl": "http://localhost:5000/uploads/1705330200000_image1.jpg",
      "mimeType": "image/jpeg",
      "fileType": "image",
      "size": 1024000,
      "sizeFormatted": "1.0 MB",
      "uploadedAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "60d5ec49c1234567890abc21",
      "filename": "image2.png",
      "uploadedFilename": "1705330200001_image2.png",
      "fileUrl": "http://localhost:5000/uploads/1705330200001_image2.png",
      "mimeType": "image/png",
      "fileType": "image",
      "size": 2048576,
      "sizeFormatted": "2.0 MB",
      "uploadedAt": "2024-01-15T10:30:01Z"
    },
    {
      "id": "60d5ec49c1234567890abc22",
      "filename": "document.pdf",
      "uploadedFilename": "1705330200002_document.pdf",
      "fileUrl": "http://localhost:5000/uploads/1705330200002_document.pdf",
      "mimeType": "application/pdf",
      "fileType": "document",
      "size": 3072000,
      "sizeFormatted": "3.0 MB",
      "uploadedAt": "2024-01-15T10:30:02Z"
    }
  ]
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "No files could be uploaded"
}
```

**Use Cases:**

1. **Batch Upload Project Documentation**
   - Files: requirements.pdf, design.docx, implementation_guide.pdf
   - Outcome: All 3 files uploaded, accessible individually

2. **Upload Bug Evidence Bundle**
   - Files: screenshot1.png, screenshot2.png, error_log.txt, console_output.txt
   - Outcome: All files uploaded successfully, linked to bug report

---

## 3. Get All Files

Retrieve all files uploaded by the authenticated user.

**Endpoint:** `GET /files/files`

**URL:** `http://localhost:5000/api/v1/files/files`

**Authentication:** ✅ Required (Bearer Token)

**Query Parameters:** None

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49c1234567890abc20",
      "filename": "document.pdf",
      "uploadedFilename": "1705330200000_document.pdf",
      "fileUrl": "http://localhost:5000/uploads/1705330200000_document.pdf",
      "mimeType": "application/pdf",
      "fileType": "document",
      "size": 2048576,
      "sizeFormatted": "2.0 MB",
      "userId": "60d5ec49c1234567890abc12",
      "uploadedAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    {
      "_id": "60d5ec49c1234567890abc21",
      "filename": "image.png",
      "uploadedFilename": "1705330200001_image.png",
      "fileUrl": "http://localhost:5000/uploads/1705330200001_image.png",
      "mimeType": "image/png",
      "fileType": "image",
      "size": 1024000,
      "sizeFormatted": "1.0 MB",
      "userId": "60d5ec49c1234567890abc12",
      "uploadedAt": "2024-01-15T10:45:00Z",
      "updatedAt": "2024-01-15T10:45:00Z"
    }
  ],
  "count": 2
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Request success status |
| data | array | Array of file objects |
| count | number | Total number of files retrieved |

---

## 4. Get Files by Type

Retrieve files of a specific type (image, video, or document).

**Endpoint:** `GET /files/files/type/:fileType`

**URL:** `http://localhost:5000/api/v1/files/files/type/:fileType`

**Authentication:** ✅ Required (Bearer Token)

**Path Parameters:**

| Parameter | Type | Required | Values | Description |
|-----------|------|----------|--------|-------------|
| fileType | string | ✅ Yes | image, video, document | File type to filter |

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49c1234567890abc20",
      "filename": "screenshot.png",
      "uploadedFilename": "1705330200000_screenshot.png",
      "fileUrl": "http://localhost:5000/uploads/1705330200000_screenshot.png",
      "mimeType": "image/png",
      "fileType": "image",
      "size": 1024000,
      "sizeFormatted": "1.0 MB",
      "uploadedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1,
  "fileType": "image"
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Invalid file type. Allowed types: image, video, document"
}
```

**Use Cases:**

1. **Get All Images**
   - Parameter: image
   - Outcome: List of all uploaded image files with URLs

2. **Get All Documents**
   - Parameter: document
   - Outcome: List of all PDF, Word, Excel files

3. **Get All Videos**
   - Parameter: video
   - Outcome: List of all video files

---

## 5. Delete Single File

Delete a specific file by ID.

**Endpoint:** `DELETE /files/delete/:fileId`

**URL:** `http://localhost:5000/api/v1/files/delete/:fileId`

**Authentication:** ✅ Required (Bearer Token)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| fileId | string | ✅ Yes | File ID to delete |

**Success Response (200):**

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "File not found"
}
```

**Use Cases:**

1. **Delete Outdated Document**
   - File ID: 60d5ec49c1234567890abc20
   - Outcome: File and associated metadata removed from server

---

## 6. Delete Multiple Files

Delete multiple files at once.

**Endpoint:** `POST /files/delete-multiple`

**URL:** `http://localhost:5000/api/v1/files/delete-multiple`

**Authentication:** ✅ Required (Bearer Token)

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "fileIds": [
    "60d5ec49c1234567890abc20",
    "60d5ec49c1234567890abc21",
    "60d5ec49c1234567890abc22"
  ]
}
```

**Request Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fileIds | array | ✅ Yes | Array of file IDs to delete (min 1) |

**Success Response (200):**

```json
{
  "success": true,
  "message": "3 file(s) deleted successfully"
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Please provide file IDs"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "No files found"
}
```

**Use Cases:**

1. **Clean Up Old Files**
   - File IDs: [60d5ec49c1234567890abc20, 60d5ec49c1234567890abc21]
   - Outcome: Both files removed from storage and database

---

## 7. Get File Statistics

Retrieve statistics about uploaded files.

**Endpoint:** `GET /files/stats`

**URL:** `http://localhost:5000/api/v1/files/stats`

**Authentication:** ✅ Required (Bearer Token)

**Query Parameters:** None

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "totalFiles": 15,
    "totalSize": 157286400,
    "totalSizeFormatted": "150.0 MB",
    "byType": {
      "image": {
        "count": 8,
        "size": 52428800,
        "sizeFormatted": "50.0 MB"
      },
      "video": {
        "count": 3,
        "size": 83886080,
        "sizeFormatted": "80.0 MB"
      },
      "document": {
        "count": 4,
        "size": 20971520,
        "sizeFormatted": "20.0 MB"
      }
    }
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| totalFiles | number | Total number of uploaded files |
| totalSize | number | Total size in bytes |
| totalSizeFormatted | string | Total size in human-readable format |
| byType | object | Statistics broken down by file type |

**Use Cases:**

1. **Monitor Storage Usage**
   - Outcome: Displays total files, total storage used, and breakdown by type

2. **Storage Quota Analysis**
   - Outcome: Shows storage breakdown by file type for quota planning

---

## Response Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Successful GET, DELETE request |
| 201 | Created | Successful POST file upload |
| 400 | Bad Request | Validation error or missing fields |
| 401 | Unauthorized | Missing or invalid token |
| 404 | Not Found | File not found |
| 413 | Payload Too Large | File size exceeds 50MB limit |
| 415 | Unsupported Media Type | File type not allowed |
| 500 | Internal Server Error | Server error |

---

## Request/Response Examples

### cURL Examples

**Upload Single File:**
```bash
curl -X POST http://localhost:5000/api/v1/files/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/document.pdf"
```

**Upload Multiple Files:**
```bash
curl -X POST http://localhost:5000/api/v1/files/upload-multiple \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.png" \
  -F "files=@/path/to/document.pdf"
```

**Get All Files:**
```bash
curl -X GET http://localhost:5000/api/v1/files/files \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Get Files by Type:**
```bash
curl -X GET http://localhost:5000/api/v1/files/files/type/image \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Delete File:**
```bash
curl -X DELETE http://localhost:5000/api/v1/files/delete/60d5ec49c1234567890abc20 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Delete Multiple Files:**
```bash
curl -X POST http://localhost:5000/api/v1/files/delete-multiple \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileIds": ["60d5ec49c1234567890abc20", "60d5ec49c1234567890abc21"]
  }'
```

**Get File Statistics:**
```bash
curl -X GET http://localhost:5000/api/v1/files/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## JavaScript/Fetch Examples

**Upload Single File:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:5000/api/v1/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log('Upload successful:', data))
.catch(error => console.error('Upload failed:', error));
```

**Get All Files:**
```javascript
fetch('http://localhost:5000/api/v1/files/files', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
.then(response => response.json())
.then(data => console.log('Files:', data.data))
.catch(error => console.error('Error:', error));
```

**Delete File:**
```javascript
fetch(`http://localhost:5000/api/v1/files/delete/${fileId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
.then(response => response.json())
.then(data => console.log('Deleted:', data.message))
.catch(error => console.error('Error:', error));
```

---

## Security Best Practices

1. **File Validation:**
   - Always validate file types on client side before upload
   - Check file size before sending to server
   - Use only whitelisted MIME types
   - Never trust filename extensions

2. **Upload Handling:**
   - Use multipart/form-data for file uploads
   - Implement progress tracking for large files
   - Retry failed uploads automatically
   - Validate response before using file URL

3. **Storage Management:**
   - Monitor storage usage regularly
   - Delete unused files to maintain storage
   - Archive old files periodically
   - Keep organized folder structure

4. **Access Control:**
   - Always include valid authentication token
   - Users can only access their own files
   - Implement proper authorization checks
   - Log all file operations

---

## File Type Handling

### Image Files
- **Use Cases:** Screenshots, bug evidence, profile pictures
- **Recommended:** PNG or JPEG for best quality
- **Sizes:** Keep under 5MB for faster loading

### Video Files
- **Use Cases:** Screen recordings, bug demonstrations
- **Recommended:** MP4 format for compatibility
- **Sizes:** Can be large, consider compression

### Document Files
- **Use Cases:** Requirements, specifications, logs
- **Recommended:** PDF for preservation, Office formats for editing
- **Sizes:** Usually small, suitable for long-term storage

---

## Rate Limiting

- **Standard Limit:** 100 requests per 15 minutes per IP
- **Upload Limit:** 50 uploads per hour per user
- **Delete Limit:** No specific limit on deletions
- **Get Requests:** Standard rate limiting applies

---

## File URL Persistence

- **Accessibility:** Files remain accessible via URL after upload
- **Availability:** URLs are permanent for the file lifetime
- **Download:** Direct URL access supported for all file types
- **Sharing:** URLs can be shared with other users

---

## Versioning

- **Current Version:** 1.0.0
- **Base URL:** `/api/v1`
- **Deprecation:** None at this time

---

## Support

For API support, contact:
- **Email:** support@bugtracker.com
- **Documentation:** https://bugtracker.com/docs
- **Issues:** Report via support dashboard

---

**Last Updated:** January 2024  
**API Status:** Active and Production Ready