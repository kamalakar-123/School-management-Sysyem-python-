import requests
import json

r = requests.get('http://127.0.0.1:5000/api/teacher/classes')
data = r.json()

print('API Response:')
print(json.dumps(data, indent=2))

if data.get('classes'):
    print('\n\nFirst class object:')
    print(json.dumps(data['classes'][0], indent=2))
