const reminderTemplate = ({
  name,
  title,
  startTime,
  endTime,
  location,
  mode,
  imageUrl,
  availableSeats,
}) => {
  return `
  <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #ddd; border-radius:10px; overflow:hidden;">
    
    <!-- Header -->
    <div style="background:#4CAF50; padding:20px; text-align:center; color:white;">
      <h2 style="margin:0;">Event Reminder</h2>
    </div>

    <!-- Body -->
    <div style="padding:20px; color:#333;">
      <p>Hi <strong>${name}</strong>,</p>

      <p>
        Your event <strong>"${title}"</strong> starts soon.
        Don’t miss it!
      </p>

      ${
        imageUrl
          ? `<img src="${imageUrl}" 
               style="width:100%; max-height:200px; object-fit:cover; border-radius:8px; margin-bottom:15px;" />`
          : ""
      }

      <table style="width:100%; border-collapse:collapse;">
        <tr>
          <td style="padding:8px; font-weight:bold;">Start Time:</td>
          <td style="padding:8px;">${startTime}</td>
        </tr>
        <tr>
          <td style="padding:8px; font-weight:bold;">End Time:</td>
          <td style="padding:8px;">${endTime}</td>
        </tr>
        <tr>
          <td style="padding:8px; font-weight:bold;">Location:</td>
          <td style="padding:8px;">${location} (${mode})</td>
        </tr>
        <tr>
          <td style="padding:8px; font-weight:bold;">Seats Left:</td>
          <td style="padding:8px;">${availableSeats}</td>
        </tr>
      </table>

      <p style="margin-top:20px;">
        See you there 🚀
      </p>

      <p style="font-size:12px; color:#888; margin-top:25px;">
        This is an automated reminder. Please do not reply.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f5f5f5; padding:10px; text-align:center; font-size:12px;">
      © Event Platform
    </div>

  </div>
  `;
};

module.exports = reminderTemplate;
