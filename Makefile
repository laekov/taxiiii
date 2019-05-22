cc=g++
ccflags=-std=c++11 -g
libpath=-I/home/laekov/.local/include -L/home/laekov/.local/lib
objs=bin/gtree.o bin/gptree.o


all : bin/test

bin/test : src/test.cc $(objs)
	$(cc) $(ccflags) $< $(objs) -o ./$@ $(libpath) -lmetis

bin/%.o : src/%.cc
	$(cc) $(ccflags) $< -c -o $@ $(libpath) -lmetis

bin : 
	mkdir -p bin

clean : 
	rm -f bin/*.a bin/*.o bin/test
