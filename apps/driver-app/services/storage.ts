import { supabase, BUCKET_NAME } from '@workspace/integrations/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';

export interface UploadResult {
  url: string;
  path: string;
}

export async function uploadEvidencePhoto(
  uri: string, 
  serviceId: number, 
  type: 'before' | 'after'
): Promise<UploadResult> {
  try {
    // 1. Read file as Base64 (Expo doesn't support Blob/File easily for large files)
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 2. Generate unique path: service_id/timestamp_type.jpg
    const timestamp = new Date().getTime();
    const fileName = `${timestamp}_${type}.jpg`;
    const filePath = `${serviceId}/${fileName}`;

    // 3. Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, decode(base64), {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      throw error;
    }

    // 4. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath
    };
  } catch (error) {
    console.error("Storage upload error:", error);
    throw new Error("Failed to upload photo to cloud storage");
  }
}

export async function uploadServiceSignature(
  base64Data: string, // format: data:image/png;base64,xxxx
  serviceId: number
): Promise<UploadResult> {
  try {
    // 1. Clean the base64 string
    const base64 = base64Data.split(',')[1];
    
    // 2. Path: service_id/signature.png
    const filePath = `${serviceId}/signature.png`;

    // 3. Upload
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, decode(base64), {
        contentType: 'image/png',
        upsert: true
      });

    if (error) throw error;

    // 4. Get URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath
    };
  } catch (error) {
    console.error("Signature upload error:", error);
    throw new Error("Failed to upload signature to cloud storage");
  }
}
