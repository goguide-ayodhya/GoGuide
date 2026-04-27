export type RideData = {
  pickup: string;
  destination: string;
  vehicleType: "auto" | "car" | "moto";
};


export type Fare = {
  auto: number;
  car: number;
  moto: number;
};

export type VehicleType = "auto" | "car" | "moto";