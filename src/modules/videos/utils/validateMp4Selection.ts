type ValidationResult = {
  files: File[];
  error: string | null;
};

export function validateMp4Selection(selected: File[]): ValidationResult {
  if (selected.length === 0) return { files: [], error: null };

  const invalid = selected.find(
    (f) => f.type !== "video/mp4" && !f.name.toLowerCase().endsWith(".mp4")
  );

  if (invalid) {
    return { files: [], error: `El archivo "${invalid.name}" no es .mp4` };
  }

  return { files: selected, error: null };
}
