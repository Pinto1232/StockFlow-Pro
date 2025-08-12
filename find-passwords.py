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

def reverse_hash_check(target_hash, salt):
    """Try to find what password produces the target hash"""
    common_passwords = [
        "admin", "password", "123456", "admin123", "password123",
        "stockflow", "test", "demo", "user", "login",
        "Admin", "ADMIN", "Password", "StockFlow", 
        "admin@stockflowpro.com", "admin@gmail.com",
        "SecureAdmin2024!", "default", "letmein",
        "", "admin!", "admin$", "admin@", "admin#"
    ]
    
    print(f"Searching for password that produces hash: {target_hash}")
    print(f"Using salt: {salt}")
    
    for pwd in common_passwords:
        salted_password = pwd + salt
        computed_hash_bytes = hashlib.sha256(salted_password.encode('utf-8')).digest()
        computed_hash = base64.b64encode(computed_hash_bytes).decode('utf-8')
        
        if computed_hash == target_hash:
            print(f"✓ FOUND! Password: '{pwd}'")
            return pwd
    
    print("✗ Password not found in common list")
    return None

# Mock data hashes from the JSON file
admin_hash_parts = "YajzDl4gykhWfs21H4zClojGaaYfdUZvvOJdul4aFUU=:550e8400-e29b-41d4-a716-446655440000".split(':')
admin_stockflow_hash_parts = "pEVXIe618L6xKVCXHteBRzfKd9b/IvepwcTqnY/RhlQ=:550e8400-e29b-41d4-a716-446655440001".split(':')

print("=== REVERSE HASH LOOKUP ===")
print("\nFor admin user (email: 'admin'):")
admin_password = reverse_hash_check(admin_hash_parts[0], admin_hash_parts[1])

print("\nFor admin@stockflowpro.com user:")
stockflow_password = reverse_hash_check(admin_stockflow_hash_parts[0], admin_stockflow_hash_parts[1])

if admin_password:
    print(f"\n=== VERIFICATION ===")
    print(f"Admin password '{admin_password}' verification: {verify_legacy_password(admin_password, 'YajzDl4gykhWfs21H4zClojGaaYfdUZvvOJdul4aFUU=:550e8400-e29b-41d4-a716-446655440000')}")

if stockflow_password:
    print(f"StockFlow admin password '{stockflow_password}' verification: {verify_legacy_password(stockflow_password, 'pEVXIe618L6xKVCXHteBRzfKd9b/IvepwcTqnY/RhlQ=:550e8400-e29b-41d4-a716-446655440001')}")
