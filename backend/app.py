from flask import Flask, request, jsonify, session
from flask_cors import CORS
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
import pandas as pd
from flask_sqlalchemy import SQLAlchemy
from models import db, User, ChatHistory
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt

app = Flask(__name__)
CORS(app)
CORS(app, supports_credentials=True)

app.config['SESSION_TYPE'] = 'filesystem'
app.config.from_pyfile('instance/config.py')
app.config['SECRET_KEY'] = '1234'  # Add a secret key for session
app.config['SESSION_COOKIE_SAMESITE'] = None  # Allow cross-site requests for session cookie
db.init_app(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)

# Load and prepare the dataset (Replace with your actual dataset)
dataset_path = '../dataset/b1.csv'
df = pd.read_csv(dataset_path)

# Combine multiline strings into a single line, separating interests with commas
df['passion_interest'] = df['passion_interest'].str.replace('\n', ', ')

X, y = df['passion_interest'].astype(str), df['programme'] + ' - ' + df['College_name'] + ' (' + df['type'] + ')'

# Train the model
model = make_pipeline(CountVectorizer(), MultinomialNB())
model.fit(X, y)

@app.route('/predict_career', methods=['POST'])
def predict_career():
    try:
        user_id = request.json.get('user_id')
        print(f"user kittunnundo inside predic_career: user_id={user_id}")

        user_input = request.json.get('user_input', '').lower()

        # Get probability estimates for all classes
        probabilities = model.predict_proba([user_input])[0]

        # Create a list of dictionaries containing career and probability
        career_probabilities = [{'predictedProgram': label.split(' - ')[0],
                                 'predictedCollegeName': label.split(' - ')[1].rsplit(' (', 1)[0],
                                 'predictedCollegeType': label.split(' - ')[1].rsplit(' (', 1)[1][:-1],
                                 'probability': prob}
                                for label, prob in zip(model.classes_, probabilities)]

        # Filter careers based on probability (greater than 0.01)
        filtered_careers = [career for career in career_probabilities if career['probability'] > 0.001]

        # Sort filtered careers based on probability in descending order
        sorted_careers = sorted(filtered_careers, key=lambda x: x['probability'], reverse=True)[:10]
        
        if user_id:
            print(f"in function if: user_id={user_id}, user_input={user_input}, sorted_careers={sorted_careers}")
            save_chat_history(user_id, user_input, sorted_careers)

        response_data = {
            'userInput': user_input,
            'predictedCareers': sorted_careers,
            'message': f"We suggest considering the following programs and colleges."
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
            session['user_id'] = user.id
            response_data = {'message': 'Login successful', 'user_id': user.id}
            return jsonify(response_data), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def save_chat_history(user_id, user_input, sorted_careers):
    try:
        # Debugging: Print user_id, user_input, and sorted_careers
        print(f"Saving chat history: user_id={user_id}, user_input={user_input}, sorted_careers={sorted_careers}")

        # Convert sorted_careers to a string or any other format that suits your needs
        chatbot_response = ', '.join([f"{career['predictedProgram']} at {career['predictedCollegeName']}" for career in sorted_careers])

        # Create a new ChatHistory instance
        chat_history = ChatHistory(user_id=user_id, user_input=user_input, chatbot_response=chatbot_response)

        # Add the chat history to the database session
        db.session.add(chat_history)

        # Commit changes to the database
        db.session.commit()

        print(f"Chat history saved successfully: {chat_history}")

    except Exception as e:
        print(f"Error saving chat history: {str(e)}")

@app.route('/fetch_chat_history', methods=['POST'])
def fetch_chat_history():
    try:
        user_id = request.json.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400

        # Fetch chat history for the specified user_id
        chat_history = ChatHistory.query.filter_by(user_id=user_id).all()

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

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        new_user = User(name=name, username=username, email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        print(f"User created successfully: {new_user}")

        return jsonify({'message': 'User created successfully'}), 201

    except Exception as e:
        print(f"Error in signup route: {str(e)}")
        return jsonify({'error': 'Internal Server Error'}), 500

    
@app.route('/logout', methods=['POST'])
def logout():
    try:
        print("Logout route accessed")
        user_id = session.get('user_id')
        print(f"user kittunnundo inside logout: user_id={user_id}")

        session.clear()

        print(f"User logged out successfully")
        return jsonify({'message': 'Logout successful'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
