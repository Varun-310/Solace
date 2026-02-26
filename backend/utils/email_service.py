"""
Email Service
Sends OTP via Gmail SMTP for password reset.
Configure SMTP_EMAIL and SMTP_PASSWORD in .env
"""

import os
import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))


def generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP."""
    return ''.join(random.choices(string.digits, k=length))


def send_otp_email(to_email: str, otp: str) -> bool:
    """Send OTP email via Gmail SMTP."""
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print(f"⚠️  SMTP not configured. OTP for {to_email}: {otp}")
        return True  # Allow dev mode without actual email
    
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Solace — Password Reset Code"
        msg["From"] = SMTP_EMAIL
        msg["To"] = to_email

        html = f"""
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #2D6A4F; font-size: 24px; margin: 0;">Solace</h1>
                <p style="color: #6B7280; font-size: 14px; margin-top: 4px;">Your compassionate companion</p>
            </div>
            <div style="background: #F5F0EB; border-radius: 16px; padding: 24px; text-align: center;">
                <p style="color: #1A1A1A; font-size: 14px; margin: 0 0 16px;">
                    Use this code to reset your passphrase:
                </p>
                <div style="background: #2D6A4F; color: white; font-size: 32px; letter-spacing: 8px; 
                            padding: 16px 24px; border-radius: 12px; font-weight: 600; display: inline-block;">
                    {otp}
                </div>
                <p style="color: #9CA3AF; font-size: 12px; margin-top: 16px;">
                    This code expires in 10 minutes. If you didn't request this, ignore this email.
                </p>
            </div>
        </div>
        """

        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, to_email, msg.as_string())

        return True
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return False
