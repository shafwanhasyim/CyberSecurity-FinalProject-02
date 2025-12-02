# 🔗 INTEGRATION GUIDE - Frontend ↔ Backend

## Quick Setup

### 1. Start Backend (Terminal 1)
```bash
cd backend
npm install
npm start
```
✅ Expected: `Server listening on port 3001`

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
✅ Expected: `Local: http://localhost:5173/`

### 3. Access Frontend
Open browser: `http://localhost:5173/`

---

## Integration Checklist

### ✅ Step 1: Register Account
1. Click **Auth** tab
2. Toggle to **Register**
3. Fill form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `test123456`
4. Click **Register**
5. Expected: "Registration Success. Please login now."

### ✅ Step 2: Login Account
1. Toggle back to **Login**
2. Fill form:
   - Username: `testuser`
   - Password: `test123456`
3. Click **Login**
4. Expected: "Login Success! Token saved."
   - Token stored in `localStorage` → `vulnerableToken`
   - User ID stored in `localStorage` → `userId`

### ✅ Step 3: View All Users (Data Page)
1. Click **Data** in navbar
2. Expected: Table shows all users from database (including password hashes)
3. ✅ Vulnerability 1 (No Auth) verified: Can see all user data without token

### ✅ Step 4: View Your Profile (Profile Page)
1. Login first (Step 2)
2. Click **Profile** in navbar
3. Click **View My Profile**
4. Expected: Your profile data displayed
5. ⚠️ Try viewing other users by entering their UUID → Vulnerability 3 (IDOR) verified

### ✅ Step 5: Reset Account (Settings Page)
1. Login first (Step 2)
2. Click **Settings** in navbar
3. Find **Reset My Password** section
4. Enter new password
5. Click **Reset Password**
6. Expected: "Password updated successfully"
7. Logout and login with new password to verify

### ⚠️ Step 6: Exploit IDOR (Settings Page - Advanced)
1. Create 2 accounts:
   - Account A (victim): `victim_user` / `password123`
   - Account B (attacker): `attacker_user` / `password456`
2. Get Victim UUID from Data page
3. Login as Account B (attacker)
4. Go to **Settings** page
5. Find **Exploit: Reset Other User Password** section
6. Enter Victim UUID and new password
7. Click **Reset Target Password**
8. Expected: Success message
9. Logout, login as Victim with new password → Password actually changed ✅

---

## API Endpoints (For Reference)

| Action | Endpoint | Method | Auth | Body |
|--------|----------|--------|------|------|
| Register | `/api/auth/register` | POST | ❌ | `{username, email, password}` |
| Login | `/api/auth/login` | POST | ❌ | `{username, password}` |
| Get All Users | `/api/users/all` | GET | ❌ | - |
| Get User Profile | `/api/users/:id` | GET | ✅ | - |
| Update Profile | `/api/users/profile` | PUT | ✅ | `{full_name, email}` |
| Reset Password | `/api/users/:id/reset_password` | POST | ✅ | `{new_password}` |

---

## Troubleshooting

### Backend won't connect
- [ ] Port 3001 is free: `netstat -ano | findstr :3001`
- [ ] `.env` has correct `DATABASE_URL`
- [ ] PostgreSQL server is running
- [ ] CORS enabled: Check `app.use(cors())` in backend

### Frontend can't connect to backend
- [ ] Backend running on `http://localhost:3001`
- [ ] Frontend running on `http://localhost:5173`
- [ ] CORS error in console? Backend CORS needs `http://localhost:5173`
- [ ] Try: `curl http://localhost:3001/` → Should see response

### Token not working
- [ ] Clear `localStorage`: Click **Clear Local Storage** button in Auth page
- [ ] Re-login to get fresh token
- [ ] Check browser DevTools → Application → Local Storage

### Database not connecting
- [ ] Check NeonDB connection string in `.env`
- [ ] Test with: `npm start` → Look for "Database connected successfully"
- [ ] If error: Update `DATABASE_URL` in `.env` file

---

## Frontend Pages Overview

### 📄 AuthPage (`/api/auth/*`)
- Register new account
- Login with credentials
- Token automatically saved to `localStorage.vulnerableToken`

### 📄 UserListPage (Data tab - `/api/users/all`)
- View all system users
- Shows password hashes (Vulnerability 1: No Auth)
- Get User UUIDs for exploitation

### 📄 ProfilePage (Profile tab - `/api/users/:id`)
- View your own profile
- View other user profiles by UUID (Vulnerability 3: IDOR)

### 📄 AccountSettingsPage (Settings tab)
- Reset own password (Normal)
- Reset other user password (Vulnerability 2: IDOR)

---

## Key Integration Points

### Token Storage (localStorage)
```javascript
// After login success
localStorage.setItem('vulnerableToken', token);
localStorage.setItem('userId', userId);

// Use in API calls
headers: {
  'Authorization': `Bearer ${localStorage.getItem('vulnerableToken')}`,
  'Content-Type': 'application/json'
}
```

### API Base URL
```javascript
const API_BASE = 'http://localhost:3001/api';

// Example
axios.get(`${API_BASE}/users/all`)
```

### Error Handling
```javascript
try {
  const response = await axios.post(...);
  // Success
} catch (error) {
  const errorMsg = error.response?.data?.error || error.message;
  // Show error to user
}
```

---

## ✅ Verification Complete When:

- [x] Backend responds to all endpoints (3001)
- [x] Frontend loads all pages (5173)
- [x] Register/Login workflow works
- [x] Token stored and used in requests
- [x] All 3 vulnerabilities can be demonstrated
- [x] Database operations working (read/write/update)

**Status: Ready for Security Testing** 🔒

