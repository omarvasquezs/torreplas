<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LeaveRequestController extends Controller
{
    public function myIndex(Request $request)
    {
        $requests = LeaveRequest::query()
            ->where('user_id', Auth::id())
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('HR/MyRequests', [
            'requests' => $requests,
            'filters' => $request->only('status'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|in:compensacion_horas,descanso_medico,licencia,maternidad,permiso_temporal,vacaciones',
            'reason' => 'required|string|max:1000',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'return_date' => 'nullable|date|after_or_equal:end_date',
            'goce_haber' => 'boolean',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('hr/leave-requests', 'public');
        }

        LeaveRequest::create([
            'user_id' => Auth::id(),
            'type' => $data['type'],
            'reason' => $data['reason'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'return_date' => $data['return_date'] ?? null,
            'goce_haber' => $data['goce_haber'] ?? false,
            'attachment_path' => $attachmentPath,
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Solicitud registrada correctamente.');
    }

    public function adminIndex(Request $request)
    {
        $requests = LeaveRequest::query()
            ->with(['user:id,name,email', 'reviewer:id,name'])
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->search, fn($q, $search) =>
                $q->whereHas('user', fn($uq) => $uq->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
            )
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('HR/ManageRequests', [
            'requests' => $requests,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function updateStatus(Request $request, LeaveRequest $leaveRequest)
    {
        $data = $request->validate([
            'status' => 'required|in:approved,rejected,pending',
            'admin_comment' => 'nullable|string|max:1000',
        ]);

        $leaveRequest->update([
            'status' => $data['status'],
            'admin_comment' => $data['admin_comment'] ?? null,
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Estado actualizado.');
    }
}
