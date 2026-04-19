<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style>
        body { background-color: #f8fafc; color: #74787e; height: 100%; hyphens: auto; line-height: 1.4; margin: 0; -moz-hyphens: auto; -ms-word-break: break-all; width: 100% !important; -webkit-hyphens: auto; -webkit-text-size-adjust: none; word-break: break-all; word-wrap: break-word; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; }
        .wrapper { background-color: #f8fafc; margin: 0; padding: 0; width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; -premailer-width: 100%; }
        .content { margin: 0; padding: 0; width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; -premailer-width: 100%; }
        .header { padding: 25px 0; text-align: center; }
        .header a { color: #bbbfc3; font-size: 19px; font-weight: bold; text-decoration: none; }
        .logo { height: 75px; width: auto; max-height: 75px; }
        .body { background-color: #ffffff; border-bottom: 1px solid #edeff2; border-top: 1px solid #edeff2; margin: 0; padding: 0; width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; -premailer-width: 100%; }
        .inner-body { background-color: #ffffff; margin: 0 auto; padding: 0; width: 570px; -premailer-cellpadding: 0; -premailer-cellspacing: 0; -premailer-width: 570px; }
        .content-cell { padding: 35px; }
        h1 { color: #3d4852; font-size: 19px; font-weight: bold; margin-top: 0; text-align: left; }
        p { color: #3d4852; font-size: 16px; line-height: 1.5em; margin-top: 0; text-align: left; }
        .action { margin: 30px auto; padding: 0; text-align: center; width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; -premailer-width: 100%; }
        .button { border-radius: 3px; box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16); color: #fff; display: inline-block; text-decoration: none; -webkit-text-size-adjust: none; background-color: #10b981; border-top: 10px solid #10b981; border-right: 18px solid #10b981; border-bottom: 10px solid #10b981; border-left: 18px solid #10b981; }
        .footer { margin: 0 auto; padding: 0; text-align: center; width: 570px; -premailer-cellpadding: 0; -premailer-cellspacing: 0; -premailer-width: 570px; }
        .footer p { color: #aeaeae; font-size: 12px; text-align: center; }
        @media only screen and (max-width: 600px) {
            .inner-body { width: 100% !important; }
            .footer { width: 100% !important; }
        }
    </style>
</head>
<body>
    <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
            <td align="center">
                <table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <!-- Header -->
                    <tr>
                        <td class="header">
                        <td class="header">
                            <img src="{{ asset('logo.png') }}" class="logo" alt="Si-Banka">
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td class="body" width="100%" cellpadding="0" cellspacing="0">
                            <table class="inner-body" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td class="content-cell">
                                        <h1>Halo, {{ $notifiable->name }}!</h1>
                                        <p>Terima kasih telah mendaftar di Si-Banka. Mohon verifikasi alamat email Anda untuk melanjutkan.</p>
                                        
                                        <!-- Action Button -->
                                        <table class="action" align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                            <tr>
                                                <td align="center">
                                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                                        <tr>
                                                            <td align="center">
                                                                <a href="{{ $url }}" class="button" target="_blank">Verifikasi Email</a>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <p>Jika tombol di atas tidak berfungsi, salin dan tempel tautan berikut ke browser Anda:</p>
                                        <p style="word-break: break-all;">{{ $url }}</p>
                                        
                                        <p style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; color: #92400e;">
                                            <strong>⏱️ Catatan:</strong> Link verifikasi ini akan kadaluarsa dalam <strong>24 jam</strong>. Setelah kadaluarsa, Anda perlu meminta link verifikasi baru melalui halaman login.
                                        </p>
                                        
                                        <p>Jika Anda tidak merasa mendaftar akun ini, silakan abaikan email ini.</p>
                                        
                                        <p>
                                            Salam Hormat,<br>
                                            Tim Si-Banka
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td>
                            <table class="footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td class="content-cell" align="center">
                                        <p>© {{ date('Y') }} Si-Banka. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
