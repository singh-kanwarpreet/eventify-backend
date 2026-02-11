const certificateHTML = (name, eventName, date, organizer) => {
  return `
  <html>
  <head>
    <style>

      @page {
        size: A4 landscape;
        margin: 0;
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: Georgia, serif;
        background: white;
      }

      .certificate {
        width: 297mm;
        height: 210mm;

        border: 20px solid #D4AF37;
        padding: 60px;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        text-align: center;
        background: #fffdf7;

        page-break-inside: avoid;
        break-inside: avoid;
      }

      h1 {
        font-size: 48px;
        letter-spacing: 2px;
        margin-bottom: 40px;
      }

      .subtitle {
        font-size: 22px;
        margin: 10px 0;
      }

      .name {
        font-size: 44px;
        font-weight: bold;
        margin: 35px 0;
      }

      .footer {
        margin-top: 90px;
        width: 85%;
        display: flex;
        justify-content: space-between;
        font-size: 18px;
        font-weight: 600;
      }

    </style>
  </head>

  <body>
    <div class="certificate">

      <h1>CERTIFICATE OF PARTICIPATION</h1>

      <p class="subtitle">This is proudly presented to</p>

      <div class="name">${name}</div>

      <p class="subtitle">
        for successfully participating in <b>${eventName}</b>
      </p>

      <div class="footer">
        <div>${date}</div>
        <div>Organized by ${organizer}</div>
      </div>

    </div>
  </body>
  </html>
  `;
};

module.exports = certificateHTML;
