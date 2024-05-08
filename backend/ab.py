from flask import Flask, request, jsonify, redirect, url_for, session
from flask_cors import CORS
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
import pandas as pd
from flask_sqlalchemy import SQLAlchemy
from models import db, User, ChatHistory
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_admin import Admin, AdminIndexView, expose
from flask_admin.contrib.sqla import ModelView 
from flask_mail import Mail, Message
import smtplib
import ssl
import random
import string
from email.message import EmailMessage
from flask_bcrypt import check_password_hash

app = Flask(__name__)
CORS(app)
CORS(app, supports_credentials=True)

app.config.from_pyfile('instance/config.py')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///user.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = '1234'

db.init_app(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Load and prepare the dataset
# Replace the path with the new dataset path
dataset_path = '../dataset/type.csv'
df = pd.read_csv(dataset_path)

# Drop rows with NaN values
df.dropna(inplace=True)

# Reindex the DataFrame
df.reset_index(drop=True, inplace=True)

# Separate features (X) and target (y)
X = df['passion_interest'].astype(str)
y = df['Course'] + ' - ' + df['Name'] + ' (' + df['City'] + ', ' + df['State'] + ')'

# Train the model
model = make_pipeline(CountVectorizer(), MultinomialNB())
model.fit(X, y)

class MyAdminIndexView(AdminIndexView):
    @expose('/')
    def index(self):
        if not session.get('admin_logged_in'):
            return redirect(url_for('.login'))
        return super(MyAdminIndexView, self).index()

    @expose('/login', methods=['GET', 'POST'])
    def login(self):
        if request.method == 'POST':
            username = request.form.get('username')
            password = request.form.get('password')
            # Check admin credentials
            if username == 'admin' and password == 'admin':
                session['admin_logged_in'] = True
                return redirect(url_for('.index'))
            else:
                return 'Invalid username or password'
        return '''
        <form method="post">
            <h1>Admin Login</h1>
            <label for="username">Username:</label>
            <p><input type=text name=username>
            <p><label for="password">Password:</label>
            <p><input type=password name=password>
            <p><input type=submit value=Login>
        </form>
        '''

    @expose('/logout')
    def logout(self):
        session.pop('admin_logged_in', None)
        return redirect(url_for('.index'))

class AdminModelView(ModelView):
    def is_accessible(self):
        return session.get('admin_logged_in')

# Initialize Flask-Admin
admin = Admin(app, name='Admin Panel', template_mode='bootstrap3', index_view=MyAdminIndexView())

# Add views for User and ChatHistory models with authentication
admin.add_view(AdminModelView(User, db.session))
admin.add_view(AdminModelView(ChatHistory, db.session))


@app.route('/predict_career', methods=['POST'])
@jwt_required()
def predict_career():
    try:
        current_user_id = get_jwt_identity()
        print(f"user_id inside predict_career: user_id={current_user_id}")

        user_input = request.json.get('user_input', '').lower()

        if not user_input:
            return jsonify({'error': 'Empty user input'}), 400
        
        user = User.query.filter_by(id=current_user_id).first()

        if user:
            username = user.username

        if user_input.lower() in ['hi', 'hello']:
            return jsonify({'message': f'Hello {username}! Mention your passion and interests.'}), 200
        
        else:
            # Check the format of df
            print(f"DataFrame columns: {df.columns}")
            print(f"DataFrame head: {df.head()}")

            # Check the shape and contents of model.classes_
            print(f"Model classes: {model.classes_}")
            if model.classes_ is None or len(model.classes_) == 0:
                return jsonify({'error': 'No classes found in the model'}), 500
            
            split_classes = [label.rsplit(' - ', 1) for label in model.classes_]
            courses, names_cities_states = zip(*split_classes)

            # Get probability estimates for all classes
            probabilities = model.predict_proba([user_input])[0]

            # Create a list of dictionaries containing career, probability, and website link
            career_probabilities = [{
                'predictedCourse': course,
                'predictedInstitute': name_city_state.rsplit(' (', 1)[0],
                'predictedCity': name_city_state.rsplit(' (', 1)[1].split(', ')[0],
                'predictedState': name_city_state.rsplit(' (', 1)[1].split(', ')[1][:-1],
                'probability': prob,
                'website': df.loc[df['Course'] == course.split(' - ')[0], 'Website'].values[0] if course.split(' - ')[0] in df['Course'].values else ''
            } for course, name_city_state, prob in zip(courses, names_cities_states, probabilities)]

            # Sort careers based on probability in descending order
            sorted_careers = sorted(career_probabilities, key=lambda x: x['probability'], reverse=True)[:10]

            save_chat_history(current_user_id, user_input, sorted_careers)

            response_data = {
                'userInput': user_input,
                'predictedCareers': sorted_careers,
                'message': f"We suggest considering the following courses and institutes."
            }

            return jsonify(response_data)

    except Exception as e:
        print(f"Error in predict_career route: {str(e)}")
        return jsonify({'error': str(e)}), 500




@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        user = User.query.filter_by(email=email).first()

        if user and bcrypt.check_password_hash(user.password, password):
            access_token = create_access_token(identity=user.id)
            response_data = {'access_token': access_token, 'user_id': user.id}
            return jsonify(response_data), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
def send_password_reset_token(email, token):
    # SMTP server configuration
    smtp_server = 'smtp.gmail.com'
    smtp_port = 465  # SSL port for Gmail SMTP
    smtp_username = "chatbotacad@gmail.com"  # Your Gmail address
    smtp_password = "bfxr ophc ubaf xvot"  # Your Gmail password

    # Create the email message
    email_msg = EmailMessage()
    email_msg['Subject'] = 'Password Reset Instructions'
    email_msg['From'] = "chatbotacad@gmail.com"
    email_msg['To'] = email
    email_msg.set_content(f'Hi,\n\nPlease use the following token to reset your password: {token}')

    # Connect to the SMTP server and send the email
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(smtp_server, smtp_port, context=context) as server:
        server.login(smtp_username, smtp_password)
        server.send_message(email_msg)
        print(f"Password reset instructions sent to {email}")

def generate_reset_token(length=6):
    # Generate a random password reset token
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.json
        email = data.get('email')

        if not email:
            return jsonify({'error': 'Email is required'}), 400

        user = User.query.filter_by(email=email).first()

        if user:
            # Generate a random password reset token
            token = generate_reset_token()

            # Update the user's password reset token in the database
            user.reset_password_token = token
            db.session.commit()

            # Send email with password reset token
            send_password_reset_token(email, token)

            return jsonify({'message': 'Password reset instructions sent to your email'}), 200
        else:
            return jsonify({'error': 'User with this email does not exist'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.json
        email = data.get('email')
        token = data.get('token')
        new_password = data.get('new_password')

        if not email or not token or not new_password:
            return jsonify({'error': 'Email, token, and new password are required'}), 400

        user = User.query.filter_by(email=email).first()

        if user:
            if user.reset_password_token == token:
                # Update the user's password
                user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
                user.reset_password_token = None  # Clear the reset token
                db.session.commit()
                return jsonify({'message': 'Password reset successfully'}), 200
            else:
                return jsonify({'error': 'Invalid token'}), 400
        else:
            return jsonify({'error': 'User with this email does not exist'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/change-password', methods=['POST'])
@jwt_required()  # Requires authentication
def change_password():
    try:
        data = request.json
        email = data.get('email')
        current_password = data.get('current_password')
        new_password = data.get('new_password')

        if not email or not current_password or not new_password:
            return jsonify({'error': 'Email, current password, and new password are required'}), 400

        # Fetch user by email
        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Verify current password
        if not bcrypt.check_password_hash(user.password, current_password):
            return jsonify({'error': 'Incorrect current password'}), 401

        # Hash and update new password
        hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        user.password = hashed_password
        db.session.commit()

        return jsonify({'message': 'Password changed successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def save_chat_history(user_id, user_input, sorted_careers):
    try:
        # Debugging: Print user_id, user_input, and sorted_careers
        print(f"Saving chat history: user_id={user_id}, user_input={user_input}, sorted_careers={sorted_careers}")

        # Convert sorted_careers to a string or any other format that suits your needs
        chatbot_response = ', '.join([f"{career['predictedCourse']} at {career['predictedInstitute']}" for career in sorted_careers])

        # Create a new ChatHistory instance
        chat_history = ChatHistory(user_id=user_id, user_input=user_input, chatbot_response=chatbot_response)

        # Add the chat history to the database session
        db.session.add(chat_history)

        # Commit changes to the database
        db.session.commit()

        print(f"Chat history saved successfully: {chat_history}")

    except Exception as e:
        print(f"Error saving chat history: {str(e)}")
        # Rollback changes if an error occurs
        db.session.rollback()
        raise  # Re-raise the exception for further handling in the calling code



@app.route('/fetch_chat_history', methods=['GET'])
@jwt_required()
def fetch_chat_history():
    try:
        current_user_id = get_jwt_identity()
        print(f"Current user_id inside fetch_chat_history: user_id={current_user_id}")

        # Fetch chat history for the specified user_id
        chat_history = ChatHistory.query.filter_by(user_id=current_user_id).all()

        # Convert chat history to a list of dictionaries
        chat_history_data = [{'timestamp': entry.timestamp,
                              'user_input': entry.user_input,
                              'chatbot_response': entry.chatbot_response}
                             for entry in chat_history]

        return jsonify({'chat_history': chat_history_data}), 200

    except Exception as e:
        print(f"Error in fetch_chat_history route: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        name = data.get('name')
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not name or not username or not email or not password:
            return jsonify({'error': 'All fields are required'}), 400

        # Check if the username already exists
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({'error': 'Username already exists. Please choose a different username.'}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        new_user = User(name=name, username=username, email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        # Generate an access token for the new user
        access_token = create_access_token(identity=new_user.id)

        print(f"User created successfully: {new_user}")

        # Return the access token along with a success message
        return jsonify({'message': 'User created successfully', 'access_token': access_token}), 201

    except Exception as e:
        print(f"Error in signup route: {str(e)}")
        return jsonify({'error': 'Internal Server Error'}), 500
    
@app.route('/get_user_details', methods=['GET'])
@jwt_required()
def get_user_details():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(id=current_user_id).first()

        if user:
            user_details = {
                'id': user.id,
                'name': user.name,
                'username': user.username,
                'email': user.email,

                # Add any other user details you want to expose
            }

            return jsonify({'user_details': user_details}), 200
        else:
            return jsonify({'error': 'User not found'}), 404

    except Exception as e:
        print(f"Error in get_user_details route: {str(e)}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/change-username', methods=['POST'])
@jwt_required()  # Requires authentication
def change_username():
    try:
        data = request.json
        new_username = data.get('new_username')

        if not new_username:
            return jsonify({'error': 'New username is required'}), 400

        current_user_id = get_jwt_identity()
        user = User.query.filter_by(id=current_user_id).first()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Check if the new username is already taken
        existing_user = User.query.filter_by(username=new_username).first()
        if existing_user:
            return jsonify({'error': 'Username already exists'}), 409

        # Update the username
        user.username = new_username
        db.session.commit()

        return jsonify({'message': 'Username changed successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
