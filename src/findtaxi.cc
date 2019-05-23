#include <cstdio>
#include <ctime>
#include <vector>
#include <string>
#include <iostream>
#include <sstream>

#include "gtree.hh"
#include "gptree.hh"
#include "traveler.hh"


using namespace std;


namespace taxiiii {

const int max_neighbor = 1000;
const int num_res = 5;
const int int_inf = 0x3f3f3f3f;
const int max_dist = 1e4; // 10km = 1e4m
const int batch_expand_size = 1024;

struct Router {
	int d1, pos, l;
	vector<int> dests;
	vector<int> d1_opt;
	vector<vector<int> > dists;

	int dfs_min;
	vector<int> dfs_opt, dfs_stack;

	void DFS(int k, int u, int vis, int dist) {
		if (dist >= dfs_min) {
			return;
		}
		if (vis == (1 << k) - 1) {
			dfs_min = dist;
			dfs_opt = dfs_stack;
			return;
		}
		for (int v = 0; v < k; ++v) {
			if (!((1 << v) & vis)) {
				dfs_stack.push_back(dests[v]);
				DFS(k, v, vis | (1 << v), dist + dists[u][v]);
				dfs_stack.pop_back();
			}
		}
	}

	int getDist(int k, int src) {
		dfs_min = int_inf;
		dfs_stack.clear();
		for (int i = 0; i < k; ++i) {
			dfs_stack.push_back(dests[i]);
			DFS(k, i, 1 << i, gptree::query(src, dests[i]));
			dfs_stack.pop_back();
		}
		return dfs_min;
	}

	Router(int pos_, vector<int>& dests_) {
		pos = pos_;
		dests = dests_;
		l = (int)dests.size();
		dests.push_back(0);

		dists.resize(l + 1);
		for (int i = 0; i <= l; ++i) {
			dists[i].resize(l + 1);
			dists[i][i] = 0;
			if (i == l) {
				break;
			}
			for (int j = 0; j < i; ++j) {
				dists[i][j] = dists[j][i] = gptree::query(dests[i], dests[j]);
			}
		}
		d1 = getDist(l, pos);
		d1_opt = dfs_opt;
	}

	int calcD3(int src, int dst, vector<int>* opt) {
		dests[l] = dst;
		for (int i = 0; i < l; ++i) {
			dists[i][l] = dists[l][i] = gptree::query(dests[i], dst);
		}
		int d3(getDist(l + 1, src));
		if (opt != 0) {
			*opt = dfs_opt;
		}
		return d3;
	}
};

struct Point {
	double x, y;
	Point(double x_ = 0, double y_ = 0): x(x_), y(y_) {} 
};

struct Taxi {
	int id, k, pos;
	Point loc;
	vector<int> dests;
	vector<Point> dest_loc;
	Router* rtr;
};

vector<vector<Taxi> > taxi_on_node;

int n;

void readTaxis(string filename) {
	taxi_on_node.resize(n);
	FILE* fin(fopen(filename.c_str(), "r"));
	int id, k, cnt(0);
	while (fscanf(fin, "%d%d", &id, &k) != EOF) {
		Taxi t;
		t.id = id, t.k = k;
		t.rtr = 0;
		fscanf(fin, "%lf,%lf,%d", &t.loc.x, &t.loc.y, &t.pos);
		t.dests.resize(k);
		t.dest_loc.resize(k);
		for (int j = 0; j < k; ++j) {
			fscanf(fin, "%lf,%lf,%d", &t.dest_loc[j].x, &t.dest_loc[j].y, &t.dests[j]);
		}
		taxi_on_node[t.pos].push_back(t);
		++cnt;
	}
	fclose(fin);
	printf("%d taxis loaded\n", cnt);
}

void init() {
	// gtree::init_all();
	// puts("GTree initialized");
	n = gptree::init_all();
	puts("GPTree initialized");
	readTaxis("car.txt");
	Traveler::init("road.nedge");
}

int isTaxiOk(Taxi& t, int pos, int dest, int d2, int d4, vector<string>& res) {
	if (t.k == 4) {
		return 0;
	}
	if (t.rtr == 0) {
		t.rtr = new Router(t.pos, t.dests);
	}
	vector<int> rt;
	int d1(t.rtr->d1);
	int d3(t.rtr->calcD3(pos, dest, &rt));
	if (d2 + d3 - d1 > max_dist) {
		return 0;
	}
	if (d3 - d4 > max_dist) {
		return 0;
	}
	ostringstream sou;
	sou << "{";
	sou << "\"taxi_id\":" << t.id << ",";
	sou << "\"k\":" << t.k << ",";
	sou << "\"taxi_pos\":" << t.pos << ",";
	sou << "\"user_pos\":" << pos << ",";
	sou << "\"d1\":" << d1 << ",";
	sou << "\"d2\":" << d2 << ",";
	sou << "\"d3\":" << d3 << ",";
	sou << "\"d4\":" << d4 << ",";
	sou << "\"route_orig\":[";
	vector<int> route_orig;
	int u(t.pos);
	for (auto i : t.rtr->d1_opt) {
		auto seg(Traveler::Visitor(u, i).trace());
		route_orig.insert(route_orig.end(), seg.begin(), seg.end());
		u = i;
	}
	for (auto i : route_orig) {
		sou << i << ",";
	}
	sou << "],";

	vector<int> route_new(Traveler::Visitor(t.pos, pos).trace());
	u = pos;
	for (auto i : rt) {
		auto seg(Traveler::Visitor(u, i).trace());
		route_new.insert(route_new.end(), seg.begin(), seg.end());
		u = i;
	}

	sou << "\"route_new\":[";
	for (auto i : route_new) {
		sou << i << ",";
	}
	sou << "],";

	sou << "\"dests\":[";
	for (auto i : t.dests) {
		sou << i << ",";
	}
	sou << "]";
	sou << "}";
	res.push_back(sou.str());
	return 1;
}

string find(int pos, int dest) {
	vector<string> res;
	int d4(gptree::query(pos, dest));
	Traveler::Visitor vis(pos);
	while (res.size() < num_res) {
		auto cands(vis.expand(batch_expand_size));
		for (auto& c : cands) {
			if (c.dis > max_dist) {
				break;
			}
			for (auto& t : taxi_on_node[c.id]) {
				if (isTaxiOk(t, pos, dest, c.dis, d4, res)) {
					if (res.size() > num_res) {
						break;
					}
				}
			}
			if (res.size() > num_res) {
				break;
			}
		}
		if (cands.rbegin()->dis > max_dist) {
			break;
		}
	}
	string out;
	for (auto i : res) {
		out += i + "\n";
	}
	return out;
}

};  // namespace taxiiii

extern "C" {

void taxiiii_init() {
	taxiiii::init();
}

const char* taxiiii_find(int pos, int dest) {
	return taxiiii::find(pos, dest).c_str();
}

};

int main() {
	taxiiii_init();
	int u, v;
	while (cin >> u >> v) {
		clock_t t_b(clock());
		cout << taxiiii::find(u, v);
		clock_t t_e(clock());
		cout << "Finished in " << t_e - t_b << "us\n";
	}
}

