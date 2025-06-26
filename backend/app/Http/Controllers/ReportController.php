<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    /**
     * List all reports.
     */
    public function index()
    {
        $reports = Report::orderBy('created_at', 'desc')->get();
        return response()->json($reports);
    }

    /**
     * Store a new report.
     */
    public function store(Request $request)
    {
        // (Opcional) Log para debug
        Log::debug('Request received:', $request->all());

        // ✅ Validação correta para campos individuais:
        $validatedData = $request->validate([
            'report-title' => ['required', 'string', 'max:255'],
            'report-category' => ['required', 'string', 'max:255'],
            'report-location' => ['required', 'string', 'max:255'],
            'report-description' => ['required', 'string'],
            'report-occurrence-date' => ['required', 'date'],
            'report-status' => ['nullable', 'string', 'max:255'],
            'report-file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        // ✅ Gera protocolo único
        do {
            $uniqueProtocol = 'OC-' . Str::upper(Str::random(10));
        } while (Report::where('unique_protocol', $uniqueProtocol)->exists());

        // ✅ Upload de 1 arquivo, se existir
        $attachmentUrl = null;
        if ($request->hasFile('report-file')) {
            $path = $request->file('report-file')->store('reports_attachments', 'public');
            $attachmentUrl = Storage::url($path);
        }

        // ✅ Cria o Report com todos os campos preenchidos
        $report = Report::create([
            'unique_protocol' => $uniqueProtocol,
            'title' => $validatedData['report-title'],
            'description' => $validatedData['report-description'],
            'problem_type' => $validatedData['report-category'],
            'location' => $validatedData['report-location'],
            'status' => $validatedData['report-status'] ?? 'pendente',
            'occurrence_date' => $validatedData['report-occurrence-date'],
            'anexo_url' => $attachmentUrl,
        ]);

        return response()->json([
            'message' => 'Denúncia registrada com sucesso!',
            'unique_protocol' => $uniqueProtocol,
            'report_id' => $report->id,
        ], 201);
    }

    public function show($protocol)
{
    $report = Report::where('unique_protocol', $protocol)->first();

    if (!$report) {
        return response()->json(['error' => 'Protocolo não encontrado.'], 404);
    }

    return response()->json([
        'status' => $report->status,
        'unique_protocol' => $report->unique_protocol,
        'title' => $report->problem_type, // ou use o campo certo
        'description' => $report->description,
        'location' => $report->location,
        'occurrence_date' => $report->occurrence_date->toDateString(),
        'created_at' => $report->created_at->toDateTimeString(),
        'attachment_url' => $report->anexo_url,
    ]);
}

}
