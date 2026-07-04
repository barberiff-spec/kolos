import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def send_email(to: str, subject: str, html_body: str) -> bool:
    if not settings.email_enabled:
        logger.info("[EMAIL MOCK] To: %s | Subject: %s\n%s", to, subject, html_body[:200])
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.smtp_from
        msg["To"] = to
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            if settings.smtp_use_tls:
                server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_from, to, msg.as_string())
        return True
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to, exc)
        return False


def send_welcome_email(to: str, name: str) -> bool:
    html = f"""
    <div style="font-family:sans-serif;background:#050505;color:#fff;padding:40px">
      <h1 style="color:#CD7F32">KOLOS Barber Academy</h1>
      <p>Добро пожаловать, {name}!</p>
      <p>Ваш аккаунт успешно создан. Начните обучение на <a href="{settings.frontend_url}/courses" style="color:#CD7F32">каталоге курсов</a>.</p>
    </div>
    """
    return send_email(to, "Добро пожаловать в KOLOS", html)


def send_purchase_email(to: str, name: str, course_title: str, amount: float) -> bool:
    html = f"""
    <div style="font-family:sans-serif;background:#050505;color:#fff;padding:40px">
      <h1 style="color:#CD7F32">Оплата подтверждена</h1>
      <p>{name}, спасибо за покупку!</p>
      <p>Курс: <strong>{course_title}</strong></p>
      <p>Сумма: <strong>{amount:.0f} ₽</strong></p>
      <p><a href="{settings.frontend_url}/cabinet" style="color:#CD7F32">Перейти в кабинет →</a></p>
    </div>
    """
    return send_email(to, f"Доступ к курсу «{course_title}»", html)


def send_certificate_email(to: str, name: str, course_title: str, code: str) -> bool:
    html = f"""
    <div style="font-family:sans-serif;background:#050505;color:#fff;padding:40px">
      <h1 style="color:#CD7F32">🎓 Сертификат KOLOS</h1>
      <p>Поздравляем, {name}!</p>
      <p>Вы успешно завершили курс <strong>{course_title}</strong>.</p>
      <p>Номер сертификата: <code style="color:#CD7F32">{code}</code></p>
      <p><a href="{settings.frontend_url}/certificates" style="color:#CD7F32">Посмотреть сертификат →</a></p>
    </div>
    """
    return send_email(to, f"Сертификат KOLOS — {course_title}", html)
