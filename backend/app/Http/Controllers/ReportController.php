<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ReportController extends Controller
{
    /**
     * Store a newly created report in storage (API Endpoint).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
        public function index()
    {
        // Busca todos os reports do banco de dados, ordenados pelo mais recente
        $reports = Report::orderBy('created_at', 'desc')->get();

        // Retorna os reports como JSON
        return response()->json($reports);
    }

public function store(Request $request)
    {
        $validatedData = $request->validate([
            'report-category' => ['required', 'string', 'max:255'],
            'report-location' => ['required', 'string', 'max:255'],
            'report-description' => ['required', 'string'],
            'report-occurrence-date' => ['required', 'date'],
            'report-status' => ['nullable', 'string', 'max:255'],
            'report-file' => ['array', 'nullable'],
            'report-file.*' => ['file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        do {
            $uniqueProtocol = 'OC-' . Str::upper(Str::random(10));
        } while (Report::where('unique_protocol', $uniqueProtocol)->exists());

        $attachmentUrls = [];
        if ($request->hasFile('report-file')) {
            foreach ($request->file('report-file') as $file) {
                $path = $file->store('reports_attachments', 'public');
                $attachmentUrls[] = Storage::url($path);
            }
        }

        $report = Report::create([
            'unique_protocol' => $uniqueProtocol,
            'description' => $validatedData['report-description'],
            'problem_type' => $validatedData['report-category'],
            'location' => $validatedData['report-location'],
            'status' => $validatedData['report-status'] ?? 'Pending Review',
            'occurrence_date' => $validatedData['report-occurrence-date'],
        ]);

        // Se quiser salvar os arquivos no banco, adicione aqui também

        return response()->json([
            'message' => 'Report submitted successfully!',
            'unique_protocol' => $uniqueProtocol,
            'report_id' => $report->id,
        ], 201);
    }
}
