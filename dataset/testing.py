# Step 1: Import Python Libraries
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.multioutput import MultiOutputClassifier
from sklearn.ensemble import RandomForestClassifier

# Step 2: Read the Dataset
data = pd.read_csv('final10k.csv')  # Assuming the dataset is stored in a CSV file named 'college_data.csv'

# Step 3: Preprocess the Data
data.dropna(inplace=True)  # Drop any rows with missing values
X = data['passion_interest']  # Features (student's interests and passions)
y = data[['College_name', 'programme', 'discipline_group', 'discipline', 'type']]  # Target (college details)

# Step 4: Build the Model
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer()),  # Convert text to TF-IDF vectors
    ('clf', MultiOutputClassifier(RandomForestClassifier()))  # Multi-output Random Forest Classifier
])

# Train the model
pipeline.fit(X, y)

# Step 5: Make Predictions
# Example input from the student
student_input = ["* Business management and administration", 
                 "* Finance and accounting", 
                 "* Desire to understand accounting principles and practices"]

# Make predictions based on student's input
predictions = pipeline.predict(student_input)

# Display the predicted details
predicted_details = pd.DataFrame(predictions, columns=['College_name', 'programme', 'discipline_group', 'discipline', 'type'])
print(predicted_details)
