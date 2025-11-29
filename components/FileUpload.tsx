import React, { useRef, useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    accept?: string;
    maxSize?: number; // em MB
    label?: string;
    preview?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onFileSelect,
    accept = 'image/*,application/pdf',
    maxSize = 5,
    label = 'Selecionar arquivo',
    preview = false
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamanho
        if (file.size > maxSize * 1024 * 1024) {
            setError(`Arquivo muito grande. Tamanho máximo: ${maxSize}MB`);
            return;
        }

        setError(null);
        setSelectedFile(file);
        onFileSelect(file);

        // Gerar preview se for imagem
        if (preview && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClear = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
            />

            {!selectedFile ? (
                <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
                >
                    <Upload className="mr-2 text-gray-400" size={20} />
                    <span className="text-sm font-medium text-gray-600">{label}</span>
                </label>
            ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-12 h-12 rounded object-cover" />
                        ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                {selectedFile.type.startsWith('image/') ? (
                                    <ImageIcon size={24} className="text-gray-500" />
                                ) : (
                                    <FileText size={24} className="text-gray-500" />
                                )}
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                {(selectedFile.size / 1024).toFixed(2)} KB
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClear}
                        className="text-gray-400 hover:text-red-500 transition"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}

            {error && (
                <p className="text-xs text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span> {error}
                </p>
            )}
        </div>
    );
};
