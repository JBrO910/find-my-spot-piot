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
  Log.tag("socket").trace(id, status, "UPDATE")
  socket.emit("update", id, parseInt(status));
};

export const emitLoadSpots = (spots, gates) => {
  socket.emit("loadSpotsResponse", { spots, gates });
};

export const listenToLoadSpots = (callback) => {
  socket.on("loadSpots", callback);
};

export const listenToReadCard = (callback) => {
  socket.on("readCard", callback);
};

export const listenToBlinkMaintain = (callback) => {
  socket.on("blink", callback);
};

export const listenToTurnOnMaintain = (callback) => {
  socket.on("turnOn", callback);
};

export const listenToTurnOffMaintain = (callback) => {
  socket.on("turnOff", callback);
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

export const emitResultOfReadCard = (callback) => {
  socket.emit("readCardResult", callback);
};
