<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'title',
        'description',
        'time_limit',
        'passing_score',
        'due_date',
    ];

    protected $casts = [
        'due_date' => 'datetime',
    ];

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function attempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }
}
