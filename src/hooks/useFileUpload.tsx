import { useMutation } from "@tanstack/react-query";

export function useFileUpload() {
  const {
    mutateAsync: uploadFile,
    error,
    isPending: isUploading,
  } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
  });

  return { uploadFile, error, isUploading };
}
