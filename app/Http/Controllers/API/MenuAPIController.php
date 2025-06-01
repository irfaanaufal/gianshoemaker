<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Http\Requests\Menu\StoreRequest as MenuStore;
use App\Http\Requests\Menu\UpdateRequest as MenuUpdate;

class MenuAPIController extends Controller
{
    public function index()
    {
        $data = Menu::all();
        return response()->json($data);
    }

    public function store(MenuStore $request)
    {
        //
        dd($request);
    }
}
