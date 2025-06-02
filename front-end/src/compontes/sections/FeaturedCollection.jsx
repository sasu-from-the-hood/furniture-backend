import { useContext } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { IMAGE_URL } from "../../config/index";

export default function FeaturedCollection() {
  const { products } = useContext(ShopContext);
  
  // Log products to debug
  console.log("Products from context:", products);
  
  const trendingProducts = Array.isArray(products) ? products.slice(0, 4) : [];
  
  // Log trending products to debug
  console.log("Trending products:", trendingProducts);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 ">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl md:text-4xl font-light text-center tracking-wide">
          Trending{" "}
          <span className="text-green-900 font-semibold">Products</span>
        </h2>
        <Link to="/shop" className="text-green-700 hover:text-green-800 flex items-center">
          View All Products
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trendingProducts.map((product) => {
          // Skip rendering if product is not a valid object
          if (!product || typeof product !== 'object' || !product.id) {
            return null;
          }
          
          return (
          <div key={product.id} className="bg-gray-50 rounded-lg overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 flex flex-col h-full">
            <Link to={`/product/${product.id}`} className="block flex-grow flex flex-col">
              <div className="relative h-64">
                <img 
                  src={product?.images && product?.images[0]?.imageUrl 
                    ? IMAGE_URL + product.images[0].imageUrl 
                    : "/placeholder.svg"} 
                  alt={product.name || "Product"} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                <div className="absolute top-3 left-3">
                  {product.status && typeof product.status !== 'object' && (
                    <span
                      className={`${
                        product.status === "NEW"
                          ? "bg-green-800"
                          : product.status === "SALE"
                          ? "bg-yellow-500"
                          : "bg-gray-600"
                      } text-white px-3 py-1 text-xs font-bold`}
                    >
                      {product.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 flex-grow flex flex-col">
                <div className="text-sm text-green-700 font-medium mb-1">
                  {product.category ? 
                    (typeof product.category === 'object' ? product.category.name : product.category) 
                    : ''}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 h-14 overflow-hidden">{product.title || 'Product'}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow h-16 overflow-hidden">
                  {typeof product.shortDesc === 'string' 
                    ? product.shortDesc 
                    : 'No description available'}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-xl font-bold text-gray-900">${product.price?.toLocaleString()}</span>
                    {product.originalPrice && (
                      <span className="text-gray-500 line-through ml-2">${product.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                  <span className={
                    (product.stockQuantity > 0) 
                      ? "text-green-700" 
                      : "text-red-500"
                  }>
                    {typeof product.stockStatus === 'string' 
                      ? product.stockStatus 
                      : (product.stockQuantity > 0) 
                        ? "In Stock" 
                        : "Out of Stock"}
                  </span>
                </div>
              </div>
            </Link>
            
            {/* View Product button */}
            <div className="px-4 pb-4 mt-auto">
              <Link to={`/product/${product.id}`}>
                <button
                  className="bg-green-800 hover:bg-green-900 text-white w-full py-2 rounded flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  View Product
                </button>
              </Link>
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
}