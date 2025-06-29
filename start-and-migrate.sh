#!/bin/sh

# Exit on error
set -e

# Run database migrations
pnpm payload migrate
# Start the application
pnpm start