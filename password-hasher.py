import hashlib
import os
import base64

def hash_password_pbkdf2(password):
    salt_size = 32  # 256 bits
    hash_size = 32  # 256 bits
    iterations = 100000  # OWASP recommended minimum
    
    # Generate a cryptographically secure random salt
    salt = os.urandom(salt_size)
    
    # Hash the password using PBKDF2 with SHA256
    password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, iterations, hash_size)
    
    # Combine salt and hash for storage
    hash_bytes = salt + password_hash
    
    return base64.b64encode(hash_bytes).decode('utf-8')

def hash_password_legacy(password, salt):
    # Legacy SHA256 format: hash:salt
    salted_password = password + salt
    hash_bytes = hashlib.sha256(salted_password.encode('utf-8')).digest()
    hash_b64 = base64.b64encode(hash_bytes).decode('utf-8')
    return f"{hash_b64}:{salt}"

# Generate hashes for test users
admin_password = "admin"
admin_email_password = "SecureAdmin2024!"

print("PBKDF2 Hashes:")
print(f"admin:admin -> {hash_password_pbkdf2(admin_password)}")
print(f"admin@stockflowpro.com:SecureAdmin2024! -> {hash_password_pbkdf2(admin_email_password)}")

print("\nLegacy SHA256 Hashes:")
print(f"admin:admin -> {hash_password_legacy(admin_password, 'salt123')}")
print(f"admin@stockflowpro.com:SecureAdmin2024! -> {hash_password_legacy(admin_email_password, 'salt456')}")
