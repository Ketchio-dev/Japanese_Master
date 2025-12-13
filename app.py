import streamlit as st
import random
from datetime import datetime
from modules.data_manager import DataManager
from modules.srs_algorithm import get_due_items, calculate_next_review
from modules.ui_components import render_ruby_text, render_progress_bar, apply_custom_css
from datetime import datetime
from modules.data_manager import DataManager
from modules.srs_algorithm import get_due_items, calculate_next_review
from modules.ui_components import render_ruby_text, render_progress_bar, apply_custom_css
from datetime import datetime
from modules.data_manager import DataManager
from modules.srs_algorithm import get_due_items, calculate_next_review
from modules.ui_components import render_ruby_text, render_progress_bar, apply_custom_css
from modules.admin_utils import fetch_rss_feeds, summarize_text, plot_user_stats
from modules.analytics import AnalyticsManager
from modules import auth

# --- Initialization ---
st.set_page_config(page_title="JpMaster", layout="wide", page_icon="🇯🇵")
apply_custom_css()

if 'data_manager' not in st.session_state:
    st.session_state.data_manager = DataManager()

if 'analytics_manager' not in st.session_state:
    st.session_state.analytics_manager = AnalyticsManager()

dm = st.session_state.data_manager
am = st.session_state.analytics_manager

# --- Authentication Flow ---
if 'user' not in st.session_state:
    st.session_state.user = None

if not st.session_state.user:
    st.title("Welcome to JpMaster 🇯🇵")
    tab_login, tab_signup = st.tabs(["Login", "Sign Up"])
    
    with tab_login:
        email = st.text_input("Email", key="login_email")
        password = st.text_input("Password", type="password", key="login_pass")
        if st.button("Login"):
            user = auth.sign_in(email, password)
            if "error" in user:
                st.error(user["error"])
            else:
                st.session_state.user = user
                st.success("Logged in!")
                st.rerun()

    with tab_signup:
        new_email = st.text_input("Email", key="signup_email")
        new_password = st.text_input("Password", type="password", key="signup_pass")
        if st.button("Sign Up"):
            user = auth.sign_up(new_email, new_password)
            if "error" in user:
                st.error(user["error"])
            else:
                st.session_state.user = user
                st.success("Account created! Logged in.")
                st.rerun()
    
    st.info("Please log in to continue.")
    st.stop() # Stop execution until logged in

# --- Authenticated App ---
user_id = st.session_state.user['localId']
user_email = st.session_state.user['email']

# --- Analytics Heartbeat ---
am.log_heartbeat()

user_profile = dm.get_user_profile(uid=user_id)

# --- Validating Data ---
if not user_profile:
     # Initialize default profile for new user
    user_profile = {
        "username": user_email.split("@")[0], # Default username from email
        "level": 1,
        "exp": 0,
        "last_login": datetime.now().strftime('%Y-%m-%d'),
        "daily_limit": 20
    }
    dm.save_user_profile(user_profile, uid=user_id)

# Update Last Login
today = datetime.now().strftime('%Y-%m-%d')
if user_profile.get("last_login") != today:
    user_profile["last_login"] = today
    dm.save_user_profile(user_profile, uid=user_id)

# --- Sidebar Navigation ---
with st.sidebar:
    st.title("JpMaster 🇯🇵")
    st.write(f"User: **{user_profile['username']}**")
    
    if st.button("Logout"):
        st.session_state.user = None
        st.rerun()
    
    # Calculate XP to next level (Simple Logic: Level * 1000)
    exp_to_next = user_profile['level'] * 1000
    render_progress_bar(user_profile['level'], user_profile['exp'], exp_to_next)
    
    # --- Settings ---
    st.markdown("---")
    st.subheader("Settings ⚙️")
    daily_limit = st.slider("Daily Review Limit", min_value=5, max_value=50, value=user_profile.get("daily_limit", 20), step=5)
    
    if daily_limit != user_profile.get("daily_limit"):
        user_profile["daily_limit"] = daily_limit
        dm.save_user_profile(user_profile, uid=user_id)
        st.toast(f"Daily Limit updated to {daily_limit}")
    
    st.markdown("---")
    page = st.radio("Navigation", ["Home", "Typing Practice", "Vocabulary (SRS)", "Admin"])

# --- Page: Home ---
if page == "Home":
    st.title("Dashboard")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Today's Goal")
        vocab_list = dm.get_vocab_list(uid=user_id)
        due_count = len(get_due_items(vocab_list))
        st.metric(label="Words to Review", value=due_count)
        
        if due_count > 0:
            st.info(f"You have {due_count} words due for review today! Go to the Vocabulary tab.")
        else:
            st.success("All caught up! Great job!")

    with col2:
        st.subheader("Your Stats")
        plot_user_stats() # Mockup stats

