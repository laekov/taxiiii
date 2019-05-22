#ifndef GTREE_HH
#define GTREE_HH

#include <vector>

namespace gtree {
struct NodeDist {
	int id;
	int dis;
	NodeDist(int id_, int dis_): id(id_), dis(dis_) {}
};

inline bool operator <(const NodeDist& a, const NodeDist& b) {
	return a.dis > b.dis;
}

typedef NodeDist ResultSet;

void init_all();
std::vector<ResultSet> knn_query(int, int);
};  // gtree

#endif  // GTREE_HH
