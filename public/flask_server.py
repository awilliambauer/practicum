from flask import Flask, request
from datetime import datetime

app = Flask(__name__, static_folder='')

@app.route('/')
def serve():
    return app.send_static_file('index.html')

@app.route('/log', methods=["POST"])
def log_email():
    print(request.form)
    email = request.form.get("email")
    with open("logfile", "a+") as logfile:
        logfile.write(f"{str(datetime.now())},{email}\n")
    return 'OK'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9000, debug=True, threaded=True)
