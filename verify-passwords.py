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

# Mock data hashes from the JSON file
admin_hash = "YajzDl4gykhWfs21H4zClojGaaYfdUZvvOJdul4aFUU=:550e8400-e29b-41d4-a716-446655440000"
admin_stockflow_hash = "pEVXIe618L6xKVCXHteBRzfKd9b/IvepwcTqnY/RhlQ=:550e8400-e29b-41d4-a716-446655440001"

# Test various passwords
test_passwords = ["admin", "password", "SecureAdmin2024!", "admin123", "password123"]

print("Testing admin user (email: 'admin'):")
for pwd in test_passwords:
    result = verify_legacy_password(pwd, admin_hash)
    print(f"  Password '{pwd}': {'✓' if result else '✗'}")

print("\nTesting admin@stockflowpro.com user:")  
for pwd in test_passwords:
    result = verify_legacy_password(pwd, admin_stockflow_hash)
    print(f"  Password '{pwd}': {'✓' if result else '✗'}")
