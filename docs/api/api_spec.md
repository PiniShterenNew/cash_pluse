# CashPulse API Specification

## 1. API Conventions
- Base URL: `/api/v1`
- Auth: Bearer JWT for user endpoints.
- Content-Type: `application/json`
- Tenant scope from authenticated user company context.
- Error format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": {}
  }
}
```

## 2. Debts Endpoints

### 2.1 Create Debt
`POST /api/v1/debts`

#### Request
```json
{
  "clientId": "9f6f9f57-42b2-4f35-8c1d-9b08f3f6d4ac",
  "amountTotal": 4500.00,
  "currency": "ILS",
  "dueDate": "2026-04-10",
  "invoiceReference": "INV-2026-0041",
  "title": "Website maintenance - March"
}
```

#### Response (201)
```json
{
  "id": "8e8fd5c7-6db5-44c7-b8d7-e6342f0fe823",
  "status": "open",
  "paymentLinkUrl": "https://payplus.example/link/abc123",
  "amountOutstanding": 4500.00,
  "createdAt": "2026-04-01T09:20:14.231Z"
}
```

### 2.2 Get Debts
`GET /api/v1/debts?status=overdue&clientId=&search=&page=1&pageSize=20&sort=dueDate:asc`

#### Response (200)
```json
{
  "items": [
    {
      "id": "8e8fd5c7-6db5-44c7-b8d7-e6342f0fe823",
      "clientId": "9f6f9f57-42b2-4f35-8c1d-9b08f3f6d4ac",
      "clientName": "Ayalon Digital",
      "amountOutstanding": 4500,
      "currency": "ILS",
      "dueDate": "2026-04-10",
      "status": "overdue",
      "overdueDays": 5,
      "expectedPaymentDate": "2026-04-18",
      "expectedPaymentConfidence": "medium"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 47
}
```

## 3. Reminder Endpoints

### 3.1 Send Reminder
`POST /api/v1/debts/{debtId}/reminders`

#### Request
```json
{
  "templateKey": "friendly_due",
  "customMessage": "optional user edits"
}
```

#### Response (202)
```json
{
  "reminderId": "df1efff8-4ac6-4982-aedd-93e6735f5c00",
  "status": "queued",
  "queuedAt": "2026-04-15T08:10:00.000Z"
}
```

## 4. Client Endpoints

### 4.1 Create Client
`POST /api/v1/clients`

#### Request
```json
{
  "name": "Ayalon Digital",
  "contactName": "Noa Levi",
  "phoneE164": "+972541112233",
  "email": "finance@ayalon.example"
}
```

#### Response (201)
```json
{
  "id": "9f6f9f57-42b2-4f35-8c1d-9b08f3f6d4ac",
  "name": "Ayalon Digital",
  "reliabilityScore": 50,
  "createdAt": "2026-04-01T09:10:00.000Z"
}
```

### 4.2 Get Client
`GET /api/v1/clients/{clientId}`

#### Response (200)
```json
{
  "id": "9f6f9f57-42b2-4f35-8c1d-9b08f3f6d4ac",
  "name": "Ayalon Digital",
  "phoneE164": "+972541112233",
  "reliabilityScore": 73,
  "totalDebtOpen": 4500,
  "totalDebtPaid": 12000
}
```

## 5. Prediction Endpoints

### 5.1 Get Debt Prediction
`GET /api/v1/debts/{debtId}/prediction`

#### Response (200)
```json
{
  "expectedPaymentDate": "2026-04-18",
  "confidence": "medium",
  "explanation": {
    "factors": [
      "Client average delay: 6 days",
      "Last reminder sent 2 days ago"
    ],
    "modelVersion": "pred-v1"
  }
}
```

## 6. Internal Endpoint
### 6.1 Recompute Predictions
`POST /api/v1/internal/predictions/recompute`
- Protected for service role only.
- Accepts company or subject scope for targeted recomputation.

## 7. Error Codes
- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `CONFLICT`
- `INTEGRATION_ERROR`
- `RATE_LIMITED`
- `INTERNAL_ERROR`
