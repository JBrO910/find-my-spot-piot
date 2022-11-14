import { config } from "dotenv";
import setupMockBroker from "./MockBroker";
import setupMQTTBroker from "./MQTTBroker";

config();

const useMock = ["--mock", "-m"].some((flag) => process.argv.includes(flag));
const useRegister = ["--register", "-r"].some((flag) =>
  process.argv.includes(flag)
);

if (useMock) {
  setupMockBroker(useRegister);
} else {
  setupMQTTBroker();
}
