export interface AddressData {
  address: string;
  city: string;
  state: string;
  country: string;
}

export function parseAddress(local: string): AddressData {
  const [address = "", city = "", state = "", country = ""] =
    local.split(" \\ ").map((item) => item.trim());
  return {
    address,
    city,
    state,
    country,
  };
}