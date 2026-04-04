import sympy as sp
import json

def handler(request):

    try:
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

        response = {
            "X": float(sol[X]),
            "Y": float(sol[Y])
        }

    except Exception as err:
        response = {"error": str(err)}

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps(response)
    }
