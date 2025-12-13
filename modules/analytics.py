import streamlit as st
import time
import json
import os
from datetime import datetime
from modules.data_manager import DataManager

# We use st.cache_resource to maintain a "global" state across sessions for active user counting.
# This assumes the app runs in a single process (typical for simple Streamlit deployments).
@st.cache_resource
def get_shared_state():
    return {
        "active_sessions": {},  # session_id -> last_heartbeat_timestamp
        "last_cleanup": time.time()
    }

STATE = get_shared_state()
SESSION_TIMEOUT = 300  # 5 minutes timeout for active status

class AnalyticsManager:
    def __init__(self):
        self.dm = DataManager()
        self.filename = "analytics.json"
        
    def _load_data(self):
        return self.dm.load_json(self.filename)
    
    def _save_data(self, data):
        self.dm.save_json(self.filename, data, "Update Analytics")

    def log_heartbeat(self):
        """
        Call this on every page load/interaction to update active status.
        """
        # Use a unique identifier for the session. 
        # Streamlit doesn't expose a stable session ID easily, so we use st.runtime.scriptrunner.add_script_run_ctx if needed,
        # but for simplicity in this pure logic, we can generate a session_id in session_state.
        if 'session_id' not in st.session_state:
            import uuid
            st.session_state.session_id = str(uuid.uuid4())
            st.session_state.start_time = time.time()
            
            # Increment total sessions count
            data = self._load_data()
            data["total_sessions"] = data.get("total_sessions", 0) + 1
            
            # Update daily visits
            today = datetime.now().strftime('%Y-%m-%d')
            data.setdefault("daily_visits", {})
            data["daily_visits"][today] = data["daily_visits"].get(today, 0) + 1
            
            self._save_data(data)

        # Update heartbeat
        STATE["active_sessions"][st.session_state.session_id] = time.time()
        
        # Calculate duration
        start_time = st.session_state.get("start_time", time.time())
        duration = (time.time() - start_time) / 60.0 # Minutes
        
        # We periodically update the total duration (not perfect, but works for aggregate)
        # Implementing a robust total duration requires a 'on_session_end' which doesn't exist efficiently.
        # So we won't constantly write to DB for duration to save API calls.
        # We can just display 'Current Session Duration' for the user.
        
        # Cleanup stale sessions from the unique active count
        self._cleanup_stale_sessions()

    def _cleanup_stale_sessions(self):
        """
        Remove sessions that haven't sent a heartbeat recently.
        """
        now = time.time()
        if now - STATE["last_cleanup"] > 60: # Cleanup every minute
            expired_sessions = [
                sid for sid, last_seen in STATE["active_sessions"].items() 
                if now - last_seen > SESSION_TIMEOUT
            ]
            for sid in expired_sessions:
                del STATE["active_sessions"][sid]
            STATE["last_cleanup"] = now

    def get_active_user_count(self):
        self._cleanup_stale_sessions()
        return len(STATE["active_sessions"])

    def get_global_stats(self):
        data = self._load_data()
        total_sessions = data.get("total_sessions", 0)
        
        # Calculate approximate active duration if we tracked it properly
        # For this simplified version, we'll return what we have.
        return {
            "total_sessions": total_sessions,
            "daily_visits": data.get("daily_visits", {})
        }
        
    def end_session(self):
        """
        Manual attempt to log duration when user clicks a logout or similar (Optional).
        """
        if 'start_time' in st.session_state:
            duration = (time.time() - st.session_state.start_time) / 60.0
            data = self._load_data()
            data["total_duration_minutes"] = data.get("total_duration_minutes", 0) + duration
            self._save_data(data)

