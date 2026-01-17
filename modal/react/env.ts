/// <reference types="vite/client" />

import { z } from "zod";

const envVariables = z.object({
  CHAINRAILS_API_KEY: z.string(),
});

envVariables.parse(import.meta.env);
