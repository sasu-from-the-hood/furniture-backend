import { Link } from "react-router-dom";
import ShopItemCard from "../ui/ShopItemCard";
import ShopItemSkeleton from "../ui/ShopItemSkeleton"; // Import Skeleton Component
import shophero from "../../assets/shophero.jpg";
import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductCategories from "./ProductCategories";
import { IMAGE_URL } from "../../config/index";

function Shop() {
    const ITEMS_PER_PAGE = 8;
    const [showProducts, setShowProducts] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);

    const {
        products,
        loading,
        error,
        categories,
        getCategories,
        categoryProducts,
        selectedCategory,
        handleCategoryChange,
        search,
        showSearch,
    } = useContext(ShopContext);
    // We're using selectedCategory and setSelectedCategory from ShopContext

    useEffect(() => {
        getCategories();
    }, [getCategories]);

    // When selectedCategory changes, reset to page 1
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory]);



    useEffect(() => {
        try {
            // Get active products based on the selected category
            let activeProducts = [];

            if (selectedCategory === 0) {
                // All products
                activeProducts = Array.isArray(products) ? products : [];
            } else {
                // Category products
                if (categoryProducts && categoryProducts.furniture) {
                    activeProducts = Array.isArray(categoryProducts.furniture) ? categoryProducts.furniture : [];
                } else {
                    activeProducts = [];
                }
            }

            // Apply search filter if the search bar is active and a search term exists
            if (showSearch && search) {
                activeProducts = activeProducts.filter((item) => {
                    if (!item || typeof item !== 'object') return false;

                    const matchesName = item.name && item.name.toLowerCase().includes(search.toLowerCase());
                    const matchesTitle = item.title && item.title.toLowerCase().includes(search.toLowerCase());
                    const matchesDesc = item.description && item.description.toLowerCase().includes(search.toLowerCase());
                    const matchesShortDesc = item.shortDesc && item.shortDesc.toLowerCase().includes(search.toLowerCase());
                    const matchesLongDesc = item.longDesc && item.longDesc.toLowerCase().includes(search.toLowerCase());

                    return matchesName || matchesTitle || matchesDesc || matchesShortDesc || matchesLongDesc;
                });
            }

            // Pagination: calculate start index and slice the filtered results
            const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
            const paginatedProducts = activeProducts.slice(startIdx, startIdx + ITEMS_PER_PAGE);

            setShowProducts(paginatedProducts);
        } catch (error) {
            console.error("Error updating products:", error);
            setShowProducts([]);
        }
    }, [
        products,
        categoryProducts,
        selectedCategory,
        search,
        showSearch,
        currentPage,
    ]);


    const handleCategorySelect = (category) => {
        handleCategoryChange(category);
    };



    // Calculate total pages safely
    const calculateTotalPages = () => {
        try {
            let filteredProducts = [];

            if (selectedCategory === 0) {
                // All products
                filteredProducts = Array.isArray(products) ? products : [];
            } else {
                // Category products
                if (categoryProducts && categoryProducts.furniture) {
                    const categoryProductsArray = categoryProducts.furniture;
                    filteredProducts = Array.isArray(categoryProductsArray) ? categoryProductsArray : [];
                } else {
                    filteredProducts = [];
                }
            }

            // Apply search filter if needed
            if (showSearch && search) {
                filteredProducts = filteredProducts.filter((item) => {
                    if (!item || typeof item !== 'object') return false;

                    return (
                        (item.name && item.name.toLowerCase().includes(search.toLowerCase())) ||
                        (item.title && item.title.toLowerCase().includes(search.toLowerCase())) ||
                        (item.description && item.description.toLowerCase().includes(search.toLowerCase())) ||
                        (item.shortDesc && item.shortDesc.toLowerCase().includes(search.toLowerCase())) ||
                        (item.longDesc && item.longDesc.toLowerCase().includes(search.toLowerCase()))
                    );
                });
            }

            // Ensure we have a valid positive integer
            return Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
        } catch (error) {
            console.error("Error calculating total pages:", error);
            return 1; // Default to 1 page on error
        }
    };

    const totalPages = calculateTotalPages();

    // Event handler for page change
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (error)
        return <p className="text-center mt-4 text-red-500">Error: {error}</p>;

    return (
        <>
            {/* Hero Section */}
            <section
                className=" md:mt-0 my-6 h-[20vh] rounded-2xl bg-center flex items-center justify-center text-center"
                style={{ backgroundImage: `url(${shophero})` }}
            >
                <div>
                    <h1 className="pb-2 text-4xl text-zinc-800 font-bold">Shop</h1>
                    <Link to="/" className="text-gray-600 hover:underline">
                        Home
                    </Link>{" "}
                    <span> &gt; shop </span>
                </div>
            </section>

            {/* Product section */}

            <section>
                <div className="p-4 flex flex-col lg:flex-row lg:space-x-16">
                    {/* Product Categories */}
                    <ProductCategories
                        categories={categories}
                        selectedCategory={selectedCategory}
                        handleCategorySelect={handleCategorySelect}
                    />
                    {/* Divider */}
                    <div className="hidden lg:block w-[1px] bg-gray-300"></div>
                    {/* Product Items */}
                    {loading ? (
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                            {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
                                <ShopItemSkeleton key={index} />
                            ))}
                        </div>
                    ) : showProducts && showProducts.length > 0 ? (
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                            {showProducts.map((product) => (
                                <Link key={product.id} to={`/product/${product.id}`}>
                                    <ShopItemCard
                                        image={
                                            (product.images && product.images.length > 0)
                                                ? (product.images[0].imageUrl
                                                    ? `${IMAGE_URL}${product.images[0].imageUrl}`
                                                    : product.images[0].url)
                                                : "/default-image.jpg"
                                        }
                                        name={product.name || product.title}
                                        price={product.price}
                                    />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex justify-center items-center min-h-[300px]">
                            <p className="text-gray-500 text-lg">No products found. Try a different category or search term.</p>
                        </div>
                    )}
                </div>

                {/* Pagination Buttons */}
                {!loading && showProducts && showProducts.length > 0 && (
                    <div className="flex justify-center gap-2 p-2">
                        {/* Previous button */}
                        <button
                            className={`w-20 h-10 ${currentPage === 1
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "hover:border-black"
                                }`}
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>

                        {/* Page number buttons - using a safer approach with a for loop */}
                        {(() => {
                            const buttons = [];
                            const safeTotal = Math.max(1, Math.min(100, totalPages)); // Limit to reasonable range

                            for (let i = 0; i < safeTotal; i++) {
                                buttons.push(
                                    <button
                                        key={i + 1}
                                        className={`w-10 h-10 border-solid ${currentPage === i + 1
                                                ? "border-black font-bold"
                                                : "border-gray-500 text-gray-500 hover:text-black hover:border-black"
                                            }`}
                                        onClick={() => handlePageChange(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            }

                            return buttons;
                        })()}

                        {/* Next button */}
                        <button
                            className={`w-20 h-10 ${currentPage === totalPages
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "hover:border-black"
                                }`}
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </section>
        </>
    );
}

export default Shop;
