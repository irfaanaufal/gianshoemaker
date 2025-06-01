<?php

namespace App\Http\Controllers;

use App\Models\Treatment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Http\Requests\Treatment\StoreRequest as TreatmentStore;
use App\Http\Requests\Treatment\UpdateRequest as TreatmentUpdate;
use Illuminate\Support\Facades\DB;

class TreatmentController extends Controller
{
    public function get()
    {
        $data = Treatment::all();
        return response()->json($data, 200);
    }

    public function row(Treatment $treatment)
    {
        return response()->json($treatment, 200);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('treatment/page', [
            "title" => "GIANSHOEMAKER | Treatment",
            "treatments" => Treatment::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('treatment/create', [
            "title" => "GIANSHOEMAKER | Tambah Treatment",
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(TreatmentStore $request)
    {
        DB::transaction(function() use($request) {
            $validated = $request->validated();
            $validated['slug'] = Str::slug($validated['name']);
            if ($request->hasFile('picture')) {
                $validated['picture'] = "/storage/" . $request->file('picture')->store('treatments');
            }
            $treatment = Treatment::create($validated);
            if (!$treatment) {
                return response()->json([
                    "message" => "Data gagal diinputkan ke database!"
                ], 205);
            }
        });
        return response()->json([
            "message" => "Data berhasil diinputkan ke database!"
        ], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(Treatment $treatment)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Treatment $treatment)
    {
        return Inertia::render('treatment/edit', [
            "title" => "GIANSHOEMAKER | Edit Treatment",
            "treatment" => $treatment
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(TreatmentUpdate $request, Treatment $treatment)
    {
        DB::transaction(function() use($request, $treatment) {
            $validated = $request->validated();
            $validated['slug'] = Str::slug($validated['name']);
            $validated['picture'] = $request->hasFile('picture') ? "/storage/" . $request->file('picture')->store('treatments') : $treatment->picture;
            $treatment->update($validated);
        });
        return response()->json([
            "message" => "Data berhasil diupdate!"
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Treatment $treatment)
    {
        //
    }
}
