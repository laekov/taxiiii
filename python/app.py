from flask import Flask, send_file
import ctypes


app = Flask(__name__)


backend = ctypes.cdll.LoadLibrary('../bin/libfindtaxi.so')
backend.taxiiii_find.argtypes = [ctypes.c_int32, ctypes.c_int32]
backend.taxiiii_find.restype = ctypes.c_char_p
backend.taxiiii_init()


@app.route('/')
def home():
    return send_file('../www/index.html')

@app.route('/app.js')
def appjs():
    return send_file('../www/app.js')

@app.route('/data/<filepath>')
def data(filepath):
    if filepath.find('..') != -1:
        return 'Dangerous operation!'
    return send_file('../data/{}'.format(filepath))

@app.route('/query/<pos>/<dst>')
def query(pos, dst):
    try:
        res = backend.taxiiii_find(int(pos), int(dst))
        res_str = res.decode()
        return res_str
    except Exception as e:
        print(e)
        return '{} to {} causes an error'.format(pos, dst)
