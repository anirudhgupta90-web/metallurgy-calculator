import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(200).json({
        success: false,
        error: "Code required"
      });
    }

    // 🔥 FIX: NO .single()
    const { data, error } = await supabase
      .from('codes')
      .select('*')
      .eq('code', code)
      .eq('status', 'unused');

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    if (!data || data.length === 0) {
      return res.status(200).json({
        success: false,
        error: "Invalid or already used code"
      });
    }

    const record = data[0];

    // Mark as used
    const { error: updateError } = await supabase
      .from('codes')
      .update({
        status: 'used',
        used_at: new Date()
      })
      .eq('id', record.id);

    if (updateError) {
      return res.status(500).json({
        success: false,
        error: updateError.message
      });
    }

    return res.status(200).json({
      success: true
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
