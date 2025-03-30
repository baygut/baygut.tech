import React, { useRef, useState } from 'react';
import { XIcon } from 'lucide-react';

interface ImageUploadProps {
  onImagesChange: (images: { data: ArrayBuffer; type: string }[]) => void;
  required?: boolean;
  maxWidth?: number; // Added property for image resizing
  maxHeight?: number; // Added property for image resizing
  quality?: number; // Added property for JPEG compression quality
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesChange,
  required = false,
  maxWidth = 1200, // Reasonable default max width
  maxHeight = 1200, // Reasonable default max height
  quality = 0.8, // 80% quality is usually a good balance
}) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<{ data: ArrayBuffer; type: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to resize and compress an image
  const processImage = (
    file: File
  ): Promise<{ data: ArrayBuffer; type: string; preview: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (!event.target?.result) {
          reject(new Error('Failed to read file'));
          return;
        }

        const img = new Image();
        img.src = event.target.result as string;

        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          // Draw resized image on canvas
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convert to desired format and quality
          let outputType = file.type;
          const outputQuality = quality;

          // For JPEGs and PNGs, we can use the original MIME type
          // For other formats, convert to JPEG for better compression
          if (!outputType.match(/image\/(jpeg|png)/)) {
            outputType = 'image/jpeg';
          }

          // Get data URL of resized image
          const dataURL = canvas.toDataURL(outputType, outputQuality);

          // Convert data URL to blob
          fetch(dataURL)
            .then((res) => res.blob())
            .then((blob) => blob.arrayBuffer())
            .then((arrayBuffer) => {
              resolve({
                data: arrayBuffer,
                type: outputType,
                preview: dataURL,
              });
            })
            .catch((err) => {
              reject(err);
            });
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsProcessing(true);

    try {
      const newFiles = Array.from(e.target.files);

      // Process each file to resize, compress, and get preview URLs
      const processedFiles = await Promise.all(newFiles.map(processImage));

      // Update state with new files and preview URLs
      const newImageFiles = [
        ...imageFiles,
        ...processedFiles.map((f) => ({ data: f.data, type: f.type })),
      ];
      const newPreviews = [...previews, ...processedFiles.map((f) => f.preview)];

      setImageFiles(newImageFiles);
      setPreviews(newPreviews);

      // Notify parent component about the change
      onImagesChange(newImageFiles);
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Failed to process one or more images. Please try again with different images.');
    } finally {
      setIsProcessing(false);
      // Reset input to allow selecting the same file again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    // Create new arrays without the removed image
    const newPreviews = [...previews];
    const newImageFiles = [...imageFiles];

    // Revoke the Object URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);

    // Remove the image from arrays
    newPreviews.splice(index, 1);
    newImageFiles.splice(index, 1);

    // Update state
    setPreviews(newPreviews);
    setImageFiles(newImageFiles);

    // Notify parent component
    onImagesChange(newImageFiles);
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="sr-only"
        id="image-upload"
        required={required && imageFiles.length === 0}
        disabled={isProcessing}
      />

      <label
        htmlFor="image-upload"
        className={`flex items-center justify-center px-4 py-2 border border-gray-300/30 rounded-md cursor-pointer bg-white/5 hover:bg-white/10 ${
          isProcessing ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isProcessing ? 'Processing Images...' : 'Upload Images'}
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative group">
            <img
              src={preview}
              alt={`Preview ${index + 1}`}
              className="h-32 w-full object-cover rounded-md border border-gray-300/30"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
              disabled={isProcessing}
            >
              <XIcon size={16} />
            </button>
          </div>
        ))}
      </div>

      {required && imageFiles.length === 0 && (
        <p className="text-sm text-red-500">At least one image is required</p>
      )}

      <p className="text-xs text-gray-500">
        Images will be automatically resized and compressed to optimize upload speed.
      </p>
    </div>
  );
};

export default ImageUpload;
