# REST API Reference: BIS Assistant

Base URL: `http://localhost:5000/api`

---

## Authentication Endpoints

### 1. Register User
`POST /api/auth/register`
```json
{
  "name": "Dr. Rajesh Sharma",
  "email": "rajesh@company.in",
  "password": "securepassword123",
  "role": "INDUSTRY_USER",
  "organization": "Apex Plastics Ltd"
}
```

### 2. Login User
`POST /api/auth/login`
```json
{
  "email": "admin@bis.gov.in",
  "password": "bisadmin123"
}
```

### 3. Current Profile
`GET /api/auth/me`
*Headers: `Authorization: Bearer <token>`*

---

## Chat & RAG Endpoints

### 1. Send Message
`POST /api/chat`
```json
{
  "message": "What BIS standard is applicable to packaged drinking water?",
  "conversationId": "optional-uuid"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "cm8...1",
    "messageId": "cm8...2",
    "answer": "### Applicable BIS Standard & Certification Guidance...",
    "citations": [
      {
        "id": "std-1",
        "identifier": "IS 14543:2016",
        "title": "Packaged Drinking Water",
        "isMandatoryQCO": true,
        "sourceUrl": "https://www.services.bis.gov.in"
      }
    ],
    "confidence": 0.92,
    "suggestedQuestions": [
      "What are the testing requirements for IS 14543:2016?",
      "Is IS 14543:2016 covered under a mandatory QCO?"
    ]
  }
}
```

---

## Standards Endpoints

### 1. Search Standards
`GET /api/standards/search?q=water&mandatory=true&sector=Food&limit=20`

### 2. Get Standard By ID
`GET /api/standards/:id`

---

## Schemes & Compliance Roadmap

### 1. List Schemes
`GET /api/schemes`

### 2. Generate Compliance Checklist
`POST /api/schemes/checklist/generate`
```json
{
  "standardNo": "IS 14543",
  "productName": "Packaged Drinking Water",
  "scale": "SMALL"
}
```

---

## Grievances & Consumer Protection

### 1. List Grievance Guides
`GET /api/grievance/guides`

---

## Admin Endpoints

### 1. Telemetry Stats
`GET /api/admin/telemetry`

### 2. Trigger Ingestion Job
`POST /api/admin/ingestion/run`
*Requires Admin Role*
