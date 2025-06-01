import { fetchUtils } from "react-admin";
import { stringify } from "query-string";
import { API_URL } from "../../config";

const apiUrl = API_URL;
const httpClient = fetchUtils.fetchJson;

// Helper function to get the appropriate endpoint based on resource and role
const getEndpoint = (resource, role) => {
  // Default endpoints for different roles
  const endpoints = {
    superAdmin: {
      products: "/superadmin/products",
      categories: "/superadmin/categories",
      orders: "/superadmin/orders",
      users: "/superadmin/users",
      settings: "/superadmin/settings",
      analytics: "/superadmin/analytics",
      inquiries: "/superadmin/inquiries",
      dashboard: "/superadmin/dashboard",
            // Analytics specific endpoints
      "analytics/dashboard": "/superadmin/analytics/dashboard",
      "analytics/sales": "/superadmin/analytics/sales",
      "analytics/products": "/superadmin/analytics/products",
      "analytics/users": "/superadmin/analytics/users"
    },
    admin: {
      products: "/superadmin/products",
      categories: "/manager/categories",
      reviews: "/manager/reviews",
      orders: "/superadmin/orders",
      inquiries: "/superadmin/inquiries",
      dashboard: "/superadmin/dashboard",
      users: "/superadmin/users",
    },
    salesAdmin: {
      orders: "/sales/orders",
      invoices: "/sales/invoices",
      customers: "/sales/customers",
      dashboard: "/superadmin/dashboard",
      users: "/superadmin/users",
      inquiries: "/superadmin/inquiries",
    },
  };

  // Get the endpoint based on the user role
  if (role === "Super Admin" && endpoints.superAdmin[resource]) {
    return endpoints.superAdmin[resource];
  } else if (role === "Product Manager" && endpoints.admin[resource]) {
    return endpoints.admin[resource];
  } else if (role === "Sales Admin" && endpoints.salesAdmin[resource]) {
    return endpoints.salesAdmin[resource];
  }

  // Fallback to a default endpoint
  return `/${resource}`;
};

