export function isImage(url: any) {
  const extension = url?.split(".").pop().toLowerCase();

  return ["jpg", "jpeg", "png", "bmp", "gif"].includes(extension);
}
