import cloudinary from "@/lib/cloudinary";

export async function deleteImage(publicId) {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId);
}

export async function updateImage(Model, id, newImage, field = "image") {
  const oldData = await Model.findById(id);

  if (!oldData) return null;

  const oldImage = oldData[field];

  if (oldImage?.publicId && oldImage.publicId !== newImage?.publicId) {
    await deleteImage(oldImage.publicId);
  }

  return oldData;
}

export async function deleteModelImage(Model, id, field = "image") {
  const data = await Model.findById(id);

  if (!data) return null;

  await deleteImage(data[field]?.publicId);

  return data;
}

// ================= PRODUCT IMAGES =================

// Product update ke waqt removed images delete
export async function updateProductImages(oldImages = [], newImages = []) {
  const newPublicIds = newImages.map((img) => img.publicId);

  for (const oldImg of oldImages) {
    if (oldImg?.publicId && !newPublicIds.includes(oldImg.publicId)) {
      await deleteImage(oldImg.publicId);
    }
  }
}

// Product delete ke waqt sari images delete
export async function deleteProductImages(images = []) {
  for (const img of images) {
    if (img?.publicId) {
      await deleteImage(img.publicId);
    }
  }
}
