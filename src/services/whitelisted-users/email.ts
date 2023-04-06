export default (listName: string, ownerName: string, bannerImgURL: string, joinURL: string, viewInBrowserURL: string) => `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title></title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript><![endif]-->
</head>
<body style="margin:0;padding:0;">
<table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;font-family:Arial, sans-serif;"><tr>
  <td align="center" style="padding:0;font-family:Arial, sans-serif;">
    <table role="presentation" style="width:602px;border-collapse:collapse;border:none;border-spacing:0;text-align:left;font-family:Arial, sans-serif;">
      <tr>
        <td align="center" style="padding:20px 0 20px 0;background:#fff;font-family:Arial, sans-serif;">
          <img src="${bannerImgURL}" alt='Logo Banner' width="300" style="height:auto;display:block;">
        </td>
      </tr>
      <tr>
        <td style="padding:36px 30px 42px 30px;font-family:Arial, sans-serif;">
          <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;font-family:Arial, sans-serif;"><tr>
            <td style="padding:0 0 36px 0;color:#153643;font-family:Arial, sans-serif;" align="center">
              <h1 style="font-size:24px;margin:0 0 20px 0;font-family:Arial, sans-serif;text-align:center;">
                ${ownerName} has invited you!</h1>


              <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial, sans-serif;border-top:1px solid #dedede;padding-top:20px;">
                ${ownerName} has invited you to join their Busket list:</p>
              <p style="margin:0;font-size:30px;line-height:24px;font-family:Arial, sans-serif;font-weight:600;">
                ${listName}</p>

              <p style="margin-top:30px;font-family:Arial, sans-serif;">
                <a style="background: #61A840; color:white; border-radius: 10px; padding: 10px 18px;text-decoration: none;font-family: Roboto, Arial, sans-serif; cursor: pointer;" href="${joinURL}">
                  Join list </a>
              </p>

              <p style="opacity:60%;margin-top:30px;font-family:Arial, sans-serif;">
                If you don't want to join, ignore this message.
              </p>
            </td>
          </tr></table>
        </td>
      </tr>
      <tr>
        <td style="padding:30px;background:#61A840;font-family:Arial, sans-serif;">
          <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;font-size:9px;font-family:Arial, sans-serif;"><tr>
            <td style="padding:0;width:50%;font-family:Arial, sans-serif;" align="left">
              <p style="margin:0;font-size:14px;line-height:16px;font-family:Arial, sans-serif;color:#ffffff;">
                &copy; Busket ${(new Date()).getFullYear()}<br><a href="${viewInBrowserURL}" style="color:#ffffff;text-decoration:underline;">View this email in the browser</a>
              </p>
            </td>
          </tr></table>
        </td>
      </tr>
    </table>
  </td>
</tr></table>
</body>
</html>
`;
