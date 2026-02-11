const puppeteer = require("puppeteer");
const certificateHTML = require("./certificateTemplate.js");

module.exports = async (name, eventName) => {
  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  const html = certificateHTML(name, eventName, new Date().toDateString(), "Event Management Team");

  await page.setContent(html);

  // pdf saved in ram
  const pdfBuffer = await page.pdf({
    format: "A4",
    landscape: true,
    printBackground: true,
  });

  await browser.close();

  return pdfBuffer;
};
