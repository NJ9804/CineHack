from jose import jwt
import os

token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImV4cCI6MTc2MDE5OTE2Nn0.qg4fsKhviUgddPWIuUAWVAiNs3xFchyisPkzET6lXUE'
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-this-in-production-please-make-it-very-long-and-random')

try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    print('✅ Token is valid!')
    print(f'User ID: {payload.get("sub")}')
    print(f'Expires (timestamp): {payload.get("exp")}')
    
    # Check expiration
    import datetime
    exp_timestamp = payload.get("exp")
    exp_date = datetime.datetime.fromtimestamp(exp_timestamp)
    now = datetime.datetime.now()
    print(f'Expiration date: {exp_date}')
    print(f'Current date: {now}')
    print(f'Is expired? {"YES ❌" if now > exp_date else "NO ✅"}')
except Exception as e:
    print(f'❌ Token validation failed: {e}')
