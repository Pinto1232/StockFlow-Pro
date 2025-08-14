#!/usr/bin/env python3
import hashlib
import base64

def verify_legacy_password(password, stored_hash):
    """Verify password against legacy SHA256:salt format"""
    parts = stored_hash.split(':')
    if len(parts) != 2:
        return False
    
    hash_part = parts[0]
    salt = parts[1]
    
    salted_password = password + salt
    computed_hash_bytes = hashlib.sha256(salted_password.encode('utf-8')).digest()
    computed_hash = base64.b64encode(computed_hash_bytes).decode('utf-8')
    
    return hash_part == computed_hash

# The actual hash for pintotnet@gmail.com from the database
stored_hash = "gVLyPfwmsDz0hjfm8HDUnBx0lLAmQnOqnKnW2qidmYM=:94d49c2c-8678-45c2-bff3-3087bdf2df0b"

# Common passwords to test
test_passwords = [
    "password",
    "Password123",
    "admin",
    "123456",
    "pinto",
    "manuel",
    "stockflow",
    "StockFlow123",
    "Admin123",
    "pintotnet",
    "gmail123"
]

print("=== PASSWORD VERIFICATION FOR pintotnet@gmail.com ===")
print(f"Hash: {stored_hash}")
print("\nTesting common passwords:")

for password in test_passwords:
    result = verify_legacy_password(password, stored_hash)
    status = "✓ MATCH" if result else "✗ NO MATCH"
    print(f"{password:<15} -> {status}")

# Let's also try to reverse-engineer the password by brute force (limited)
print("\n=== BRUTE FORCE ATTEMPT ===")
import itertools
import string

# Try simple combinations
charset = string.ascii_lowercase + string.digits
for length in range(4, 8):  # Try lengths 4-7
    print(f"Trying length {length}...")
    count = 0
    for combination in itertools.product(charset, repeat=length):
        password = ''.join(combination)
        if verify_legacy_password(password, stored_hash):
            print(f"🎉 FOUND PASSWORD: {password}")
            exit()
        count += 1
        if count > 10000:  # Limit to prevent infinite loop
            break
    
print("❌ Password not found in simple brute force attempt")
print("\n💡 The password might be:")
print("   - Longer than 7 characters")
print("   - Contains uppercase letters or special characters")
print("   - A more complex combination")
