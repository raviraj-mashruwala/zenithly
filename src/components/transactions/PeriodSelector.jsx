import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import './PeriodSelector.css';

export default function PeriodSelector({ currentDate, onDateChange }) {
    const handlePrevious = () => {
        onDateChange(subMonths(currentDate, 1));
    };

    const handleNext = () => {
        onDateChange(addMonths(currentDate, 1));
    };

    const handleToday = () => {
        onDateChange(new Date());
    };

    const isCurrentMonth = format(new Date(), 'yyyy-MM') === format(currentDate, 'yyyy-MM');

    return (
        <div className="period-selector">
            <button
                className="period-nav-btn"
                onClick={handlePrevious}
                aria-label="Previous month"
            >
                <ChevronLeft size={20} />
            </button>

            <div className="period-display">
                <span className="period-month">{format(currentDate, 'MMMM yyyy')}</span>
            </div>

            <button
                className="period-nav-btn"
                onClick={handleNext}
                aria-label="Next month"
                disabled={isCurrentMonth}
            >
                <ChevronRight size={20} />
            </button>

            {!isCurrentMonth && (
                <>
                    <span className="period-divider"></span>
                    <button className="period-today-btn" onClick={handleToday}>
                        Today
                    </button>
                </>
            )}
        </div>
    );
}
