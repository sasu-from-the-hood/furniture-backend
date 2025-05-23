import React, { useState } from 'react';
import PropTypes from 'prop-types';

function ProductCategories({ categories, selectedCategory, handleCategorySelect }) {
  // State to track which main categories are expanded
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="w-full lg:w-[40vh] mb-6 lg:mb-0 bg-white p-4 rounded-lg shadow-sm">
      <h1 className="p-2 text-xl font-semibold text-gray-800">Product Categories</h1>
      <hr className="mb-4 border-gray-200" />
      <ul className="space-y-2">
        {/* "All" option */}
        <li
          className="flex items-center p-2 border-b border-gray-200 cursor-pointer transition-colors hover:bg-blue-50 text-gray-700"
          onClick={() => handleCategorySelect(0)}
        >
          <div
            className={`h-3 w-3 border-2 rounded-full ${selectedCategory === 0 ? 'bg-green-900 border-green-200' : 'border-gray-400'
              } hover:border-green-400`}
          ></div>
          <span className="ml-2">All</span>
        </li>

        {/* Main Categories */}
        {categories && categories.map((category) => (
          <React.Fragment key={category.id}>
            {/* Main category header */}
            <li
              className="flex items-center justify-between p-2 border-b border-gray-200 cursor-pointer transition-colors hover:bg-blue-50"
              onClick={() => {
                toggleExpand(category.id);
                // Always select the category when clicked, regardless of subcategories
                handleCategorySelect(category.id);
              }}
            >
              <div className="flex items-center space-x-2">
                {category.subcategories && category.subcategories.length > 0 ? (
                  <span
                    className={`transform transition-transform duration-200 text-gray-600 ${expanded[category.id] ? 'rotate-90' : ''}`}
                  >
                    ►
                  </span>
                ) : (
                  <div
                    className={`h-3 w-3 border-2 rounded-full ml-1 mr-1 ${selectedCategory === category.id ? 'bg-green-900 border-green-200' : 'border-gray-400'} hover:border-green-400`}
                  ></div>
                )}
                <span className="text-lg font-medium text-gray-800">
                  {category.name}
                </span>
              </div>
            </li>

            {/* Subcategories */}
            {expanded[category.id] && category.subcategories && category.subcategories.length > 0 &&
              category.subcategories.map((subCat) => (
                <li
                  key={subCat.id}
                  className="flex items-center p-2 pl-10 border-b border-gray-100 cursor-pointer transition-colors hover:bg-blue-50 text-gray-700"
                  onClick={() => handleCategorySelect(subCat.id)}
                >
                  <div
                    className={`h-3 w-3 border-2 rounded-full ${selectedCategory === subCat.id ? 'bg-green-900 border-green-200' : 'border-gray-400'} hover:border-green-400`}
                  ></div>
                  <span className="ml-2">{subCat.name}</span>
                </li>
              ))}
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
}

ProductCategories.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      subcategories: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number,
          name: PropTypes.string
        })
      )
    })
  ).isRequired,
  selectedCategory: PropTypes.number,
  handleCategorySelect: PropTypes.func.isRequired
};

export default ProductCategories;