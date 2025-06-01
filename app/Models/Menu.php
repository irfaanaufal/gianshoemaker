<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Models\Role;

class Menu extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'url',
        'route',
        'icon',
        'is_active',
    ];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'menu_role');
    }
}
