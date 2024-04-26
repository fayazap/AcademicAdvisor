from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4
from datetime import datetime

db = SQLAlchemy()

def get_uuid():
    return uuid4().hex

class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.String, default=get_uuid, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    username = db.Column(db.Text, nullable=False, unique=True)
    email = db.Column(db.Text, unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    jwt_token = db.Column(db.Text)  # Add this line
    reset_password_token = db.Column(db.Text)  # Add this line

    def __repr__(self):
        return f"User(id={self.id}, name={self.name}, username={self.username}, email={self.email})"


class ChatHistory(db.Model):
    __tablename__ = "chat_history"
    id = db.Column(db.String, default=get_uuid, primary_key=True)
    user_id = db.Column(db.String, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_input = db.Column(db.Text, nullable=False)
    chatbot_response = db.Column(db.Text, nullable=False)  # Change this line

    # Define a relationship with the User model
    user = db.relationship('User', backref=db.backref('chat_history', lazy=True))

    def __repr__(self):
        return f"ChatHistory(id={self.id}, user_id={self.user_id}, timestamp={self.timestamp}, user_input={self.user_input}, chatbot_response={self.chatbot_response})"

