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

# The salt from the hash is the user ID
user_id = "94d49c2c-8678-45c2-bff3-3087bdf2df0b"

print("=== PASSWORD VERIFICATION FOR pintotnet@gmail.com ===")
print(f"User ID (salt): {user_id}")
print(f"Hash: {stored_hash}")

# Test all possible default passwords from DatabaseSeeder
test_passwords = [
    "SecureAdmin2024!",    # Admin role default
    "SecureManager2024!",  # Manager role default  
    "SecureUser2024!",     # User role default
    "admin",               # Special case for email "admin"
]

print("\nTesting DatabaseSeeder default passwords:")
for password in test_passwords:
    result = verify_legacy_password(password, stored_hash)
    status = "✓ CORRECT PASSWORD!" if result else "✗ No match"
    print(f"  {password:<20} -> {status}")
    if result:
        print(f"\n🎉 FOUND IT! The password for pintotnet@gmail.com is: {password}")
        break
else:
    print("\n❌ None of the default passwords work. The user might have been created differently.")
    print("Let me check if the hash format is correct...")
    
    # Verify the hash format
    parts = stored_hash.split(':')
    if len(parts) == 2:
        print(f"Hash format is correct: hash='{parts[0]}', salt='{parts[1]}'")
        print("This means the password was set manually or through a different process.")
