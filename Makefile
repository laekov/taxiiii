cc=g++
ccflags=-std=c++11 -g
libpath=-I/home/laekov/.local/include -L/home/laekov/.local/lib
objs=bin/gtree.o bin/gptree.o

default : data/gtree_build


data/gtree_build : src/gtree_build.cpp
	g++ -std=c++0x -O3 -fopenmp $< -I/home/laekov/.local/include -L/home/laekov/.local/lib/ -lmetis -o $@

bin/% : src/%.cc $(objs)
	$(cc) $(ccflags) $< $(objs) -o ./$@ $(libpath) -lmetis

bin/%.o : src/%.cc
	$(cc) $(ccflags) $< -c -o $@ $(libpath) -lmetis

bin : 
	mkdir -p bin

clean : 
	rm -f bin/*.a bin/*.o bin/test
