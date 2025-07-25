// src/components/DailyCalendar.jsx
import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';

const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function DailyCalendar({ completedDatesSet }) {
  const calendarGridRef = useRef(null);
  const hasMountedForInitialScroll = useRef(false); // Flag for initial auto-scroll

  // NEW: Control the earliest date displayed. Initially showing just ~180 days (6 months)
  const [earliestDisplayedDate, setEarliestDisplayedDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 180); // Start approx. 6 months ago (adjust as desired)
    date.setHours(0,0,0,0); // Normalize
    return date;
  });
  // isLoadingMore is removed as automatic loading is removed


  const calendarData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allDays = [];
    const months = [];

    // Calculate actual start date for the calendar grid based on earliestDisplayedDate
    let startDate = new Date(earliestDisplayedDate);
    // Adjust startDate to be the preceding Sunday to align with grid
    startDate.setDate(startDate.getDate() - startDate.getDay());
    startDate.setHours(0,0,0,0); // Normalize

    let currentDate = new Date(startDate);
    let monthTracker = -1;
    let dayIndex = 0; // Cumulative day index from the very start of the generated period

    // Loop to generate days from calculated startDate up to today
    while (currentDate <= today) {
      const formattedDate = formatDateToYYYYMMDD(currentDate);
      const dayOfWeek = currentDate.getDay(); // 0 for Sunday, 6 for Saturday

      // Add month name only once when it changes, or for the very first day
      if (currentDate.getMonth() !== monthTracker) {
        months.push({
          name: currentDate.toLocaleString('default', { month: 'short' }),
          // gridColumnStart: The week column index where this month's first day falls
          // +1 because content grid starts at column 1 (as weekday labels are on the right)
          gridColumnStart: Math.floor(dayIndex / 7) + 1,
        });
        monthTracker = currentDate.getMonth();
      }

      allDays.push({
        date: formattedDate,
        dayOfMonth: currentDate.getDate(),
        dayOfWeek: dayOfWeek,
        isToday: formattedDate === formatDateToYYYYMMDD(today),
        isCompleted: completedDatesSet.has(formattedDate),
      });

      currentDate.setDate(currentDate.getDate() + 1);
      dayIndex++;
    }

    return { allDays, months };
  }, [earliestDisplayedDate, completedDatesSet]); // Dependency array: Recalculate when earliestDisplayedDate or completedDatesSet changes


  // EFFECT 1: Initial auto-scroll to the far right (only on first mount)
  useEffect(() => {
    // Check if it's the very first mount AND the ref is available
    if (calendarGridRef.current && !hasMountedForInitialScroll.current) {
      const gridElement = calendarGridRef.current;
      requestAnimationFrame(() => {
        gridElement.scrollLeft = gridElement.scrollWidth;
        hasMountedForInitialScroll.current = true; // Mark as mounted after initial scroll
      });
    }
  }, []); // Empty dependency array: runs only once on initial mount


  // NEW: Function to handle "Load More History" button click
  const handleLoadMoreClick = useCallback(() => {
    const gridElement = calendarGridRef.current;
    const oldScrollWidth = gridElement ? gridElement.scrollWidth : 0; // Capture scroll width before update

    setEarliestDisplayedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setFullYear(newDate.getFullYear() - 1); // Go back one more year
      newDate.setHours(0,0,0,0);
      return newDate;
    });

    // Adjust scroll position after data loads (similar to infinite scroll adjustment)
    // This will be triggered by earliestDisplayedDate dependency in useMemo
    // and then this setTimeout handles scroll adjustment.
    if (gridElement) {
        setTimeout(() => {
            const newScrollWidth = gridElement.scrollWidth;
            if (newScrollWidth > oldScrollWidth) { // Only adjust if new content was actually added
                gridElement.scrollLeft += (newScrollWidth - oldScrollWidth);
            }
            console.log(`Scroll adjusted after loading more history. Old width: ${oldScrollWidth}, New width: ${newScrollWidth}`);
        }, 50); // Small delay to allow DOM to update
    }
    console.log('Load More History button clicked!');
  }, []); // Empty dependency array: this function is stable


  const weekDaysShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Short labels for sidebar

  return (
    <div className="daily-calendar-container">
      <h3>Daily Task Activity</h3>
      <div className="calendar-legend">
        Less <span className="legend-box level-0"></span>
        <span className="legend-box level-1"></span>
        <span className="legend-box level-2"></span>
        <span className="legend-box level-3"></span> More
      </div>

      {/* Attach ref to the main scrollable grid container */}
      <div className="calendar-main-grid" ref={calendarGridRef}>
        {/* Month Names (positioned at the top, spanning weeks) */}
        <div className="calendar-month-names-row">
          {calendarData.months.map((month, index) => (
            <div
              key={index}
              className="calendar-month-name"
              style={{ gridColumnStart: month.gridColumnStart }} /* JS dynamically sets column start */
            >
              {month.name}
            </div>
          ))}
        </div>

        {/* The actual grid of daily activity squares */}
        <div className="calendar-days-grid">
          {calendarData.allDays.map((day, index) => (
            <div
              key={day.date || `padding-${index}`} // Use unique key
              className={`calendar-day
                         ${day.isCompleted ? 'completed-day' : 'no-activity-day'}
                         ${day.isToday ? 'today-day' : ''}`}
              title={day.date ? (day.isCompleted ? `Completed on ${day.date}` : `No activity on ${day.date}`) : ''}
              style={{ gridRowStart: day.dayOfWeek + 1 }}
            >
              {/* No day number in compact view */}
            </div>
          ))}
        </div>

        {/* Weekday Labels (fixed on the RIGHT) */}
        {/* CORRECTED: This div is now moved to the end of the calendar-main-grid for CSS grid order */}
        <div className="weekday-labels">
          {weekDaysShort.map((day, index) => (
            <div key={index} className="weekday-label">{day}</div>
          ))}
        </div>
      </div>
      {/* NEW: Load More History button */}
      <button onClick={handleLoadMoreClick} className="load-more-history-button">
        Load More History
      </button>
    </div>
  );
}

export default DailyCalendar;