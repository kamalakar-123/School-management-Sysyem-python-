# 🎓 School Management Dashboard - Automated Insights

A professional-grade, animated web dashboard for School Management System with AI-driven automated insights.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![Flask](https://img.shields.io/badge/Flask-3.0+-lightgrey)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Features

### 📊 **Dashboard Module**

#### **Auto-Updated Statistics Cards**
- **Total Students**: Dynamic count with animated counters
- **Total Teachers**: Real-time faculty count
- **Today's Attendance**: Live percentage with color-coded status indicators
- **Pending Fees**: Alert system for unpaid fees
- **Upcoming Exams**: Countdown for next 7 days

#### **Automated Data Visualization**
- **Daily Attendance Pattern**: 7-day trend line chart with smooth animations
- **Class-Wise Performance**: Bar chart showing average performance per class
- **Responsive Charts**: Built with Chart.js, fully interactive and animated

#### **Smart Alerts System**
Automated rule-based alerts that trigger based on:
- 🔴 **Low Attendance**: Alert if attendance < 75%
- 🟠 **Unpaid Fees**: Warning for pending/overdue payments
- 🔵 **Upcoming Exams**: Notifications for exams within 3 days
- 🟢 **Positive Alerts**: Celebration for excellent performance

### 👨‍🎓 **Students Module** (NEW!)

#### **Modern Animated Table**
- Display all students with roll number, name, class, email, and attendance
- Smooth fade-in animations with staggered effects
- Hover effects with scale transformations

#### **Class-Wise Filter**
- Dropdown to filter students by class (Class 7-10)
- Dynamic filtering without page reload
- Smooth fade transition animations

#### **Absent Students View**
- Toggle button to switch views
- Show only today's absent students
- Red pulsing badges for absent status
- Automatic date detection

#### **Live Search System**
- Real-time search by student name or roll number
- Animated input focus effect
- Clear button with smooth transitions
- Works in combination with class filter

### 🎨 **Modern UI/UX Design**
- **Glassmorphism Cards**: Soft blur effects with transparency
- **Smooth Animations**: CSS animations + JavaScript transitions
- **Responsive Design**: Mobile, Tablet, Desktop optimized
- **Education-Themed Colors**: Professional palette for academic environment

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.8+, Flask 3.0+ |
| **Database** | SQLite3 |
| **Frontend** | HTML5, CSS3, JavaScript ES6+ |
| **Charts** | Chart.js 4.4.0 |
| **Icons** | Font Awesome 6.4.0 |
| **Fonts** | Google Fonts (Inter) |

## 📁 Project Structure

```
school_management/
├── app.py                  # Flask backend server
├── database.db             # SQLite database (auto-generated)
├── schema.sql              # Database schema with sample data
├── README.md               # Main documentation
├── STUDENTS_MODULE.md      # Students module documentation
├── TESTING_GUIDE.md        # Testing guide
├── QUICK_REFERENCE.md      # Quick reference
├── requirements.txt        # Python dependencies
├── start.bat               # Windows quick start
├── templates/
│   ├── dashboard.html      # Main dashboard page
│   └── students.html       # Students list page (NEW!)
└── static/
    ├── css/
    │   └── style.css       # Complete stylesheet
    └── js/
        ├── dashboard.js    # Dashboard logic
        └── students.js     # Students page logic (NEW!)
```

## ⚡ Quick Start

### Prerequisites

Ensure you have Python 3.8+ installed:

```bash
python --version
```

### Installation & Setup

1. **Navigate to project directory**
```bash
cd school_management
```

2. **Install Flask** (if not already installed)
```bash
pip install flask
```

3. **Run the application**
```bash
python app.py
```

4. **Access the dashboard**
Open your browser and visit:
```
### **Dashboard APIs**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/dashboard` | GET | Main dashboard page |
| `/api/stats` | GET | Dashboard statistics (students, teachers, attendance, fees, exams) |
| `/api/attendance-data` | GET | 7-day attendance data for line chart |
| `/api/performance-data` | GET | Class-wise performance data for bar chart |
| `/api/alerts` | GET | Smart alerts based on business rules |

### **Students APIs** (NEW!)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/students` | GET | Students list page |
| `/api/students` | GET | All active students with today's attendance |
| `/api/classes` | GET | List of unique classes for filter |
| `/api/absent` | GET | Today's absent students only
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/dashboard` | GET | Main dashboard page |
| `/api/stats` | GET | Dashboard statistics (students, teachers, attendance, fees, exams) |
| `/api/attendance-data` | GET | 7-day attendance data for line chart |
| `/api/performance-data` | GET | Class-wise performance data for bar chart |
| `/api/alerts` | GET | Smart alerts based on business rules |

## 🎯 Key Features Explained

### 1️⃣ Animated Statistics Cards

The dashboard fetches real-time data and displays it with:
- **Smooth counter animations** from 0 to actual value
- **Dynamic color coding** based on thresholds:
  - 🟢 Green: Good performance (attendance ≥ 85%, no pending fees)
  - 🟡 Yellow: Warning (attendance 75-84%, some pending fees)
  - 🔴 Red: Critical (attendance < 75%, many pending fees)

### 2️⃣ Automated Graphs

#### Daily Attendance Pattern (Line Chart)
- Shows last 7 days of attendance
- Animated line drawing effect
- Hover tooltips with exact percentages
- Gradient fill under the line

#### Class-Wise Performance (Bar Chart)
- Average performance per class
- Gradient bars with different colors based on performance
- Grade labels in tooltips (A+, A, B+, B, C)
- Staggered animation on load

### 3️⃣ Smart Alerts System

Alerts are **automatically generated** by backend logic:

```python
# Example: Low Attendance Alert
if attendance_percentage < 75:
    trigger_alert("Low Attendance Alert")
```

Alerts include:
- Icon indicator (🔴 🟠 🔵 🟢)
- Title and detailed message
- Timestamp
- Dismissible with smooth animation

## 🎨 Color Palette

```css
Primary Blue:   #1E3A8A  /* Main navigation, headers */
Accent Blue:    #38BDF8  /* Interactive elements */
Success Green:  #10B981  /* Positive indicators */
Warning Amber:  #F59E0B  /* Warning alerts */
Danger Red:     #EF4444  /* Critical alerts */
```

## 🔧 Customization

### Adding More Data

Edit `schema.sql` to add more students, teachers, or modify sample data:

```sql
INSERT INTO students (name, class, section) VALUES
('New Student', 'Class 10', 'A');
```

Then delete `database.db` and restart the server to regenerate the database.

### Changing Thresholds

Edit `app.py` to modify alert thresholds:

```python
# Change attendance threshold from 75% to 80%
if today_attendance['attendance_percentage'] < 80:
    # Trigger alert
```

### Styling

All styles are in `static/css/style.css`. Modify CSS variables at the top:

```css
:root {
    --primary-blue: #1E3A8A;
    /* Change colors here */
}
```

## 📱 Responsive Breakpoints

| Device | Max Width | Layout Changes |
|--------|-----------|----------------|
| Desktop | 1024px+ | Full sidebar, 2-column charts |
| Tablet | 768px - 1024px | Full sidebar, 1-column charts |
| Mobile | < 768px | Collapsible sidebar, stacked layout |

## 🎓 Perfect For

- ✅ College Mini Projects
- ✅ Final Year Projects
- ✅ Web Development Portfolio
- ✅ Client Demonstrations
- ✅ School/College Management Systems
- ✅ Learning Flask & Database Integration

## 🏆 VIVA / Demo Talking Points

**Technical Architecture:**
> "Our system uses a modern 3-tier architecture with Flask as the backend RESTful API, SQLite for efficient data storage, and a responsive frontend built with HTML5, CSS3, and vanilla JavaScript for optimal performance."

**Key Innovation:**
> "The dashboard implements AI-driven rule-based logic to automatically detect academic risks, unpaid fees, and attendance trends. It visualizes real-time data using animated Chart.js graphs with smooth transitions for enhanced user experience."
### **Dashboard**
1. **Check Statistics**: The dashboard should show 30 students, 8 teachers
2. **View Attendance Chart**: Should display 7 days of data
3. **View Performance Chart**: Should show 4 classes (Class 7-10)
4. **Check Alerts**: Should show multiple alerts based on current data
5. **Test Responsiveness**: Resize browser to see mobile/tablet layouts
6. **Dismiss Alerts**: Click X button to dismiss alerts with animation

### **Students Module** (NEW!)
1. **View All Students**: Navigate to `/students` - should show 30 students
2. **Test Search**: Type a name or roll number - results filter in real-time
3. **Test Class Filter**: Select a class - table shows only those students
4. **Toggle Absent View**: Click button - should show 5 absent students
5. **Absent Animation**: Red badges should have pulsing effect
6. **Combine Filters**: Use search + class filter together
7. **Clear Search**: Click X button to clear search
8. **Refresh Data**: Click refresh button - icon spins and reloads
9. **Hover Effects**: Hover over rows to see scale animation
10. **Empty State**: Filter with no results shows friendly messageocking API requests, ensuring smooth user experience even with large datasets. The glassmorphism UI design follows modern UX principles with accessibility in mind."

## 🔍 Testing the System

1. **Check Statistics**: The dashboard should show 20 students, 8 teachers
2. **View Attendance Chart**: Should display 7 days of data
3. **View Performance Chart**: Should show 4 classes (Class 7-10)
4. **Check Alerts**: Should show multiple alerts based on current data
5. **Test Responsiveness**: Resize browser to see mobile/tablet layouts
6. **Dismiss Alerts**: Click X button to dismiss alerts with animation

## 🐛 Troubleshooting

### Database Not Creating
```bash
# Delete existing database and restart
rm database.db
python app.py
```

### Port Already in Use
```python
# Change port in app.py
**Dashboard Module:**
- ✅ Flask Backend with RESTful APIs
- ✅ SQLite Database with Sample Data
- ✅ Animated Statistics Cards
- ✅ Real-time Attendance Tracking
- ✅ Class-Wise Performance Analytics
- ✅ Smart Alert System
- ✅ Glassmorphism UI Design
- ✅ Fully Responsive Layout
- ✅ Chart.js Data Visualization
- ✅ Smooth CSS Animations
- ✅ Professional Color Scheme
- ✅ Auto-Refresh Functionality

**Students Module:** (NEW!)
- ✅ Modern Animated Table
- ✅ Live Search by Name/Roll Number
- ✅ Class-Wise Dropdown Filter
- ✅ Absent Students Toggle View
- ✅ Real-Time Attendance Badges
- ✅ Pulsing Animation for Absent Students
- ✅ Staggered Row Animations
- ✅ Hover Scale Effects
- ✅ Empty State Handling
- ✅ Count Badge with Animated Numbers
- ✅ Responsive Table Design
- ✅ Action Buttons (View/Edit/Delete)
## 👨‍💻 Author

Created by: **Your Name**
Project: School Management Dashboard
Year: 2026

---

## 🌟 Features Checklist

- ✅ Flask Backend with RESTful APIs
- ✅ SQLite Database with Sample Data
- ✅ Animated Statistics Cards
- ✅ Real-time Attendance Tracking
- ✅ Class-Wise Performance Analytics
- ✅ Smart Alert System
- ✅ Glassmorphism UI Design
- ✅ Fully Responsive Layout
- ✅ Chart.js Data Visualization
- ✅ Smooth CSS Animations
- ✅ Professional Color Scheme
- ✅ Auto-Refresh Functionality

---

**🎯 Ready to impress your professors and clients!**

For questions or support, refer to the inline code comments - every major function is documented!
