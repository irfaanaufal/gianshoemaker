<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\User\StoreRequest as UserStore;
use App\Http\Requests\User\UpdateRequest as UserUpdate;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('user/page', [
            "title" => "GIANSHOEMAKER | User"
        ]);
    }

    public function create()
    {
        //
    }

    public function store(UserStore $request)
    {
        DB::transaction(function() use($request) {
            $validated = $request->validated();
            $validated['password'] = Hash::make('password');
            $validated['is_active'] = true;
            $user = User::create($validated);
            if (!$user) {
                return response()->json([
                    "message" => "Gagal menambahkan user baru!"
                ], 205);
            }
            $user->assignRole($validated['role']);
        });
        return response()->json([
            "message" => "Berhasil menambahkan user baru!"
        ], 200);
    }
}
