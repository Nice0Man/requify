#!/bin/bash

# MinIO Bucket Initialization Script
# This script creates required buckets and sets up policies

set -e

echo "Starting MinIO bucket initialization..."

# Wait for MinIO to be ready
echo "Waiting for MinIO to be ready..."
until mc config host add myminio http://minio:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}; do
    echo "MinIO is not ready yet. Waiting..."
    sleep 2
done

echo "MinIO is ready. Creating buckets..."

# Create buckets if they don't exist
buckets=("${MINIO_BUCKET_UPLOADS}" "${MINIO_BUCKET_AVATARS}" "${MINIO_BUCKET_DOCUMENTS}")

for bucket in "${buckets[@]}"; do
    if ! mc ls myminio/${bucket} >/dev/null 2>&1; then
        echo "Creating bucket: ${bucket}"
        mc mb myminio/${bucket}
    else
        echo "Bucket ${bucket} already exists"
    fi
done

echo "Setting bucket policies..."

# Set public read policy for avatars bucket (for CDN access)
echo "Setting public read policy for ${MINIO_BUCKET_AVATARS}..."
cat > /tmp/avatar-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {"AWS": "*"},
            "Action": ["s3:GetObject"],
            "Resource": ["arn:aws:s3:::${MINIO_BUCKET_AVATARS}/*"]
        }
    ]
}
EOF

mc policy set-json /tmp/avatar-policy.json myminio/${MINIO_BUCKET_AVATARS}

# Set private policy for uploads and documents buckets
echo "Setting private policy for ${MINIO_BUCKET_UPLOADS}..."
mc policy set none myminio/${MINIO_BUCKET_UPLOADS}

echo "Setting private policy for ${MINIO_BUCKET_DOCUMENTS}..."
mc policy set none myminio/${MINIO_BUCKET_DOCUMENTS}

echo "Bucket initialization completed successfully!"

# List buckets and their policies for verification
echo "Verification - Listing buckets:"
mc ls myminio/

echo "Verification - Bucket policies:"
for bucket in "${buckets[@]}"; do
    echo "Policy for ${bucket}:"
    mc policy get myminio/${bucket} || echo "  No policy set"
done

echo "MinIO initialization finished!"
