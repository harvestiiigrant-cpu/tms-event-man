# Photo Upload Implementation Guide

## Overview

The PLP Training Management System uses a **file storage + URL path** approach for profile photos and signatures. This document explains the current implementation and how to integrate with a backend.

## Current Implementation (Development)

### Architecture
```
Frontend (React)
    ↓
Upload Utils (/src/lib/uploadUtils.ts)
    ↓
Data URL (base64) - Temporary preview
    ↓
Store in component state
```

### File Structure
```
public/
  └── uploads/
      ├── profiles/          # User profile photos
      │   ├── .gitkeep
      │   └── default-avatar.png
      ├── signatures/        # User signatures
      │   └── .gitkeep
      └── README.md
```

### How It Works

1. **User selects photo** → File input triggers
2. **Validation** → Check size (5MB max), type (JPG/PNG/WebP)
3. **Convert to Data URL** → For immediate preview (development only)
4. **Update state** → Display preview in Avatar component
5. **Save to profile** → Update profile_image_url in database

### Code Example

```typescript
// User clicks camera button
<Button onClick={() => profileImageInputRef.current?.click()}>
  <Camera />
</Button>

// File input (hidden)
<input
  ref={profileImageInputRef}
  type="file"
  accept="image/jpeg,image/png,image/jpg,image/webp"
  onChange={handleProfileImageChange}
/>

// Upload handler
const handleProfileImageChange = async (e) => {
  const file = e.target.files?.[0];

  // Upload using utility
  const result = await uploadProfileImage(file, userId);

  if (result.success) {
    setProfileImage(result.url); // Display preview
    updateProfile({ profile_image_url: result.url });
  }
};
```

## Production Implementation (Backend Integration)

### Step 1: Set Up Upload Endpoint

#### Option A: Node.js + Express + Multer

```bash
npm install multer sharp
```

```javascript
// server/routes/upload.js
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || 'profiles';
    const uploadPath = path.join(__dirname, '../../public/uploads', folder);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const userId = req.body.userId;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `user-${userId}-${timestamp}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

// Upload endpoint
router.post('/profile-image', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { userId, folder } = req.body;
    const filePath = req.file.path;
    const fileName = req.file.filename;

    // Optional: Optimize image using sharp
    const optimizedPath = path.join(
      path.dirname(filePath),
      `optimized-${fileName}`
    );

    await sharp(filePath)
      .resize(500, 500, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(optimizedPath);

    // Delete original, rename optimized
    fs.unlinkSync(filePath);
    fs.renameSync(optimizedPath, filePath);

    // Return URL
    const url = `/uploads/${folder}/${fileName}`;

    res.json({
      success: true,
      url,
      filename: fileName,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Delete endpoint
router.delete('/delete', async (req, res) => {
  try {
    const { url } = req.body;
    const filePath = path.join(__dirname, '../../public', url);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
```

### Step 2: Update Frontend Upload Utility

Update `/src/lib/uploadUtils.ts`:

```typescript
export async function uploadProfileImage(
  file: File,
  userId: string,
  options: UploadOptions = { ...DEFAULT_OPTIONS, folder: 'profiles' }
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(file, options);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // PRODUCTION: Upload to server
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('userId', userId);
    formData.append('folder', options.folder || 'profiles');

    const response = await fetch('/api/upload/profile-image', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();

    return {
      success: true,
      url: result.url, // e.g., '/uploads/profiles/user-123-1703567890.jpg'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}
```

### Step 3: Update Database Schema

```sql
-- Add profile_image_url column
ALTER TABLE users
ADD COLUMN profile_image_url VARCHAR(255) DEFAULT '/uploads/profiles/default-avatar.png';

-- Add signature_url column
ALTER TABLE users
ADD COLUMN signature_url VARCHAR(255) DEFAULT NULL;
```

### Step 4: Update Profile Save Handler

```typescript
const handleSave = async () => {
  try {
    // Save to API
    const response = await fetch('/api/profile/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        ...profileData,
        profile_image_url: profileImage, // URL path from upload
        signature_url: signatureImage,
      }),
    });

    if (!response.ok) throw new Error('Update failed');

    toast({
      title: 'Profile Updated',
      description: 'Your profile has been updated successfully.',
    });

    setIsEditing(false);
  } catch (error) {
    toast({
      title: 'Update Failed',
      description: 'Failed to update profile',
      variant: 'destructive',
    });
  }
};
```

## Cloud Storage Integration (Recommended for Production)

### Option 1: AWS S3

```bash
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage
```

```typescript
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(file: File, userId: string) {
  const key = `profiles/${generateFileName(userId, file.name)}`;

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: file,
      ContentType: file.type,
      ACL: 'public-read',
    },
  });

  await upload.done();

  return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;
}
```

### Option 2: Cloudinary

```bash
npm install cloudinary
```

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(file: File, userId: string) {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: 'plp-tms/profiles',
    public_id: `user-${userId}-${Date.now()}`,
    transformation: [
      { width: 500, height: 500, crop: 'fill' },
      { quality: 'auto' },
    ],
  });

  return result.secure_url;
}
```

## Security Best Practices

1. **Validate File Types** - Check MIME types and magic numbers
2. **Limit File Size** - Prevent DoS attacks
3. **Scan for Malware** - Use ClamAV or cloud service
4. **Authentication** - Require auth token for uploads
5. **Rate Limiting** - Prevent abuse
6. **Unique Filenames** - Prevent overwriting/conflicts
7. **Content Security Policy** - Set proper headers
8. **HTTPS Only** - Encrypt file transfers

## Testing

```bash
# Test file upload
curl -X POST http://localhost:3000/api/upload/profile-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@/path/to/image.jpg" \
  -F "userId=123" \
  -F "folder=profiles"

# Expected response
{
  "success": true,
  "url": "/uploads/profiles/user-123-1703567890.jpg",
  "filename": "user-123-1703567890.jpg"
}
```

## Migration Checklist

- [ ] Set up upload endpoint (Express + Multer)
- [ ] Configure file storage (local or cloud)
- [ ] Update uploadUtils.ts with production code
- [ ] Update database schema
- [ ] Add image optimization (sharp)
- [ ] Implement file deletion on update
- [ ] Add security measures
- [ ] Test upload flow end-to-end
- [ ] Add error handling and logging
- [ ] Configure CDN (optional)

## Support

For questions about the upload implementation, refer to:
- Upload Utils: `/src/lib/uploadUtils.ts`
- Profile Component: `/src/pages/portal/BeneficiaryProfile.tsx`
- Directory Structure: `/public/uploads/README.md`
