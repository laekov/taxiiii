cc=g++
ccflags=-std=c++11
libpath=-L/Users/laekov/.local/lib
objs=bin/gtree.o


all : bin/test

bin/test : src/test.cc bin/gtree.o
	$(cc) $(ccflags) $< $(objs) -o ./$@ $(libpath) -lmetis

bin/%.o : src/%.cc
	$(cc) $(ccflags) $< -c -o $@ $(libpath) -lmetis

bin : 
	mkdir -p bin

clean : 
	rm bin/*.a bin/*.o bin/test
