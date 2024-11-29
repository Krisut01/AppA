from django.db import models
from django.contrib.auth.models import User

class Message(models.Model):
    sender = models.ForeignKey(User, related_name="appA_sent_messages", on_delete=models.CASCADE)
    recipient = models.ForeignKey(User, related_name="appA_received_messages", on_delete=models.CASCADE)
    content = models.TextField()  # This stores the plain text message
    encrypted_content = models.TextField(blank=True, null=True)  # For the encrypted content
    timestamp = models.DateTimeField(auto_now_add=True)  # Automatically set the time when the message is sent

    def __str__(self):
        return f"Message from {self.sender.username} to {self.recipient.username} at {self.timestamp}"

    def save(self, *args, **kwargs):
        if self.content:
            # Here, you would encrypt the content before saving
            from cryptography.fernet import Fernet
            key = b'your-secret-key-here'  # Use a secure key
            cipher = Fernet(key)
            self.encrypted_content = cipher.encrypt(self.content.encode()).decode()
        super().save(*args, **kwargs)

def decrypt_content(self):
        if self.encrypted_content:
            # Assuming the encryption is done using Fernet
            from cryptography.fernet import Fernet
            key = b'your-secret-key-here'  # Use the same key as in the save method
            cipher = Fernet(key)
            try:
                return cipher.decrypt(self.encrypted_content.encode()).decode()
            except Exception as e:
                # Handle decryption errors gracefully
                return f"Decryption failed: {str(e)}"
        return "No content"