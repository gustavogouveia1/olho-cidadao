<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;
    protected $fillable = [
        'title',
        'category',
        'location',
        'description',
        'occurrence_date',
        'status',
        'unique_protocol',
    ];

    protected $casts = [
    'occurrence_date' => 'date',
    'created_at' => 'datetime',
    'updated_at' => 'datetime',
];

}
