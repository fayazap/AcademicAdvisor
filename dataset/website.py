import google.generativeai as genai
import pandas as pd
from requests.exceptions import ReadTimeout

# Replace 'YOUR_API_KEY' with your actual API key
genai.configure(api_key='AIzaSyCAVf_1UruvuIjqXb0JxFPymvXVyexi-EA')

model = genai.GenerativeModel('gemini-pro')

# Load Excel file into a DataFrame
df = pd.read_csv('nirfnext1.csv', encoding='latin-1')

# Create a new column for generated responses
df['Website'] = ""

# Specify the file name for storing the last successfully processed index
resume_file = 'last_successful_index.txt'

# Initialize the last successfully processed index
last_successful_index = 0

# Check if the resume file exists and read the last successful index from it
try:
    with open(resume_file, 'r') as file:
        last_successful_index = int(file.read())
except FileNotFoundError:
    pass  # The file may not exist initially

# Iterate through rows and make API requests, starting from the last successful index
try:
    for index, row in df.iloc[last_successful_index:].iterrows():
        prompt = row['Name']
        prompt2 = row['City']
        prompt3 = row['State']
        prompt_text = f"Provide the website link of the college {prompt} located in {prompt2} city in the state{prompt3}. just generate the link no other words or sentence."
        # Use response.parts[0].text or the alternative accessor
        try:
            response = model.generate_content(prompt_text)
            generated_text = response.parts[0].text  # Access the first part's text
        except (IndexError, AttributeError):
            # Handle potential errors if the expected structure is not found
            generated_text = ""
            print(f"Error accessing response for prompt: {prompt_text}")
        except ReadTimeout:
            # Handle read timeout error (you can choose to skip or retry)
            print(f"Read timeout for prompt: {prompt_text}. Skipping to the next prompt.")
            generated_text = ""

        # Update the 'passion_interest' column with the generated response
        df.at[index, 'Website'] = generated_text

        print(f"Prompt: {prompt_text}")
        print(f"Generated Text: {generated_text}")
        print("-----------------------------------")

        # Save the DataFrame with the new column to a new CSV file after each iteration
        df.to_csv(f'impimp_interest_partial_{index + 1}.csv', index=False)

    print("All iterations completed. Final DataFrame saved to CSV.")

except Exception as e:
    print(f"Error occurred: {e}")
    print("Saving the DataFrame with generated data up to this point.")
    df.to_csv(f'impimp_interest_partial_error_{index + 1}.csv', index=False)

finally:
    # Save the last successfully processed index to the resume file
    with open(resume_file, 'w') as file:
        file.write(str(index))