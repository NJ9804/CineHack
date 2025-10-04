import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

SECRET_KEY_ENV = os.getenv("SECRET_KEY")
DEFAULT_KEY = "your-secret-key-change-this-in-production-please-make-it-very-long-and-random"

print("SECRET_KEY from .env:", SECRET_KEY_ENV)
print("Default SECRET_KEY:", DEFAULT_KEY)
print("Are they the same?", SECRET_KEY_ENV == DEFAULT_KEY)

# This is what auth.py uses
ACTUAL_KEY = os.getenv("SECRET_KEY", DEFAULT_KEY)
print("\nActual SECRET_KEY being used:", ACTUAL_KEY)

# Test the token with the actual key
from jose import jwt

token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImV4cCI6MTc2MDE5OTE2Nn0.qg4fsKhviUgddPWIuUAWVAiNs3xFchyisPkzET6lXUE'

print("\n--- Testing Token ---")
print("Token:", token[:50] + "...")

# Try with .env SECRET_KEY
if SECRET_KEY_ENV:
    try:
        payload = jwt.decode(token, SECRET_KEY_ENV, algorithms=['HS256'])
        print(f"✅ Token is VALID with .env SECRET_KEY!")
        print(f"   User ID: {payload.get('sub')}")
    except Exception as e:
        print(f"❌ Token INVALID with .env SECRET_KEY: {e}")

# Try with default SECRET_KEY
try:
    payload = jwt.decode(token, DEFAULT_KEY, algorithms=['HS256'])
    print(f"✅ Token is VALID with default SECRET_KEY!")
    print(f"   User ID: {payload.get('sub')}")
except Exception as e:
    print(f"❌ Token INVALID with default SECRET_KEY: {e}")
