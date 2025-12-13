from datetime import datetime, timedelta

def calculate_next_review(quality, interval, repetitions, easiness):
    """
    SuperMemo-2 (SM-2) Algorithm implementation.
    
    Args:
        quality (int): User's grade (0-5).
                       0: Complete blackout.
                       1: Incorrect response; the correct one remembered.
                       2: Incorrect response; where the correct one seemed easy to recall.
                       3: Correct response recalled with serious difficulty.
                       4: Correct response after a hesitation.
                       5: Perfect recall.
        interval (int): Current interval in days.
        repetitions (int): Current number of repetitions.
        easiness (float): Current easiness factor.
        
    Returns:
        tuple: (next_review_date (str), new_interval (int), new_repetitions (int), new_easiness (float))
    """
    
    # 1. Update Easiness Factor
    # EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    new_easiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if new_easiness < 1.3:
        new_easiness = 1.3
        
    # 2. Update Repetitions & Interval
    if quality < 3:
        new_repetitions = 0
        new_interval = 1
    else:
        new_repetitions = repetitions + 1
        if new_repetitions == 1:
            new_interval = 1
        elif new_repetitions == 2:
            new_interval = 6
        else:
            new_interval = int(interval * new_easiness)
            
    # 3. Calculate Next Review Date
    next_review_date = (datetime.now() + timedelta(days=new_interval)).strftime('%Y-%m-%d')
    
    return next_review_date, new_interval, new_repetitions, new_easiness

def get_due_items(vocab_list):
    """
    Filter vocabulary items that are due for review.
    """
    today = datetime.now().strftime('%Y-%m-%d')
    due_items = [item for item in vocab_list if item['next_review'] <= today]
    return due_items
