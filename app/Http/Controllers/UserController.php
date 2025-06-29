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
        $data = User::whereDoesntHave('roles', function ($query) {
            $query->where('name', 'admin');
        })->with('roles')->get();

        return Inertia::render('user/page', [
            "title" => "GIANSHOEMAKER | User",
            "users" => $data
        ]);
    }

    public function create()
    {
        return Inertia::render('user/create', [
            "title" => "Tambah Data User",
        ]);
    }

    public function store(UserStore $request)
    {
        DB::transaction(function () use ($request) {
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
        ], 201);
    }

    public function edit(User $user) {
        return Inertia::render('user/edit', [
            "title" => "Edit Data User",
            "user" => $user->load('roles')
        ]);
    }

    public function update(UserUpdate $request, User $user)
    {
        DB::transaction(function() use($request, $user) {
            $validated = $request->validated();
            $currRole = $user->getRoleNames();
            $user->update($validated);
            $user->removeRole($currRole[0]);
            $user->assignRole($validated['role']);
        });
        return response()->json([
            "message" => "Berhasil mengubah user!"
        ], 201);
    }
}
