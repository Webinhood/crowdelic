#!/bin/bash

# Ensure the script stops on first error
set -e

# Copy the migration file to the postgres container
docker cp ./backend/src/db/migrations/20241210_002_add_test_status_fields.sql crowdelic-postgres-1:/migration.sql

# Execute the migration inside the postgres container
docker exec -i crowdelic-postgres-1 psql -U crowdelic -d crowdelic -f /migration.sql

# Remove the temporary migration file
docker exec crowdelic-postgres-1 rm /migration.sql

echo "Migration completed successfully!"
