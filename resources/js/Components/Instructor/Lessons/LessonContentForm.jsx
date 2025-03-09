import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';

export default function LessonContentForm({ data, setData, errors }) {
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

            <div className="space-y-2">
                <Label htmlFor="video_url">Video URL (optional)</Label>
                <Input
                    id="video_url"
                    value={data.video_url}
                    onChange={(e) => setData('video_url', e.target.value)}
                    placeholder="https://example.com/video"
                />
                {errors.video_url && (
                    <p className="text-sm text-destructive">
                        {errors.video_url}
                    </p>
                )}
                <p className="text-sm text-muted-foreground">
                    Enter a YouTube, Vimeo, or other video platform URL
                </p>
            </div>
        </div>
    );
}
