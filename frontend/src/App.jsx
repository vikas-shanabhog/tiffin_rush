import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import RestaurantMenu from "./pages/RestaurantMenu.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderTracking from "./pages/OrderTracking.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import RestaurantDashboard from "./pages/RestaurantDashboard.jsx";
import RestaurantReviews from "./pages/RestaurantReviews.jsx";
import MenuItemReviews from "./pages/MenuItemReviews.jsx";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/restaurants/:id" element={<RestaurantMenu />} />
        <Route path="/restaurants/:id/reviews" element={<RestaurantReviews />} />
        <Route path="/menu/:id/reviews" element={<MenuItemReviews />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/cart"
          element={
            <ProtectedRoute roles={["customer"]}>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute roles={["customer"]}>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute roles={["customer"]}>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderTracking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["restaurant"]}>
              <RestaurantDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
