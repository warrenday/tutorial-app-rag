function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks = [];
  const totalChunks = Math.ceil(text.length / chunkSize);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = start + chunkSize;

    const startWithOverlap = start - overlap;
    const endWithOverlap = end + overlap;

    const startSlice = startWithOverlap < 0 ? 0 : startWithOverlap;
    const endSlice =
      endWithOverlap > text.length ? text.length : endWithOverlap;

    const chunk = text.slice(startSlice, endSlice);
    chunks.push(chunk);
  }

  return chunks;
}

export default chunkText;
