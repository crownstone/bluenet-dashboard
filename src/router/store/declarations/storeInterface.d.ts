
type operationMode = "SETUP" | "NORMAL" | "DFU" | "UNKNOWN"

interface dashboardState {
  state: crownstoneState,
  adc: any
}

interface crownstoneState {
  connected: boolean,
  simulated: boolean,
  name: string,
  macAddress: string,
  mode: operationMode,  // "SETUP" | "NORMAL" | "DFU" | "UNKNOWN"
  radioEnabled: boolean,
  advertisementsEnabled: boolean,
  meshEnabled: boolean,
  relayEnabled: boolean,
  igbtState: number,

  voltageRange: number,
  currentRange: number,
  differentialVoltage: boolean,
  differentialCurrent: boolean,
  measureReference: boolean,

  updatedAt: number,
}