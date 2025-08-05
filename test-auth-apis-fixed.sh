#!/bin/bash

API_URL="http://localhost:5000/api"
echo "Testing Authentication APIs (Fixed)..."
echo "=============================="

# Test 1: Register new user
echo -e "\n1. Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Test User",
    "email": "testuser@example.com",
    "password": "TestPass123!"
  }')
echo "Register Response: $REGISTER_RESPONSE"

# Test 2: Register with weak password
echo -e "\n2. Testing Registration with weak password..."
WEAK_PASS_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Test User 2",
    "email": "testuser2@example.com",
    "password": "123"
  }')
echo "Weak Password Response: $WEAK_PASS_RESPONSE"

# Test 3: Login with valid credentials
echo -e "\n3. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123!"
  }')
echo "Login Response: $LOGIN_RESPONSE"

# Extract tokens if available
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken // empty')
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.refreshToken // empty')

if [ ! -z "$ACCESS_TOKEN" ]; then
  echo "Access Token received: ${ACCESS_TOKEN:0:20}..."
fi

# Test 4: Refresh token
if [ ! -z "$REFRESH_TOKEN" ]; then
  echo -e "\n4. Testing Refresh Token..."
  REFRESH_RESPONSE=$(curl -s -X POST $API_URL/auth/refresh-token \
    -H "Content-Type: application/json" \
    -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")
  echo "Refresh Token Response: $REFRESH_RESPONSE"
fi

# Test 5: Login as admin
echo -e "\n5. Testing Admin Login..."
ADMIN_LOGIN=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@muhammedtarikucar.com",
    "password": "admin123"
  }')
echo "Admin Login Response: $ADMIN_LOGIN"

echo -e "\n=============================="
echo "Authentication API Tests Complete"