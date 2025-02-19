import axios from "axios";
import { getFacilities } from "./api";

// Mocks axios library so as to not make real requests
jest.mock("axios");

test("getFacilities returns data on success", async () => {
  axios.get.mockResolvedValue({ status: 200, data: [{ id: 1, name: "Facility Test" }] });

  // Calls real API function, but internally uses the mocked axios
  const data = await getFacilities();
  expect(data).toEqual([{ id: 1, name: "Facility Test" }]);
});
