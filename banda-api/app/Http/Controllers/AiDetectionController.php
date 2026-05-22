<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Aduan;
use Illuminate\Support\Facades\Log;

class AiDetectionController extends Controller
{
    /**
     * Endpoint for AI worker to upload processed images and predictions.
     */
    public function uploadDetection(Request $request)
    {
        try {
            // Secure authorization check via env token
            $workerToken = env('AI_WORKER_TOKEN', 'secret-ai-token-123');
            $headerToken = $request->bearerToken();

            if (!$headerToken || $headerToken !== $workerToken) {
                Log::warning('Unauthorized AI detection upload attempt. IP: ' . $request->ip());
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Validate incoming request
            $validated = $request->validate([
                'complaint_id' => 'required|string',
                'predictions' => 'required|string',
                'file' => 'required|image|mimes:jpeg,png,jpg,webp|max:10240',
            ]);

            // Find the Complaint record by ID (id_aduan is the primary key in Aduan model)
            $aduan = Aduan::find($validated['complaint_id']);

            if (!$aduan) {
                Log::error('AI upload failed. Complaint not found: ' . $validated['complaint_id']);
                return response()->json(['error' => 'Complaint not found'], 404);
            }

            if ($request->hasFile('file')) {
                // Store the uploaded file in 'public/storage/detections'
                // This saves to storage/app/public/detections
                $path = $request->file('file')->store('detections', 'public');
                
                // The frontend typically accesses this via the storage symlink 
                // We'll store just the path 'detections/filename.jpg' or prefix with 'storage/'
                $storagePath = 'storage/' . $path;
                
                // Decode JSON string predictions
                $predictionsData = json_decode($validated['predictions'], true);
                
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new \Exception('Invalid JSON provided for predictions');
                }

                // Update the model
                $aduan->status = 'verified';
                $aduan->detected_image_path = $storagePath;
                $aduan->ai_predictions = $predictionsData;
                $aduan->save();

                Log::info('AI detection processed successfully for complaint: ' . $aduan->id_aduan);

                return response()->json([
                    'message' => 'Detection uploaded and saved successfully',
                    'data' => [
                        'complaint_id' => $aduan->id_aduan,
                        'status' => $aduan->status,
                        'detected_image_path' => $aduan->detected_image_path,
                        'ai_predictions' => $aduan->ai_predictions,
                    ]
                ], 200);
            }

            return response()->json(['error' => 'File not found in request'], 400);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('AI detection validation error: ' . json_encode($e->errors()));
            return response()->json(['error' => 'Validation Error', 'details' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('AI detection upload error: ' . $e->getMessage());
            return response()->json(['error' => 'Internal Server Error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Endpoint for AI worker to fetch pending complaints that need processing.
     */
    public function getPending(Request $request)
    {
        try {
            $workerToken = env('AI_WORKER_TOKEN', 'secret-ai-token-123');
            $headerToken = $request->bearerToken();

            if (!$headerToken || $headerToken !== $workerToken) {
                Log::warning('Unauthorized AI fetch pending attempt. IP: ' . $request->ip());
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Fetch complaints that don't have AI predictions yet and are 'Baru' or 'Dalam Tindakan'
            $pendingAduan = Aduan::whereNull('ai_predictions')
                ->whereIn('status', ['Baru', 'Dalam Tindakan'])
                ->select('id_aduan', 'gambar_bukti', 'status', 'tarikh_lapor')
                ->orderBy('tarikh_lapor', 'asc')
                ->limit(5)
                ->get();

            return response()->json([
                'data' => $pendingAduan
            ], 200);

        } catch (\Exception $e) {
            Log::error('AI fetch pending error: ' . $e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }
}
