import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import sofa from "../assets/sofa.png";
import light from "../assets/light.jpg";
import decor from "../assets/decor.jpg";
import { ShopContext } from "../compontes/context/ShopContext.jsx";
import { IMAGE_URL } from "../config/index.js";

function Home() {
  const {
    products,
    handleCategoryChange,
    siteSettings,
    getSettings
  } = useContext(ShopContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Define categories
  const categories = [
    { id: 1, image: sofa, name: "Furniture" },
    { id: 12, image: decor, name: "Porcelain" },
    { id: 9, image: light, name: "Door" },
  ];

  // Ensure settings and products are loaded
  useEffect(() => {
    getSettings();
  }, [getSettings]);

  const handleCategory = (id) => {
    handleCategoryChange(id);
    navigate("/shop");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % categories.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [categories.length]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % categories.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + categories.length) % categories.length);
  };

  const currentCategory = categories[currentIndex];

  return (
    <>
      {/* Hero Section */}
      <div className="home-page pt-4">
        <section className="relative flex flex-col md:flex-row items-center justify-center pt-[120px] px-4 md:px-[200px] h-screen w-[95%] mx-auto bg-white z-0 rounded overflow-hidden">
          {/* Text Container */}
          <div className="landingText text-center mx-auto md:text-left md:pr-8">
            <h1 className="text-4xl font-semibold tracking-wide animate-fade-in">
              {currentCategory.name}
            </h1>
            <p className="mt-4 text-xl animate-fade-in">
              Explore our {currentCategory.name} collection
            </p>
            <button className="mt-12 w-[130px] min-w-[100px] p-[6px] border-solid border-2 rounded-md border-black hover:bg-gray-950 hover:text-white flex items-center justify-center whitespace-nowrap">
              <Link to="/shop" onClick={() => handleCategoryChange(currentCategory.id)}>Shop Now</Link>
            </button>
          </div>

          {/* Category Image with Refined Animation and Shadow */}
          <img
            key={currentIndex}
            className={`${
              currentIndex === 0 ? "animate-slide-down" : "animate-slide-left"
            } md:ml-8 `}
            style={{
              objectFit: "contain",
              width: "750px", // Tripled size
              height: "550px", // Tripled size
              maxWidth: "100%",
            }}
            src={currentCategory.image}
            alt={currentCategory.name}
          />

          {/* Navigation Buttons */}
          <div className="absolute bottom-4 right-4 flex gap-4">
            <button
              className="p-2 text-black rounded hover:text-green-900 transition-colors"
              onClick={handlePrevious}
            >
              Previous
            </button>
            <button
              className="p-2 text-black rounded hover:text-green-900 transition-colors"
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        </section>
      </div>

      {/* Featured Categories Section */}
      <section className="py-16 px-6 md:px-16">
        <h2 className="text-3xl md:text-4xl font-light text-center mb-8 tracking-wide">
          Explore Our{" "}
          <span className="text-green-900 font-semibold">Categories</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategory(category.id)}
              className="relative group h-72 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              {/* Category Image */}
              <img
                src={category.image}
                alt={category.name}
                className="rounded-xl shadow-lg w-full h-full object-cover transition-transform duration-300 ease-in-out"
              />

              {/* Overlay Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>

              {/* Category Text */}
              <h3 className="absolute inset-0 flex items-center justify-center text-white text-2xl font-semibold tracking-wide opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300">
                {category.name}
              </h3>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-gray-50 px-6 md:px-16">
        <h2 className="text-3xl md:text-4xl font-light text-center mb-8 tracking-wide">
          Trending{" "}
          <span className="text-green-900 font-semibold">Products</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.isArray(products) && products.length > 0 ? (
            products.slice(0, 4).map((product, index) => (
              <div key={index} className="text-center">
                <div className="relative h-96 w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white group transition-transform duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2">
                  {/* Image with Hover Overlay */}
                  <img
                    src={IMAGE_URL +product?.images[0]?.imageUrl || "/default-image.jpg"}
                    alt={product?.title}
                    className="h-96 w-full object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
                  />
                  {/* Subtle overlay effect */}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </div>

                {/* Product Name */}
                <p className="font-medium text-lg text-gray-800 mt-3 tracking-wide">
                  {product?.name}
                </p>

                {/* CTA Button */}
                <Link to={`/product/${product?.id}`}>
                  <button className="mt-4 px-5 py-2 bg-green-900 text-white font-medium rounded-lg shadow-md hover:bg-green-800 hover:shadow-lg transition-all duration-300">
                    View Product
                  </button>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center py-8">
              <p className="text-gray-500">Loading products...</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-6 md:px-16">
        <h2 className="text-3xl md:text-4xl font-light text-center mb-8 tracking-wide">
          Why Choose {siteSettings.site_name || "European Luxury"}{" "}
          <span className="text-green-700 font-bold">?</span>
        </h2>

        {/* Site Description Banner */}
        {siteSettings.site_description && (
          <div className="mb-10 p-6 rounded-lg text-center">
            <p className="text-lg text-green-800">{siteSettings.site_description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(siteSettings.why_choose_us_reasons || [
            { title: 'Craftsmanship', description: 'Experience unmatched quality and detail in every product.' },
            { title: 'Sustainability', description: 'We prioritize eco-friendly and ethical practices.' },
            { title: 'Exclusivity', description: 'Our collections are curated to offer unique and timeless elegance.' }
          ]).map((reason, index) => (
            <div key={index} className="text-center">
              <h3 className="text-xl font-semibold mb-2">{reason.title}</h3>
              <p className="text-gray-600">{reason.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 bg-black text-white text-center">
        <h2 className="text-3xl md:text-4xl font-light text-center mb-8 tracking-wide">
          Experience the {siteSettings.site_name || "Luxury"}{" "}
          <span className="text-green-500 font-bold">Lifestyle</span>
        </h2>
        <div className="relative w-full max-w-4xl mx-auto aspect-video">
          <iframe
            className="rounded-lg shadow-lg w-full h-full border-0"
            src={siteSettings.video_url || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
            title="Product Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-6 md:px-16">
        <h2 className="text-3xl md:text-4xl font-light text-center mb-8 tracking-wide">
          What Our <span className="text-green-700 font-bold">Clients</span> Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(siteSettings.testimonials || [
            {
              quote: 'Their products are truly exquisite and add elegance to any space.',
              author: 'Alex Johnson'
            },
            {
              quote: 'Exceptional craftsmanship and quality. Highly recommended!',
              author: 'Sarah Williams'
            },
            {
              quote: `${siteSettings.site_name || 'European Luxury'} is my go-to for elegant and unique home pieces.`,
              author: 'Michael Lee'
            }
          ]).map((testimonial, index) => (
            <div key={index} className="p-6 bg-white rounded-lg shadow-lg">
              <p className="text-gray-600">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <p className="mt-4 font-semibold">- {testimonial.author}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Contact Section */}
      <section className="py-16 bg-gray-100 px-6 md:px-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Get in Touch
        </h2>

        {/* Contact Information from Settings */}
        {(siteSettings.contact_email || siteSettings.contact_phone) && (
          <div className="mb-8 p-4 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold mb-4 text-center">Contact Information</h3>
            <div className="flex flex-col md:flex-row justify-center items-center gap-6">
              {siteSettings.contact_email && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span>{siteSettings.contact_email}</span>
                </div>
              )}
              {siteSettings.contact_phone && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span>{siteSettings.contact_phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          <form className="grid grid-cols-1 gap-6">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
            <textarea
              rows="4"
              placeholder="Your Message"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            ></textarea>
            <button
              type="submit"
              className="px-6 py-3 bg-green-700 text-white font-semibold rounded-md hover:bg-green-800"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Trending Items */}

      {/* <section>
        <div className="flex flex-wrap lg:flex-nowrap justify-between p-8 gap-4">
          <Link to={`/product/${products[0]?.id}`}>
            <HomeCards
              image={products[0]?.images[0].url}
              name={products[0]?.name}
              class="w-full lg:w-[48rem] h-[25rem] "
            />
          </Link>
          <Link to={`/product/${products[1]?.id}`}>
            <HomeCards
              image={products[1]?.images[0].url}
              name={products[1]?.name}
              class="w-full lg:w-[28rem] h-[25rem]"
            />
          </Link>
        </div>
        <h1 className="font-bold p-4 text-2xl">Trending This Week</h1>



        <div className="flex flex-col gap-8 p-8">

          <Link to={`/product/${products[2]?.id}`}>
            <HomeCards
              image={products[2]?.images[0].url}
              name={products[2]?.name}
              class="w-[95%] mx-auto h-[40rem] lg:h-[35rem] lg:w-[90%]"
            />
          </Link>


          <div className="grid grid-cols-2 gap-4 w-full">
            <Link to={`/product/${products[3]?.id}`}>
              <HomeCards
                image={products[3]?.images[0].url}
                name={products[3]?.name}
                class="h-[15rem] lg:h-[19rem] w-full"
              />
            </Link>
            <Link to={`/product/${products[4]?.id}`}>
              <HomeCards
                image={products[4]?.images[0].url}
                name={products[4]?.name}
                class="h-[15rem] lg:h-[19rem] w-full"
              />
            </Link>
            <Link to={`/product/${products[5]?.id}`}>
              <HomeCards
                image={products[5]?.images[0].url}
                name={products[5]?.name}
                class="h-[15rem] lg:h-[19rem] w-full"
              />
            </Link>
            <Link to={`/product/${products[6]?.id}`}>
              <HomeCards
                image={products[6]?.images[0].url}
                name={products[6]?.name}
                class="h-[15rem] lg:h-[19rem] w-full"
              />
            </Link>
          </div>
        </div>
      </section>


      <section className="text-gray-900 h-dvh p-4 pt-12 flex flex-col justify-center items-center bg-cover bg-center">
        <h1 className="lg:mb-[5rem] text-3xl md:text-4xl lg:text-5xl text-center font-bold max-w-full">
          Services
        </h1>
        <div className="lg:flex lg:grid-cols-3 grid grid-cols-1 md:grid-cols-2 p-4 gap-x-16 gap-y-4 items-start max-w-full">
          <div className="max-w-xs break-words">
            <h1 className="text-xl md:text-2xl font-semibold pb-2 md:pb-4">
              Custom Furniture Design
            </h1>
            <p className="text-sm md:text-base">
              We create bespoke furniture pieces tailored to your unique style
              and space requirements. From contemporary to classic designs, our
              team works closely with you to bring your vision to life, using
              high-quality materials that stand the test of time.
            </p>
          </div>
          <div className="max-w-xs break-words">
            <h1 className="text-xl md:text-2xl font-semibold pb-2 md:pb-4">
              Interior Styling and Consulting
            </h1>
            <p className="text-sm md:text-base">
              Our expert designers help transform your space into a functional
              and aesthetically pleasing environment. Whether you’re furnishing
              a new home or refreshing a single room, our consulting services
              ensure every detail aligns with your vision and lifestyle.
            </p>
          </div>
          <div className="max-w-xs break-words">
            <h1 className="text-xl md:text-2xl font-semibold pb-2 md:pb-4">
              Delivery and Installation
            </h1>
            <p className="text-sm md:text-base">
              We provide seamless delivery and installation to make your
              furnishing experience hassle-free. Our skilled team handles
              everything from careful transportation to precise assembly, so you
              can start enjoying your new pieces right away.
            </p>
          </div>
        </div>
      </section> */}

      {/* Testimony */}
      {/* <section className="py-8">
        <div className="block w-screen h-[50vh] bg-emerald-800"></div>
      </section> */}
    </>
  );
}

export default Home;
