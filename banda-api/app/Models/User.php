<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'no_telefon',
        'peranan',
        'id_jabatan',   // FK → jabatans.id_jabatan (pegawai sahaja)
        'status',
        'alamat_1',
        'alamat_2',
        'poskod',
        'bandar',
        'negeri',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
    ];

    // -------------------------------------------------------
    // Auto-generate no_pengguna on create
    // -------------------------------------------------------
    protected static function booted(): void
    {
        static::creating(function (User $user) {
            if (empty($user->no_pengguna)) {
                $prefixMap = [
                    'komuniti'   => 'PEN',
                    'pegawai'    => 'PGW',
                    'pentadbir'  => 'ADM',
                    'kontraktor' => 'KTR',
                ];
                $prefix = $prefixMap[$user->peranan] ?? 'PEN';
                $year   = Carbon::now()->format('Y');

                $last = static::where('no_pengguna', 'like', "{$prefix}-{$year}-%")
                    ->orderBy('no_pengguna', 'desc')
                    ->value('no_pengguna');

                $num = $last
                    ? str_pad(intval(substr($last, -4)) + 1, 4, '0', STR_PAD_LEFT)
                    : '0001';

                $user->no_pengguna = "{$prefix}-{$year}-{$num}";
            }
        });
    }

    // -------------------------------------------------------
    // Helper Methods
    // -------------------------------------------------------

    /**
     * Check if user has one of the given roles.
     * Usage: $user->hasRole('pentadbir')  OR  $user->hasRole('pegawai', 'pentadbir')
     */
    public function hasRole(string ...$roles): bool
    {
        return in_array($this->peranan, $roles);
    }

    // -------------------------------------------------------
    // Relationships
    // -------------------------------------------------------

    /**
     * Aduan yang dikemukakan oleh pengguna ini (komuniti).
     */
    public function aduans()
    {
        return $this->hasMany(Aduan::class, 'id_pengguna');
    }

    /**
     * Jabatan yang diselia oleh pegawai ini.
     * Hanya relevan apabila peranan === 'pegawai'.
     */
    public function jabatan()
    {
        return $this->belongsTo(Jabatan::class, 'id_jabatan', 'id_jabatan');
    }

    /**
     * Arahan kerja yang diberikan kepada kontraktor ini.
     * Hanya relevan apabila peranan === 'kontraktor'.
     */
    public function arahanKerjas()
    {
        return $this->hasMany(ArahanKerja::class, 'id_kontraktor');
    }
}
