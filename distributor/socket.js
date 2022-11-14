import { config } from "dotenv";
import { io } from "socket.io-client";
import { Log } from "./logger";

config();

const socket = io(
  `${process.env.SOCKET_SERVER_ADDRESS}/${process.env.GARAGE_ID}-broker`
);

socket.on("connect", () => Log.info("Connected to Socket"));
socket.on("connect_error", (err) => Log.error("Connection error in socket", err.message));

export const mqttToSocketEmit = (emitEvent) => (message) =>
  emitEvent(JSON.parse(message.toString()));

export const emitKeepAliveSpot = ({ id }) => {
  socket.emit("keepAlive", id);
};

export const emitUpdateSpot = ({ id, status }) => {
  socket.emit("update", id, parseInt(status));
};

export const emitLoadSpots = (spots) => {
  socket.emit("loadSpotsResponse", { spots });
};

// TODO Check if this is not already registered
export const listenToLoadSpots = (callback) => {
  socket.on("loadSpots", callback);
};
