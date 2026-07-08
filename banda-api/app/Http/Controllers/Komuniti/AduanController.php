<?php

namespace App\Http\Controllers\Komuniti;

use App\Http\Controllers\Controller;
use App\Models\Aduan;
use App\Events\AduanBaruDicipta;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\PriorityScoreService;
use App\Services\JabatanMappingService;
use App\Services\ClusteringService;

class AduanController extends Controller
{
    /**
     * Submit a new aduan (komuniti).
     * Route: POST /api/aduan
     */
    public function store(Request $request)
    {
        $request->validate([
            'jenis_kerosakan'  => 'required', // Can be string or JSON array
            'id_zon'           => 'required|integer',
            'alamat_lokasi'    => 'required|string|max:255',
            'keterangan_aduan' => 'nullable|string',
            'gambar_bukti'     => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5048',
            'scan_id'          => 'nullable|string',
            'evidences'        => 'nullable|array|max:3',
            'evidences.*'      => 'file|mimes:jpg,jpeg,png,webp,mp4,mov,webm|max:30720',
            'audio'            => 'nullable|file|mimes:webm,ogg,mp3,wav,m4a,aac,mp4|max:10240',
        ]);

        $imagePath = null;
        $aiPredictions = null;
        $detectedImagePath = null;

        if ($request->has('scan_id')) {
            $scan = \App\Models\AiScan::find($request->scan_id);
            if ($scan) {
                $imagePath = $scan->image_path;
                $aiPredictions = $scan->predictions;
                if (str_starts_with($imagePath, 'detections/')) {
                    $detectedImagePath = 'storage/' . $imagePath;
                }
            }
        } 
        
        if (!$imagePath && $request->hasFile('gambar_bukti')) {
            $imagePath = $request->file('gambar_bukti')->store('aduan_images', 'public');
        } elseif (!$imagePath) {
            return response()->json(['error' => 'Gambar atau scan_id diperlukan'], 422);
        }

        $audioPath = null;
        if ($request->hasFile('audio')) {
            $audioPath = $request->file('audio')->store('aduan_audio', 'public');
        }

        $lat = $request->input('lat');
        $lng = $request->input('lng');
        $lokasi_gps = ($lat && $lng)
            ? DB::raw("ST_PointFromText('POINT({$lng} {$lat})')")
            : null;

        // Parse labels
        $rawJenis = $request->jenis_kerosakan;
        if (is_string($rawJenis) && str_starts_with(trim($rawJenis), '[')) {
            $labels = json_decode($rawJenis, true) ?: [$rawJenis];
        } else {
            $labels = is_array($rawJenis) ? $rawJenis : [$rawJenis];
        }

        if (empty($labels)) {
            $labels = ['Unknown'];
        }

        DB::beginTransaction();
        try {
            // Helper to generate ID
            $year = Carbon::now()->format('Y');
            $generateId = function() use ($year) {
                $lastAduan = Aduan::where('id_aduan', 'like', "ADU-{$year}-%")
                                  ->orderBy('id_aduan', 'desc')
                                  ->lockForUpdate()
                                  ->first();
                $newNumber = $lastAduan
                    ? str_pad(intval(substr($lastAduan->id_aduan, -4)) + 1, 4, '0', STR_PAD_LEFT)
                    : '0001';
                return "ADU-{$year}-{$newNumber}";
            };

            $priorityService = new PriorityScoreService();
            $jabatanService = new JabatanMappingService();
            $clusteringService = new ClusteringService();

            if (count($labels) === 1) {
                // Single label logic
                $label = $labels[0];
                $priorityResult = $priorityService->calculateScore($label, $lat, $lng);
                $mapped = $jabatanService->mapLabel($label);

                $id_aduan_induk = null;
                if ($lat && $lng) {
                    $id_aduan_induk = $clusteringService->findParentCluster((float)$lat, (float)$lng, $label);
                }

                $aduan = Aduan::create([
                    'id_aduan'         => $generateId(),
                    'id_pengguna'      => $request->user()->id,
                    'id_zon'           => $request->id_zon,
                    'id_jabatan'       => $mapped['id'] === 'J00' ? null : $mapped['id'],
                    'jenis_kerosakan'  => $label,
                    'alamat_lokasi'    => $request->alamat_lokasi,
                    'keterangan_aduan' => $request->keterangan_aduan,
                    'lokasi_gps'       => $lokasi_gps,
                    'gambar_bukti'     => $imagePath,
                    'status'           => 'Baru',
                    'skor_ai'          => $priorityResult['skor'],
                    'label_prioriti'   => $priorityResult['label'],
                    'id_aduan_induk'   => $id_aduan_induk,
                    'ai_predictions'   => $aiPredictions,
                    'detected_image_path' => $detectedImagePath,
                    'audio'            => $audioPath,
                ]);
                $mainAduan = $aduan;

                // If this is a child aduan, recalculate and update the parent's score!
                if ($id_aduan_induk) {
                    $parentAduan = Aduan::where('id_aduan', $id_aduan_induk)->first();
                    if ($parentAduan && $lat && $lng) {
                        $parentScore = $priorityService->calculateScore($parentAduan->jenis_kerosakan, $lat, $lng);
                        $parentAduan->update([
                            'skor_ai' => $parentScore['skor'],
                            'label_prioriti' => $parentScore['label']
                        ]);
                    }
                }
            } else {
                // Multi-label Split Logic
                // 1. Create Main Aduan (Pelbagai Kerosakan)
                $mainAduan = Aduan::create([
                    'id_aduan'         => $generateId(),
                    'id_pengguna'      => $request->user()->id,
                    'id_zon'           => $request->id_zon,
                    'id_jabatan'       => null, // Will be handled via children
                    'jenis_kerosakan'  => 'Pelbagai Kerosakan',
                    'alamat_lokasi'    => $request->alamat_lokasi,
                    'keterangan_aduan' => $request->keterangan_aduan,
                    'lokasi_gps'       => $lokasi_gps,
                    'gambar_bukti'     => $imagePath,
                    'status'           => 'Dalam Tindakan', // Induk sentiasa Dalam Tindakan jika ada anak
                    'skor_ai'          => 0, // Induk doesn't need score
                    'label_prioriti'   => 'N/A',
                    'id_aduan_induk'   => null,
                    'ai_predictions'   => $aiPredictions,
                    'detected_image_path' => $detectedImagePath,
                    'audio'            => $audioPath,
                ]);

                // 2. Create Anak Aduan for each label
                foreach ($labels as $label) {
                    $priorityResult = $priorityService->calculateScore($label, $lat, $lng);
                    $mapped = $jabatanService->mapLabel($label);

                    Aduan::create([
                        'id_aduan'         => $generateId(),
                        'id_pengguna'      => $request->user()->id,
                        'id_zon'           => $request->id_zon,
                        'id_jabatan'       => $mapped['id'] === 'J00' ? null : $mapped['id'],
                        'jenis_kerosakan'  => $label,
                        'alamat_lokasi'    => $request->alamat_lokasi,
                        'keterangan_aduan' => $request->keterangan_aduan,
                        'lokasi_gps'       => $lokasi_gps,
                        'gambar_bukti'     => $imagePath,
                        'status'           => 'Baru',
                        'skor_ai'          => $priorityResult['skor'],
                        'label_prioriti'   => $priorityResult['label'],
                        'id_aduan_induk'   => $mainAduan->id_aduan, // Link to parent
                        'ai_predictions'   => $aiPredictions,
                        'detected_image_path' => $detectedImagePath,
                        'audio'            => $audioPath,
                    ]);
                }
            }
            if ($request->hasFile('evidences')) {
                foreach ($request->file('evidences') as $file) {
                    $path = $file->store('aduan_evidences', 'public');
                    $mime = $file->getMimeType();
                    $type = str_starts_with($mime, 'video') ? 'video' : 'image';
                    \App\Models\AduanEvidence::create([
                        'id_aduan' => $mainAduan->id_aduan,
                        'file_path' => $path,
                        'file_type' => $type,
                        'original_name' => $file->getClientOriginalName(),
                    ]);
                }
            }

            DB::commit();

            // Fire live broadcast event to Admin/Pegawai dashboards
            broadcast(new AduanBaruDicipta($mainAduan->load('pengguna')));

            return response()->json([
                'message' => count($labels) > 1 ? 'Aduan berbilang kerosakan berjaya dihantar dan diasingkan!' : 'Aduan berjaya dihantar!',
                'aduan'   => $mainAduan
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Ralat pangkalan data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get stats for the logged-in komuniti user's own aduan.
     * Route: GET /api/dashboard/stats
     */
    public function getStats(Request $request)
    {
        $userId = $request->user()->id;

        return response()->json([
            'baru'     => Aduan::where('id_pengguna', $userId)->where('status', 'Baru')->count(),
            'diproses' => Aduan::where('id_pengguna', $userId)->where('status', 'Dalam Tindakan')->count(),
            'selesai'  => Aduan::where('id_pengguna', $userId)->where('status', 'Selesai')->count(),
        ]);
    }

    /**
     * Get all aduan submitted by the logged-in user.
     * Route: GET /api/aduan
     */
    public function getUserAduan(Request $request)
    {
        $aduans = Aduan::with('evidences')
                       ->select('id_aduan', 'jenis_kerosakan', 'gambar_bukti', 'alamat_lokasi', 'status', 'tarikh_lapor')
                       ->where('id_pengguna', $request->user()->id)
                       ->orderBy('tarikh_lapor', 'desc')
                       ->get();

        return response()->json($aduans);
    }
}
