#include <cstdio>
#include "gtree.hh"
#include "gptree.hh"

int main() {
	gtree::init_all();
	puts("GTree initialized");
	gptree::init_all();
	puts("GPTree initialized");
}
