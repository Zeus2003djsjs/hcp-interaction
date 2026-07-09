import requests
import json

url = "http://localhost:8000/chat"
payload = {
    "messages": [
        {"type": "human", "content": "I gave him 8 samples of Vicodin."}
    ],
    "form_state": {
        "hcpName": "Dr. House",
        "interactionType": "Meeting",
        "date": "2026-07-09",
        "time": "15:00",
        "attendees": "None",
        "topicsDiscussed": "Vicodin",
        "materialsShared": [],
        "samplesDistributed": [],
        "sentiment": "Neutral",
        "outcomes": "",
        "followUpActions": ""
    }
}
res = requests.post(url, json=payload)
print(res.status_code)
print(res.text)
