<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LogAnalyst extends Model
{
    use SoftDeletes;

    protected $fillable = [
        "dirtiness_level",
        "is_yellowing",
        "recommended_treatment_slug",
        "reason"
    ];
}
