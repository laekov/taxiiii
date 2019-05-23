#ifndef TRAVELER_HH
#define TRAVELER_HH

#include <vector>
#include <queue>
#include <unordered_map>
#include <string>
#include "gtree.hh"

namespace Traveler {

using gtree::NodeDist;

void init(std::string);

struct Visitor {
	int src, dest; 
	std::unordered_map<int, int> dist, exp, from;
	std::priority_queue<NodeDist> cand;
	Visitor(int src_, int dest_=-1) {
		src = src_;
		dest = dest_;
		cand.push(NodeDist(src, 0));
	}
	std::vector<NodeDist> expand(int);
	std::vector<int> trace();
};

};  // namespace Traveler

#endif  // TRAVELER_HH

