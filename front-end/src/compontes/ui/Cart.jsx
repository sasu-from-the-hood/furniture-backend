// import { useParams, Link, useNavigate } from "react-router-dom";
// import { ShopContext } from "../context/ShopContext";
// import { useContext, useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import CartItem from "./CartItem"
// import { ClipLoader } from "react-spinners";

// function Cart() {
//   const { cart, setCart, getCart, loading, error, token } = useContext(ShopContext);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const navigate = useNavigate();

//   // Use the same API_URL from config for consistency
//   const BASE_URL = 'http://localhost:3002/api/user/cart';

//   useEffect(() => {
//     getCart();
//   }, []);

//   // const fetchCart = async () => {
//   //   try {
//   //     const data = await getCart();
//   //     setProduct(data);
//   //   } catch (error) {
//   //     console.error("Error fetching product:", error);
//   //   }
//   // };

//   //   useEffect(() => {

//   // }, []);

//   const quantityChange = async (itemId, newQuantity) => {
//     try {
//       const response = await fetch(`${BASE_URL}/${itemId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ quantity: newQuantity }),
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to update quantity: ${response.statusText}`);
//       }

//       // Optimistically update the UI
//       setCart((prevCart) =>
//         prevCart.map((item) =>
//           item.id === itemId
//             ? { ...item, quantity: newQuantity }
//             : item
//         )
//       );

//       console.log("Quantity updated successfully");
//     } catch (err) {
//       console.error("Error updating quantity:", err);
//     }
//   };

//   const removeItem = async (itemId) => {
//     try {
//       const response = await fetch(`${BASE_URL}/${itemId}`, {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to remove item: ${response.statusText}`);
//       }

//       // Optimistically update the UI
//       getCart();

//       console.log("Removed item successfully");
//     } catch (err) {
//       console.error("Error removing item:", err);
//     }
//   };

//   // Handle checkbox change
//   const handleSelect = (itemId) => {
//     setSelectedItems((prev) =>
//       prev.includes(itemId)
//         ? prev.filter((id) => id !== itemId)
//         : [...prev, itemId]
//     );
//   };

//   // Select all items
//   const handleSelectAll = (e) => {
//     if (e.target.checked) {
//       setSelectedItems(cart.map((item) => item.id));
//     } else {
//       setSelectedItems([]);
//     }
//   };

//   // Proceed to checkout with selected items
//   const proceedToCheckout = () => {
//     const selectedCartItems = cart.filter((item) => selectedItems.includes(item.id));
//     localStorage.setItem('selectedCartItems', JSON.stringify(selectedCartItems));
//     navigate('/order-page');
//   };

//   // if (loading) return <p>Loading...</p>;
//   if (loading)
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <ClipLoader color="#4caf50" size={60} />
//       </div>
//     );
//   if (error) return <p>Error: {error}</p>;
//   if (!cart) return <p>No Producst in Cart</p>;
//   return (
//     <>
//       <section className="mt-4">
//         <h1 className="text-3xl text-left px-6 font-extralight">
//           Your <span className="text-green-950 font-bold">Cart</span>
//         </h1>
//         {cart.length > 0 && (
//           <div className="flex items-center px-6 mb-2">
//             <input
//               type="checkbox"
//               checked={selectedItems.length === cart.length}
//               onChange={handleSelectAll}
//               className="mr-2"
//             />
//             <span className="text-sm">Select All</span>
//           </div>
//         )}
//         {cart.map((item) =>
//           <div key={item.id} className="m-4 flex flex-wrap items-center p-4 space-x-4 border-solid border-t-2 border-gray-300">
//             {/* Checkbox */}
//             <input
//               type="checkbox"
//               checked={selectedItems.includes(item.id)}
//               onChange={() => handleSelect(item.id)}
//               className="mr-4"
//             />
//             {/* Product Details */}
//             <div className="flex-1 space-y-2 min-w-[200px]">
//               <h1 className="text-2xl">{item.furniture.title || 'Product'}</h1>
//               <p>{item.furniture.shortDesc || item.furniture.description || 'No description available'}</p>
//               <p className="text-2xl text-green-950">{item.furniture.price || 0} ETB</p>
//             </div>
//             {/* Quantity */}
//             <div className="min-w-[120px]">
//               Quantity: <input type="number"
//                 min={1} defaultValue={item.quantity}
//                 className='border max-w-10 sm:max-w-20 px-1 py-1'
//                 onChange={(e) =>
//                   quantityChange(item.id, Number(e.target.value))
//                 }
//               ></input>
//             </div>
//             {/* Delete Button */}
//             <div className="ml-auto">
//               <button className="rounded-md p-2 text-white hover:bg-red-600"
//                 onClick={() => removeItem(item.id)}
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   height="24px"
//                   viewBox="0 -960 960 960"
//                   width="24px"
//                   fill=""
//                 >
//                   <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         )}
//         {cart.length === 0 ? <h1 className="p-4">Your Cart Is Empty</h1> :
//           <div className="p-6 flex justify-end my-20">
//             <div className="w-full sm:w-[450px]">
//               <CartItem selectedItems={selectedItems} cart={cart} />
//               <div className="w-full text-end">
//                 <button
//                   className={`bg-green-800 p-2 mt-8 ${selectedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
//                   onClick={proceedToCheckout}
//                   disabled={selectedItems.length === 0}
//                 >
//                   <span className="font-semibold">PROCEED TO CHECKOUT</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         }
//       </section>
//     </>
//   );
// }

