export const getBaseTemplate = (content) => {
  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #000000; background-color: #ffffff; }
                .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .email-header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: #ffffff; padding: 30px 20px; text-align: center; }
                .email-header h1 { font-size: 24px; margin-bottom: 10px; word-break: break-word; }
                .email-body { padding: 30px 20px; }
                .email-body p { margin-bottom: 15px; font-size: 14px; color: #000000; }
                .button { display: inline-block; padding: 12px 30px; background: #22c55e; color: #000000 !important; text-decoration: none; border-radius: 5px; font-weight: 600; margin: 15px 0; transition: transform 0.2s; text-align: center; }
                .button:hover { transform: translateY(-2px); background: #16a34a; }
                .info-box { background-color: #f3f4f6; border-left: 4px solid #1e40af; padding: 15px; margin: 15px 0; border-radius: 4px; }
                .warning-box { background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 15px 0; border-radius: 4px; }
                .email-footer { background-color: #f3f4f6; padding: 20px; text-align: center; color: #000000; font-size: 12px; }
                .email-footer a { color: #22c55e; text-decoration: none; }
                .divider { height: 1px; background-color: #e5e7eb; margin: 15px 0; }
                .link-text { word-break: break-all; color: #22c55e; font-size: 12px; }
                @media (max-width: 640px) {
                    .email-container { margin: 0; border-radius: 0; }
                    .email-header { padding: 20px 15px; }
                    .email-header h1 { font-size: 20px; }
                    .email-body { padding: 20px 15px; }
                    .email-body p { font-size: 13px; }
                    .button { padding: 10px 25px; font-size: 13px; }
                    .info-box { padding: 12px; margin: 12px 0; }
                    .warning-box { padding: 12px; margin: 12px 0; }
                    .email-footer { padding: 15px; font-size: 11px; }
                    .divider { margin: 12px 0; }
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                ${content}
            </div>
        </body>
        </html>
    `;
};
