<?php
/**
 * BandaPlus API Test Script
 * Run: php test_api.php
 */

$base = 'http://localhost:8000/api';
$pass = 0;
$fail = 0;

function req(string $method, string $url, array $headers = [], array $body = []): array
{
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $h = ['Accept: application/json'];
    foreach ($headers as $k => $v) {
        $h[] = "$k: $v";
    }

    if (!empty($body)) {
        $json = json_encode($body);
        $h[] = 'Content-Type: application/json';
        $h[] = 'Content-Length: ' . strlen($json);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
    }

    curl_setopt($ch, CURLOPT_HTTPHEADER, $h);
    $response = curl_exec($ch);
    $status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ['status' => $status, 'body' => json_decode($response, true)];
}

function check(string $label, int $got, int $expected): void
{
    global $pass, $fail;
    if ($got === $expected) {
        echo "\033[32m  PASS\033[0m [$got] $label\n";
        $pass++;
    } else {
        echo "\033[31m  FAIL\033[0m [got:$got, expected:$expected] $label\n";
        $fail++;
    }
}

// ============================================================
echo "\n\033[33m--- LOGIN ALL ROLES ---\033[0m\n";

$adminLogin   = req('POST', "$base/login", [], ['email' => 'admin@bandaplus.gov.my',    'password' => 'Admin@1234']);
$pegawaiLogin = req('POST', "$base/login", [], ['email' => 'pegawai@bandaplus.gov.my',  'password' => 'Pegawai@1234']);
$ktLogin      = req('POST', "$base/login", [], ['email' => 'kontraktor@bandaplus.gov.my','password' => 'Kontraktor@1234']);

check('Login Pentadbir',  $adminLogin['status'],   200);
check('Login Pegawai',    $pegawaiLogin['status'],  200);
check('Login Kontraktor', $ktLogin['status'],       200);

$aT = $adminLogin['body']['access_token']   ?? null;
$pT = $pegawaiLogin['body']['access_token'] ?? null;
$kT = $ktLogin['body']['access_token']      ?? null;

if (!$aT || !$pT || !$kT) {
    echo "\033[31mCannot continue — one or more logins failed.\033[0m\n";
    exit(1);
}

// ============================================================
echo "\n\033[33m--- KOMUNITI ROUTES ---\033[0m\n";
check('/api/user (admin token)',           req('GET', "$base/user",            ['Authorization' => "Bearer $aT"])['status'], 200);
check('/api/aduan (admin token)',          req('GET', "$base/aduan",           ['Authorization' => "Bearer $aT"])['status'], 200);
check('/api/dashboard/stats (admin)',      req('GET', "$base/dashboard/stats", ['Authorization' => "Bearer $aT"])['status'], 200);

// ============================================================
echo "\n\033[33m--- PENTADBIR ROUTES ---\033[0m\n";
check('/api/admin/users',          req('GET', "$base/admin/users",          ['Authorization' => "Bearer $aT"])['status'], 200);
check('/api/admin/aduan',          req('GET', "$base/admin/aduan",          ['Authorization' => "Bearer $aT"])['status'], 200);
check('/api/admin/dashboard/stats',req('GET', "$base/admin/dashboard/stats",['Authorization' => "Bearer $aT"])['status'], 200);

// ============================================================
echo "\n\033[33m--- PEGAWAI ROUTES ---\033[0m\n";
check('/api/pegawai/jabatan',       req('GET', "$base/pegawai/jabatan",        ['Authorization' => "Bearer $pT"])['status'], 200);
check('/api/pegawai/aduan',         req('GET', "$base/pegawai/aduan",          ['Authorization' => "Bearer $pT"])['status'], 200);
check('/api/pegawai/arahan-kerja',  req('GET', "$base/pegawai/arahan-kerja",   ['Authorization' => "Bearer $pT"])['status'], 200);
check('/api/pegawai/dashboard/stats',req('GET',"$base/pegawai/dashboard/stats",['Authorization' => "Bearer $pT"])['status'], 200);

// ============================================================
echo "\n\033[33m--- KONTRAKTOR ROUTES ---\033[0m\n";
check('/api/kontraktor/dashboard/stats', req('GET', "$base/kontraktor/dashboard/stats", ['Authorization' => "Bearer $kT"])['status'], 200);
check('/api/kontraktor/tugasan',         req('GET', "$base/kontraktor/tugasan",         ['Authorization' => "Bearer $kT"])['status'], 200);

// ============================================================
echo "\n\033[33m--- ROLE BLOCK TESTS (should all be 403) ---\033[0m\n";
check('Kontraktor BLOCKED from /admin/users',     req('GET', "$base/admin/users",           ['Authorization' => "Bearer $kT"])['status'], 403);
check('Kontraktor BLOCKED from /admin/aduan',     req('GET', "$base/admin/aduan",           ['Authorization' => "Bearer $kT"])['status'], 403);
check('Pegawai    BLOCKED from /admin/users',     req('GET', "$base/admin/users",           ['Authorization' => "Bearer $pT"])['status'], 403);
check('Admin      BLOCKED from /kontraktor/tugasan',req('GET',"$base/kontraktor/tugasan",   ['Authorization' => "Bearer $aT"])['status'], 403);

// ============================================================
echo "\n\033[33m--- AUTH BLOCK TEST (no token, should be 401) ---\033[0m\n";
check('No token -> /api/admin/users (401)',    req('GET', "$base/admin/users")['status'],    401);
check('No token -> /api/aduan (401)',          req('GET', "$base/aduan")['status'],          401);

// ============================================================
echo "\n\033[36m================================\033[0m\n";
echo "\033[36m RESULTS: $pass passed, $fail failed\033[0m\n";
echo "\033[36m================================\033[0m\n\n";
