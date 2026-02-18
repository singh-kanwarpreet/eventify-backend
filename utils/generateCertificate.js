const puppeteer = require("puppeteer");
const certificateHTML = require("./certificateTemplate.js");

module.exports = async (name, eventName) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });

  const page = await browser.newPage();

  const html = certificateHTML(
    name,
    eventName,
    new Date().toDateString(),
    "Event Management Team"
  );

  await page.setContent(html, { waitUntil: "networkidle0" }); 

  const pdfBuffer = await page.pdf({
    format: "A4",
    landscape: true,
    printBackground: true,
  });

  await browser.close();

  return pdfBuffer;
};
