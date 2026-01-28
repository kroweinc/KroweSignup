# Signup API Routes

This directory contains all API routes for the signup flow.

## Structure

```
app/api/signup/
├── session/
│   ├── start/          # POST - Create new signup session
│   └── [sessionId]/     # GET - Get session by ID
├── answer/
│   ├── route.ts         # POST - Submit and validate answer
│   └── confirm/         # POST - Confirm answer and advance
├── complete/            # POST - Mark signup as complete
└── report/
    ├── generate/        # POST - Generate report for session
    └── [sessionId]/     # GET - Get report by session ID
```

## Routes

### Session Management

#### `POST /api/signup/session/start`
Creates a new signup session.

**Response:**
```json
{
  "sessionId": "uuid",
  "currentStepKey": "age",
  "status": "in_progress"
}
```

#### `GET /api/signup/session/[sessionId]`
Retrieves an existing session.

**Response:**
```json
{
  "sessionId": "uuid",
  "currentStepKey": "idea",
  "answersByStepKey": { ... }
}
```

### Answer Submission

#### `POST /api/signup/answer`
Submits an answer for validation. Does not advance the step.

**Request Body:**
```json
{
  "sessionId": "uuid",
  "stepKey": "idea",
  "answerText": "...",
  "force": false
}
```

**Response:**
```json
{
  "validationStatus": "ok" | "needs_fix",
  "issues": [...],
  "failCount": 0,
  "canContinueWithWarning": false,
  "nextStepKey": "product_type" | null,
  "aiSuggestion": "..." | null,
  "aiReason": "..." | null
}
```

#### `POST /api/signup/answer/confirm`
Confirms an answer and advances to the next step.

**Request Body:**
```json
{
  "sessionId": "uuid",
  "stepKey": "idea",
  "finalAnswer": "...",
  "finalSource": "original" | "ai_suggested" | "user_edited" | "override"
}
```

**Response:**
```json
{
  "ok": true,
  "nextStepKey": "product_type" | null
}
```

### Completion

#### `POST /api/signup/complete`
Marks a signup session as complete.

**Request Body:**
```json
{
  "sessionId": "uuid"
}
```

**Response:**
```json
{
  "ok": true
}
```

### Report Generation

#### `POST /api/signup/report/generate`
Generates a report for a completed signup session.

**Request Body:**
```json
{
  "sessionId": "uuid"
}
```

**Response:**
```json
{
  "ok": true,
  "reportId": "uuid",
  "sessionId": "uuid"
}
```

#### `GET /api/signup/report/[sessionId]`
Retrieves a generated report.

**Response:**
```json
{
  "id": "uuid",
  "status": "ready",
  "report": { ... },
  "created_at": "...",
  "updated_at": "..."
}
```