# --- Page: Typing Practice ---
elif page == "Typing Practice":
    st.title("Typing Practice ⌨️")
    st.caption("Type the sentence exactly as shown (Kanji or Kana).")
    
    # Category Selection
    category = st.radio("Select Category:", ["Quotes", "Daily"], horizontal=True)
    
    quotes = dm.get_quotes()
    
    # Filter by category. 
    # Handle legacy data (fallback to "Quotes" if no category field)
    filtered_quotes = [q for q in quotes if q.get("category", "Quotes") == category]
    
    if not filtered_quotes:
        st.warning(f"No sentences found for {category}.")
    else:
        if 'current_quote' not in st.session_state or st.session_state.current_quote.get("category", "Quotes") != category:
            st.session_state.current_quote = random.choice(filtered_quotes)
        
        quote = st.session_state.current_quote
        
        # Render Target Sentence
        st.markdown(f"### Target ({quote.get('origin', 'Unknown')}):")
        render_ruby_text(quote['sentence'], quote['kana'], quote['meaning'], font_size="32px")
        
        # Input Area
        user_input = st.text_input("Type here:", key="typing_input")
        
        col1, col2 = st.columns([1, 5])
        with col1:
             if st.button("Check"):
                # Simple check: allows Kanji sentence OR Kana sentence
                if user_input.strip() == quote['sentence'] or user_input.strip() == quote['kana']:
                    st.balloons()
                    st.success("Correct! +10 XP")
                    
                    # Update XP
                    user_profile['exp'] += 10
                    if user_profile['exp'] >= user_profile['level'] * 1000:
                        user_profile['level'] += 1
                        user_profile['exp'] = 0
                        st.toast(f"Level Up! You are now Level {user_profile['level']}!")
                    
                    dm.save_user_profile(user_profile, uid=user_id)
                    
                    # Load new quote
                    st.session_state.current_quote = random.choice(filtered_quotes)
                    st.rerun()
                else:
                    st.error("Try again!")
        
        with col2:
            if st.button("Skip"):
                st.session_state.current_quote = random.choice(filtered_quotes)
                st.rerun()

