export default async function handler(req, res) {
  const { id } = req.query;
  const targetUrl = id ? `https://jsonblob.com/api/jsonBlob/${id}` : 'https://jsonblob.com/api/jsonBlob';

  try {
    if (req.method === 'GET') {
      const response = await fetch(targetUrl);
      const data = await response.json();
      return res.status(200).json(data);
    }
    
    if (req.method === 'POST') {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      const loc = response.headers.get('Location');
      const newId = loc ? loc.split('/').pop() : null;
      return res.status(200).json({ id: newId });
    }

    if (req.method === 'PUT') {
      const response = await fetch(targetUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(req.body),
      });
      return res.status(response.status).json({ success: true });
    }

    res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Vercel API jsonblob error:', error);
    res.status(500).json({ error: 'Failed to communicate with cloud space' });
  }
}
