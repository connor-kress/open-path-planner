from typing import Optional
from flask import Flask, request
from flask_cors import CORS

import math
import osmnx as ox
from osmnx.distance import great_circle, nearest_nodes
import networkx as nx

app = Flask(__name__)
CORS(app)


def are_coords_close(coords1, coords2, epsilon=1e-6):
    lat1, lon1 = coords1
    lat2, lon2 = coords2
    return (math.isclose(lat1, lat2, abs_tol=epsilon) and
            math.isclose(lon1, lon2, abs_tol=epsilon))


def parse_args(
    args: dict[str, str]
) -> Optional[tuple[tuple[float, float], tuple[float, float]]]:
    try:
        lat1 = float(args["lat1"])
        lon1 = float(args["lon1"])
        lat2 = float(args["lat2"])
        lon2 = float(args["lon2"])
    except (ValueError, TypeError, KeyError):
        return None
    return (lat1, lon1), (lat2, lon2)


def get_endpoints_and_graph(
    start_query: tuple[float, float],
    finish_query: tuple[float, float]
) -> tuple[int, int, nx.MultiDiGraph]:
    radius = great_circle(*start_query, *finish_query) + 2000  # 2km extra
    G = ox.graph_from_point(start_query, dist=radius, network_type='bike')
    start = nearest_nodes(G, X=start_query[1], Y=start_query[0])
    finish = nearest_nodes(G, X=finish_query[1], Y=finish_query[0])
    return start, finish, G


@app.get("/api/path")
def path():
    parse_res = parse_args(request.args)
    if parse_res is None:
        return {"error": "Invalid or missing query parameters"}
    start_query, finish_query = parse_res

    start, finish, G = get_endpoints_and_graph(start_query, finish_query)
    start_coords = (G.nodes[start]['y'], G.nodes[start]['x'])
    finish_coords = (G.nodes[finish]['y'], G.nodes[finish]['x'])

    start_offset = great_circle(*start_query, *start_coords)
    finish_offset = great_circle(*finish_query, *finish_coords)

    # Replace with custom algorithms
    node_path = nx.shortest_path(G, source=start, target=finish, weight="length")
    path_length = nx.path_weight(G, node_path, weight="length")

    node_path_json = [
        {
            "id": node,
            "coords": [G.nodes[node]["y"], G.nodes[node]["x"]],
        }
        for node in node_path
    ]

    geometric_path = []
    for u, v in zip(node_path[:-1], node_path[1:]):
        edge = G[u][v]
        geometry = edge[0].get("geometry")
        # no detailed geoetry available (fallback to straight line)
        if geometry is None:
            u_coords = (G.nodes[u]['y'], G.nodes[u]['x'])
            v_coords = (G.nodes[v]['y'], G.nodes[v]['x'])
            if not are_coords_close(u_coords, geometric_path[-1]):
                geometric_path.append(u_coords)
            geometric_path.append(v_coords)
        else:
            geometric_path.extend(
                ((coords[1], coords[0]) for coords in geometry.coords)
            )

    return {
        "nodePath": node_path_json,
        "geoPath": geometric_path,
        "length": path_length,  # meters
        "straightLength": great_circle(*start_coords, *finish_coords),
        "offsets": {
            "start": start_offset,  # meters
            "finish": finish_offset,  # meters
        },
    }


if __name__ == "__main__":
    app.run(debug=True)
