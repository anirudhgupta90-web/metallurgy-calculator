export default function handler(req, res) {

    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST allowed' });
    }

    const {
        C1, S1, C2, S2,
        Ct, St,
        Cc, Pc,
        Ss, Ps,
        M
    } = req.body;

    let solutions = [];

    // -------------------------
    // 1. PURE MIXING
    // -------------------------
    let xC = (Ct - C2) / (C1 - C2);
    let xS = (St - S2) / (S1 - S2);

    if (isFinite(xC) && isFinite(xS) && Math.abs(xC - xS) < 0.001) {
        let x = xC * M;
        let y = M - x;

        if (x >= 0 && y >= 0) {
            solutions.push({
                type: "Pure Mixing",
                x, y, zc: 0, zs: 0,
                cost: 0
            });
        }
    }

    // -------------------------
    // 2. CARBON ADDITIVE ONLY
    // -------------------------
    {
        let x = (St - S2) / (S1 - S2);
        let X = x * M;
        let Y = M - X;

        if (X >= 0 && Y >= 0) {
            let carbonFromFeeds = X*C1 + Y*C2;
            let neededCarbon = M*Ct - carbonFromFeeds;

            let zc = neededCarbon / Cc;

            if (zc >= 0) {
                let y_new = Y - zc;

                if (y_new >= 0) {
                    solutions.push({
                        type: "Carbon Additive",
                        x: X,
                        y: y_new,
                        zc,
                        zs: 0,
                        cost: zc * Pc
                    });
                }
            }
        }
    }

    // -------------------------
    // 3. SILICON ADDITIVE ONLY
    // -------------------------
    {
        let x = (Ct - C2) / (C1 - C2);
        let X = x * M;
        let Y = M - X;

        if (X >= 0 && Y >= 0) {
            let siliconFromFeeds = X*S1 + Y*S2;
            let neededSi = M*St - siliconFromFeeds;

            let zs = neededSi / Ss;

            if (zs >= 0) {
                let y_new = Y - zs;

                if (y_new >= 0) {
                    solutions.push({
                        type: "Silicon Additive",
                        x: X,
                        y: y_new,
                        zc: 0,
                        zs,
                        cost: zs * Ps
                    });
                }
            }
        }
    }

    // -------------------------
    // 4. BOTH ADDITIVES (LP SOLVER)
    // -------------------------
    {
        const steps = 200; // increase for more precision
        const stepSize = M / steps;

        for (let x = 0; x <= M; x += stepSize) {

            // Solve for zc and zs using equations
            // Assume y = remaining mass after additives

            let A = Cc;
            let B = Ss;

            // Solve using substitution
            // y = M - x - zc - zs

            let numeratorC = M*Ct - x*C1;
            let numeratorS = M*St - x*S1;

            // Express in terms of zc, zs
            // y = M - x - zc - zs

            // Carbon:
            // xC1 + (M-x-zc-zs)C2 + zcCc = M Ct

            // Silicon:
            // xS1 + (M-x-zc-zs)S2 + zsSs = M St

            // Rearranged into 2 equations:
            // zc*(Cc - C2) - zs*C2 = M Ct - xC1 - (M-x)C2
            // -zc*S2 + zs*(Ss - S2) = M St - xS1 - (M-x)S2

            let RHS1 = M*Ct - x*C1 - (M-x)*C2;
            let RHS2 = M*St - x*S1 - (M-x)*S2;

            let a1 = (Cc - C2);
            let b1 = -C2;

            let a2 = -S2;
            let b2 = (Ss - S2);

            let det = a1*b2 - a2*b1;

            if (Math.abs(det) < 1e-6) continue;

            let zc = (RHS1*b2 - RHS2*b1) / det;
            let zs = (a1*RHS2 - a2*RHS1) / det;

            let y = M - x - zc - zs;

            if (x >= 0 && y >= 0 && zc >= 0 && zs >= 0) {
                let cost = zc*Pc + zs*Ps;

                solutions.push({
                    type: "Both Additives (Optimized)",
                    x, y, zc, zs,
                    cost
                });
            }
        }
    }

    if (solutions.length === 0) {
        return res.status(200).json({ success: false });
    }

    solutions.sort((a,b) => a.cost - b.cost);

    return res.status(200).json({
        success: true,
        best: solutions[0]
    });
}
