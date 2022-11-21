import { config } from "dotenv";
import { io } from "socket.io-client";
import { Log } from "./logger";

config();

const socket = io(
  `${process.env.SOCKET_SERVER_ADDRESS}/${process.env.GARAGE_ID}-broker`
);

socket.on("connect", () => Log.tag("socket").info("Connected to Socket"));
socket.on("connect_error", (err) => Log.tag("socket").error("Connection error in socket", err.message));

export const mqttParseMessage = (emitEvent) => (message) =>
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

export const listenToLoadSpots = (callback) => {
  socket.on("loadSpots", callback);
};

export const listenToBlinkMaintain = (callback) => {
  socket.on("blink", callback);
};

export const listenToMeasureMaintain = (callback) => {
  socket.on("measure", callback);
};

export const listenToRegisterMaintain = (callback) => {
  socket.on("register", callback);
};

export const emitResultOfMeasureMaintain = (callback) => {
  socket.emit("measureResult", callback);
};
