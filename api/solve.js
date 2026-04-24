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

    if (isFinite(xC) && isFinite(xS) && Math.abs(xC - xS) < 1e-4) {
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
    // 2. CARBON ONLY
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
    // 3. SILICON ONLY
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
    // 4. BOTH ADDITIVES (CLEAN SOLVER)
    // -------------------------
    {
        const steps = 200;       // x resolution
        const steps_zc = 200;    // zc resolution

        const stepX = M / steps;
        const stepZc = M / steps_zc;

        for (let x = 0; x <= M; x += stepX) {

            for (let zc = 0; zc <= M; zc += stepZc) {

                // Solve zs from carbon balance
                // xC1 + yC2 + zcCc = M Ct
                // y = M - x - zc - zs

                let numerator =
                    M*Ct
                    - x*C1
                    - (M - x - zc)*C2
                    - zc*Cc;

                let zs = numerator / (-C2);

                if (!isFinite(zs)) continue;

                let y = M - x - zc - zs;

                if (y < 0 || zc < 0 || zs < 0) continue;

                // Check silicon consistency
                let S_calc = (x*S1 + y*S2 + zs*Ss) / M;
                let C_calc = (x*C1 + y*C2 + zc*Cc) / M;

                if (Math.abs(S_calc - St) > 0.001) continue;
                if (Math.abs(C_calc - Ct) > 0.001) continue;

                let cost = zc*Pc + zs*Ps;

                solutions.push({
                    type: "Both Additives (Exact)",
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
