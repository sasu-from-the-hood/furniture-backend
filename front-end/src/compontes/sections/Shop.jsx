import { Link } from "react-router-dom";
import ShopItemCard from "../ui/ShopItemCard";
import ShopItemSkeleton from "../ui/ShopItemSkeleton"; // Import Skeleton Component
import shophero from "../../assets/shophero.jpg";
import { useContext, useEffect, useState, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductCategories from "./ProductCategories";
import { IMAGE_URL } from "../../config/index";
import { FaFilter } from "react-icons/fa";

function Shop() {
    const ITEMS_PER_PAGE = 8;
    const [showProducts, setShowProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    // Price filter states
    const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Price range options (memoized to avoid dependency issues)
    const priceRanges = useMemo(() => [
        { id: 'price_0_1000', label: '0 - 1,000 Birr', min: 0, max: 1000 },
        { id: 'price_1000_10000', label: '1,000 - 10,000 Birr', min: 1000, max: 10000 },
        { id: 'price_10000_100000', label: '10,000 - 100,000 Birr', min: 10000, max: 100000 }
    ], []);

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

    // Handle price range selection
    const handlePriceRangeChange = (rangeId) => {
        setSelectedPriceRanges(prev => {
            // If already selected, remove it
            if (prev.includes(rangeId)) {
                return prev.filter(id => id !== rangeId);
            }
            // Otherwise add it
            return [...prev, rangeId];
        });
        // Reset to page 1 when filter changes
        setCurrentPage(1);
    };

    // Toggle mobile filters visibility
    const toggleMobileFilters = () => {
        setShowMobileFilters(prev => !prev);
    };

    // When selectedCategory changes, reset to page 1
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory]);

    // When price filters change, reset to page 1
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedPriceRanges]);

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

            // Apply price range filter if any are selected
            if (selectedPriceRanges.length > 0) {
                activeProducts = activeProducts.filter(product => {
                    if (!product || typeof product !== 'object' || !product.price) return false;

                    // Check if product price falls within any of the selected ranges
                    return selectedPriceRanges.some(rangeId => {
                        const range = priceRanges.find(r => r.id === rangeId);
                        if (!range) return false;

                        const price = parseFloat(product.price);
                        return price >= range.min && price <= range.max;
                    });
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
        selectedPriceRanges,
        priceRanges
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

            // Apply price range filter if any are selected
            if (selectedPriceRanges.length > 0) {
                filteredProducts = filteredProducts.filter(product => {
                    if (!product || typeof product !== 'object' || !product.price) return false;

                    // Check if product price falls within any of the selected ranges
                    return selectedPriceRanges.some(rangeId => {
                        const range = priceRanges.find(r => r.id === rangeId);
                        if (!range) return false;

                        const price = parseFloat(product.price);
                        return price >= range.min && price <= range.max;
                    });
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
                {/* Mobile Filter Button */}
                <div className="lg:hidden flex justify-between items-center px-4 py-2">
                    <button
                        onClick={toggleMobileFilters}
                        className="flex items-center space-x-2 bg-green-900 text-white px-4 py-2 rounded-md shadow-sm"
                    >
                        <FaFilter />
                        <span>Filters {selectedPriceRanges.length > 0 && `(${selectedPriceRanges.length})`}</span>
                    </button>

                    {selectedPriceRanges.length > 0 && (
                        <button
                            onClick={() => setSelectedPriceRanges([])}
                            className="text-red-600 text-sm underline"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Mobile Filters Panel */}
                {showMobileFilters && (
                    <div className="lg:hidden bg-white p-4 mb-4 rounded-md shadow-md mx-4">
                        <div className="mb-4">
                            <h3 className="font-semibold text-lg mb-2">Price Range</h3>
                            <div className="space-y-2">
                                {priceRanges.map(range => (
                                    <label key={range.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedPriceRanges.includes(range.id)}
                                            onChange={() => handlePriceRangeChange(range.id)}
                                            className="w-4 h-4 accent-green-900"
                                        />
                                        <span>{range.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={toggleMobileFilters}
                            className="w-full bg-green-900 text-white py-2 rounded-md"
                        >
                            Apply Filters
                        </button>
                    </div>
                )}

                <div className="p-4 flex flex-col lg:flex-row lg:space-x-16">
                    {/* Product Categories */}
                    <div className="lg:block">
                        <ProductCategories
                            categories={categories}
                            selectedCategory={selectedCategory}
                            handleCategorySelect={handleCategorySelect}
                        />

                        {/* Desktop Price Filter */}
                        <div className="hidden lg:block mt-6 bg-white p-4 rounded-lg shadow-sm">
                            <h2 className="p-2 text-xl font-semibold text-gray-800">Price Range</h2>
                            <hr className="mb-4 border-gray-200" />
                            <div className="space-y-3">
                                {priceRanges.map(range => (
                                    <label key={range.id} className="flex items-center p-2 cursor-pointer hover:bg-blue-50">
                                        <input
                                            type="checkbox"
                                            checked={selectedPriceRanges.includes(range.id)}
                                            onChange={() => handlePriceRangeChange(range.id)}
                                            className="w-4 h-4 accent-green-900"
                                        />
                                        <span className="ml-2">{range.label}</span>
                                    </label>
                                ))}
                            </div>

                            {selectedPriceRanges.length > 0 && (
                                <button
                                    onClick={() => setSelectedPriceRanges([])}
                                    className="mt-3 text-red-600 text-sm underline"
                                >
                                    Clear Price Filters
                                </button>
                            )}
                        </div>
                    </div>

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
                        <div className="flex-1 flex flex-col justify-center items-center min-h-[300px]">
                            <p className="text-gray-500 text-lg text-center">
                                {selectedPriceRanges.length > 0
                                    ? "No products found in the selected price range."
                                    : "No products found. Try a different category or search term."}
                            </p>
                            {selectedPriceRanges.length > 0 && (
                                <button
                                    onClick={() => setSelectedPriceRanges([])}
                                    className="mt-4 px-4 py-2 bg-green-900 text-white rounded-md hover:bg-green-800"
                                >
                                    Clear Price Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Active Filters Indicator (below products) */}
                {selectedPriceRanges.length > 0 && (
                    <div className="w-full flex justify-center my-4">
                        <div className="bg-green-50 border border-green-200 rounded-md p-2 flex flex-wrap items-center max-w-2xl">
                            <span className="text-green-800 font-medium mr-2">Active Price Filters:</span>
                            <div className="flex flex-wrap gap-2">
                                {selectedPriceRanges.map(rangeId => {
                                    const range = priceRanges.find(r => r.id === rangeId);
                                    return range ? (
                                        <span key={rangeId} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                            {range.label}
                                        </span>
                                    ) : null;
                                })}
                            </div>
                            <button
                                onClick={() => setSelectedPriceRanges([])}
                                className="ml-auto text-red-600 text-sm underline"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                )}

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
