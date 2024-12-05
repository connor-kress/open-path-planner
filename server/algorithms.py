from typing import Optional
from osmnx.distance import great_circle
import networkx as nx
import heapq


def convert_graph_to_dict(G: nx.MultiDiGraph) -> dict[int, dict[int, float]]:
    """Convert graph to dictionary for easier edge access."""
    graph = {}
    for u, v, data in G.edges(data=True):
        # Use length attribute if available, otherwise straight line
        if u not in graph:
            graph[u] = {}
        weight = data.get('length',
                          great_circle(G.nodes[u]['y'], G.nodes[u]['x'], 
                                       G.nodes[v]['y'], G.nodes[v]['x']))
        graph[u][v] = weight
    return graph


def solve_djikstra(G: nx.MultiDiGraph, start: int, finish: int) -> list[int]:
    """Dijkstra's shortest path algorithm."""
    graph = convert_graph_to_dict(G)
    distances = {node: float('infinity') for node in graph}
    distances[start] = 0.0
    prev: dict[int, Optional[int]] = {node: None for node in graph}
    
    # Initialize priority queue and visited set
    pq = [(0.0, start)]
    visited = set()
    
    while pq:
        curr_dist, curr_node = heapq.heappop(pq) # closest node to start
        if curr_node == finish:
            path = []
            # Traverse using previous nodes to form backwards path
            while curr_node is not None:
                path.append(curr_node)
                curr_node = prev[curr_node]
            return list(reversed(path))

        if curr_node in visited:
            continue
        visited.add(curr_node)
        
        # Handles some edge cases
        if curr_node not in graph:
            continue
        
        for neighbor, weight in graph[curr_node].items():
            distance = curr_dist + weight
            if distance < distances[neighbor]: # new shortest path
                distances[neighbor] = distance
                prev[neighbor] = curr_node
                heapq.heappush(pq, (distance, neighbor))
    raise Exception("No path found")


def solve_a_star(G: nx.MultiDiGraph, start: int, finish: int) -> list[int]:
    """A* shortest path algorithm using great circle distance as heuristic."""
    def heuristic(node, goal):
        return great_circle(G.nodes[node]['y'], G.nodes[node]['x'], 
                            G.nodes[goal]['y'], G.nodes[goal]['x'])
    
    graph = convert_graph_to_dict(G)
    distances = {node: float('infinity') for node in graph}
    distances[start] = 0.0
    prev: dict[int, Optional[int]] = {node: None for node in graph}
    
    # Initialize priority queue and visited set
    pq = [(heuristic(start, finish), 0.0, start)]
    visited = set()
    
    while pq:
        _, curr_dist, curr_node = heapq.heappop(pq) # least estimate cost node
        
        if curr_node == finish:
            # Traverse using previous nodes to form backwards path
            path = []
            while curr_node is not None:
                path.append(curr_node)
                curr_node = prev[curr_node]
            return list(reversed(path))
        
        if curr_node in visited:
            continue
        visited.add(curr_node)
        
        # Handles some edge cases
        if curr_node not in graph:
            continue
        
        for neighbor, weight in graph[curr_node].items():
            distance = curr_dist + weight
            
            if distance < distances[neighbor]: # new shortest path
                distances[neighbor] = distance
                prev[neighbor] = curr_node
                # f(n) = actual cost + heuristic
                estimate_cost = distance + heuristic(neighbor, finish)
                heapq.heappush(pq, (estimate_cost, distance, neighbor))
    raise Exception("No path found")
