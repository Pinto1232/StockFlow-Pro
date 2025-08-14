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

# The expected password for Admin role users from DatabaseSeeder
expected_password = "SecureAdmin2024!"

print("=== PASSWORD VERIFICATION FOR pintotnet@gmail.com ===")
print(f"Hash: {stored_hash}")
print(f"Expected Password (Admin): {expected_password}")

result = verify_legacy_password(expected_password, stored_hash)
print(f"\nPassword '{expected_password}' verification: {'✓ CORRECT' if result else '✗ INCORRECT'}")

if result:
    print(f"\n🎉 SUCCESS! The password for pintotnet@gmail.com is: {expected_password}")
else:
    print(f"\n❌ The password '{expected_password}' is NOT correct for this user.")
    print("This suggests the user might have been created with a different password,")
    print("or the password hash was generated differently.")
    
    # Let's also test some other possibilities
    other_passwords = [
        "admin",  # Simple admin password
        "SecureUser2024!",  # User role default
        "SecureManager2024!",  # Manager role default
    ]
    
    print("\nTesting other default passwords:")
    for pwd in other_passwords:
        result = verify_legacy_password(pwd, stored_hash)
        status = "✓ MATCH" if result else "✗ NO MATCH"
        print(f"  {pwd:<20} -> {status}")
