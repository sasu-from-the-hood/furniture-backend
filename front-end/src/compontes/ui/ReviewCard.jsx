
import PropTypes from 'prop-types';

function ReviewCard({ userName, userEmail, date, rating, reviewText }) {
    return (
        <>
          <hr />
          <div className="w-fit p-4 gap-2">
            <div className="flex flex-col">
              <h1 className="font-bold py-1">{userName}</h1>
              {userEmail && <p className="text-gray-500 text-sm italic">{userEmail}</p>}
            </div>
            <p className="text-gray-500 text-sm">{date}</p>
            <div>
              <div className="text-xl text-amber-400">
                {"★".repeat(rating)}{"☆".repeat(5 - rating)}
              </div>
            </div>
            <p className="text-gray-800">{reviewText}</p>
          </div>
        </>
    );
}

ReviewCard.propTypes = {
    userName: PropTypes.string.isRequired,
    userEmail: PropTypes.string,
    date: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    reviewText: PropTypes.string.isRequired
};

export default ReviewCard;