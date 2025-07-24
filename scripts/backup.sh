#!/bin/bash

# Backup script for PostgreSQL database
# This script should be run as a cron job

# Configuration
DB_HOST="${POSTGRES_HOST:-postgresql}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-blog_db}"
DB_USER="${POSTGRES_USER:-admin}"
BACKUP_DIR="/backups"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${DATE}.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform backup
echo "Starting backup of $DB_NAME..."
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME | gzip > $BACKUP_FILE

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_FILE"
    
    # Remove old backups
    echo "Removing backups older than $RETENTION_DAYS days..."
    find $BACKUP_DIR -name "backup_${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    # List current backups
    echo "Current backups:"
    ls -lh $BACKUP_DIR/backup_${DB_NAME}_*.sql.gz
else
    echo "Backup failed!"
    exit 1
fi