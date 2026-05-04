import PropTypes from 'prop-types';

/**
 * Statistics card component for admin dashboard.
 * Displays a label, numeric value, and optional icon/emoji.
 * Styled with Tailwind gradient backgrounds and rounded corners.
 * @param {object} props
 * @param {string} props.label - The statistic label text.
 * @param {number|string} props.value - The numeric or string value to display.
 * @param {string} [props.icon] - Optional emoji or icon string to display.
 * @param {string} [props.className] - Optional additional CSS classes.
 * @returns {JSX.Element}
 */
function StatCard({ label, value, icon, className }) {
  return (
    <div
      className={`relative bg-white rounded-2xl border border-surface-200 shadow-card hover:shadow-card-hover transition-shadow duration-200 p-5 sm:p-6 ${className || ''}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-surface-500 mb-1 truncate">
            {label}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-surface-800">
            {value}
          </p>
        </div>
        {icon && (
          <span
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-primary text-white text-xl select-none flex-shrink-0"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.string,
  className: PropTypes.string,
};

StatCard.defaultProps = {
  icon: undefined,
  className: '',
};

export default StatCard;