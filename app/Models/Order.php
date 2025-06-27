<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'trx',
        'user_id',
        'user_address_id',
        'custom_user',
        'custom_phone',
        'custom_address',
        'custom_lat',
        'custom_long',
        'status',
        'payment_status',
        'distance_km',
        'delivery_fee',
        'service_method'
    ];

    public function order_details(): HasMany
    {
        return $this->hasMany(OrderDetail::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function user_address(): BelongsTo
    {
        return $this->belongsTo(UserAddress::class);
    }
}
