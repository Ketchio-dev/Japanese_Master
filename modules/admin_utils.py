import feedparser
import pandas as pd
import streamlit as st

def fetch_rss_feeds(urls):
    """
    Fetches and parses RSS feeds from a list of URLs.
    """
    feed_items = []
    
    for url in urls:
        feed = feedparser.parse(url)
        for entry in feed.entries:
            feed_items.append({
                "title": entry.title,
                "link": entry.link,
                "published": entry.get("published", "No Date"),
                "summary": entry.get("summary", "No Summary")
            })
            
    return feed_items

def summarize_text(text):
    """
    Mockup for AI Text Summarization.
    Real implementation would use an LLM API.
    """
    if len(text) > 100:
        return text[:100] + "..."
    return text

def plot_user_stats(history_data=None):
    """
    Visualizes user statistics using Pandas and Streamlit charts.
    """
    # Mock data for demonstration if history_data is not provided
    if history_data is None:
        data = {
            "date": pd.date_range(start="2025-12-01", periods=10),
            "xp_gained": [50, 60, 40, 80, 100, 90, 120, 110, 150, 130],
            "words_learned": [5, 6, 4, 8, 10, 9, 12, 11, 15, 13]
        }
        df = pd.DataFrame(data)
        df.set_index("date", inplace=True)
        
        st.subheader("Daily Activity")
        st.line_chart(df)
    else:
        # Implement with real history data if available
        pass
