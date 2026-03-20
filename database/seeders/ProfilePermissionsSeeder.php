<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class ProfilePermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'admin' => 'Administrador',
            'seller' => 'Vendedor',
            'ventas' => 'Perfil Ventas',
            'logistica' => 'Perfil Logistica',
            'contabilidad' => 'Perfil Contabilidad',
            'gerencial_general' => 'Perfil Gerencial General',
        ];

        foreach ($roles as $name => $label) {
            Role::updateOrCreate(['name' => $name], ['label' => $label]);
        }

        $permissions = [
            'sales.access' => 'Acceso a ventas',
            'logistics.access' => 'Acceso a logistica',
            'accounting.access' => 'Acceso a contabilidad',
            'finance.access' => 'Acceso a finanzas',
            'hr.self' => 'Acceso a mis permisos',
            'hr.manage' => 'Acceso a solicitudes RRHH',
            'admin.access' => 'Acceso administrativo general',
            'support.blackbox' => 'Acceso a soporte tecnico caja negra',
        ];

        foreach ($permissions as $name => $label) {
            Permission::updateOrCreate(['name' => $name], ['label' => $label]);
        }

        $permissionIds = Permission::query()->pluck('id', 'name');
        $allPermissionIds = Permission::query()->pluck('id')->all();

        $rolePermissions = [
            'admin' => $allPermissionIds,
            'gerencial_general' => $allPermissionIds,
            'ventas' => [
                $permissionIds['sales.access'],
                $permissionIds['hr.self'],
                $permissionIds['hr.manage'],
            ],
            'seller' => [
                $permissionIds['sales.access'],
                $permissionIds['hr.self'],
            ],
            'logistica' => [
                $permissionIds['logistics.access'],
                $permissionIds['hr.self'],
                $permissionIds['hr.manage'],
            ],
            'contabilidad' => [
                $permissionIds['accounting.access'],
                $permissionIds['hr.self'],
                $permissionIds['hr.manage'],
            ],
        ];

        foreach ($rolePermissions as $roleName => $ids) {
            $role = Role::where('name', $roleName)->first();
            if ($role) {
                $role->permissions()->sync(array_values(array_filter($ids)));
            }
        }
    }
}
