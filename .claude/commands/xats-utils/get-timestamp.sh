#!/bin/bash
# Utility command to get consistent timestamps for xats commands

# Get date in YYYY-MM-DD format
DATE=$(date +"%Y-%m-%d")

# Get time in HHMM format (24-hour)
TIME=$(date +"%H%M")

# Get full timestamp
TIMESTAMP="${DATE}-${TIME}"

# Output based on argument
case "$1" in
  --date)
    echo "$DATE"
    ;;
  --time)
    echo "$TIME"
    ;;
  --timestamp|*)
    echo "$TIMESTAMP"
    ;;
esac