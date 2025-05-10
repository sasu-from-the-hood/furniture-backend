import CartItem from "../compontes/ui/CartItem";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ShopContext } from "../compontes/context/ShopContext";
import { toast } from "react-toastify";
import InputValidation from "../utils/InputValidation";

function OrderPage() {
  const { username, userEmail, checkout } = useContext(ShopContext);
  const navigate = useNavigate();

  // Split the username into first and last name if possible
  const nameParts = username ? username.split(' ') : ['', ''];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  const [formData, setFormData] = useState({
    firstName: firstName,
    lastName: lastName,
    email: userEmail || "",
    city: "",
    phone: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    let value = event.target.value;

    // Apply validation for phone numbers
    if (name === "phone") {
      value = InputValidation(value, "phone");
    } else if (name === "city") {
      // Only allow letters for city
      value = InputValidation(value, "letter");
    }

    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault(); // Prevent default behavior.
    console.log(formData);

    if (!formData.city || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Use the checkout function from ShopContext
      await checkout(formData);

      // Navigate to orders page after successful checkout
      navigate("/orders");
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("Failed to place order. Please try again.");
    }
  };


  return (
    <>
      <form onSubmit={onSubmitHandler} className="sm:flex md:grid md:grid-cols-2 p-4 mt-16">
        <div className="font-medium grid grid-cols-1">
          <h1 className="text-2xl font-extralight">
            <span className="text-green-950 font-semibold">YOUR</span>{" "}
            INFORMATION
          </h1>
          <div className="p-4">
            {/* <input
              name="firstName"
              value={formData.firstName}
              placeholder="First Name"
              className="border m-2 p-1 rounded-md bg-gray-100"
              type="text"
              disabled
              readOnly
            ></input>
            <input
              name="lastName"
              value={formData.lastName}
              placeholder="Last Name"
              className="border m-2 p-1 rounded-md bg-gray-100"
              type="text"
              disabled
              readOnly
            ></input>
          </div>
          <div className="p-4">
            <input
              name="email"
              value={formData.email}
              placeholder="Email address"
              className="border m-2 p-1 rounded-md bg-gray-100"
              type="email"
              disabled
              readOnly
            ></input> */}
            <input
              onChange={onChangeHandler}
              name="city"
              value={formData.city}
              placeholder="City"
              className="border m-2 p-1 rounded-md"
              type="text"
              required
            ></input>
          </div>
          <div className="p-4">
            <input
              onChange={onChangeHandler}
              name="phone"
              value={formData.phone}
              placeholder="Phone Number"
              className="border m-2 p-1 rounded-md"
              type="tel"
              required
            ></input>
          </div>
        </div>
        <div className="mt-4">
          <CartItem />
          <div className="w-full text-end">
            <button type="submit" className="bg-green-800 p-2 mt-8 ">
              <span className="font-semibold">ORDER NOW</span>
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

export default OrderPage;
