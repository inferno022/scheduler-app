export const getLocalDateStr = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const calculateStreak = (habitId, logs) => {
  if (!logs || !logs.length) return 0;
  
  // Get all completed dates for this habit
  const completedDates = logs
    .filter(l => l.habitId === habitId && l.status === 'done')
    .map(l => l.dateKey)
    .sort((a, b) => b.localeCompare(a)); // sort descending (newest first)
    
  if (completedDates.length === 0) return 0;

  // Remove duplicates
  const uniqueDates = [...new Set(completedDates)];
  
  let streak = 0;
  let currentDate = new Date();
  
  // Check today and yesterday to see if streak is active
  const todayStr = getLocalDateStr(currentDate);
  
  currentDate.setDate(currentDate.getDate() - 1);
  const yesterdayStr = getLocalDateStr(currentDate);
  
  let expectedDateStr = uniqueDates[0];
  
  // If the most recent log is not today or yesterday, the streak is broken (0).
  if (expectedDateStr !== todayStr && expectedDateStr !== yesterdayStr) {
    return 0;
  }
  
  // Start counting backwards from the most recent logged date
  let checkDate = new Date(expectedDateStr + 'T12:00:00Z'); // force timezone-safe noon
  
  for (let i = 0; i < uniqueDates.length; i++) {
    if (uniqueDates[i] === getLocalDateStr(checkDate)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1); // move back 1 day
    } else {
      break; // break the chain
    }
  }
  
  return streak;
};
