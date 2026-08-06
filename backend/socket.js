// Socket.io room strategy:
//  - "restaurant:<id>"  -> restaurant dashboard listens for new orders / payments
//  - "order:<id>"       -> customer's order-tracking page listens for status + live location
export const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    socket.on("join_restaurant", (restaurantId) => {
      socket.join(`restaurant:${restaurantId}`);
    });

    socket.on("join_order", (orderId) => {
      socket.join(`order:${orderId}`);
    });

    socket.on("delivery_location_update", ({ orderId, lat, lng }) => {
      // Delivery partner's app can also push location purely over sockets
      io.to(`order:${orderId}`).emit("delivery_location", { orderId, lat, lng });
    });

    socket.on("disconnect", () => {});
  });
};
