import json
import os
import streamlit as st
from github import Github, GithubException

DATA_DIR = "data"

class DataManager:
    def __init__(self):
        # Prefer st.secrets, fallback to os.environ for Vercel/Local compatibility
        self.github_token = st.secrets.get("GITHUB_TOKEN") or os.environ.get("GITHUB_TOKEN")
        self.repo_name = st.secrets.get("REPO_NAME") or os.environ.get("REPO_NAME")
        
        self.use_github = bool(self.github_token and self.repo_name)
        self.repo = None
        
        if self.use_github:
            try:
                g = Github(self.github_token)
                self.repo = g.get_repo(self.repo_name)
            except GithubException as e:
                st.error(f"GitHub Connection Failed: {e}")
                self.use_github = False
        else:
            st.warning("GitHub not configured. Data will not persist on Vercel.")

    def load_json(self, filename):
        """
        Load JSON data. Prioritize Session State -> GitHub -> Default/Empty.
        Does NOT rely on local file system for dynamic user data.
        """
        # 1. Check Session State
        if filename in st.session_state:
            return st.session_state[filename]
        
        data = None
        
        # 2. Try GitHub (Primary Source for Vercel)
        if self.use_github:
            try:
                contents = self.repo.get_contents(f"{DATA_DIR}/{filename}")
                data = json.loads(contents.decoded_content.decode())
                # st.toast(f"Loaded {filename} from GitHub") # Reduced noise
            except Exception as e:
                # File doesn't exist on GitHub yet (e.g. new user profile)
                pass
        
        # 3. Fallback to Local (Only for read-only assets like quotes.json included in build)
        if data is None:
            # Only attempt local load for static assets, not dynamic user data which won't exist
            local_path = os.path.join(DATA_DIR, filename)
            if os.path.exists(local_path):
                try:
                    with open(local_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                except:
                    pass
        
        # 4. If still None, return empty dict (caller handles initialization)
        if data is None:
            data = {}

        # 5. Save to Session State
        st.session_state[filename] = data
        return data

    def save_json(self, filename, data, commit_message="Update data"):
        """
        Save JSON data. Updates Session State and Pushes to GitHub.
        Ignores local filesystem write errors (expected on Vercel).
        """
        # 1. Update Session State
        st.session_state[filename] = data
        
        # 2. Try Save Locally (Optional/Best Effort)
        try:
            # Check if directory exists, if not try to create (might fail on Vercel)
            directory = os.path.dirname(os.path.join(DATA_DIR, filename))
            if not os.path.exists(directory):
                os.makedirs(directory, exist_ok=True)
                
            local_path = os.path.join(DATA_DIR, filename)
            with open(local_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except OSError:
            # Expected on Vercel (Read-Only FS)
            pass
            
        # 3. Push to GitHub (Required for persistence)
        if self.use_github:
            try:
                path = f"{DATA_DIR}/{filename}"
                json_content = json.dumps(data, indent=2, ensure_ascii=False)
                
                try:
                    # Update existing file
                    contents = self.repo.get_contents(path)
                    if contents.decoded_content.decode() != json_content: # Only commit if changed
                        self.repo.update_file(
                            contents.path,
                            commit_message,
                            json_content,
                            contents.sha
                        )
                        # st.toast(f"Saved {filename} to GitHub")
                except:
                    # Create new file
                    self.repo.create_file(
                        path,
                        commit_message,
                        json_content
                    )
                    # st.toast(f"Created {filename} on GitHub")
            except Exception as e:
                st.error(f"Failed to save to GitHub: {e}")
                
    def get_user_profile(self, uid=None):
        if uid:
            filename = f"users/{uid}.json"
            return self.load_json(filename)
        else:
            return self.load_json("user_profile.json")

    def save_user_profile(self, profile, uid=None):
        if uid:
            filename = f"users/{uid}.json"
            self.save_json(filename, profile, f"Update Profile for {uid}")
        else:
            self.save_json("user_profile.json", profile, "Update User Profile")

    def get_vocab_list(self, uid=None):
        if uid:
            filename = f"users/vocab_{uid}.json"
            data = self.load_json(filename)
            if not data:
                # If first time, load default vocab and initialize
                # Start with clean fresh copy from repo/local default
                # Don't use load_json here to avoid accidental shared state pollution if not careful
                # Just load the base 'vocab.json'
                data = self.load_json("vocab.json")
                if data:
                    self.save_json(filename, data, f"Init Vocab for {uid}")
            return data
        return self.load_json("vocab.json")

    def save_vocab_list(self, vocab_list, uid=None):
        if uid:
            filename = f"users/vocab_{uid}.json"
            self.save_json(filename, vocab_list, f"Update Vocab for {uid}")
        else:
            self.save_json("vocab.json", vocab_list, "Update Vocab List")

    def get_quotes(self):
        return self.load_json("quotes.json")
    
    def get_rss_config(self):
        return self.load_json("rss_config.json")
    
    def save_rss_config(self, config):
        self.save_json("rss_config.json", config, "Update RSS Config")
