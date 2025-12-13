import requests
import streamlit as st
import json
import os

# Firebase Identity Toolkit API URLs
# Support both Streamlit Secrets (Local/Cloud) and Env Vars (Vercel)
FIREBASE_API_KEY = st.secrets.get("FIREBASE_API_KEY") or os.environ.get("FIREBASE_API_KEY")
SIGN_UP_URL = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={FIREBASE_API_KEY}"
SIGN_IN_URL = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}"

def sign_up(email, password):
    """
    Creates a new user in Firebase Authentication.
    """
    payload = {
        "email": email,
        "password": password,
        "returnSecureToken": True
    }
    try:
        response = requests.post(SIGN_UP_URL, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        try:
            error_data = e.response.json()
            error_msg = error_data.get('error', {}).get('message', 'Unknown Error')
            return {"error": error_msg}
        except:
            return {"error": str(e)}

def sign_in(email, password):
    """
    Signs in an existing user.
    """
    payload = {
        "email": email,
        "password": password,
        "returnSecureToken": True
    }
    try:
        response = requests.post(SIGN_IN_URL, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        try:
            error_data = e.response.json()
            error_msg = error_data.get('error', {}).get('message', 'Unknown Error')
            return {"error": error_msg}
        except:
            return {"error": str(e)}
