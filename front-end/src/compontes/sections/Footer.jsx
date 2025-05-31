import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../../config/index";
import { ShopContext } from "../context/ShopContext";

function Footer() {
  const { siteSettings, getSettings } = useContext(ShopContext);
  const [footerSettings, setFooterSettings] = useState({
    general: {
      site_name: { value: "European Luxury" },
    },
    footer: {
      footer_about: {
        value:
          "We specialize in high-quality, stylish furniture designed to bring comfort and elegance to every space.",
      },
      footer_address: { value: "123 Furniture Lane, Hometown, ST 12345" },
      footer_copyright: { value: "All rights reserved." },
      footer_quick_links: { value: [] },
      footer_customer_service: { value: [] },
    },
    contact: {
      contact_email: { value: "support@european.com" },
      contact_phone: { value: "(123) 456-7890" },
    },
    social: {},
  });
  const [loading, setLoading] = useState(true);

  // Use a ref to track if we've already fetched data
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    // Only fetch once
    if (hasFetched) return;

    // Fetch footer settings from the API
    const fetchFooterSettings = async () => {
      try {
        setLoading(true);
        setHasFetched(true);

        // Initialize footer with default values to ensure links are always available
        setFooterSettings((prevSettings) => ({
          ...prevSettings,
          footer: {
            ...prevSettings.footer,
            footer_quick_links: {
              value: [
                { title: "Home", url: "/" },
                { title: "Shop", url: "/shop" },
                { title: "About Us", url: "/about" },
                { title: "Contact", url: "/contact" },
              ],
            },
            footer_customer_service: {
              value: [
                { title: "FAQs", url: "/faqs" },
                { title: "Shipping & Returns", url: "/shipping" },
                { title: "Privacy Policy", url: "/privacy" },
                { title: "Terms of Service", url: "/terms" },
              ],
            },
          },
        }));

        // Use existing siteSettings if available
        if (siteSettings && Object.keys(siteSettings).length > 0) {
          // Update footer settings with data from siteSettings
          setFooterSettings((prevSettings) => ({
            ...prevSettings,
            general: {
              ...prevSettings.general,
              site_name: {
                value:
                  siteSettings.site_name ||
                  prevSettings.general.site_name.value,
              },
            },
            contact: {
              ...prevSettings.contact,
              contact_email: {
                value:
                  siteSettings.contact_email ||
                  prevSettings.contact.contact_email.value,
              },
              contact_phone: {
                value:
                  siteSettings.contact_phone ||
                  prevSettings.contact.contact_phone.value,
              },
              contact_address: { value: siteSettings.contact_address || "" },
            },
            social: {
              social_facebook: { value: siteSettings.social_facebook || "" },
              social_instagram: { value: siteSettings.social_instagram || "" },
            },
          }));
        } else {
          // If no siteSettings, fetch them
          await getSettings();
        }

        // Make API call to get footer-specific settings
        try {
          const response = await fetch(`${API_URL}/superadmin/settings/footer`);
          if (response.ok) {
            const data = await response.json();
            if (data.settings) {
              // Merge API data with our defaults, preserving the links if they're not in the API response
              setFooterSettings((prevSettings) => {
                const newSettings = {
                  ...prevSettings,
                  ...data.settings,
                };

                // Ensure footer links are preserved
                if (!newSettings.footer?.footer_quick_links?.value) {
                  if (!newSettings.footer) newSettings.footer = {};
                  newSettings.footer.footer_quick_links =
                    prevSettings.footer?.footer_quick_links;
                }

                if (!newSettings.footer?.footer_customer_service?.value) {
                  if (!newSettings.footer) newSettings.footer = {};
                  newSettings.footer.footer_customer_service =
                    prevSettings.footer?.footer_customer_service;
                }

                return newSettings;
              });
            }
          }
        } catch (apiError) {
          console.error("API call failed:", apiError);
          // Even if API fails, we still have our default links
        }
      } catch (error) {
        console.error("Error fetching footer settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterSettings();
    // We intentionally only want this to run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update footer settings when siteSettings changes
  useEffect(() => {
    if (siteSettings && Object.keys(siteSettings).length > 0) {
      // No need to fetch again, just update our local state with the new values
      setFooterSettings((prevSettings) => ({
        ...prevSettings,
        general: {
          ...prevSettings.general,
          site_name: {
            value:
              siteSettings.site_name || prevSettings.general.site_name.value,
          },
        },
        footer: {
          ...prevSettings.footer,
          footer_about: {
            value: prevSettings.footer?.footer_about?.value || "",
          },
          footer_address: {
            value:
              siteSettings.contact_address ||
              prevSettings.footer?.footer_address?.value ||
              "",
          },
          footer_copyright: {
            value:
              prevSettings.footer?.footer_copyright?.value ||
              "All rights reserved.",
          },
          // Ensure these are properly formatted as arrays of objects
          footer_quick_links: {
            value: prevSettings.footer?.footer_quick_links?.value || [
              { title: "Home", url: "/" },
              { title: "Shop", url: "/shop" },
              { title: "About Us", url: "/about" },
              { title: "Contact", url: "/contact" },
            ],
          },
          footer_customer_service: {
            value: prevSettings.footer?.footer_customer_service?.value || [
              { title: "FAQs", url: "/faqs" },
              { title: "Shipping & Returns", url: "/shipping" },
              { title: "Privacy Policy", url: "/privacy" },
              { title: "Terms of Service", url: "/terms" },
            ],
          },
        },
        contact: {
          ...prevSettings.contact,
          contact_email: {
            value:
              siteSettings.contact_email ||
              prevSettings.contact.contact_email.value,
          },
          contact_phone: {
            value:
              siteSettings.contact_phone ||
              prevSettings.contact.contact_phone.value,
          },
          contact_address: {
            value:
              siteSettings.contact_address ||
              prevSettings.contact.contact_address?.value ||
              "",
          },
        },
        social: {
          ...prevSettings.social,
          social_facebook: { value: siteSettings.social_facebook || "" },
          social_instagram: { value: siteSettings.social_instagram || "" },
        },
      }));
    }
  }, [siteSettings]);

  // Extract values from settings with fallbacks from siteSettings
  const siteName =
    footerSettings.general?.site_name?.value ||
    siteSettings?.site_name ||
    "European Luxury";
  const aboutText = footerSettings.footer?.footer_about?.value || "";
  const address =
    footerSettings.footer?.footer_address?.value ||
    siteSettings?.contact_address ||
    "";
  const copyright =
    footerSettings.footer?.footer_copyright?.value || "All rights reserved.";
  const email =
    footerSettings.contact?.contact_email?.value ||
    siteSettings?.contact_email ||
    "";
  const phone =
    footerSettings.contact?.contact_phone?.value ||
    siteSettings?.contact_phone ||
    "";

  // Parse JSON values with better error handling
  let quickLinks = [
    { title: "Home", url: "/" },
    { title: "Shop", url: "/shop" },
    { title: "About Us", url: "/about" },
    { title: "Contact", url: "/contact" },
  ];

  try {
    // Try to get the value from footerSettings
    const linksFromSettings = footerSettings.footer?.footer_quick_links?.value;

    // Check if it's a valid array
    if (Array.isArray(linksFromSettings) && linksFromSettings.length > 0) {
      quickLinks = linksFromSettings;
    } else if (typeof linksFromSettings === "string") {
      // If it's a string, try to parse it as JSON
      try {
        const parsed = JSON.parse(linksFromSettings);
        if (Array.isArray(parsed) && parsed.length > 0) {
          quickLinks = parsed;
        }
      } catch (e) {
        console.error("Failed to parse quickLinks JSON:", e);
      }
    }
  } catch (error) {
    console.error("Error processing quickLinks:", error);
  }

  let customerServiceLinks = [
    { title: "FAQs", url: "/faqs" },
    { title: "Shipping & Returns", url: "/shipping" },
    { title: "Privacy Policy", url: "/privacy" },
    { title: "Terms of Service", url: "/terms" },
  ];

  try {
    // Try to get the value from footerSettings
    const linksFromSettings =
      footerSettings.footer?.footer_customer_service?.value;

    // Check if it's a valid array
    if (Array.isArray(linksFromSettings) && linksFromSettings.length > 0) {
      customerServiceLinks = linksFromSettings;
    } else if (typeof linksFromSettings === "string") {
      // If it's a string, try to parse it as JSON
      try {
        const parsed = JSON.parse(linksFromSettings);
        if (Array.isArray(parsed) && parsed.length > 0) {
          customerServiceLinks = parsed;
        }
      } catch (e) {
        console.error("Failed to parse customerServiceLinks JSON:", e);
      }
    }
  } catch (error) {
    console.error("Error processing customerServiceLinks:", error);
  }

  // Social media links
  const socialLinks = Object.entries(footerSettings.social || {})
    .filter(([key, value]) => key.startsWith("social_") && value.value)
    .map(([key, value]) => ({
      platform: key.replace("social_", ""),
      url: value.value,
    }));

  return (
    <footer className="site-footer border border-solid">
      <div className="block w-full h-auto bg-emerald-800">
        <div className="container mx-auto p-4">
          {loading ? (
            <div className="text-center py-4 text-gray-400">
              Loading footer information...
            </div>
          ) : (
            <>
              <div className="flex flex-wrap justify-between">
                {/* About Us Section */}
                <div className="w-full sm:w-1/2 md:w-1/4 mb-6">
                  <h2 className="text-lg font-semibold text-white mb-4">
                    About Us
                  </h2>
                  <p className="text-gray-400">
                    {aboutText ||
                      "We specialize in high-quality, stylish furniture designed to bring comfort and elegance to every space."}
                  </p>
                </div>

                {/* Quick Links Section */}
                <div className="w-full sm:w-1/2 md:w-1/4 mb-6">
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Quick Links
                  </h2>
                  <ul className="text-gray-400 space-y-2">
                    {quickLinks.map((link, index) => (
                      <li key={index}>
                        <Link to={link.url} className="hover:text-white">
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Customer Service Section */}
                <div className="w-full sm:w-1/2 md:w-1/4 mb-6">
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Customer Service
                  </h2>
                  <ul className="text-gray-400 space-y-2">
                    {customerServiceLinks.map((link, index) => (
                      <li key={index}>
                        <Link to={link.url} className="hover:text-white">
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contact Info Section */}
                <div className="w-full sm:w-1/2 md:w-1/4 mb-6">
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Contact Us
                  </h2>

                  {address && (
                    <div className="flex items-start mb-3">
                      <svg
                        className="w-5 h-5 text-gray-300 mr-2 mt-1 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                      </svg>
                      <p className="text-gray-300">{address}</p>
                    </div>
                  )}

                  {email && (
                    <div className="flex items-center mb-3">
                      <svg
                        className="w-5 h-5 text-gray-300 mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <a
                        href={`mailto:${email}`}
                        className="text-gray-300 hover:text-white"
                      >
                        {email}
                      </a>
                    </div>
                  )}

                  {phone && (
                    <div className="flex items-center mb-3">
                      <svg
                        className="w-5 h-5 text-gray-300 mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        ></path>
                      </svg>
                      <a
                        href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                        className="text-gray-300 hover:text-white"
                      >
                        {phone}
                      </a>
                    </div>
                  )}

                  {/* Social Media Links */}
                  {socialLinks.length > 0 && (
                    <div className="mt-4 flex space-x-4">
                      {socialLinks.map((social, index) => (
                        <a
                          key={index}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-white flex items-center"
                        >
                          {social.platform === "facebook" && (
                            <svg
                              className="w-5 h-5 mr-1"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                            </svg>
                          )}
                          {social.platform === "instagram" && (
                            <svg
                              className="w-5 h-5 mr-1"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                            </svg>
                          )}
                          {social.platform.charAt(0).toUpperCase() +
                            social.platform.slice(1)}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Bottom Section */}
              <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400">
                <p>
                  &copy; {new Date().getFullYear()} {siteName}. {copyright}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
