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
	int src; 
	std::unordered_map<int, int> dist, exp;
	std::priority_queue<NodeDist> cand;
	Visitor(int src_) {
		src = src_;
		cand.push(NodeDist(src, 0));
	}
	std::vector<NodeDist> expand(int);
};

};  // namespace Traveler

#endif  // TRAVELER_HH

