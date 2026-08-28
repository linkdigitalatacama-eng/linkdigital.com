const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  let html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');

  // Keep the browser integration aligned with the active Supabase publishable key.
  // This is intentionally a small compatibility layer so the visual iteration can
  // ship without exposing a second configuration source in the page source.
  const activeKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZ2ZiZXJrcGNqdWF0cmJ3dHdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1OTMxOTgsImV4cCI6MjEwMzE2OTE5OH0.TVZL-83aAW0MGtJ39L86Vrv6ck1U-llG8EBCp22q7As';
  html = html.replace(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, activeKey);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.status(200).send(html);
};
