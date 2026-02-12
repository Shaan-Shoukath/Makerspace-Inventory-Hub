// Mock data and API service layer
// Replace these functions with actual Google Apps Script API calls

export interface Component {
  id: string;
  name: string;
  case: string;
  category: "sensor" | "motor" | "module" | "wire" | "display" | "power" | "board" | "other";
  totalStock: number;
  availableStock: number;
}

export interface BorrowRecord {
  id: string;
  userHubId: string;
  componentId: string;
  componentName: string;
  caseName: string;
  quantity: number;
  borrowedAt: string;
  returned: boolean;
}

// Mock inventory data
const mockComponents: Component[] = [
  { id: "1", name: "Arduino Uno R3", case: "Case A - Microcontrollers", category: "board", totalStock: 12, availableStock: 8 },
  { id: "2", name: "ESP32 DevKit", case: "Case A - Microcontrollers", category: "board", totalStock: 10, availableStock: 6 },
  { id: "3", name: "Raspberry Pi 4B", case: "Case A - Microcontrollers", category: "board", totalStock: 5, availableStock: 3 },
  { id: "4", name: "HC-SR04 Ultrasonic Sensor", case: "Case B - Sensors", category: "sensor", totalStock: 20, availableStock: 15 },
  { id: "5", name: "DHT11 Temperature Sensor", case: "Case B - Sensors", category: "sensor", totalStock: 15, availableStock: 12 },
  { id: "6", name: "PIR Motion Sensor", case: "Case B - Sensors", category: "sensor", totalStock: 10, availableStock: 7 },
  { id: "7", name: "IR Sensor Module", case: "Case B - Sensors", category: "sensor", totalStock: 18, availableStock: 14 },
  { id: "8", name: "SG90 Servo Motor", case: "Case C - Motors & Actuators", category: "motor", totalStock: 15, availableStock: 10 },
  { id: "9", name: "DC Motor 5V", case: "Case C - Motors & Actuators", category: "motor", totalStock: 20, availableStock: 16 },
  { id: "10", name: "Stepper Motor 28BYJ-48", case: "Case C - Motors & Actuators", category: "motor", totalStock: 8, availableStock: 5 },
  { id: "11", name: "L298N Motor Driver", case: "Case C - Motors & Actuators", category: "module", totalStock: 10, availableStock: 8 },
  { id: "12", name: "16x2 LCD Display", case: "Case D - Displays & LEDs", category: "display", totalStock: 10, availableStock: 7 },
  { id: "13", name: "0.96\" OLED Display", case: "Case D - Displays & LEDs", category: "display", totalStock: 8, availableStock: 5 },
  { id: "14", name: "LED Pack (Assorted)", case: "Case D - Displays & LEDs", category: "display", totalStock: 30, availableStock: 25 },
  { id: "15", name: "Relay Module 4-Channel", case: "Case E - Modules", category: "module", totalStock: 6, availableStock: 4 },
  { id: "16", name: "Bluetooth HC-05", case: "Case E - Modules", category: "module", totalStock: 10, availableStock: 7 },
  { id: "17", name: "ESP8266 WiFi Module", case: "Case E - Modules", category: "module", totalStock: 12, availableStock: 9 },
  { id: "18", name: "Jumper Wires (M-M) 40pcs", case: "Case F - Wires & Connectors", category: "wire", totalStock: 25, availableStock: 20 },
  { id: "19", name: "Jumper Wires (M-F) 40pcs", case: "Case F - Wires & Connectors", category: "wire", totalStock: 25, availableStock: 18 },
  { id: "20", name: "Breadboard 830-Point", case: "Case F - Wires & Connectors", category: "wire", totalStock: 15, availableStock: 11 },
  { id: "21", name: "9V Battery + Connector", case: "Case G - Power", category: "power", totalStock: 20, availableStock: 14 },
  { id: "22", name: "LM7805 Voltage Regulator", case: "Case G - Power", category: "power", totalStock: 15, availableStock: 12 },
];

let mockBorrowRecords: BorrowRecord[] = [
  { id: "b1", userHubId: "TH001", componentId: "1", componentName: "Arduino Uno R3", caseName: "Case A - Microcontrollers", quantity: 2, borrowedAt: "2025-02-10", returned: false },
  { id: "b2", userHubId: "TH001", componentId: "4", componentName: "HC-SR04 Ultrasonic Sensor", caseName: "Case B - Sensors", quantity: 3, borrowedAt: "2025-02-11", returned: false },
  { id: "b3", userHubId: "TH002", componentId: "8", componentName: "SG90 Servo Motor", caseName: "Case C - Motors & Actuators", quantity: 1, borrowedAt: "2025-02-09", returned: false },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API functions — replace with Google Apps Script fetch calls
export async function fetchComponents(): Promise<Component[]> {
  await delay(300);
  return [...mockComponents];
}

export async function fetchCases(): Promise<string[]> {
  await delay(200);
  return [...new Set(mockComponents.map(c => c.case))];
}

export async function fetchComponentsByCase(caseName: string): Promise<Component[]> {
  await delay(200);
  return mockComponents.filter(c => c.case === caseName);
}

export async function borrowComponent(userHubId: string, componentId: string, quantity: number): Promise<{ success: boolean; message: string }> {
  await delay(500);
  const component = mockComponents.find(c => c.id === componentId);
  if (!component) return { success: false, message: "Component not found." };
  if (component.availableStock < quantity) return { success: false, message: `Only ${component.availableStock} available.` };
  
  component.availableStock -= quantity;
  mockBorrowRecords.push({
    id: `b${Date.now()}`,
    userHubId,
    componentId,
    componentName: component.name,
    caseName: component.case,
    quantity,
    borrowedAt: new Date().toISOString().split("T")[0],
    returned: false,
  });
  return { success: true, message: `Successfully borrowed ${quantity}x ${component.name}!` };
}

export async function fetchBorrowedByUser(userHubId: string): Promise<BorrowRecord[]> {
  await delay(300);
  return mockBorrowRecords.filter(r => r.userHubId === userHubId && !r.returned);
}

export async function returnComponent(recordId: string, quantity: number): Promise<{ success: boolean; message: string }> {
  await delay(500);
  const record = mockBorrowRecords.find(r => r.id === recordId);
  if (!record) return { success: false, message: "Record not found." };
  if (quantity > record.quantity) return { success: false, message: `You only borrowed ${record.quantity}.` };

  const component = mockComponents.find(c => c.id === record.componentId);
  if (component) component.availableStock += quantity;

  if (quantity === record.quantity) {
    record.returned = true;
  } else {
    record.quantity -= quantity;
  }
  return { success: true, message: `Successfully returned ${quantity} item(s)!` };
}
