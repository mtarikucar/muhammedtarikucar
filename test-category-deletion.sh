#!/bin/bash

echo "Testing category deletion functionality..."

# First login to get token
echo "1. Logging in..."
# Skip registration if user already exists

LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testadmin@example.com",
    "password": "TestPassword123@"
  }')

echo "Login response: $LOGIN_RESPONSE"

# Extract token from cookie header
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Failed to get access token"
  exit 1
fi

echo "2. Got access token: ${TOKEN:0:20}..."

# Get categories with post counts of 0
echo "3. Getting categories..."
CATEGORIES_RESPONSE=$(curl -s -X GET "http://localhost:5000/api/categories" \
  -H "Authorization: Bearer $TOKEN")

echo "Categories response: $CATEGORIES_RESPONSE"

# Find a category with 0 posts to delete
CATEGORY_TO_DELETE=$(echo "$CATEGORIES_RESPONSE" | jq -r '.data.categories[] | select(.postCount == 0) | .id' | head -1)

if [ -z "$CATEGORY_TO_DELETE" ] || [ "$CATEGORY_TO_DELETE" = "null" ]; then
  echo "No category with 0 posts found to delete"
  exit 1
fi

echo "4. Deleting category: $CATEGORY_TO_DELETE"

# Delete the category
DELETE_RESPONSE=$(curl -s -X DELETE "http://localhost:5000/api/categories/$CATEGORY_TO_DELETE" \
  -H "Authorization: Bearer $TOKEN")

echo "Delete response: $DELETE_RESPONSE"

# Check if deletion was successful
if echo "$DELETE_RESPONSE" | grep -q '"status":"success"'; then
  echo "✅ Category deletion successful!"
else
  echo "❌ Category deletion failed!"
  echo "$DELETE_RESPONSE"
fi