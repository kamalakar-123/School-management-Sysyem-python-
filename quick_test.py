import requests

# Test search
print("Testing search for 'Rahul'...")
r = requests.get('http://127.0.0.1:5000/api/teacher/students/all?search=Rahul')
data = r.json()
print(f"Found {data['total']} students:")
for s in data['students']:
    print(f"  - {s['name']} ({s['class']})")

print("\n" + "="*50 + "\n")

# Test class filter
print("Testing class filter '10 A'...")
r = requests.get('http://127.0.0.1:5000/api/teacher/students/all?class=Class 10')
data = r.json()
print(f"Found {data['total']} students in Class 10:")
for s in data['students'][:5]:  # Show first 5
    print(f"  - {s['name']} ({s['roll_no']})")

print("\n" + "="*50 + "\n")

# Test search + filter
print("Testing search 'a' + filter 'Class 10'...")
r = requests.get('http://127.0.0.1:5000/api/teacher/students/all?search=a&class=Class 10')
data = r.json()
print(f"Found {data['total']} students:")
for s in data['students']:
    print(f"  - {s['name']} ({s['roll_no']})")
