import { Log } from "./logger";
import {
  emitKeepAliveSpot,
  emitLoadSpots,
  emitUpdateSpot,
  listenToLoadSpots,
} from "./socket";
import { genHexString, sleep } from "./utils";

const LOG_TAG = "Demo-Distributor";

const register = async (
  spotStates,
  amountOfControllers,
  spotsPerController = 4
) => {
  const registeredSpots = [];

  return new Promise((resolve, reject) => {
    Log.tag(LOG_TAG).info("Listen to register");

    listenToLoadSpots(async () => {
      // Clear all spots
      registeredSpots.splice(0)

      Log.tag(LOG_TAG).info("Loading Spots requested");

      for (let i = 0; i < amountOfControllers; i++) {
        const id = genHexString(8);
        for (let j = 1; j <= spotsPerController; j++) {
          const spotId = id + "-" + String(j).padStart(3, "0");

          registeredSpots.push(spotId);
          spotStates[spotId] = 0;
        }
      }

      Log.tag(LOG_TAG).trace(`Register ${registeredSpots.length} spots`);

      emitLoadSpots(registeredSpots);
      Log.tag(LOG_TAG).info("Done registering");

      let timeoutCheck = 0;
      const TIMEOUT = 60 * 5 // * 5 minutes
      // ! Check 5 minutes for registration, otherwise just exit to limit resource consumption
      while (registeredSpots.length > 0 && timeoutCheck++ <= TIMEOUT) {
        await sleep(1000);
      }

      if (timeoutCheck >= TIMEOUT) {
        reject("Timed out");
      }

      resolve();
    });
  });
};

export default async function setupMockBroker(
  useRegister,
  amountOfControllers = 10,
  timeBetween = 4000,
  chanceToSkip = 0.8
) {
  Log.tag(LOG_TAG).info("Starting up");

  const spotStates = {};

  if (useRegister) {
    await register(spotStates, amountOfControllers).catch((err) => {
      Log.tag(LOG_TAG).error("Registration failed", err);
      process.exit(1);
    });
  }

  Log.tag(LOG_TAG).info("Starting Simulation");

  const doUpdateSpot = (id, status) => () =>
    emitUpdateSpot(
      JSON.stringify({
        id,
        status,
      })
    );

  // * Simulate Spots
  for (let run = 0; run <= 10; run++) {
    Log.tag(LOG_TAG).trace("Run", run + 1);

    for (let id of Object.keys(spotStates)) {
      emitKeepAliveSpot(JSON.stringify({ id }));

      if (Math.random() <= chanceToSkip) {
        continue;
      }

      const status = +!spotStates[id];
      spotStates[id] = status;

      setTimeout(doUpdateSpot(id, status), Math.random() * timeBetween);
    }

    await sleep(timeBetween);
  }

  Log.tag(LOG_TAG).info("Finished Simulation");
  Log.tag(LOG_TAG).info("Done");

  process.exit(0);
}
