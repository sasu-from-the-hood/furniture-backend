import PropTypes from 'prop-types';
import { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';

function CartItem(props) {

  const {cart, deliveryFee} = useContext(ShopContext);
  const { selectedItems = [] } = props;
  const [subTotal, setSubTotal] = useState(0);
  
  useEffect(() => {
    // Calculate subtotal for selected items only
    const total = cart
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + (item.furniture.price * item.quantity), 0);
    setSubTotal(total);
  }, [cart, selectedItems]);

  return (
    <>

<div className='w-full'>
  <div className="text-3xl">
    <h1 className="font-extralight">CART <span className="text-green-950 font-bold">TOTALS</span></h1>
  </div>

  <div className="flex flex-col gap-4 mt-4 text-sm">
    {/* Subtotal */}
    <div className="flex justify-between">
      <p>Subtotal</p>
      <p>{subTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB</p>
    </div>
    <hr />
    
    {/* Shipping */}
    <div className="flex justify-between">
      <p>Shipping</p>
      <p>{deliveryFee ? deliveryFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'} ETB</p>
    </div>
    <hr />

    {/* Total */}
    <div className="flex justify-between">
      <b>Total</b>
      <b>{(subTotal + (deliveryFee || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB</b>
    </div>
  </div>
</div>



    </>
  );
}

export default CartItem;
