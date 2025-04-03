<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'slug',
        'description',
        'video_url',
        'video_path',
        'video_disk',
        'encryption_key',
        'content',
        'duration',
        'order',
        'is_free',
        'is_published',
        'section',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }

    public function getVideoPathAttribute($value)
    {
        return $value;
    }

    public function hasEncryptedVideo()
    {
        return !empty($this->video_path) && !empty($this->encryption_key);
    }
}
