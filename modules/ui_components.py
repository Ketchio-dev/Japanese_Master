import streamlit as st

def render_ruby_text(kanji, kana, meaning="", font_size="24px"):
    """
    Renders Japanese text with Furigana using HTML <ruby> tag.
    """
    html_code = f"""
    <div style="font-size: {font_size}; font-family: 'Noto Sans JP', sans-serif;">
        <ruby>
            {kanji}
            <rt>{kana}</rt>
        </ruby>
        <span style="font-size: 0.6em; color: gray; margin-left: 10px;">{meaning}</span>
    </div>
    """
    st.markdown(html_code, unsafe_allow_html=True)

def render_progress_bar(level, exp, exp_to_next_level):
    """
    Renders a custom progress bar for User Level & XP.
    """
    progress = min(1.0, exp / exp_to_next_level)
    st.write(f"### Level {level}")
    st.progress(progress)
    st.caption(f"XP: {exp} / {exp_to_next_level}")

def apply_custom_css():
    """
    Injects custom CSS for a modern look.
    """
    st.markdown("""
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap');
        
        html, body, [class*="css"]  {
            font-family: 'Noto Sans JP', sans-serif;
        }
        
        /* Modern Button Style */
        .stButton>button {
            border-radius: 20px;
            border: none;
            background-color: #4CAF50;
            color: white;
            padding: 10px 24px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
            transition-duration: 0.4s;
        }
        
        .stButton>button:hover {
            background-color: #45a049;
            box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
        }
        
        /* Card Style for SRS */
        .srs-card {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
            text-align: center;
            margin-bottom: 20px;
        }
        </style>
    """, unsafe_allow_html=True)
