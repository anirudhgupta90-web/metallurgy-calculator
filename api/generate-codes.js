import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

function generateCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();}
  try {
    const n = parseInt(req.query.n) || 5;

    const codes = [];

    for (let i = 0; i < n; i++) {
      codes.push({
        code: generateCode(),
        status: 'unused'
      });
    }

    const { data, error } = await supabase
      .from('codes')
      .insert(codes)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ codes: data });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
