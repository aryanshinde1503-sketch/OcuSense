import { useRef, useState, type DragEvent } from 'react';
import { UploadCloud, ImageUp } from 'lucide-react';

export default function UploadArea({
  onFileSelected,
}: {
  onFileSelected: (file: File) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors ${
        dragging ? 'border-teal-500 bg-teal-50' : 'border-navy-100 bg-white hover:border-teal-300'
      }`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
        {dragging ? <ImageUp className="h-7 w-7" /> : <UploadCloud className="h-7 w-7" />}
      </div>
      <div>
        <p className="font-display text-lg text-navy-800">
          {dragging ? 'Drop your image here' : 'Drag & drop a retinal image'}
        </p>
        <p className="mt-1 text-sm text-navy-500">or click to browse from your device</p>
      </div>
      <p className="text-xs text-navy-400">Supports JPG, PNG, WEBP — up to 10 MB</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
        }}
      />
    </div>
  );
}
