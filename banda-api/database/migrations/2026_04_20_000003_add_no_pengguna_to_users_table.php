<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Add no_pengguna (readable user ID) to users table.
     * Format: PEN-2026-0001 (komuniti), PGW-2026-0001 (pegawai),
     *         ADM-2026-0001 (pentadbir), KTR-2026-0001 (kontraktor)
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('no_pengguna', 20)->nullable()->unique()->after('id');
        });

        // Backfill existing users with readable IDs
        $prefixMap = [
            'komuniti'   => 'PEN',
            'pegawai'    => 'PGW',
            'pentadbir'  => 'ADM',
            'kontraktor' => 'KTR',
        ];

        $year  = now()->format('Y');
        $users = DB::table('users')->orderBy('id')->get(['id', 'peranan']);
        $counters = [];

        foreach ($users as $user) {
            $prefix = $prefixMap[$user->peranan] ?? 'PEN';
            $counters[$prefix] = ($counters[$prefix] ?? 0) + 1;
            $noPengguna = "{$prefix}-{$year}-" . str_pad($counters[$prefix], 4, '0', STR_PAD_LEFT);
            DB::table('users')->where('id', $user->id)->update(['no_pengguna' => $noPengguna]);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('no_pengguna');
        });
    }
};
