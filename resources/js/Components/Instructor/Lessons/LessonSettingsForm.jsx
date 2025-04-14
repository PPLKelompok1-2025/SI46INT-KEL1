import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';

export default function LessonSettingsForm({ data, setData, errors }) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                    id="duration"
                    type="number"
                    min="0"
                    value={data.duration}
                    onChange={(e) => setData('duration', e.target.value)}
                    placeholder="Enter lesson duration in minutes"
                />
                {errors.duration && (
                    <p className="text-sm text-destructive">
                        {errors.duration}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="order">Lesson Order *</Label>
                <Input
                    id="order"
                    type="number"
                    min="1"
                    value={data.order}
                    onChange={(e) => setData('order', e.target.value)}
                    placeholder="Enter lesson order"
                />
                {errors.order && (
                    <p className="text-sm text-destructive">{errors.order}</p>
                )}
                <p className="text-sm text-muted-foreground">
                    The order in which this lesson appears in the course
                </p>
            </div>

            <div className="space-y-4 pt-4">
                <div className="flex items-center space-x-2">
                    <Switch
                        id="is_free"
                        checked={data.is_free}
                        onCheckedChange={(checked) =>
                            setData('is_free', checked)
                        }
                    />
                    <Label htmlFor="is_free">Free Preview</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                    If enabled, this lesson will be available as a free preview
                </p>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="is_published"
                        checked={data.is_published}
                        onCheckedChange={(checked) =>
                            setData('is_published', checked)
                        }
                    />
                    <Label htmlFor="is_published">Publish Immediately</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                    If disabled, this lesson will be saved as a draft
                </p>
            </div>
        </div>
    );
}