// export default Cart;
"use client";

import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { useContext, useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";

function Cart() {
  const { cart, setCart, getCart, loading, error, token } =
    useContext(ShopContext);
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();

  const BASE_URL = "http://localhost:3002/api/user/cart";

  useEffect(() => {
    getCart();
  }, []);

  const quantityChange = async (itemId, newQuantity) => {
    try {
      const response = await fetch(`${BASE_URL}/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update quantity: ${response.statusText}`);
      }

      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await fetch(`${BASE_URL}/${itemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to remove item: ${response.statusText}`);
      }

      getCart();
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const handleSelect = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(cart.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const proceedToCheckout = () => {
    const selectedCartItems = cart.filter((item) =>
      selectedItems.includes(item.id)
    );
    if (selectedCartItems.length === 0) return;

    localStorage.setItem(
      "selectedCartItems",
      JSON.stringify(selectedCartItems)
    );
    navigate("/order-page");
  };

  // Calculate totals for selected items only
  const selectedCart = cart.filter((item) => selectedItems.includes(item.id));
  const subtotal = selectedCart.reduce(
    (sum, item) => sum + item.furniture.price * item.quantity,
    0
  );
  const installation = selectedCart.some(
    (item) => item.furniture.hasInstallation
  )
    ? 299
    : 0;
  const shipping = 0;
  const taxRate = 0.2;
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + installation + tax;

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#4caf50" size={60} />
      </div>
    );
  if (error) return <p>Error: {error}</p>;
  if (!cart) return <p>No Products in Cart</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {cart.length === 0 ? (
        <h1 className="text-2xl text-center py-8">Your Cart Is Empty</h1>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Table */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-gray-100 font-semibold text-gray-700">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={
                      selectedItems.length === cart.length && cart.length > 0
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4"
                  />
                </div>
                <div className="col-span-4">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-2 text-center">Subtotal</div>
              </div>

              {/* Cart Items */}
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 items-center"
                >
                  {/* Checkbox */}
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelect(item.id)}
                      className="h-4 w-4"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="col-span-4 flex items-center space-x-4">
                    <img
                      src={
                        item.furniture.image ||
                        "/placeholder.svg?height=80&width=80"
                      }
                      alt={item.furniture.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {item.furniture.title || "Product"}
                      </h3>
                      {item.furniture.hasInstallation && (
                        <div className="flex items-center mt-1">
                          <input
                            type="checkbox"
                            id={`install-${item.id}`}
                            className="mr-2 text-blue-600"
                            checked={selectedItems.includes(item.id)}
                            readOnly
                          />
                          <label
                            htmlFor={`install-${item.id}`}
                            className="text-sm text-blue-600"
                          >
                            Add installation: $299
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-center">
                    ${item.furniture.price?.toLocaleString() || 0}
                  </div>

                  {/* Quantity Controls */}
                  <div className="col-span-3 flex items-center justify-center">
                    <div className="flex items-center border border-gray-300 rounded">
                      <button
                        onClick={() =>
                          quantityChange(
                            item.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 border-x border-gray-300">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          quantityChange(item.id, item.quantity + 1)
                        }
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="col-span-2 text-center font-semibold">
                    $
                    {(item.furniture.price * item.quantity)?.toLocaleString() ||
                      0}
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-12 flex justify-end mt-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-500 hover:text-red-600 flex items-center text-sm"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    ${subtotal.toLocaleString()}
                  </span>
                </div>

                {installation > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Installation</span>
                    <span className="font-semibold">${installation}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (20%)</span>
                  <span className="font-semibold">${tax.toLocaleString()}</span>
                </div>

                <hr className="my-4" />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>

              <button
                className={`w-full bg-emerald-800 text-white font-semibold py-3 px-4 rounded mt-6 transition-colors duration-200 flex items-center justify-center ${
                  selectedItems.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-emerald-900"
                }`}
                onClick={proceedToCheckout}
                disabled={selectedItems.length === 0}
              >
                Proceed to Checkout
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
