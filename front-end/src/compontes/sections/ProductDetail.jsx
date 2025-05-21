import { useParams, Link } from "react-router-dom";
import { useState, useContext, useEffect, useCallback } from "react";
import { ShopContext } from "../context/ShopContext";
import ReviewCard from "../ui/ReviewCard";
import ReviewForm from "../ui/ReviewForm";
import RelatedProduct from "../ui/RelatedProducts";
import ZoomableImage from "../ui/ZoomableImage";
import InquiryModal from "../ui/InquiryModal";
import { toast } from "react-toastify";
import axiosInstance from "../../hooks/axiosInstance";
import { ClipLoader } from "react-spinners";
import { FaQuestionCircle } from "react-icons/fa";
import { IMAGE_URL } from "../../config/index";

function ProductDetail() {
  const productId = useParams().productId;
  const [quantity, setQuantity] = useState(1);
  const [image, setImage] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [CategoryName, setCategoryName] = useState();
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  // Fetch reviews for this product
  const fetchReviews = useCallback(async () => {
    try {
      console.log("Fetching reviews for product ID:", productId);
      const response = await axiosInstance.get(`/reviews/products/${productId}/reviews`);
      console.log("Reviews response:", response.data);

      if (response.data) {
        // Process reviews to include user information
        const processedReviews = (response.data.reviews || []).map(review => {
          return {
            id: review.id,
            rating: review.rating,
            content: review.comment || review.content,
            createdAt: review.createdAt,
            // Include user information if available
            reviewBy: review.user ? review.user.name : "Anonymous",
            userEmail: review.user ? review.user.email : ""
          };
        });

        console.log("Processed reviews:", processedReviews);
        setReviews(processedReviews);
        setReviewStats(response.data.stats || { averageRating: 0, totalReviews: 0 });
        console.log("Review stats set:", response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Error fetching reviews!");
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const { getCart, getProductById, loading, error, categories } = useContext(ShopContext);
  const [productData, setProduct] = useState(null);


  const addToCart = async (quantity) => {
    try {
      console.log("Product ID:", productId);
      console.log("Quantity:", quantity);

      // Use the correct endpoint for adding items to cart
      const response = await axiosInstance.post("/user/cart", {
        furnitureId: Number(productId),
        quantity,
      });

      console.log("Response:", response.data);
      await getCart();
      toast.success("Item added to cart successfully!");
    } catch (error) {
      console.error("Error adding item to cart:", error);

      // More detailed error message
      if (error.response) {
        console.log("Error response:", error.response.data);
        toast.error(error.response.data.message || "Failed to add item to cart. Please try again.");
      } else {
        toast.error("Failed to add item to cart. Please try again.");
      }
    }
  };


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(productId);
        console.log("Product data received:", data);

        // Check if data contains a nested product object (API response structure)
        const productData = data?.product || data;

        if (!productData) {
          console.error("No product data found in the response");
          return;
        }

        setProduct(productData);

        // Safely access the first image URL if available
        if (productData.images && productData.images.length > 0) {
          const firstImage = productData.images[0];
          // Check if the image has imageUrl (from backend) or url (from frontend)
          if (firstImage.imageUrl) {
            setImage(`${IMAGE_URL}${firstImage.imageUrl}`);
          } else if (firstImage.url) {
            setImage(firstImage.url);
          } else {
            console.log("Image found but no valid URL");
            setImage("/default-image.jpg");
          }
        } else {
          console.log("No images found for product");
          setImage("/default-image.jpg"); // Set a default image
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [productId, getProductById]);

  const getCategoryName = useCallback(() => {
    if (!categories || !Array.isArray(categories) || !productData) {
      return;
    }

    // First try to find a direct match
    const foundCategory = categories.find(category => category.id === productData.categoryId);
    if (foundCategory) {
      setCategoryName(foundCategory.name);
      console.log("Category found:", foundCategory.name);
      return;
    }

    // If not found, search in subcategories
    categories.forEach(category => {
      if (category.subcategories && Array.isArray(category.subcategories)) {
        const subCategory = category.subcategories.find(
          subCat => subCat.id === productData.categoryId
        );
        if (subCategory) {
          setCategoryName(subCategory.name);
          console.log("Subcategory found:", subCategory.name);
        }
      }
    });
  }, [categories, productData]);

  useEffect(() => {
    if (productData) {
      getCategoryName();
    }
  }, [productData, categories, getCategoryName]);

  const [activeTab, setActiveTab] = useState("description");
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#4caf50" size={60} />
      </div>
    );
  if (error) return <p>Error: {error}</p>;
  if (!productData) return <p>No product found</p>;

  // Stock status
  const isOutOfStock = !productData.stockQuantity || productData.stockQuantity <= 0;

  const tabContent = {
    description: (
      <div className="">
        <p className="text-gray-700">
          {productData.longDesc}
          <br />A sleek, minimalist chair designed for contemporary spaces,
          combining clean lines with ergonomic comfort. Crafted with a durable
          metal frame and a soft, cushioned seat, it's perfect for a modern home
          office or dining area. Available in neutral tones to complement any
          décor.
        </p>
      </div>
    ),
    review: (
      <>
        <div>
          <div className="space-y-4 mb-4">
            {reviews !== null && reviews.length > 0 ? (
              reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  userName={review.reviewBy}
                  userEmail={review.userEmail}
                  date={new Date(review.createdAt).toLocaleDateString()}
                  rating={review.rating}
                  reviewText={review.content}
                />
              ))
            ) : (
              <p>No reviews yet.</p>
            )}
          </div>
          <h3>Leave a Review</h3>
          <ReviewForm
            productId={productId}
            onReviewSubmitted={fetchReviews}
          />
        </div>
      </>
    ),
  };


  return (
    <>
      <section className="grid grid-cols-1 gap-6 py-16 px-8 md:grid-cols-2 lg:grid-cols-2 sm:grid-cols-1">
        {/* product Image section */}
        <div className="pt-10 transition-opacity ease-in duration-500 opacity-100">
          <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
            <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
              <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
                {productData.images && productData.images.length > 0 ? (
                  productData.images.map((item, index) => {
                    // Determine the correct image URL
                    const imageUrl = item.imageUrl
                      ? `${IMAGE_URL}${item.imageUrl}`
                      : (item.url || "/default-image.jpg");

                    return (
                      <div
                        key={index}
                        onClick={() => setImage(imageUrl)}
                        className={`w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer border-2 rounded-md overflow-hidden transition-all duration-200 ${image === imageUrl ? 'border-green-800 shadow-md' : 'border-transparent hover:border-gray-300'}`}
                      >
                        <img
                          src={imageUrl}
                          className="w-full h-full object-cover"
                          alt={`Product view ${index + 1}`}
                        />
                      </div>
                    );
                  })
                ) : (
                  <div
                    className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 border-2 border-gray-200 rounded-md overflow-hidden"
                  >
                    <img
                      src="/default-image.jpg"
                      className="w-full h-full object-cover"
                      alt="Default product image"
                    />
                  </div>
                )}
              </div>
              <div className="w-full sm:w-[80%] border border-gray-200 rounded-md overflow-hidden relative group">
                <ZoomableImage
                  src={image}
                  alt={productData.name || productData.title || "Product Image"}
                  className="w-full h-auto"
                />
                <div className="absolute top-2 right-2 bg-white bg-opacity-70 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="absolute bottom-2 left-2 bg-white bg-opacity-70 px-2 py-1 rounded text-xs text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Hover to zoom
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product price and description */}
        <div className="flex flex-col justify-start h-auto">
          <h1 className="text-3xl font-semibold mt-4 lg:ml-12 sm:ml-0">
            {productData.name}
          </h1>
          {/* Dynamic product review here */}
          <div className="flex items-center text-gray-600 gap-4 lg:ml-12 sm:ml-0 py-4">
            {/* average rating */}
            <h1 className="text-2xl bg-gray-300 rounded-xl p-2">{reviewStats.averageRating || "0.0"}</h1>
            {/* dynamic review stars */}
            <div>
              <div className="text-xl text-yellow-500">
                {[...Array(5)].map((_, index) => (
                  <span key={index}>
                    {index < Math.round(reviewStats.averageRating) ? "★" : "☆"}
                  </span>
                ))}
              </div>
            </div>
            {/* Total number of reviews */}
            <p className="tracking-widest text-lg">({reviewStats.totalReviews || 0})</p>
          </div>

          <h1 className="text-2xl text-gray-600 lg:ml-12 sm:ml-0">
            {productData.price} ETB
          </h1>

          <p className="p-4 text-gray-500 lg:ml-8 sm:ml-0">
            {productData.description}
          </p>

          <div className="mb-2">
            {isOutOfStock ? (
              <span className="text-red-600 font-bold">Out of Stock</span>
            ) : (
              <span className="text-green-600">In Stock: {productData.stockQuantity}</span>
            )}
          </div>

          <form
            className="flex md:ml-12 gap-4 pt-4"
            onSubmit={(e) => {
              e.preventDefault();

              addToCart(quantity);
            }}
          >
            <label>
              <input
                className="max-w-[5rem] h-16 p-2 text-xl border-gray-600 border-solid border-[1px] rounded-md"
                type="number"
                min="1"
                placeholder="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </label>
            <button
              className={`flex gap-4 text-lg bg-green-950 text-gray-400 p-4 w-[500px] justify-center ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-900'}`}
              type="submit"
              disabled={isOutOfStock}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#000000"
              >
                <path d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM246-720l96 200h280l110-200H246Zm-38-80h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Zm134 280h280-280Z" />
              </svg>
              <p>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</p>
            </button>
          </form>

          {/* Inquiry Button */}
          <div className="md:ml-12 mt-4">
            <button
              onClick={() => setIsInquiryModalOpen(true)}
              className="flex items-center gap-2 text-green-900 hover:text-green-700 transition-colors"
            >
              <FaQuestionCircle size={20} />
              <span className="font-medium">Ask a question about this product</span>
            </button>
          </div>

          {/* <div className="md:ml-12 pt-6 flex gap-2">
            <h1 className="">Catagory:</h1>
            <a href="" className="font-bold text-green-900">
              {CategoryName}
            </a>
          </div> */}
        </div>
      </section>

      <section className="px-32 py-4">
        {/* Tab buttons with underline on active tab */}
        <div className="flex justify-center min-[500px]:space-x-8  pb-2">
          {["description", "review"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn px-4 py-2 text-lg ${activeTab === tab
                ? "font-semibold border-b-2 border-green-900"
                : ""
                }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "description"
                ? "Description"
                : tab === "additional-info"
                  ? "Additional Information"
                  : "Review"}
            </button>
          ))}
        </div>
        {/* Tab content */}
        <div className="tab-content mt-4 w-72 min-[600px]:w-full min-[500px]:ml-0 ml-[-4rem] min-[]">
          {tabContent[activeTab]}
        </div>
        {productData.categoryId && <RelatedProduct subCategoryId={productData.categoryId} />}
      </section>

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        productId={productId}
        productName={productData?.title || productData?.name || 'Product'}
      />
    </>
  );
}

export default ProductDetail;
