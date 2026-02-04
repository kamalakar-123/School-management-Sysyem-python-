"""
Test script to verify student selection API endpoint
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_all_students():
    """Test getting all students"""
    print("Testing: Get all students")
    print("=" * 50)
    
    response = requests.get(f"{BASE_URL}/api/teacher/students/all")
    data = response.json()
    
    if data['success']:
        print(f"✅ Success! Found {data['total']} students")
        print("\nFirst 5 students:")
        for student in data['students'][:5]:
            print(f"  - {student['name']} ({student['student_id']}) - {student['class']}")
    else:
        print(f"❌ Error: {data.get('error', 'Unknown error')}")
    
    print()

def test_search_students():
    """Test searching students by name"""
    print("Testing: Search students by name 'Rahul'")
    print("=" * 50)
    
    response = requests.get(f"{BASE_URL}/api/teacher/students/all?search=Rahul")
    data = response.json()
    
    if data['success']:
        print(f"✅ Success! Found {data['total']} student(s)")
        for student in data['students']:
            print(f"  - {student['name']} ({student['student_id']}) - {student['class']}")
    else:
        print(f"❌ Error: {data.get('error', 'Unknown error')}")
    
    print()

def test_filter_by_class():
    """Test filtering students by class"""
    print("Testing: Filter students by class '10 A'")
    print("=" * 50)
    
    response = requests.get(f"{BASE_URL}/api/teacher/students/all?class=10 A")
    data = response.json()
    
    if data['success']:
        print(f"✅ Success! Found {data['total']} student(s) in Class 10 A")
        for student in data['students']:
            print(f"  - {student['name']} ({student['student_id']}) - {student['class']}")
    else:
        print(f"❌ Error: {data.get('error', 'Unknown error')}")
    
    print()

def test_search_and_filter():
    """Test combining search and class filter"""
    print("Testing: Search 'a' in class '10 A'")
    print("=" * 50)
    
    response = requests.get(f"{BASE_URL}/api/teacher/students/all?search=a&class=10 A")
    data = response.json()
    
    if data['success']:
        print(f"✅ Success! Found {data['total']} student(s)")
        for student in data['students']:
            print(f"  - {student['name']} ({student['student_id']}) - {student['class']}")
    else:
        print(f"❌ Error: {data.get('error', 'Unknown error')}")
    
    print()

if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("STUDENT SELECTION API TESTS")
    print("=" * 50 + "\n")
    
    try:
        test_all_students()
        test_search_students()
        test_filter_by_class()
        test_search_and_filter()
        
        print("=" * 50)
        print("✅ All tests completed!")
        print("=" * 50)
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to Flask server")
        print("Make sure the server is running at http://127.0.0.1:5000")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
