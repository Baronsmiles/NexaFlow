import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET_NAME = 'product-images';

export async function uploadProductImage(imageData, fileName) {
  const match = imageData.match(
    /^data:(image\/[^;]+);base64,(.+)$/
  );

  if (!match) {
    throw new Error('Invalid image format.');
  }

  const contentType = match[1];
  const base64Data = match[2];

  const buffer = Buffer.from(base64Data, 'base64');

  const extension = contentType.split('/')[1];

  const safeName = fileName
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .toLowerCase();

  const uniqueFileName = `${Date.now()}-${safeName}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(uniqueFileName, buffer, {
      contentType,
      upsert: false
    });

  if (error) {
    throw new Error(
      `Supabase upload failed: ${error.message}`
    );
  }

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(uniqueFileName);

  return data.publicUrl;
}

function getContentType(imageData) {
  const match = imageData.match(/^data:(image\/[^;]+);base64,/);

  if (!match) {
    throw new Error('Invalid image format.');
  }

  return match[1];
}

export async function deleteProductImage(imageUrl) {
  try {
    const marker =
      `/storage/v1/object/public/${BUCKET_NAME}/`;

    if (!imageUrl.includes(marker)) {
      throw new Error('Invalid Supabase image URL.');
    }

    const filePath = decodeURIComponent(
      imageUrl.split(marker)[1]
    );

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      throw new Error(
        `Supabase delete failed: ${error.message}`
      );
    }

    return true;
  } catch (error) {
    console.error(
      'Delete Supabase image error:',
      error
    );

    throw error;
  }
}

export default supabase;