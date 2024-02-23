from flask import Flask, request, jsonify
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
@jwt_required()
def predict_career():
    try:
        current_user_id = get_jwt_identity()
        print(f"user_id inside predict_career: user_id={current_user_id}")

        user_input = request.json.get('user_input', '').lower()

        if not user_input:
            return jsonify({'error': 'Empty user input'}), 400

        print(f"user_input: {user_input}")

        # Check the format of df
        print(f"DataFrame columns: {df.columns}")
        print(f"DataFrame head: {df.head()}")

        # Check the shape and contents of model.classes_
        print(f"Model classes: {model.classes_}")
        if model.classes_ is None or len(model.classes_) == 0:
            return jsonify({'error': 'No classes found in the model'}), 500

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

        save_chat_history(current_user_id, user_input, sorted_careers)

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
            access_token = create_access_token(identity=user.id)
            response_data = {'access_token': access_token, 'user_id': user.id}
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

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        new_user = User(name=name, username=username, email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        print(f"User created successfully: {new_user}")

        return jsonify({'message': 'User created successfully'}), 201

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

if __name__ == '__main__':
    app.run(debug=True)
