import hashlib
import base64
import json

def create_legacy_hash(password, salt):
    """Create legacy SHA256:salt format hash"""
    salted_password = password + salt
    hash_bytes = hashlib.sha256(salted_password.encode('utf-8')).digest()
    hash_b64 = base64.b64encode(hash_bytes).decode('utf-8')
    return f"{hash_b64}:{salt}"

# Generate new hashes for known passwords
admin_hash = create_legacy_hash("admin", "550e8400-e29b-41d4-a716-446655440000")
stockflow_hash = create_legacy_hash("SecureAdmin2024!", "550e8400-e29b-41d4-a716-446655440001")
manager_hash = create_legacy_hash("manager123", "550e8400-e29b-41d4-a716-446655440002")
user_hash = create_legacy_hash("user123", "550e8400-e29b-41d4-a716-446655440003")
alice_hash = create_legacy_hash("alice123", "550e8400-e29b-41d4-a716-446655440004")

print("Generated password hashes:")
print(f"admin:admin -> {admin_hash}")
print(f"admin@stockflowpro.com:SecureAdmin2024! -> {stockflow_hash}")
print(f"manager@stockflowpro.com:manager123 -> {manager_hash}")
print(f"user@stockflowpro.com:user123 -> {user_hash}")
print(f"alice@stockflowpro.com:alice123 -> {alice_hash}")

# Updated mock users data
mock_users = [
    {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "",
        "firstName": "Admin",
        "lastName": "User",
        "fullName": "Admin User",
        "email": "admin",
        "phoneNumber": "+1-555-0100",
        "dateOfBirth": "1980-01-01T00:00:00Z",
        "age": 45,
        "isActive": True,
        "createdAt": "2025-08-12T15:16:11.2932034Z",
        "updatedAt": None,
        "lastLoginAt": None,
        "role": "Admin",
        "passwordHash": admin_hash,
        "profilePhotoUrl": None
    },
    {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "username": "",
        "firstName": "Admin",
        "lastName": "User",
        "fullName": "",
        "email": "admin@stockflowpro.com",
        "phoneNumber": "",
        "dateOfBirth": "0001-01-01T00:00:00",
        "age": 0,
        "isActive": True,
        "createdAt": "2025-06-13T15:16:11.2945196Z",
        "updatedAt": "2025-08-02T15:16:11.2945297Z",
        "lastLoginAt": None,
        "role": "Admin",
        "passwordHash": stockflow_hash,
        "profilePhotoUrl": None
    },
    {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "username": "",
        "firstName": "Manager",
        "lastName": "User",
        "fullName": "",
        "email": "manager@stockflowpro.com",
        "phoneNumber": "",
        "dateOfBirth": "0001-01-01T00:00:00",
        "age": 0,
        "isActive": True,
        "createdAt": "2025-07-13T15:16:11.2955833Z",
        "updatedAt": "2025-08-07T15:16:11.2955849Z",
        "lastLoginAt": None,
        "role": "Manager",
        "passwordHash": manager_hash,
        "profilePhotoUrl": None
    },
    {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "username": "",
        "firstName": "Regular",
        "lastName": "User",
        "fullName": "",
        "email": "user@stockflowpro.com",
        "phoneNumber": "",
        "dateOfBirth": "0001-01-01T00:00:00",
        "age": 0,
        "isActive": True,
        "createdAt": "2025-05-13T15:16:11.2962542Z",
        "updatedAt": "2025-08-01T15:16:11.2962551Z",
        "lastLoginAt": None,
        "role": "User",
        "passwordHash": user_hash,
        "profilePhotoUrl": None
    },
    {
        "id": "550e8400-e29b-41d4-a716-446655440004",
        "username": "",
        "firstName": "Alice",
        "lastName": "Johnson",
        "fullName": "",
        "email": "alice@stockflowpro.com",
        "phoneNumber": "",
        "dateOfBirth": "0001-01-01T00:00:00",
        "age": 0,
        "isActive": True,
        "createdAt": "2025-04-13T15:16:11.2969061Z",
        "updatedAt": "2025-07-31T15:16:11.2969069Z",
        "lastLoginAt": None,
        "role": "User",
        "passwordHash": alice_hash,
        "profilePhotoUrl": None
    }
]

# Write to JSON file
with open('updated-mock-users.json', 'w') as f:
    json.dump(mock_users, f, indent=2)

print("\nUpdated mock-users.json created with known passwords!")
print("\nTest these credentials:")
print("admin / admin")
print("admin@stockflowpro.com / SecureAdmin2024!")
print("manager@stockflowpro.com / manager123")
print("user@stockflowpro.com / user123")
print("alice@stockflowpro.com / alice123")