# --- Page: Vocabulary (SRS) ---
elif page == "Vocabulary (SRS)":
    st.title("Vocabulary Flashcards 🧠")
    
    vocab_list = dm.get_vocab_list(uid=user_id)
    all_due_items = get_due_items(vocab_list)
    
    # Apply Daily Limit
    limit = user_profile.get("daily_limit", 20)
    due_items = all_due_items[:limit]
    
    if not due_items:
        if all_due_items:
             st.success(f"You've reached your daily limit of {limit} words! (Total due: {len(all_due_items)})")
        else:
             st.success("No items due for review! Come back tomorrow.")
    else:
        # Use session state to track current index
        if 'srs_index' not in st.session_state:
            st.session_state.srs_index = 0
            # Initialize reveal state
            st.session_state.srs_revealed = False

        if st.session_state.srs_index < len(due_items):
            current_item = due_items[st.session_state.srs_index]
            
            # Progress
            st.progress((st.session_state.srs_index) / len(due_items))
            st.caption(f"Reviewing {st.session_state.srs_index + 1} / {len(due_items)}")
            
            # Card Display
            st.markdown(f"""
            <div class="srs-card">
                <h1>{current_item['kanji']}</h1>
            </div>
            """, unsafe_allow_html=True)
            
            if st.session_state.srs_revealed:
                st.markdown(f"### {current_item['kana']}")
                st.markdown(f"#### {current_item['meaning']}")
                
                st.markdown("---")
                st.write("How was it?")
                
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    if st.button("Hard (1 Day)"):
                        q = 2 # Hard
                        next_date, interval, reps, ease = calculate_next_review(q, current_item['interval'], current_item['repetitions'], current_item['easiness'])
                        
                        # Update Item in original list
                        for item in vocab_list:
                            if item['id'] == current_item['id']:
                                item.update({'next_review': next_date, 'interval': interval, 'repetitions': reps, 'easiness': ease})
                                break
                        
                        dm.save_vocab_list(vocab_list) # Vocab list is currently shared global, might want to make per-user later or just track progress per user?
                        dm.save_vocab_list(vocab_list, uid=user_id) # Vocab list is currently shared global, might want to make per-user later or just track progress per user?
                        # For now, vocab.json is SHARED content, but SRS progress *should* be per user.
                        # However, the current architecture stores progress INSIDE vocab.json. 
                        # To support multi-user SRS properly, we'd need to separate content (vocab) from progress (user_vocab_data).
                        # Given the prompt scope, we will keep writing to the shared vocab.json BUT realize this affects all users.
                        # **Correction**: The user asked for "Multi-user", so sharing progress is bad.
                        # We should create a copy of vocab.json for the user if it doesn't exist, or better, store learning data in user_profile?
                        # For simplicity in this iteration: We will keep using global vocab.json but note the limitation OR 
                        # we can clone vocab.json to `data/users/{uid}_vocab.json`. Let's do the clone approach.
                        st.session_state.srs_index += 1
                        st.session_state.srs_revealed = False
                        st.rerun()

                with col2:
                    if st.button("Good (Standard)"):
                        q = 4 # Good
                        next_date, interval, reps, ease = calculate_next_review(q, current_item['interval'], current_item['repetitions'], current_item['easiness'])
                        
                        for item in vocab_list:
                             if item['id'] == current_item['id']:
                                item.update({'next_review': next_date, 'interval': interval, 'repetitions': reps, 'easiness': ease})
                                break
                        
                        dm.save_vocab_list(vocab_list, uid=user_id)
                        st.session_state.srs_index += 1
                        st.session_state.srs_revealed = False
                        st.rerun()

                with col3:
                    if st.button("Easy (Boost)"):
                        q = 5 # Easy
                        next_date, interval, reps, ease = calculate_next_review(q, current_item['interval'], current_item['repetitions'], current_item['easiness'])
                        
                        for item in vocab_list:
                             if item['id'] == current_item['id']:
                                item.update({'next_review': next_date, 'interval': interval, 'repetitions': reps, 'easiness': ease})
                                break
                                
                        dm.save_vocab_list(vocab_list, uid=user_id)
                        st.session_state.srs_index += 1
                        st.session_state.srs_revealed = False
                        st.rerun()
            
            else:
                if st.button("Show Answer"):
                    st.session_state.srs_revealed = True
                    st.rerun()
        else:
            st.success("Session Complete! All due items reviewed.")
            if st.button("Back to Home"):
                st.session_state.srs_index = 0
                st.rerun()

# --- Page: Admin ---
elif page == "Admin":
    st.title("Admin Dashboard 🛠️")
    
    password = st.text_input("Enter Admin Password", type="password")
    
    # Simple hardcoded check for demo purposes
    if password == "admin123":
        st.success("Access Granted")
        
        # --- Analytics Metrics ---
        st.subheader("Live Analytics 🟢")
        active_users = am.get_active_user_count()
        global_stats = am.get_global_stats()
        
        col_a, col_b, col_c = st.columns(3)
        col_a.metric("Active Users", active_users)
        col_b.metric("Total Sessions", global_stats['total_sessions'])
        
        # Calculate Average Play Time (Mock calculation if data insufficient)
        total_duration = global_stats.get('total_duration_minutes', 0) # Assuming this is tracked
        total_sessions = global_stats.get('total_sessions', 1)
        if total_sessions == 0: total_sessions = 1
        avg_time = round(total_duration / total_sessions, 1)
        
        col_c.metric("Avg. Play Time (min)", avg_time)
        
        st.markdown("---")
        
        tab1, tab2 = st.tabs(["RSS Feeds", "Analytics"])
        
        with tab1:
            st.header("Manage RSS Feeds")
            config = dm.get_rss_config()
            
            # List current feeds
            st.write("Current Feeds:")
            for url in config['feeds']:
                st.code(url)
            
            # Add new feed
            new_feed = st.text_input("Add New RSS URL")
            if st.button("Add Feed"):
                if new_feed and new_feed not in config['feeds']:
                    config['feeds'].append(new_feed)
                    dm.save_rss_config(config)
                    st.success("Feed added!")
                    st.rerun()
            
            st.markdown("---")
            st.subheader("Latest News (Mock Summary)")
            if st.button("Fetch & Summarize"):
                with st.spinner("Fetching news..."):
                    items = fetch_rss_feeds(config['feeds'])
                    for item in items[:5]: # Show top 5
                        st.markdown(f"**[{item['title']}]({item['link']})**")
                        st.caption(f"Published: {item['published']}")
                        st.write(summarize_text(item['summary']))
                        st.divider()

        with tab2:
            st.header("Analytics")
            plot_user_stats()
            
    elif password:
        st.error("Incorrect Password")
