const url = 'https://rfctiyupuqtymoepueib.supabase.co/rest/v1/contractors?select=*';
fetch(url, { headers: { 'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmY3RpeXVwdXF0eW1vZXB1ZWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NjE4MzgsImV4cCI6MjA4MTMzNzgzOH0.Gzq_Dy2OLIZ0m3dsKMDUEA7aZbTIeRqgfOpgd3Ack6E' } })
  .then(r => r.json())
  .then(data => {
    console.log(data);
  })
  .catch(console.error);
