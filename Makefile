cc=g++
ccflags=-std=c++11 -O3 -fPIC
libpath=-I/home/laekov/.local/include -L/home/laekov/.local/lib
objs=bin/gptree.o bin/traveler.o

default : bin/libfindtaxi.so

data/gtree_build : src/gtree_build.cpp
	g++ -std=c++0x -O3 -fopenmp $< -I/home/laekov/.local/include -L/home/laekov/.local/lib/ -lmetis -o $@

bin/libfindtaxi.so : $(objs) src/findtaxi.cc
	$(cc) $(ccflags) $(objs) src/findtaxi.cc -shared -o $@ $(libpath) -lmetis

bin/test : src/%.cc $(objs)
	$(cc) $(ccflags) $< $(objs) -o $@ $(libpath) -lmetis

bin/%.o : src/%.cc
	$(cc) $(ccflags) $< -c -o $@ $(libpath) -lmetis

bin : 
	mkdir -p bin

clean : 
	rm -f bin/*.a bin/*.o bin/*.so
