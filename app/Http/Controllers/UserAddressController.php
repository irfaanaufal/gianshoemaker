<?php

namespace App\Http\Controllers;

use App\Models\UserAddress;
use Illuminate\Http\Request;
use App\Http\Requests\Address\StoreRequest as AddressStore;
use App\Http\Requests\Address\UpdateRequest as AddressUpdate;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UserAddressController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(AddressStore $request)
    {
        DB::transaction(function() use($request) {
            $user = Auth::user();
            $validated = $request->validated();
            $validated['user_id'] = $user->id;
            $address = UserAddress::create($validated);
            if (!$address) {
                return response()->json([
                    "message" => "Gagal menginputkan alamat baru!"
                ], 205);
            }
        });
        return response()->json([
            "message" => "Berhasil menambahkan alamat baru!"
        ], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(UserAddress $userAddress)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(UserAddress $userAddress)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(AddressUpdate $request, UserAddress $userAddress)
    {
        DB::transaction(function() use($request, $userAddress) {
            $validated = $request->validated();
            $userAddress->update($validated);
        });
        return response()->json([
            "message" => "Berhasil mengubah alamat!"
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserAddress $userAddress)
    {
        //
    }
}
