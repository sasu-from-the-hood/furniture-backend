import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ShopItemCard from "./ShopItemCard";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

const RelatedProduct = ({ subCategoryId }) => {
    const { products } = useContext(ShopContext);
    const [related, setRelated] = useState([]);

    useEffect(() => {
        if (products && products.length > 0 && subCategoryId) {
            // Get products from the same category (using categoryId instead of subCategoryId)
            let relatedProducts = products.filter(item =>
                item.categoryId === parseInt(subCategoryId) ||
                item.categoryId === subCategoryId
            );

            // Limit to 5 related products
            relatedProducts = relatedProducts.slice(0, 5);

            console.log(`Found ${relatedProducts.length} related products for category ${subCategoryId}`);
            setRelated(relatedProducts);
        }
    }, [subCategoryId, products]);

    return (
        <div className="my-24">
            <div className="text-center text-3xl py-2">
                <h1 className="font-thin">
                    <span className="font-bold text-green-950">Related</span> Products
                </h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
                {related.length > 0 ? (
                    related.map((item, index) => (
                        <Link key={item.id || index} to={`/product/${item.id}`}>
                            <ShopItemCard
                                image={(item.images && item.images.length > 0)
                                    ? item.images[0]?.url
                                    : "/default-image.jpg"}
                                name={item.name || item.title}
                                price={item.price}
                            />
                        </Link>
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-500">No related products found</p>
                )}
            </div>
        </div>
    );
};

RelatedProduct.propTypes = {
    subCategoryId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ])
};

export default RelatedProduct;
