import requests

print("Testing Class Filter with Section...")
print("=" * 60)

# Test 1: Filter by Class 10 Section A
print("\n1. Testing: Class 10 Section A")
r = requests.get('http://127.0.0.1:5000/api/teacher/students/all?class=Class 10&section=A')
data = r.json()
print(f"   Found {data['total']} students")
if data['students']:
    for s in data['students'][:3]:
        print(f"   - {s['name']} (Class: {s['class']}, Section: {s['section']})")

# Test 2: Filter by Class 10 Section B
print("\n2. Testing: Class 10 Section B")
r = requests.get('http://127.0.0.1:5000/api/teacher/students/all?class=Class 10&section=B')
data = r.json()
print(f"   Found {data['total']} students")
if data['students']:
    for s in data['students'][:3]:
        print(f"   - {s['name']} (Class: {s['class']}, Section: {s['section']})")

# Test 3: Check parent emails
print("\n3. Testing: Students with parent emails")
r = requests.get('http://127.0.0.1:5000/api/teacher/students/all')
data = r.json()
students_with_parent_email = [s for s in data['students'] if s.get('parent_email')]
print(f"   Found {len(students_with_parent_email)} students with parent email")
for s in students_with_parent_email[:3]:
    print(f"   - {s['name']}")
    print(f"     Student Email: {s['email']}")
    print(f"     Parent Email: {s['parent_email']}")

print("\n" + "=" * 60)
print("✅ All tests completed!")
