#ifndef GTREE_HH
#define GTREE_HH

#include <vector>

namespace gtree {
typedef struct{
	int id;
	int dis;
}ResultSet;

void init();
void gtree_load();
void hierarchy_shortest_path_load();
void pre_query();
std::vector<ResultSet> knn_query(int, int);
};  // gtree

#endif  // GTREE_HH
