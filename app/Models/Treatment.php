<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Treatment extends Model
{
    use HasFactory, SoftDeletes;

    protected static function booted() {
        static::creating(function($treatment) {
            if (empty($treatment->slug)) {
                $treatment->slug = Str::slug($treatment->name);
            }
        });

        static::updating(function($treatment) {
            $treatment->slug = Str::slug($treatment->name);
        });
    }

    protected $fillable = [
        'name',
        'slug',
        'price',
        'description',
        'picture',
        'analyze',
        'is_yellow'
    ];


    public function order_details(): HasMany
    {
        return $this->hasMany(OrderDetail::class);
    }
}
