import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import axios from 'axios';
import { Upload, X } from 'lucide-react';
import { useState } from 'react';

export default function LessonContentForm({ data, setData, errors }) {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const handleVideoUpload = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        const validTypes = [
            'video/mp4',
            'video/webm',
            'video/avi',
            'video/mpeg',
            'video/quicktime',
        ];
        if (!validTypes.includes(file.type)) {
            setUploadError(
                'Invalid file type. Please upload a video file (MP4, WebM, AVI, etc.)',
            );
            return;
        }

        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
            setUploadError('File is too large. Maximum size is 100MB.');
            return;
        }

        setUploadError('');
        setIsUploading(true);
        setUploadProgress(0);

        if (data.temp_video) {
            deleteTempVideo(data.temp_video);
        }

        const formData = new FormData();
        formData.append('video', file);

        axios
            .post(route('instructor.lessons.videos.upload'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total,
                    );
                    setUploadProgress(percentCompleted);
                },
            })
            .then((response) => {
                setIsUploading(false);
                setData('temp_video', response.data.path);
                setData('video_url', '');
            })
            .catch((error) => {
                setIsUploading(false);
                setUploadError('Error uploading file. Please try again.');
                console.error('Upload error:', error);
            });
    };

    const deleteTempVideo = (path) => {
        if (!path) return;

        const normalizedPath = path.replace(/\\/g, '/');

        axios
            .post(route('instructor.lessons.videos.delete'), {
                path: normalizedPath,
            })
            .then((response) => {
                if (response.status === 200) {
                    setData('temp_video', '');
                    setUploadProgress(0);
                }
            })
            .catch((error) => {
                console.error('Error deleting temporary video:', error);
            });
    };

    const renderVideoUploader = () => {
        return (
            <div className="space-y-3">
                <Label htmlFor="video">Video File</Label>
                <div className="grid gap-2">
                    {data.temp_video ? (
                        <div className="flex items-center justify-between rounded-md border border-border p-3">
                            <div className="flex items-center">
                                <span className="font-medium">
                                    Video uploaded successfully
                                </span>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTempVideo(data.temp_video)}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remove</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            <div className="flex items-center justify-center rounded-md border border-dashed border-border p-6">
                                <div className="text-center">
                                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <div className="mt-4">
                                        <label
                                            htmlFor="video-upload"
                                            className="inline-flex cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
                                        >
                                            Select Video File
                                            <input
                                                id="video-upload"
                                                name="video"
                                                type="file"
                                                accept="video/*"
                                                className="sr-only"
                                                onChange={handleVideoUpload}
                                                disabled={isUploading}
                                            />
                                        </label>
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        MP4, WebM, AVI up to 100MB
                                    </p>
                                </div>
                            </div>
                            {isUploading && (
                                <div>
                                    <div className="relative h-2 w-full rounded-full bg-muted">
                                        <div
                                            className="absolute h-2 rounded-full bg-primary"
                                            style={{
                                                width: `${uploadProgress}%`,
                                            }}
                                        ></div>
                                    </div>
                                    <span className="mt-1 text-xs text-muted-foreground">
                                        Uploading... {uploadProgress}%
                                    </span>
                                </div>
                            )}
                            {uploadError && (
                                <span className="text-sm text-destructive">
                                    {uploadError}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    <div className="flex-1 space-y-1">
                        <Label htmlFor="video_url">
                            Alternative: Video URL
                        </Label>
                        <Input
                            id="video_url"
                            type="url"
                            placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                            value={data.video_url}
                            onChange={(e) =>
                                setData('video_url', e.target.value)
                            }
                            disabled={!!data.temp_video}
                        />
                        {data.temp_video && (
                            <p className="text-xs text-muted-foreground">
                                To use a URL instead, remove the uploaded video
                                first.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="content">Lesson Content</Label>
                <Textarea
                    id="content"
                    value={data.content}
                    onChange={(e) => setData('content', e.target.value)}
                    placeholder="Enter the main content for this lesson"
                    rows={10}
                />
                {errors.content && (
                    <p className="text-sm text-destructive">{errors.content}</p>
                )}
            </div>

            <div className="mt-6">{renderVideoUploader()}</div>
        </div>
    );
}
