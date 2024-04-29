import { Client } from "@modelon/impact-client-js";
import isDev from "./isDev";

const createClient = async () => {
  if (isDev()) {
    return Client.fromImpactApiKey({
      impactApiKey: process.env.MODELON_IMPACT_API_KEY,
    });
  } else {
    return Client.fromImpactSession({});
  }
};

export default createClient;
