<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'enrolled_at',
        'completed_at',
        'progress',
    ];

    protected $casts = [
        'enrolled_at' => 'datetime',
        'completed_at' => 'datetime',
        'progress' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function completedLessons()
    {
        return $this->belongsToMany(Lesson::class, 'lesson_completions', 'enrollment_id', 'lesson_id')
            ->withTimestamps();
    }

    public function isCompleted()
    {
        return $this->completed_at !== null;
    }

    public function markAsCompleted()
    {
        $this->update([
            'completed_at' => now(),
            'progress' => 100.00,
        ]);
    }

    public function updateProgress($percentage)
    {
        $this->update([
            'progress' => $percentage,
            'completed_at' => $percentage >= 100 ? now() : $this->completed_at,
        ]);
    }
}
