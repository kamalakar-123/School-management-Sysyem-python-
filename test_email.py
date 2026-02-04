"""
Test email functionality for absence notifications
"""
import sqlite3
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

# Email configuration
MAIL_SERVER = "smtp.gmail.com"
MAIL_PORT = 587
MAIL_USERNAME = "kamalakaramarathi13579@gmail.com"
MAIL_PASSWORD = "tkkj ylhg mszl efnt"

def test_email():
    """Test sending a sample absence notification"""
    try:
        # Test data
        student_name = "Rahul Sharma"
        roll_no = "10A001"
        class_name = "Class 10"
        section = "A"
        date = "2026-02-04"
        parent_email = "gm8432419@gmail.com"
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = '🔔 Absence Notification'
        msg['From'] = MAIL_USERNAME
        msg['To'] = parent_email
        
        # Format the date
        formatted_date = datetime.strptime(date, '%Y-%m-%d').strftime('%d/%m/%Y')
        
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
                .details-box {{
                    background-color: white;
                    border: 1px solid #e0e0e0;
                    border-radius: 5px;
                    padding: 20px;
                    margin: 20px 0;
                }}
                .details-title {{
                    color: #5856D6;
                    font-weight: bold;
                    margin-bottom: 15px;
                }}
                .detail-row {{
                    margin: 8px 0;
                    color: #555;
                }}
                .footer {{
                    color: #666;
                    margin-top: 20px;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h2>🔔 Absence Notification</h2>
            </div>
            <div class="content">
                <p><strong>Dear Parent,</strong></p>
                
                <p>This is an automated notification from School Management System.</p>
                
                <p>Your child <strong>{student_name}</strong> (Roll No: <strong>{roll_no}</strong>, Class: <strong>{class_name}-{section}</strong>) has been marked <strong>absent</strong> on <strong>{formatted_date}</strong>.</p>
                
                <p>If this information is incorrect or if there are any concerns, please contact the school immediately.</p>
                
                <div class="details-box">
                    <div class="details-title">Student Details:</div>
                    <div class="detail-row">- Name: {student_name}</div>
                    <div class="detail-row">- Roll No: {roll_no}</div>
                    <div class="detail-row">- Class: {class_name}-{section}</div>
                    <div class="detail-row">- Date: {formatted_date}</div>
                </div>
                
                <p>Thank you for your attention.</p>
                
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
        ABSENCE NOTIFICATION
        
        Dear Parent,
        
        This is an automated notification from School Management System.
        
        Your child {student_name} (Roll No: {roll_no}, Class: {class_name}-{section}) has been marked absent on {formatted_date}.
        
        If this information is incorrect or if there are any concerns, please contact the school immediately.
        
        Student Details:
        - Name: {student_name}
        - Roll No: {roll_no}
        - Class: {class_name}-{section}
        - Date: {formatted_date}
        
        Thank you for your attention.
        
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
        
        print(f"✅ Test email sent successfully to {parent_email}")
        print(f"   Student: {student_name}")
        print(f"   Roll No: {roll_no}")
        print(f"   Class: {class_name}-{section}")
        print(f"   Date: {formatted_date}")
        return True
        
    except Exception as e:
        print(f"❌ Error sending test email: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("TESTING EMAIL NOTIFICATION SYSTEM")
    print("=" * 50)
    test_email()
