"""
Test low attendance alert email functionality
"""
import sqlite3
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Email configuration
MAIL_SERVER = "smtp.gmail.com"
MAIL_PORT = 587
MAIL_USERNAME = "kamalakaramarathi13579@gmail.com"
MAIL_PASSWORD = "tkkj ylhg mszl efnt"

def test_low_attendance_email():
    """Test sending a low attendance alert"""
    try:
        # Test data
        student_name = "Rahul Sharma"
        roll_no = "10A001"
        class_name = "Class 10"
        section = "A"
        total_classes = 3
        classes_attended = 1
        classes_absent = 2
        attendance_percentage = 33.3
        parent_email = "gm8432419@gmail.com"
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'🚨 Low Attendance Alert - {student_name}'
        msg['From'] = MAIL_USERNAME
        msg['To'] = parent_email
        
        # Create HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background-color: #5856D6;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 5px 5px 0 0;
                }}
                .content {{
                    background-color: #f9f9f9;
                    padding: 30px;
                    border: 1px solid #ddd;
                }}
                .summary-box {{
                    background-color: #FFF9C4;
                    border-left: 4px solid #FFA000;
                    border-radius: 5px;
                    padding: 20px;
                    margin: 20px 0;
                }}
                .summary-title {{
                    color: #F57C00;
                    font-weight: bold;
                    font-size: 18px;
                    margin-bottom: 15px;
                }}
                .summary-item {{
                    margin: 8px 0;
                    color: #555;
                }}
                .important-notice {{
                    background-color: #FFEBEE;
                    border-left: 4px solid #D32F2F;
                    border-radius: 5px;
                    padding: 20px;
                    margin: 20px 0;
                }}
                .notice-title {{
                    color: #C62828;
                    font-weight: bold;
                    font-size: 16px;
                    margin-bottom: 10px;
                }}
                .notice-text {{
                    color: #555;
                    line-height: 1.8;
                }}
                .footer {{
                    color: #666;
                    margin-top: 20px;
                }}
                .highlight {{
                    font-weight: bold;
                    color: #D32F2F;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h2>🚨 Low Attendance Alert</h2>
            </div>
            <div class="content">
                <p><strong>Dear Parent,</strong></p>
                
                <p>This is an important attendance update for your child, <strong>{student_name}</strong> (Roll No: <strong>{roll_no}</strong>, Class: <strong>{class_name}-{section}</strong>).</p>
                
                <div class="summary-box">
                    <div class="summary-title">Summary:</div>
                    <div class="summary-item">• Total classes held: <strong>{total_classes}</strong></div>
                    <div class="summary-item">• Classes attended: <strong>{classes_attended}</strong></div>
                    <div class="summary-item">• Classes absent: <strong>{classes_absent}</strong></div>
                    <div class="summary-item">• Attendance %: <span class="highlight">{attendance_percentage}%</span></div>
                </div>
                
                <div class="important-notice">
                    <div class="notice-title">Important Notice:</div>
                    <div class="notice-text">
                        Your child's attendance is below the required threshold. Please ensure your child attends school regularly to avoid academic consequences. If there are valid reasons (medical or approved leave), notify the school office to mark the absence as excused.
                    </div>
                </div>
                
                <p>If you have any questions or concerns, please contact the school office immediately.</p>
                
                <div class="footer">
                    <p>Best regards,<br>
                    <strong>School Management System</strong></p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Create plain text version
        text_content = f"""
        LOW ATTENDANCE ALERT
        
        Dear Parent,
        
        This is an important attendance update for your child, {student_name} (Roll No: {roll_no}, Class: {class_name}-{section}).
        
        Summary:
        • Total classes held: {total_classes}
        • Classes attended: {classes_attended}
        • Classes absent: {classes_absent}
        • Attendance %: {attendance_percentage}%
        
        Important Notice:
        Your child's attendance is below the required threshold. Please ensure your child attends school regularly to avoid academic consequences. If there are valid reasons (medical or approved leave), notify the school office to mark the absence as excused.
        
        If you have any questions or concerns, please contact the school office immediately.
        
        Best regards,
        School Management System
        """
        
        # Attach both versions
        part1 = MIMEText(text_content, 'plain')
        part2 = MIMEText(html_content, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email using SMTP
        print("Connecting to SMTP server...")
        with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
            print("Starting TLS...")
            server.starttls()
            print("Logging in...")
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            print("Sending email...")
            server.send_message(msg)
        
        print(f"✅ Low attendance alert sent successfully to {parent_email}")
        print(f"   Student: {student_name}")
        print(f"   Roll No: {roll_no}")
        print(f"   Class: {class_name}-{section}")
        print(f"   Attendance: {attendance_percentage}%")
        print(f"   Total Classes: {total_classes}")
        print(f"   Attended: {classes_attended}")
        print(f"   Absent: {classes_absent}")
        return True
        
    except Exception as e:
        print(f"❌ Error sending test email: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("TESTING LOW ATTENDANCE ALERT EMAIL")
    print("=" * 60)
    test_low_attendance_email()
