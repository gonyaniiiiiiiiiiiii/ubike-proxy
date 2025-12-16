import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

const CLIENT_ID = process.env.TDX_CLIENT_ID;
const CLIENT_SECRET = process.env.TDX_CLIENT_SECRET;

let tokenCache = null;
let tokenExpire = 0;

async function getToken() {
  if (tokenCache && Date.now() < tokenExpire) {
    return tokenCache;
  }

  const res = await fetch(
    'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      })
    }
  );

  const json = await res.json();
  tokenCache = json.access_token;
  tokenExpire = Date.now() + (json.expires_in - 60) * 1000;
  return tokenCache;
}

app.get('/bike/station', async (req, res) => {
  const token = await getToken();
  const r = await fetch(
    'https://tdx.transportdata.tw/api/basic/v2/Bike/Station/City/Kaohsiung?$format=JSON',
    { headers: { Authorization: `Bearer ${token}` } }
  );
  res.json(await r.json());
});

app.get('/bike/availability', async (req, res) => {
  const token = await getToken();
  const r = await fetch(
    'https://tdx.transportdata.tw/api/basic/v2/Bike/Availability/City/Kaohsiung?$format=JSON',
    { headers: { Authorization: `Bearer ${token}` } }
  );
  res.json(await r.json());
});

app.listen(PORT, () => {
  console.log('Proxy running on port ' + PORT);
});
