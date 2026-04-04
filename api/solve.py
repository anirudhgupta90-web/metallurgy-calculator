import sympy as sp

def handler(request):
    a = float(request.query.get("a"))
    b = float(request.query.get("b"))
    c = float(request.query.get("c"))
    d = float(request.query.get("d"))
    e = float(request.query.get("e"))
    f = float(request.query.get("f"))
    Z = float(request.query.get("Z"))

    X, Y = sp.symbols('X Y')

    eq1 = sp.Eq(a*X + b*Y, c*Z)
    eq2 = sp.Eq(d*X + e*Y, f*Z)

    sol = sp.solve((eq1, eq2), (X, Y))

    return {
        "X": float(sol[X]),
        "Y": float(sol[Y])
    }
