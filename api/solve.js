export default function handler(req, res) {

  // 🔥 ALWAYS set CORS headers first
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const a = parseFloat(req.query.a);
    const b = parseFloat(req.query.b);
    const c = parseFloat(req.query.c);
    const d = parseFloat(req.query.d);
    const e = parseFloat(req.query.e);
    const f = parseFloat(req.query.f);
    const Z = parseFloat(req.query.Z);

    if ([a, b, c, d, e, f, Z].some(v => isNaN(v))) {
      return res.status(200).json({ error: "Invalid input" });
    }

    const det = a * e - b * d;

    if (det === 0) {
      return res.status(200).json({ error: "No unique solution" });
    }

    const X = (c * Z * e - b * f * Z) / det;
    const Y = Z - X;

    return res.status(200).json({ X, Y });

  } catch (err) {
    return res.status(200).json({ error: err.message });
  }
}
