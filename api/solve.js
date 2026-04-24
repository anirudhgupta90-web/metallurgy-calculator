async function calculate() {

    const data = {
        C1: 0.05,
        S1: 0.02,
        C2: 0.10,
        S2: 0.03,
        Ct: 0.08,
        St: 0.025,
        Cc: 0.9,
        Pc: 20,
        Ss: 0.7,
        Ps: 50,
        M: 1000
    };

    const res = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    console.log(result);
}
