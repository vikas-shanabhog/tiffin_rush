import { io } from "socket.io-client";

// One shared socket for the whole app; connects lazily to the backend origin.
export const socket = io("/", { autoConnect: true, path: "/socket.io" });
