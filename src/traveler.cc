#include "traveler.hh"
#include <iostream>
#include <fstream>

using namespace std;

namespace Traveler {

struct Edge {
	int to, len;
	Edge* ne;
};

const int edge_buf_sz = 1 << 20;

Edge *ebuf_b, *ebuf_e;
vector<Edge*> edge_head;
int n, m;

inline Edge* allocEdge() {
	if (ebuf_b == ebuf_e) {
		ebuf_e = (ebuf_b = new Edge[edge_buf_sz]) + edge_buf_sz;
	}
	return ebuf_b++;
}

inline void addEdge(int u, int v, int w) {
	auto e(allocEdge());
	e->to = v;
	e->len = w;
	e->ne = edge_head[u];
	edge_head[u] = e;
}

void init(string filename) {
	ifstream fin(filename);
	fin >> n >> m;
	ebuf_b = ebuf_e = 0;
	edge_head.resize(n);
	for (int i = 0; i < m; ++i) {
		int u, v, w;
		fin >> u >> v >> w;
		addEdge(u, v, w);
		addEdge(v, u, w);
	}
	cout << "Graph for dijkstra loaded\n";
}

vector<NodeDist> Visitor::expand(int count) {
	vector<NodeDist> res;
	while (!cand.empty() && res.size() < (size_t)count) {
		NodeDist cur(cand.top());
		cand.pop();
		if (dist.find(cur.id) != dist.end()) {
			continue;
		}
		dist[cur.id] = cur.dis;
		res.push_back(cur);
		for (Edge* e = edge_head[cur.id]; e; e = e->ne) {
			if (exp.find(e->to) == exp.end() || cur.dis + e->len < exp[e->to]) {
				exp[e->to] = cur.dis + e->len;
				cand.push(NodeDist(e->to, cur.dis + e->len));
			}
		}
	}
	return res;
}

};  // namespace Traveler
