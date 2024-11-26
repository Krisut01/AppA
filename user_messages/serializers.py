from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    decrypted_content = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'content', 'decrypted_content', 'timestamp']

    def get_decrypted_content(self, obj):
        return obj.decrypt_content()
