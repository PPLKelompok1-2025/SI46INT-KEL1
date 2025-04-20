import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThumbnailUpload({ value, onChange, error }) {
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (!value || typeof value === 'string') {
            // If value is a string, it's an existing file path
            if (value) setPreview(`/storage/${value}`);
            return;
        }

        const objectUrl = URL.createObjectURL(value);
        setPreview(objectUrl);

        // Free memory when component unmounts
        return () => URL.revokeObjectURL(objectUrl);
    }, [value]);

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onChange(file);
        }
    };

    return (
        <div className="space-y-2">
            <Label htmlFor="thumbnail">Course Thumbnail</Label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                    />
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                    <p className="mt-1 text-sm text-muted-foreground">
                        Recommended size: 1280x720 pixels (16:9 ratio)
                    </p>
                </div>
                <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                    {preview ? (
                        <img
                            src={preview}
                            alt="Thumbnail preview"
                            className="h-full w-full rounded-md object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center text-muted-foreground">
                            <ImageIcon className="mb-2 h-10 w-10" />
                            <span>No thumbnail selected</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
