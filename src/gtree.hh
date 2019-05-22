#ifndef GTREE_HH
#define GTREE_HH

#include <vector>

namespace gtree {
typedef struct{
	int id;
	int dis;
}ResultSet;

void init_all();
std::vector<ResultSet> knn_query(int, int);
};  // gtree

#endif  // GTREE_HH
