<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'slug',
        'description',
        'short_description',
        'price',
        'level',
        'language',
        'thumbnail',
        'promotional_video',
        'is_published',
        'is_featured',
        'is_approved',
        'requirements',
        'what_you_will_learn',
        'who_is_this_course_for',
    ];

    protected $casts = [
        'requirements' => 'array',
        'what_you_will_learn' => 'array',
        'who_is_this_course_for' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function certificates()
    {
        return $this->hasMany(Certificate::class);
    }

    public function getAverageRatingAttribute()
    {
        return $this->reviews()->avg('rating') ?? 0;
    }

    public function getTotalEnrollmentsAttribute()
    {
        return $this->enrollments()->count();
    }
}
