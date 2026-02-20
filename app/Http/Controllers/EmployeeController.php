<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Attendance;
use App\Models\Payroll;
use App\Models\EmployeeDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $employees = Employee::query()
            ->when($request->search, fn($q, $s) =>
                $q->where('first_name', 'like', "%$s%")
                  ->orWhere('last_name', 'like', "%$s%")
                  ->orWhere('document_number', 'like', "%$s%")
                  ->orWhere('code', 'like', "%$s%")
            )
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->orderBy('last_name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('HR/Index', [
            'employees' => $employees,
            'filters'   => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('HR/Form');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code'            => 'required|string|max:20|unique:employees',
            'first_name'      => 'required|string|max:100',
            'last_name'       => 'required|string|max:100',
            'document_type'   => 'required|in:DNI,CE,Pasaporte',
            'document_number' => 'required|string|max:20|unique:employees',
            'email'           => 'nullable|email|max:150',
            'phone'           => 'nullable|string|max:30',
            'address'         => 'nullable|string|max:300',
            'birth_date'      => 'nullable|date',
            'hire_date'       => 'required|date',
            'position'        => 'required|string|max:100',
            'department'      => 'nullable|string|max:100',
            'salary'          => 'required|numeric|min:0',
            'payment_method'  => 'required|in:efectivo,transferencia',
            'bank_account'    => 'nullable|string|max:50',
        ]);

        Employee::create($data);

        return redirect()->route('employees.index')->with('success', 'Colaborador registrado.');
    }

    public function show(Employee $employee)
    {
        $employee->load(['attendances', 'payrolls']);

        $stats = [
            'attendance_this_month' => Attendance::where('employee_id', $employee->id)
                ->whereMonth('date', now()->month)
                ->where('status', 'present')
                ->count(),
            'absences_this_month' => Attendance::where('employee_id', $employee->id)
                ->whereMonth('date', now()->month)
                ->where('status', 'absent')
                ->count(),
        ];

        return Inertia::render('HR/Show', [
            'employee' => $employee,
            'stats'    => $stats,
        ]);
    }

    public function edit(Employee $employee)
    {
        return Inertia::render('HR/Form', ['employee' => $employee]);
    }

    public function update(Request $request, Employee $employee)
    {
        $data = $request->validate([
            'code'            => 'required|string|max:20|unique:employees,code,' . $employee->id,
            'first_name'      => 'required|string|max:100',
            'last_name'       => 'required|string|max:100',
            'document_type'   => 'required|in:DNI,CE,Pasaporte',
            'document_number' => 'required|string|max:20|unique:employees,document_number,' . $employee->id,
            'email'           => 'nullable|email|max:150',
            'phone'           => 'nullable|string|max:30',
            'address'         => 'nullable|string|max:300',
            'birth_date'      => 'nullable|date',
            'hire_date'       => 'required|date',
            'position'        => 'required|string|max:100',
            'department'      => 'nullable|string|max:100',
            'salary'          => 'required|numeric|min:0',
            'payment_method'  => 'required|in:efectivo,transferencia',
            'bank_account'    => 'nullable|string|max:50',
            'status'          => 'required|in:active,inactive,on_leave',
        ]);

        $employee->update($data);

        return redirect()->route('employees.index')->with('success', 'Colaborador actualizado.');
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();
        return redirect()->route('employees.index')->with('success', 'Colaborador eliminado.');
    }

    // Payroll
    public function payrolls(Employee $employee)
    {
        $payrolls = $employee->payrolls()->orderByDesc('period')->paginate(12);

        return Inertia::render('HR/Payrolls', [
            'employee'  => $employee,
            'payrolls'  => $payrolls,
        ]);
    }

    public function storePayroll(Request $request, Employee $employee)
    {
        $data = $request->validate([
            'period'       => 'required|string|max:7', // e.g. 2025-01
            'base_salary'  => 'required|numeric|min:0',
            'bonuses'      => 'nullable|numeric|min:0',
            'deductions'   => 'nullable|numeric|min:0',
            'payment_date' => 'required|date',
            'notes'        => 'nullable|string',
        ]);

        $data['employee_id'] = $employee->id;
        $data['bonuses']     = $data['bonuses'] ?? 0;
        $data['deductions']  = $data['deductions'] ?? 0;
        $data['net_salary']  = $data['base_salary'] + $data['bonuses'] - $data['deductions'];
        $data['status']      = 'pending';

        Payroll::create($data);

        return back()->with('success', 'Planilla registrada.');
    }

    // Documents
    public function documents(Employee $employee)
    {
        $documents = $employee->documents()->orderByDesc('created_at')->get();
        return Inertia::render('HR/Documents', [
            'employee'  => $employee,
            'documents' => $documents,
        ]);
    }

    public function storeDocument(Request $request, Employee $employee)
    {
        $request->validate([
            'name' => 'required|string|max:200',
            'type' => 'required|in:contract,dni,certificate,other',
            'file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120',
        ]);

        $path = $request->file('file')->store("employees/{$employee->id}", 'public');

        $employee->documents()->create([
            'name'          => $request->name,
            'type'          => $request->type,
            'path'          => $path,
            'original_name' => $request->file('file')->getClientOriginalName(),
        ]);

        return back()->with('success', 'Documento subido.');
    }

    public function destroyDocument(Employee $employee, EmployeeDocument $document)
    {
        Storage::disk('public')->delete($document->path);
        $document->delete();
        return back()->with('success', 'Documento eliminado.');
    }
}
