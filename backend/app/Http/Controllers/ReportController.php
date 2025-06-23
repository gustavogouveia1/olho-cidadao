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
            'problem_type' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'attachments' => ['array', 'nullable'],
            'attachments.*' => ['file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'], // 5MB por arquivo
        ]);

        do {
            $uniqueProtocol = 'OC-' . Str::upper(Str::random(10));
        } while (Report::where('unique_protocol', $uniqueProtocol)->exists());

        $attachmentUrls = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {

                $path = $file->store('reports_attachments', 'public');
                $attachmentUrls[] = Storage::url($path);
            }
        }

        $report = Report::create([
            'unique_protocol' => $uniqueProtocol,
            'description' => $validatedData['description'],
            'problem_type' => $validatedData['problem_type'],
            'location' => $validatedData['location'],
            'status' => 'Pending Review',
            'occurrence_date' => now(),
        ]);

        return response()->json([
            'message' => 'Report submitted successfully!',
            'unique_protocol' => $uniqueProtocol,
            'report_id' => $report->id,
        ], 201);
    }
}
