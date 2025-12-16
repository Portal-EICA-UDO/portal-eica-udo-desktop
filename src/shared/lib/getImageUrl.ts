export function getImageUrl(bucketName: string, fileName: string): string {
  const projectRef = "xyzcompany"; // Reemplaza con tu Project Ref
  return `https://ldnmltnoowonkijxtrag.supabase.co/storage/v1/object/public/${bucketName}/${fileName}`;
}
