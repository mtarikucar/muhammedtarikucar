#!/bin/bash

API_URL="http://localhost:5000/api"
echo "Testing Authentication APIs..."
echo "=============================="

# Test 1: Register new user
echo -e "\n1. Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "TestPass123!"
  }')
echo "Register Response: $REGISTER_RESPONSE"

# Test 2: Register with weak password
echo -e "\n2. Testing Registration with weak password..."
WEAK_PASS_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User 2",
    "email": "testuser2@example.com",
    "password": "123"
  }')
echo "Weak Password Response: $WEAK_PASS_RESPONSE"

# Test 3: Register duplicate email
echo -e "\n3. Testing duplicate email registration..."
DUPLICATE_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "TestPass123!"
  }')
echo "Duplicate Email Response: $DUPLICATE_RESPONSE"

# Test 4: Login with valid credentials
echo -e "\n4. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123!"
  }' \
  -c cookies.txt)
echo "Login Response: $LOGIN_RESPONSE"

# Extract access token if available
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken // empty')
if [ ! -z "$ACCESS_TOKEN" ]; then
  echo "Access Token received: ${ACCESS_TOKEN:0:20}..."
fi

# Test 5: Login with invalid credentials
echo -e "\n5. Testing Login with invalid credentials..."
INVALID_LOGIN=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "WrongPassword"
  }')
echo "Invalid Login Response: $INVALID_LOGIN"

# Test 6: Refresh token
echo -e "\n6. Testing Refresh Token..."
REFRESH_RESPONSE=$(curl -s -X POST $API_URL/auth/refresh-token \
  -b cookies.txt \
  -c cookies.txt)
echo "Refresh Token Response: $REFRESH_RESPONSE"

# Test 7: Login as admin
echo -e "\n7. Testing Admin Login..."
ADMIN_LOGIN=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@muhammedtarikucar.com",
    "password": "admin123"
  }' \
  -c admin-cookies.txt)
echo "Admin Login Response: $ADMIN_LOGIN"

# Clean up
rm -f cookies.txt admin-cookies.txt

echo -e "\n=============================="
echo "Authentication API Tests Complete"