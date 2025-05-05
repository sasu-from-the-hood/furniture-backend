import { useParams, Link } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { ShopContext } from "./context/ShopContext";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import RelatedProduct from "./RelatedProducts";
import { toast } from "react-toastify";
import axiosInstance from "./axiosInstance";
import { ClipLoader } from "react-spinners";

function ProductDetail() {
  const productId = useParams().productId;
  const [quantity, setQuantity] = useState(1);
  const [image, setImage] = useState("");
  const [reviews, setReviews] = useState([]);
  const [CategoryName, setCategoryName] = useState();
  // const fetchreviews = async (productId) => {
  //   try {
  //     const response = await axiosInstance.get(`/furniture/${productId}`);
  //     if (!response.ok) throw new Error("Failed to fetch reviews");
  //     const data = await response.json();
  //     setReviews(data);
  //   } catch (error) {
  //     console.log(error)
  //     toast.error("Error fetching reviews!");
  //   }
  // };

  // useEffect(() => {
  //   fetchreviews(productId);
  // }, [productId]);

  const { getCart, getProductById, loading, error, BASE_URL, categories } = useContext(ShopContext);
  const [productData, setProduct] = useState(null);


  const addToCart = async (quantity) => {
    try {
      console.log("Product ID:", productId);
      console.log("Quantity:", quantity);

      const response = await axiosInstance.post("/cart", {
        furnitureId: Number(productId),
        quantity,
      });

      console.log("Response:", response.data);
      await getCart();
      toast.success("Item added to cart successfully!");
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error("Failed to add item to cart. Please try again.");
    }
  };


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(productId);
        setProduct(data);
        setImage(data.images[0]?.url);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [productId, getProductById]);

  const getCategoryName = () => {
    categories.forEach((category) => {
      if (category.id === productData.categoryId) {
        setCategoryName(category.name);
        console.log("invoked", CategoryName)
      }
    });
  };

  useEffect(() => {
    if (productData) {
      getCategoryName();
    }
  }, [productData, categories]);



  // If the review Is returned with the product this should be enough right?

  const [activeTab, setActiveTab] = useState("description");
  useEffect(() => {
    if (productData) {
      setReviews(productData.reviews || []);

      console.log(productData.reviews)
    }
  }, [productData]);

  // if (loading) return <p>Loading...</p>;
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#4caf50" size={60} />
      </div>
    );
  if (error) return <p>Error: {error}</p>;
  if (!productData) return <p>No product found</p>;
  const tabContent = {
    description: (
      <div className="">
        <p className="text-gray-700">
          {productData.description}
          <br />A sleek, minimalist chair designed for contemporary spaces,
          combining clean lines with ergonomic comfort. Crafted with a durable
          metal frame and a soft, cushioned seat, it’s perfect for a modern home
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
                  date={new Date(review.createdAt).toLocaleDateString()}
                  rating={review.rating}
                  reviewText={review.content}
                />
              ))
            ) : (
              <p>No reviews yet.</p>
            )}
          </div>
          {/* <form className="space-y-4">
          <input
          
            className="w-full p-2 border rounded"
            type="text"
            placeholder="Your Name"
            required
          />
          <input
            className="w-full p-2 border rounded"
            type="email"
            placeholder="Your Email"
            required
          />
          <textarea
            className="w-full p-2 border rounded"
            rows="4"
            placeholder="Your Review"
            required
          ></textarea>
          <button
            className="px-4 py-2 bg-green-950 text-white rounded"
            type="submit"
          >
            Submit Review
          </button>
        </form> */}
          <h3>Leave a Review</h3>
          <ReviewForm productId={productId} />
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
                {productData.images.map((item, index) => (
                  <img
                    onClick={() => setImage(item.url)}
                    src={item.url}
                    key={index}
                    className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                  />
                ))}
              </div>
              <div className="w-full sm:w-[80%]">
                <img className="w-full h-auto" src={image} alt="" />
              </div>
            </div>
          </div>
        </div>

        {/* <div className="bg-orange-200 rounded-xl h-auto md:h-fit">
                <img className="rounded-xl" src="./src/images/servicePic.jpg" alt="Main product image"/>
                <div className="p-4 gap-4 grid grid-cols-3">
                    alternate images
                    <div className="h-fit"><img src="./src/images/lamp.avif" alt="Alternate image"/></div>
                    <div className="h-fit"><img src="./src/images/lamp.avif" alt="Alternate image"/></div>
                    <div className="h-fit"><img src="./src/images/lamp.avif" alt="Alternate image"/></div>
                </div>
            </div> */}

        {/* Product price and description */}
        <div className="flex flex-col justify-start h-auto">
          <h1 className="text-3xl font-semibold mt-4 lg:ml-12 sm:ml-0">
            {productData.name}
          </h1>
          {/* Dynamic product review here */}
          <div className="flex items-center text-gray-600 gap-4 lg:ml-12 sm:ml-0 py-4">
            {/* average rating */}
            <h1 className="text-2xl bg-gray-300 rounded-xl p-2">4.5</h1>
            {/* dynamic review stars */}
            <div>
              <div className="text-xl text-yellow-500">
                &#9733;&#9733;&#9733;&#9733;&#9733;
              </div>
            </div>
            {/* Total number of reviews */}
            <p className="tracking-widest text-lg">(290,291)</p>
          </div>

          <h1 className="text-2xl text-gray-600 lg:ml-12 sm:ml-0">
            {productData.price} ETB
          </h1>

          <p className="p-4 text-gray-500 lg:ml-8 sm:ml-0">
            {productData.description}
          </p>

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
              className="flex gap-4 text-lg bg-green-950 text-gray-400 p-4 w-[500px] justify-center"
              type="submit"
            //   onClick={() => addToCart(quantity)}
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
              {/* <Link to={`/cart/${Number(productData.id)}`}> */}
              <p>Add to cart</p>
              {/* </Link> */}
            </button>
          </form>

          <div className="md:ml-12 pt-6 flex gap-2">
            <h1 className="">Catagory:</h1>
            {/* Catagory of item here */}
            <a href="" className="font-bold text-green-900">
              {CategoryName}
            </a>
          </div>
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
        <RelatedProduct subCategoryId={productData.subCategoryId} />
      </section>
    </>
  );
}

export default ProductDetail;
