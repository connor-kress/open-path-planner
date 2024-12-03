import osmnx as ox
from osmnx.distance import great_circle
import networkx as nx

# Define your coordinate and radius (in meters)
start = (29.648643, -82.349709)
radius = 1000  # Radius in meters

# Fetch road network data around the coordinate
G = ox.graph_from_point(start, dist=radius, network_type='bike')

for u, v, data in G.edges(data=True):
    data['travel_time'] = data['length'] / 10  # meters per second

start_id = ox.distance.nearest_nodes(G, X=start[1], Y=start[0])
start_node = G.nodes[start_id]
start_coords = (start_node['y'], start_node['x'])

print(start_coords)
print(f'Start: {start_coords} ({great_circle(*start, *start_coords)} m)')
for node_id in G.neighbors(start_id):
    node = G.nodes[node_id]
    node_coords = (node['y'], node['x'])
    road_dist = nx.shortest_path_length(G, source=start_id, target=node_id, weight='length')
    travel_time = nx.shortest_path_length(G, source=start_id, target=node_id, weight='travel_time')
    straight_dist = great_circle(*start_coords, *node_coords)
    print(f'\tNeighbor: {node_coords}')
    print(f'\t\tStraight dist: {straight_dist:.4f} m')
    print(f'\t\tRoad dist: {straight_dist:.4f} m')
    print(f'\t\tTravel time: {travel_time:.4f} s')
