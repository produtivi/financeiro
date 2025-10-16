import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  endpoint: `https://${process.env.SPACES_ENDPOINT}`,
  region: process.env.SPACES_REGION || 'nyc3',
  credentials: {
    accessKeyId: process.env.SPACES_KEY!,
    secretAccessKey: process.env.SPACES_SECRET!,
  },
});

export async function uploadToSpaces(
  buffer: Buffer,
  fileName: string,
  contentType: string = 'image/png'
): Promise<string> {
  const bucket = process.env.SPACES_BUCKET!;
  const key = `relatorios/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ACL: 'public-read',
    ContentType: contentType,
  });

  await s3Client.send(command);

  const url = `https://${bucket}.${process.env.SPACES_ENDPOINT}/${key}`;
  return url;
}
