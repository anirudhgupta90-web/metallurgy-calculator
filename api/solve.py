from sympy import symbols, Eq, solve
from http.server import BaseHTTPRequestHandler
import json
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        query = parse_qs(urlparse(self.path).query)

        try:
            # Inputs (convert % to fraction)
            a = float(query.get("a")[0]) / 100
            b = float(query.get("b")[0]) / 100
            c = float(query.get("c")[0]) / 100
            d = float(query.get("d")[0]) / 100
            e = float(query.get("e")[0]) / 100
            f = float(query.get("f")[0]) / 100
            Z = float(query.get("Z")[0])

            # Variables
            X, Y = symbols('X Y')

            # Equations
            eq1 = Eq(a*X + b*Y, c*Z)
            eq2 = Eq(d*X + e*Y, f*Z)

            # Solve
            sol = solve((eq1, eq2), (X, Y))

            response = {
                "X": float(sol[X]),
                "Y": float(sol[Y])
            }

        except Exception as e:
            response = {"error": str(e)}

self.send_response(200)
self.send_header("Content-Type", "application/json")
self.send_header("Access-Control-Allow-Origin", "*")
self.send_header("Access-Control-Allow-Methods", "GET")
self.send_header("Access-Control-Allow-Headers", "Content-Type")

self.end_headers()
        self.wfile.write(json.dumps(response).encode())
