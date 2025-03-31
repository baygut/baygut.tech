import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { XIcon } from 'lucide-react';

interface ImageUploadProps {
  onImagesChange: (images: { data: ArrayBuffer; type: string }[]) => void;
  required?: boolean;
  maxWidth?: number; // Added property for image resizing
  maxHeight?: number; // Added property for image resizing
  quality?: number; // Added property for JPEG compression quality
  preserveQuality?: boolean; // New prop to preserve original quality
  label?: string; // Custom label for the upload button
  singleImage?: boolean; // Option to only allow one image
  inputId?: string; // Add prop for custom input ID
}

// Define exported ref type for TypeScript
export interface ImageUploadRefType {
  reset: () => void;
}

const ImageUpload = forwardRef<ImageUploadRefType, ImageUploadProps>(
  (
    {
      onImagesChange,
      required = false,
      maxWidth = 1200, // Reasonable default max width
      maxHeight = 1200, // Reasonable default max height
      quality = 0.9, // Increased default quality to 90%
      preserveQuality = true, // Default is false for backward compatibility
      label = 'Upload Images',
      singleImage = false,
      inputId = 'image-upload', // Default ID if not provided
    },
    ref
  ) => {
    const [previews, setPreviews] = useState<string[]>([]);
    const [imageFiles, setImageFiles] = useState<{ data: ArrayBuffer; type: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Expose reset method to parent component
    useImperativeHandle(ref, () => ({
      reset: () => {
        // Clear all previews and images
        setPreviews([]);
        setImageFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    }));

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
            // If preserveQuality is true and the image is smaller than maxWidth/maxHeight
            // just use the original image without resizing
            if (preserveQuality && img.width <= maxWidth && img.height <= maxHeight) {
              // Get the original file as ArrayBuffer
              const originalReader = new FileReader();
              originalReader.onload = () => {
                if (originalReader.result instanceof ArrayBuffer) {
                  resolve({
                    data: originalReader.result,
                    type: file.type,
                    preview: img.src,
                  });
                } else {
                  reject(new Error('Failed to read file as ArrayBuffer'));
                }
              };
              originalReader.onerror = () => reject(new Error('Failed to read file'));
              originalReader.readAsArrayBuffer(file);
              return;
            }

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
            const outputQuality = preserveQuality ? 1.0 : quality;

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

        // If singleImage is true, only process the first selected file
        const filesToProcess = singleImage ? [newFiles[0]] : newFiles;

        // Process each file to resize, compress, and get preview URLs
        const processedFiles = await Promise.all(filesToProcess.map(processImage));

        // Update state with new files and preview URLs
        const newImageFiles = singleImage
          ? processedFiles.map((f) => ({ data: f.data, type: f.type })) // Replace existing
          : [...imageFiles, ...processedFiles.map((f) => ({ data: f.data, type: f.type }))]; // Append

        const newPreviews = singleImage
          ? processedFiles.map((f) => f.preview) // Replace existing
          : [...previews, ...processedFiles.map((f) => f.preview)]; // Append

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
          multiple={!singleImage}
          onChange={handleFileChange}
          className="sr-only"
          id={inputId} // Use the custom ID
          required={required && imageFiles.length === 0}
          disabled={isProcessing}
        />

        <label
          htmlFor={inputId} // Make sure the label matches the input's ID
          className={`flex items-center justify-center px-4 py-2 border border-gray-300/30 rounded-md cursor-pointer bg-white/5 hover:bg-white/10 ${
            isProcessing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isProcessing ? 'Processing Images...' : label}
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
          {preserveQuality
            ? 'Images will be resized only if they exceed maximum dimensions, preserving original quality.'
            : 'Images will be automatically resized and compressed to optimize upload speed.'}
        </p>
      </div>
    );
  }
);

ImageUpload.displayName = 'ImageUpload';

export default ImageUpload;
