<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::with('role')
            ->when($request->search, fn($q, $s) =>
                $q->where('name', 'like', "%$s%")
                  ->orWhere('email', 'like', "%$s%")
            )
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users'   => $users,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Users/Form', [
            'roles' => Role::orderBy('label')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:150',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed',
            'role_id'  => 'nullable|exists:roles,id',
        ]);

        User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role_id'  => $data['role_id'] ?? null,
        ]);

        return redirect()->route('users.index')->with('success', 'Usuario creado.');
    }

    public function edit(User $user)
    {
        return Inertia::render('Users/Form', [
            'user'  => $user->load('role'),
            'roles' => Role::orderBy('label')->get(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:150',
            'email'    => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|min:8|confirmed',
            'role_id'  => 'nullable|exists:roles,id',
            'is_active'=> 'boolean',
        ]);

        $user->name    = $data['name'];
        $user->email   = $data['email'];
        $user->role_id = $data['role_id'] ?? null;
        $user->is_active = $data['is_active'] ?? true;

        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return redirect()->route('users.index')->with('success', 'Usuario actualizado.');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('users.index')->with('success', 'Usuario eliminado.');
    }
}
