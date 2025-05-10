import { useState, useContext } from "react";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import axiosInstance from "../../hooks/axiosInstance";
import PropTypes from 'prop-types';

function ReviewForm({ productId, onReviewSubmitted }) {
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(1);
  const [loading, setLoading] = useState(false);
  const { username, userEmail } = useContext(ShopContext);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to leave a review.");
      return;
    }

    if (!review.trim()) {
      toast.error("Please enter a review comment");
      return;
    }

    try {
      setLoading(true);

      // Use the new API endpoint for reviews
      const response = await axiosInstance.post(`/reviews/products/${productId}/reviews`, {
        rating: rating,
        content: review
      });

      console.log("Review Response:", response);

      if (response.status === 201) {
        toast.success("Review submitted successfully!");
        setReview("");
        setRating(1);

        // Call the callback function if provided
        if (typeof onReviewSubmitted === 'function') {
          onReviewSubmitted();
        }
      } else {
        throw new Error("Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.response?.data?.message || "Error submitting review.");
    } finally {
      setLoading(false);
    }
  };

  const handleStarClick = (index) => {
    const selectedRating = index + 1;
    setRating(selectedRating);
    console.log("Selected Rating:", selectedRating);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* <input
        className="w-full p-2 border rounded bg-gray-100"
        type="text"
        placeholder="Your Name"
        value={username || ""}
        disabled
        readOnly
      />
      <input
        className="w-full p-2 border rounded bg-gray-100"
        type="email"
        placeholder="Your Email"
        value={userEmail || ""}
        disabled
        readOnly
      /> */}
      <textarea
        className="w-full p-2 border rounded"
        rows="4"
        placeholder="Your Review"
        value={review}
        onChange={(e) => setReview(e.target.value)}
        required
      ></textarea>

      {/* Star Rating */}
      <div className="flex space-x-1 text-2xl">
        {[...Array(5)].map((_, index) => (
          <span
            key={index}
            onClick={() => handleStarClick(index)}
            className={`cursor-pointer ${index < rating ? "text-amber-400" : "text-gray-400"
              }`}
          >
            ★
          </span>
        ))}
      </div>

      <button
        className={`px-4 py-2 bg-green-950 text-white rounded ${loading ? "opacity-50" : ""
          }`}
        type="submit"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}

ReviewForm.propTypes = {
  productId: PropTypes.string.isRequired,
  onReviewSubmitted: PropTypes.func
};

export default ReviewForm;
