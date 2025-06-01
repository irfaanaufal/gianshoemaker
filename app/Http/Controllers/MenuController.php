<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Requests\Menu\StoreRequest as MenuStore;
use App\Http\Requests\Menu\UpdateRequest as MenuUpdate;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class MenuController extends Controller
{
    public function get()
    {
        $data = Menu::with('roles')->get();
        return response()->json($data, 200);
    }

    public function row(Menu $menu)
    {
        return response()->json($menu->load('roles'), 200);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('menu/page', [
            "title" => "GIANSHOEMAKER | Menu",
            "menus" => Menu::with('roles')->get(),
            "roles" => Role::all()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('menu/create', [
            "title" => "GIANSHOEMAKER | Tambah Menu",
            "roles" => Role::all()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(MenuStore $request)
    {
        // dd($request);
        DB::transaction(function() use($request) {
            $validated = $request->validated();
            $validated['slug'] = Str::slug($validated['name']);
            $menu = Menu::create($validated);
            if (!$menu) {
                return response()->json(["message" => "Data Gagal diinputkan ke database!"], 205);
            }
            $roles = [];
            foreach ($validated['roles'] as $role) {
                array_push($roles, (integer)$role['value']);
            }
            $menu->roles()->attach($roles);
        });
        return response()->json([
            "message" => "Data berhasil diinputkan ke database!"
        ], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(Menu $menu)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Menu $menu)
    {
        return Inertia::render('menu/edit', [
            "title" => "GIANSHOEMAKER | Edit Menu $menu->name",
            "menu" => $menu->load('roles'),
            "roles" => Role::all(),
            "readMode" => false
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(MenuUpdate $request, Menu $menu)
    {
        DB::transaction(function() use($request, $menu) {
            // Here's the logic for update data from database
            $validated = $request->validated();
            $validated['slug'] = Str::slug($validated['name']);
            $menu->updateOrFail($validated);
        });
        return response()->json([
            "message" => "Data berhasil diubah!"
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Menu $menu)
    {
        DB::beginTransaction();
        if ($menu->roles()->exists()) {
            DB::rollBack();
            return response()->json([
                "message" => "Gagal menghapus data!"
            ], 205);
        }
        $menu->delete();
        DB::commit();
        return response()->json([
            "message" => "Berhasil menghapus data!"
        ], 200);
    }
}
