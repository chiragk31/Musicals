import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// ---------------------------------------------------------------------------
// AWS S3 client — configured via VITE_ environment variables.
// See .env.example for required variables.
// ---------------------------------------------------------------------------
const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = import.meta.env.VITE_AWS_S3_BUCKET as string;
const REGION = import.meta.env.VITE_AWS_REGION as string;

/**
 * Uploads a file to AWS S3 and returns its public URL.
 * The bucket must have a public-read bucket policy for the URL to be accessible.
 *
 * @param file      - The File object to upload
 * @param folder    - Folder prefix inside the bucket (e.g. "audio" | "thumbnails")
 * @param userId    - Used to namespace uploads per user
 * @returns         - Public HTTPS URL of the uploaded file
 */
export async function uploadToS3(
  file: File,
  folder: "audio" | "thumbnails",
  userId: string
): Promise<string> {
  const key = `${folder}/${userId}/${Date.now()}-${file.name}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: file,
    ContentType: file.type,
  });

  await s3Client.send(command);

  // Return the public URL (works when the bucket has a public-read policy)
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}
