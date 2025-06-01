<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function get()
    {
        $data = Role::all();
        return response()->json($data, 200);
    }

    public function row(Role $role)
    {
        return response()->json($role, 200);
    }
}
