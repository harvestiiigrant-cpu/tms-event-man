# Uploads Directory

This directory stores user-uploaded files.

## Structure

```
uploads/
├── profiles/          # User profile photos
│   ├── user-1-1703567890123.jpg
│   ├── user-2-1703567891234.jpg
│   └── default-avatar.png
└── signatures/        # User signature images
    ├── user-1-1703567890123.png
    └── user-2-1703567891234.png
```

## File Naming Convention

**Profile Images:**
- Format: `user-{userId}-{timestamp}.{ext}`
- Example: `user-123-1703567890123.jpg`
- Max size: 5MB
- Allowed types: JPG, PNG, WebP

**Signature Images:**
- Format: `user-{userId}-{timestamp}.{ext}`
- Example: `user-123-1703567890123.png`
- Max size: 2MB
- Allowed types: JPG, PNG, WebP

## Production Deployment

For production, consider using cloud storage instead of local filesystem:

### Option 1: AWS S3
```bash
npm install @aws-sdk/client-s3
```

### Option 2: Cloudinary
```bash
npm install cloudinary
```

### Option 3: Azure Blob Storage
```bash
npm install @azure/storage-blob
```

## Security Notes

1. **Validate file types** - Check MIME types server-side
2. **Scan for malware** - Use virus scanning service
3. **Limit file sizes** - Prevent DoS attacks
4. **Generate unique names** - Prevent overwriting
5. **Set proper permissions** - Read-only for public access
6. **Use CDN** - Cache images for better performance

## .gitignore

Add to `.gitignore` to avoid committing user uploads:
```
public/uploads/profiles/*
public/uploads/signatures/*
!public/uploads/profiles/.gitkeep
!public/uploads/signatures/.gitkeep
!public/uploads/profiles/default-avatar.png
```
