<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reset Kata Laluan BANDA+</title>
    <style>
        body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .header { background-color: #1e3a8a; padding: 30px 40px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; }
        .content { padding: 40px; color: #334155; line-height: 1.6; }
        .content p { margin: 0 0 20px; font-size: 16px; }
        .button-container { text-align: center; margin: 30px 0; }
        .button { display: inline-block; background-color: #1e3a8a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; }
        .button:hover { background-color: #1e40af; }
        .footer { background-color: #f1f5f9; padding: 20px 40px; text-align: center; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>BANDA+</h1>
        </div>
        <div class="content">
            <p>Salam sejahtera,</p>
            <p>Anda menerima e-mel ini kerana kami menerima permohonan untuk menetapkan semula kata laluan bagi akaun anda dalam sistem BANDA+ (Sistem Aduan Bandar Pintar MPAJ).</p>
            
            <div class="button-container">
                <a href="{{ $resetUrl }}" class="button">Tetapkan Semula Kata Laluan</a>
            </div>
            
            <p>Pautan tetapan semula kata laluan ini akan tamat tempoh dalam masa 60 minit.</p>
            <p>Jika anda tidak memohon tetapan semula kata laluan, tiada tindakan lanjut diperlukan dan akaun anda selamat.</p>
            
            <p style="margin-top: 40px; font-size: 14px; color: #64748b;">
                Terima kasih,<br>
                <strong>Pasukan BANDA+</strong>
            </p>
        </div>
        <div class="footer">
            <p>E-mel ini dijana secara automatik. Sila jangan balas e-mel ini.</p>
            <p>&copy; {{ date('Y') }} Majlis Perbandaran Ampang Jaya (MPAJ). Hak Cipta Terpelihara.</p>
        </div>
    </div>
</body>
</html>
