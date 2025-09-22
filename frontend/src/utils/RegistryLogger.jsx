import { createActor as createRegistryActor } from "declarations/Registry_backend"; 
import { canisterId as registryCanisterId } from "declarations/Registry_backend";

/**
 * Catat aktivitas ke registry dengan retry backoff
 * @param {object} identity - Identity dari authClient
 * @param {string} principal - Principal user
 * @param {object} activityType  - Enum activity { IdentityVerified: [] } atau { DocumentUploaded: [] }
 * @param {string} message - Pesan log
 */
export const logActivity = async (identity, principal, activityType, message) => {
  try {
    const registryActor = createRegistryActor(registryCanisterId, {
      agentOptions: { identity },
    });

    const retryWithBackoff = async (fn, retries = 3, delay = 1000) => {
      try {
        return await fn();
      } catch (err) {
        if (retries <= 0) throw err;
        await new Promise(res => setTimeout(res, delay));
        return retryWithBackoff(fn, retries - 1, delay * 2);
      }
    };
    
    console.log("Sending activityType to registry:", JSON.stringify(activityType));

    await retryWithBackoff(() =>
      registryActor.recordActivity(
        principal,
        activityType,
        message
      )
    );

    console.log("Registry log recorded:", message);
  } catch (err) {
    console.error("Registry log failed:", err);
  }
};
