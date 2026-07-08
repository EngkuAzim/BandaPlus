<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Kata Laluan BANDA+</title>
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 40px 0; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #172554 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }
        .header p { color: #93c5fd; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin: 8px 0 0; }
        .content { padding: 40px 40px 30px; }
        .greeting { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 24px; }
        .text { color: #475569; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 24px; }
        .button-wrapper { text-align: center; margin: 35px 0; }
        .button { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 36px; border-radius: 50px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.39); transition: all 0.2s; }
        .divider { height: 1px; background-color: #e2e8f0; margin: 30px 0; }
        .warning-text { color: #64748b; font-size: 13px; line-height: 1.6; margin-bottom: 12px; }
        .footer { background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 0 0 10px; color: #94a3b8; font-size: 12px; line-height: 1.5; }
        .footer-logo { font-weight: 800; color: #cbd5e1; font-size: 16px; margin-bottom: 15px; display: block; }
        .signoff { margin-top: 30px; }
        .signoff p { margin: 0; font-size: 15px; color: #334155; }
        .signoff strong { color: #0f172a; font-weight: 700; }
    </style>
</head>
<body>
    <div class="wrapper">
        <table class="main" width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
                <td class="header">
                    <h1>BANDA+</h1>
                    <p>MPAJ Digital Governance</p>
                </td>
            </tr>
            <tr>
                <td class="content">
                    <p class="greeting">Salam sejahtera,</p>
                    <p class="text">Anda menerima e-mel ini kerana kami menerima permohonan untuk menetapkan semula kata laluan bagi akaun anda dalam sistem <strong>BANDA+ (Sistem Aduan Bandar Pintar MPAJ)</strong>.</p>
                    
                    <div class="button-wrapper">
                        <a href="{{ $resetUrl }}" class="button">Tetapkan Semula Kata Laluan</a>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <p class="warning-text">Pautan tetapan semula kata laluan ini hanya sah untuk <strong>60 minit</strong>. Atas faktor keselamatan, pautan ini akan luput secara automatik.</p>
                    <p class="warning-text">Jika anda tidak membuat permohonan ini, anda boleh abaikan e-mel ini. Akaun anda masih selamat.</p>
                    
                    <div class="signoff">
                        <p class="text">Terima kasih,</p>
                        <p><strong>Pasukan BANDA+</strong></p>
                    </div>
                </td>
            </tr>
            <tr>
                <td class="footer">
                    <span class="footer-logo">BANDA+</span>
                    <p>E-mel ini dijana secara automatik oleh sistem.<br>Sila jangan balas ke alamat e-mel ini.</p>
                    <p>&copy; {{ date('Y') }} Majlis Perbandaran Ampang Jaya (MPAJ).<br>Hak Cipta Terpelihara.</p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