export const dataProvider = (role = "Super Admin") => ({
  getList: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;

    const endpoint = getEndpoint(resource, role);

    const query = {
      page,
      limit: perPage,
      sortBy: field,
      sortOrder: order,
      ...params.filter,
    };

    const url = `${apiUrl}${endpoint}?${stringify(query)}`;

    return httpClient(url, {
      headers: new Headers({
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }),
    }).then(({ json }) => {
      // Handle different response formats
      let data = [];
      let total = 0;

      // Handle users endpoint specifically
      if (resource === "users" && json.data) {
        data = json.data;
        total = json.total || 0;
      }
      // Handle inquiries endpoint specifically
      else if (resource === "inquiries" && json.inquiries) {
        data = json.inquiries;
        total = json.pagination
          ? json.pagination.total
          : json.total || json.count || json.inquiries.length;
      }
      // Handle other endpoints
      else {
        data = json[resource] || json.rows || json.data || json;
        total = json.pagination
          ? json.pagination.total
          : json.total || json.count || json.length;
      }

      return {
        data,
        total,
      };
    });
  },

  getOne: (resource, params) => {
    const endpoint = getEndpoint(resource, role);

    return httpClient(`${apiUrl}${endpoint}/${params.id}`, {
      headers: new Headers({
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }),
    }).then(({ json }) => {
      // Handle inquiries specifically
      if (resource === "inquiries" && json.inquiry) {
        return { data: json.inquiry };
      }

      // Handle products with images
      if (resource === "products") {
        const product = json.product || json;

        // Transform images for react-admin ImageInput/ImageField
        if (product && product.images && Array.isArray(product.images)) {
          // Create a file array for the ImageInput component
          const transformedImages = product.images.map((image) => ({
            id: image.id,
            src: image.imageUrl, // Use imageUrl as src for ImageField
            title: image.altText || image.title || "Product Image", // Use altText or title for the title
            rawFile: null, // No rawFile for existing images
          }));

          // Replace the images array with the transformed one
          product.file = transformedImages;
        }

        return { data: product };
      }

      // Default handling
      return {
        data: json[resource.slice(0, -1)] || json,
      };
    });
  },

  getMany: (resource, params) => {
    const endpoint = getEndpoint(resource, role);

    // Special handling for users resource
    if (resource === "users") {
      const query = {
        ids: params.ids.join(","),
      };

      const url = `${apiUrl}${endpoint}/many?${stringify(query)}`;

      return httpClient(url, {
        headers: new Headers({
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }),
      }).then(({ json }) => ({
        data: json,
      }));
    }

    // Special handling for products resource
    if (resource === "products") {
      // Make individual requests for each product
      const promises = params.ids.map((id) =>
        httpClient(`${apiUrl}${endpoint}/${id}`, {
          headers: new Headers({
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }),
        }).then(({ json }) => {
          // Ensure each item has an id
          const product = json.product || json;
          if (product && !product.id) {
            product.id = id;
          }

          // Transform images for react-admin ImageInput/ImageField
          if (product && product.images && Array.isArray(product.images)) {
            // Create a file array for the ImageInput component
            const transformedImages = product.images.map((image) => ({
              id: image.id,
              src: image.imageUrl, // Use imageUrl as src for ImageField
              title: image.altText || image.title || "Product Image", // Use altText or title for the title
              rawFile: null, // No rawFile for existing images
            }));

            // Replace the images array with the transformed one
            product.file = transformedImages;
          }

          return product;
        })
      );

      return Promise.all(promises).then((results) => ({
        data: results,
      }));
    }

    // Default behavior for other resources
    const url = `${apiUrl}${endpoint}/${params.ids}`;

    return httpClient(url, {
      headers: new Headers({
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }),
    }).then(({ json }) => {
      // If the response already has a data property that's an array, use it
      if (json.data && Array.isArray(json.data)) {
        return { data: json.data };
      }

      // If the response is an array, use it directly
      if (Array.isArray(json)) {
        return { data: json };
      }

      // If the response has a property matching the resource name that's an array, use it
      if (json[resource] && Array.isArray(json[resource])) {
        return { data: json[resource] };
      }

      // Last resort: wrap the response in an array if it's not already one
      const result = Array.isArray(json) ? json : [json];

      // Ensure each item has an id
      result.forEach((item) => {
        if (!item.id && params.ids.length === 1) {
          item.id = params.ids[0];
        }
      });

      return { data: result };
    });
  },

  getManyReference: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;

    const endpoint = getEndpoint(resource, role);

    const query = {
      page,
      limit: perPage,
      sortBy: field,
      sortOrder: order,
      [params.target]: params.id,
      ...params.filter,
    };

    const url = `${apiUrl}${endpoint}?${stringify(query)}`;

    return httpClient(url, {
      headers: new Headers({
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }),
    }).then(({ json }) => {
      // Handle different response formats
      let data = [];
      let total = 0;

      // Handle users endpoint specifically
      if (resource === "users" && json.data) {
        data = json.data;
        total = json.total || 0;
      }
      // Handle inquiries endpoint specifically
      else if (resource === "inquiries" && json.inquiries) {
        data = json.inquiries;
        total = json.pagination
          ? json.pagination.total
          : json.total || json.count || json.inquiries.length;
      }
      // Handle other endpoints
      else {
        data = json[resource] || json.rows || json.data || json;
        total = json.pagination
          ? json.pagination.total
          : json.total || json.count || json.length;
      }

      return {
        data,
        total,
      };
    });
  },

  create: (resource, params) => {
    const endpoint = getEndpoint(resource, role);

    // Check if we have a file upload
    if (params.data.file) {
      // Create a FormData object
      const formData = new FormData();

      // Handle multiple files
      if (Array.isArray(params.data.file)) {
        // Multiple files
        params.data.file.forEach((fileItem) => {
          if (fileItem && fileItem.rawFile) {
            formData.append("files", fileItem.rawFile); // Use 'files' for multiple file uploads
          }
        });
      } else if (params.data.file && params.data.file.rawFile) {
        // Single file
        formData.append("file", params.data.file.rawFile);
      }

      // Add other data fields
      Object.keys(params.data).forEach((key) => {
        if (key !== "file") {
          formData.append(key, params.data[key]);
        }
      });

      // Use fetch directly to handle FormData
      return fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        body: formData,
        headers: new Headers({
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          // Don't set Content-Type, let the browser set it with the boundary
        }),
      })
        .then((response) => response.json())
        .then((json) => ({
          data: {
            ...params.data,
            id: json.id || json.product?.id || json[resource.slice(0, -1)]?.id,
          },
        }));
    }

    // Regular JSON request if no file
    return httpClient(`${apiUrl}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(params.data),
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }),
    }).then(({ json }) => ({
      data: {
        ...params.data,
        id: json.id || json.product?.id || json[resource.slice(0, -1)]?.id,
      },
    }));
  },

  update: (resource, params) => {
    const endpoint = getEndpoint(resource, role);

    // Check if we have a file upload
    if (params.data.file) {
      // Create a FormData object
      const formData = new FormData();

      // Handle multiple files
      if (Array.isArray(params.data.file)) {
        // Multiple files
        params.data.file.forEach((fileItem) => {
          if (fileItem) {
            if (fileItem.rawFile) {
              formData.append("files", fileItem.rawFile); // Use 'files' for multiple file uploads
            }
          }
        });
      } else if (params.data.file && params.data.file.rawFile) {
        // Single file
        formData.append("file", params.data.file.rawFile);
      }

      // Add other data fields
      Object.keys(params.data).forEach((key) => {
        if (key !== "file") {
          formData.append(key, params.data[key]);
        }
      });

      // Use fetch directly to handle FormData
      return fetch(`${apiUrl}${endpoint}/${params.id}`, {
        method: "PUT",
        body: formData,
        headers: new Headers({
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          // Don't set Content-Type, let the browser set it with the boundary
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          // Ensure the response has an id field
          const responseData =
            json.product || json[resource.slice(0, -1)] || json;

          // If the data doesn't have an id but json has one, use that
          if (responseData && !responseData.id && json.id) {
            responseData.id = json.id;
          }

          // If we still don't have an id, use the one from params
          if (responseData && !responseData.id) {
            responseData.id = params.id;
          }

          return {
            data: responseData,
          };
        });
    }

    // Regular JSON request if no file
    return httpClient(`${apiUrl}${endpoint}/${params.id}`, {
      method: "PUT",
      body: JSON.stringify(params.data),
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }),
    }).then(({ json }) => {
      // Ensure the response has an id field
      const responseData = json.product || json[resource.slice(0, -1)] || json;

      // If the data doesn't have an id but json has one, use that
      if (responseData && !responseData.id && json.id) {
        responseData.id = json.id;
      }

      // If we still don't have an id, use the one from params
      if (responseData && !responseData.id) {
        responseData.id = params.id;
      }

      return {
        data: responseData,
      };
    });
  },

  updateMany: (resource, params) => {
    const endpoint = getEndpoint(resource, role);

    const query = {
      ids: params.ids.join(","),
    };

    return httpClient(`${apiUrl}${endpoint}?${stringify(query)}`, {
      method: "PUT",
      body: JSON.stringify(params.data),
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }),
    }).then(({ json }) => ({
      data: json,
    }));
  },

  delete: (resource, params) => {
    const endpoint = getEndpoint(resource, role);

    return httpClient(`${apiUrl}${endpoint}/${params.id}`, {
      method: "DELETE",
      headers: new Headers({
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }),
    }).then(({ json }) => ({
      data: json,
    }));
  },

  deleteMany: (resource, params) => {
    const endpoint = getEndpoint(resource, role);

    const query = {
      ids: params.ids.join(","),
    };

    return httpClient(`${apiUrl}${endpoint}?${stringify(query)}`, {
      method: "DELETE",
      headers: new Headers({
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }),
    }).then(({ json }) => ({
      data: json,
    }));
  },

  // Custom query method for dashboard and other special endpoints
  customQuery: (params) => {
    const { type, resource, payload } = params;
    const endpoint = getEndpoint(resource, role);

    switch (type) {
      case "GET_DASHBOARD_SUMMARY":
        // Fetch dashboard summary data
        return httpClient(
          `${apiUrl}${getEndpoint("dashboard/summary", role)}`,
          {
            headers: new Headers({
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }),
          }
        ).then(({ json }) => ({
          data: json,
        }));

      case "GET_ONE":
        // Handle GET_ONE without an ID
        // Check if payload exists before trying to access its properties
        if (!payload || !payload.id) {
          return httpClient(`${apiUrl}${endpoint}`, {
            headers: new Headers({
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }),
          }).then(({ json }) => ({
            data: json,
          }));
        }

        // Default behavior with ID
        return httpClient(`${apiUrl}${endpoint}/${payload.id}`, {
          headers: new Headers({
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }),
        }).then(({ json }) => ({
          data: json,
        }));

      case "POST_ONE":
        // Special handling for settings/basic endpoint
        if (resource === "settings" && payload.id === "basic") {
          return httpClient(`${apiUrl}${endpoint}/basic`, {
            method: "POST",
            body: JSON.stringify(payload.data),
            headers: new Headers({
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }),
          }).then(({ json }) => ({
            data: json,
          }));
        }

        // Default POST_ONE behavior
        return httpClient(`${apiUrl}${endpoint}/${payload.id}`, {
          method: "POST",
          body: JSON.stringify(payload.data),
          headers: new Headers({
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }),
        }).then(({ json }) => ({
          data: json,
        }));

      default:
        throw new Error(`Unsupported custom query type: ${type}`);
    }
  },

  // Custom method to fetch dashboard data
  getDashboardSummary: () => {
    return httpClient(`${apiUrl}${getEndpoint("dashboard/summary", role)}`, {
      headers: new Headers({
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }),
    }).then(({ json }) => json);
  },
});
