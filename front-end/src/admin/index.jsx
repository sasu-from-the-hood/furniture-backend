import React, { useContext, useMemo } from "react";
import { Admin, Resource } from "react-admin";
import { ShopContext } from "../compontes/context/ShopContext";
import { dataProvider } from "./dataProvider/index.jsx";

// Import resources
import {
  ProductList,
  ProductEdit,
  ProductCreate,
} from "./resources/products.jsx";
import {
  CategoryList,
  CategoryEdit,
  CategoryCreate,
} from "./resources/categories.jsx";
import { OrderList } from "./resources/orders.jsx";
import { ManagerOrderList } from "./resources/managerOrder.jsx";
import { UserList, UserEdit, UserCreate } from "./resources/users.jsx";
import { InquiryList } from "./resources/inquiries.jsx";
import HomeRedirect from "./resources/home.jsx";
// Import pages
import Dashboard from "./pages/Dashboard.jsx";
import NotFound from "./pages/NotFound.jsx";
import SiteSettingsPage from "./resources/settings.jsx";

// Import icons
import {
  ShoppingCart as OrderIcon,
  Category as CategoryIcon,
  People as UserIcon,
  Inventory as ProductIcon,
  Settings as SettingIcon,
  Email as InquiryIcon,
  Receipt as InvoiceIcon,
  Star as ReviewIcon,
  Assessment as AnalyticsIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import AnalyticsPage from "./resources/analtics.jsx";

const AdminApp = () => {
  const { userRole, token } = useContext(ShopContext);

  // Create data provider with user role
  const adminDataProvider = useMemo(() => dataProvider(userRole), [userRole]);

  // Define resources based on user role
  const getResources = () => {
    switch (userRole) {
      case "Super Admin":
        return (
          <>
            <Resource
              name="home"
              list={HomeRedirect}
              icon={HomeIcon}
              options={{ label: "Go to Home" }}
            />
            <Resource
              name="products"
              list={ProductList}
              edit={ProductEdit}
              create={ProductCreate}
              icon={ProductIcon}
            />
            <Resource
              name="categories"
              list={CategoryList}
              edit={CategoryEdit}
              create={CategoryCreate}
              icon={CategoryIcon}
            />
            <Resource name="orders" list={OrderList} icon={OrderIcon} />
            <Resource
              name="users"
              list={UserList}
              edit={UserEdit}
              create={UserCreate}
              icon={UserIcon}
            />
            <Resource
              name="settings"
              list={SiteSettingsPage}
              icon={SettingIcon}
            />
            <Resource name="inquiries" list={InquiryList} icon={InquiryIcon} />
            <Resource name="analytics" icon={AnalyticsIcon}  list={AnalyticsPage} />
          </>
        );

      case "Product Manager":
        return (
          <>
            <Resource
              name="home"
              list={HomeRedirect}
              icon={HomeIcon}
              options={{ label: "Go to Home" }}
            />
            <Resource
              name="products"
              list={ProductList}
              edit={ProductEdit}
              create={ProductCreate}
              icon={ProductIcon}
            />
            {/* <Resource
              name="orders"
              list={ManagerOrderList}
              icon={OrderIcon}
            /> */}
            {/* <Resource
              name="inquiries"
              list={InquiryList}
              icon={InquiryIcon}
            /> */}
            <Resource name="reviews" icon={ReviewIcon} />
          </>
        );

      case "Sales Admin":
        return (
          <>
            <Resource
              name="home"
              list={HomeRedirect}
              icon={HomeIcon}
              options={{ label: "Go to Home" }}
            />
            <Resource name="orders" list={ManagerOrderList} icon={OrderIcon} />
            <Resource name="inquiries" list={InquiryList} icon={InquiryIcon} />
            <Resource name="invoices" icon={InvoiceIcon} />
            <Resource name="customers" icon={UserIcon} />
          </>
        );

      default:
        return null;
    }
  };

  if (
    !token ||
    !["Super Admin", "Product Manager", "Sales Admin"].includes(userRole)
  ) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don&apos;t have permission to access the admin dashboard.</p>
      </div>
    );
  }

  return (
    <Admin
      dataProvider={adminDataProvider}
      dashboard={Dashboard}
      catchAll={NotFound}
      title="Furniture Catalog Admin"
    >
      {getResources()}
    </Admin>
  );
};

export default AdminApp;
