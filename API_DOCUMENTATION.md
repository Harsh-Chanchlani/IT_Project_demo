# API Documentation

## Base URL
```
http://localhost:4000/api/auth
```

## Authentication
This API uses JWT tokens stored in HTTP-only cookies for authentication. After successful login or email verification, the JWT token is automatically set as a cookie.

## Headers
- `Content-Type: application/json` (for all POST requests)
- Cookies are automatically handled by the browser

## Response Format
All endpoints return JSON responses with the following structure:
```json
{
  "success": boolean,
  "message": "string (optional)"
}
```

## Endpoints

### 1. User Registration
Register a new user account.

**POST** `/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Missing Details"
}
```
```json
{
  "success": false,
  "message": "User already exists"
}
```

**Process:**
1. Validates required fields
2. Checks for existing user with same email
3. Hashes password using bcrypt
4. Generates verification token (15-minute expiry)
5. Saves user to database
6. Sends verification email
7. Returns success response

---

### 2. Email Verification
Verify user's email address using the token sent via email.

**POST** `/account-verify`

**Body:**
```json
{
  "token": "verification-token-uuid",
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Account verified"
}
```
*Sets JWT token cookie for immediate authentication*

**Error Responses:**
```json
{
  "success": false,
  "message": "Missing details"
}
```
```json
{
  "success": false,
  "message": "User not found"
}
```
```json
{
  "success": false,
  "message": "Link in not valid"
}
```
```json
{
  "success": false,
  "message": "Link is Expired"
}
```

---

### 3. User Sign In
Authenticate user with email and password.

**POST** `/signin`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true
}
```
*Sets JWT token cookie*

**Error Responses:**
```json
{
  "success": false,
  "message": "Email and password are required"
}
```
```json
{
  "success": false,
  "message": "Invalid email"
}
```
```json
{
  "success": false,
  "message": "Incorrect password"
}
```

---

### 4. User Logout
Clear authentication cookie to log out user.

**POST** `/logout`

**Body:** None

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out"
}
```
*Clears JWT token cookie*

---

### 5. Check Authentication Status
Check if user is currently authenticated.

**POST** `/is-auth`

**Body:** None
**Headers:** Requires JWT token in cookies

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Not Authorized Login Again."
}
```

---

### 6. Request Password Reset
Send password reset token to user's email.

**POST** `/send-reset-token`

**Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Reset link sent to email"
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Email required"
}
```
```json
{
  "success": false,
  "message": "User not found"
}
```

**Process:**
1. Validates email
2. Finds user in database
3. Generates reset token (15-minute expiry)
4. Updates user with reset token
5. Sends reset email with link

---

### 7. Verify Password Reset Token
Verify the password reset token before allowing password change.

**POST** `/verify-reset-token`

**Body:**
```json
{
  "email": "john@example.com",
  "resetToken": "reset-token-uuid"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Enter new password"
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Missing Details."
}
```
```json
{
  "success": false,
  "message": "User not found."
}
```
```json
{
  "success": false,
  "message": "Invalid Link."
}
```
```json
{
  "success": false,
  "message": "Link expired"
}
```

**Process:**
1. Validates email and token
2. Finds user and checks token validity
3. Verifies token hasn't expired
4. Clears reset token (single use)
5. Returns success for password change

---

### 8. Reset Password
Update user's password with new password.

**POST** `/reset-password`

**Body:**
```json
{
  "email": "john@example.com",
  "newPassword": "newSecurePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password has been reset successfully."
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "New password is required."
}
```
```json
{
  "success": false,
  "message": "User not found."
}
```

---

### 9. Google OAuth Login
Initiate Google OAuth authentication flow.

**POST** `/oauth/google/login`

**Body:** None

**Response:** HTTP 302 Redirect to Google OAuth consent screen

**Process:**
1. Constructs Google OAuth URL with client ID and scopes
2. Redirects user to Google for authentication
3. User authorizes application on Google
4. Google redirects back to callback URL

---

### 10. Google OAuth Callback
Handle the callback from Google OAuth and authenticate user.

**POST** `/oauth/google/callback`

**Query Parameters:**
- `code`: Authorization code from Google

**Success Response (200):**
```json
{
  "success": true,
  "message": "User registered successfully"
}
```
*For new users*

```json
{
  "success": true,
  "message": "User logged in successfully"
}
```
*For existing users*

*Sets JWT token cookie*

**Process:**
1. Exchanges authorization code for access token
2. Uses access token to get user profile from Google
3. Checks if user exists in database
4. Creates new user if doesn't exist (with verified status)
5. Generates JWT token and sets cookie
6. Returns appropriate success message

---

## Error Handling

### Common HTTP Status Codes
- `200 OK`: Successful request
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server-side error

### Token Expiration
- Verification tokens: 15 minutes
- Reset tokens: 15 minutes  
- JWT tokens: 7 days

### Security Features
- Passwords hashed with bcryptjs (10 salt rounds)
- JWT tokens stored in HTTP-only cookies
- CORS configured for specific origins
- Tokens are single-use (cleared after successful verification)
- Secure cookie settings for production

## Example Usage

### Registration Flow
```javascript
// 1. Register user
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  })
});

// 2. User receives email with verification link
// 3. User clicks link, frontend extracts token and email from URL
// 4. Verify account
const verifyResponse = await fetch('/api/auth/account-verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'extracted-token',
    email: 'john@example.com'
  }),
  credentials: 'include' // Include cookies
});
```

### Login Flow  
```javascript
const loginResponse = await fetch('/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  }),
  credentials: 'include' // Include cookies
});
```

### Password Reset Flow
```javascript
// 1. Request reset token
await fetch('/api/auth/send-reset-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'john@example.com' })
});

// 2. User receives email, clicks link
// 3. Verify reset token
await fetch('/api/auth/verify-reset-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    resetToken: 'extracted-token'
  })
});

// 4. Reset password
await fetch('/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    newPassword: 'newPassword123'
  })
});
```