
type operationMode = "SETUP" | "NORMAL" | "DFU" | "UNKNOWN"

interface dashboardState {
  state: crownstoneState
}

interface crownstoneState {
  connected: boolean,
  simulated: boolean,
  name: string,
  macAddress: string,
  mode: operationMode,  // "SETUP" | "NORMAL" | "DFU"
  radioOn: boolean,
  meshEnabled: boolean,
  relayOn: boolean,
  igbtState: number,
  updatedAt: number,
}