#!/bin/bash

# Security audit script for production readiness

echo "Starting security audit..."
echo "========================"

# Check for environment variables in code
echo -n "Checking for hardcoded secrets... "
if grep -r "password123\|your-super-secret" --include="*.js" --include="*.ts" --exclude-dir=node_modules .; then
    echo "FAIL: Found hardcoded secrets!"
    exit 1
else
    echo "PASS"
fi

# Check for console.log statements
echo -n "Checking for console.log statements... "
CONSOLE_COUNT=$(grep -r "console\.\(log\|error\|warn\)" --include="*.js" --exclude-dir=node_modules server | wc -l)
if [ $CONSOLE_COUNT -gt 0 ]; then
    echo "WARNING: Found $CONSOLE_COUNT console statements"
else
    echo "PASS"
fi

# Check npm audit
echo "Running npm audit..."
cd server && npm audit
cd ../client && npm audit
cd ..

# Check for vulnerable dependencies
echo "Checking for known vulnerabilities..."
cd server && npx retire --outputformat json --outputpath ../security-report-server.json
cd ../client && npx retire --outputformat json --outputpath ../security-report-client.json
cd ..

# Check file permissions
echo -n "Checking file permissions... "
WORLD_WRITABLE=$(find . -type f -perm -002 2>/dev/null | grep -v node_modules | wc -l)
if [ $WORLD_WRITABLE -gt 0 ]; then
    echo "WARNING: Found $WORLD_WRITABLE world-writable files"
else
    echo "PASS"
fi

# Check for .env file in repository
echo -n "Checking for .env files... "
if [ -f ".env" ]; then
    echo "WARNING: .env file found - ensure it's in .gitignore"
else
    echo "PASS"
fi

echo ""
echo "Security audit complete!"
echo "Review any warnings or failures before deploying to production."