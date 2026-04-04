export default function handler(req, res) {
  try {
    const a = parseFloat(req.query.a);
    const b = parseFloat(req.query.b);
    const c = parseFloat(req.query.c);
    const d = parseFloat(req.query.d);
    const e = parseFloat(req.query.e);
    const f = parseFloat(req.query.f);
    const Z = parseFloat(req.query.Z);

    const det = a * e - b * d;

    if (det === 0) {
      return res.status(200).json({ error: "No unique solution" });
    }

    const X = (c * Z * e - b * f * Z) / det;
    const Y = (a * f * Z - c * Z * d) / det;

    res.setHeader("Access-Control-Allow-Origin", "*");

    return res.status(200).json({ X, Y });

  } catch (err) {
    return res.status(200).json({ error: err.message });
  }
}
