#!/bin/bash
cd ../data
pwd
export FLASK_APP=../python/app.py 
export FLASK_DEBUG=1
flask run --port=8323
