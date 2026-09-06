import requests

url = "http://127.0.0.1:5000/predict"
files = {"image": open(r"C:\Users\shubh\OneDrive\Desktop\c files\Track4_AI\backend\Copilot_20260711_120202.jpeg", "rb")}
response = requests.post(url, files=files)
print(response.json())
