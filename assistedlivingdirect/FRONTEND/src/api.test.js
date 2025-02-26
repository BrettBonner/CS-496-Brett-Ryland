import axios from "axios";
import { getFacilities, getFacilityById, FacilityHandler, updateFacility, deleteFacility } from "./api";

// Mocks axios library so as to not make real requests
jest.mock("axios");

describe("Frontend API Functions", () => {
  
  afterEach(() => {
    // Clear mocks after each test
    jest.clearAllMocks();
  });

  test("getFacilities returns data on success", async () => {
    axios.get.mockResolvedValue({ data: [{ id: 1, name: "Facility Test" }] });
    const data = await getFacilities();
    expect(data).toEqual([{ id: 1, name: "Facility Test" }]);
  });

  test("getFacilities returns null on failure", async () => {
    axios.get.mockRejectedValue(new Error("Fetch failed"));
    const data = await getFacilities();
    expect(data).toBeNull();
  });

  test("getFacilityById returns facility data on success", async () => {
    axios.get.mockResolvedValue({ data: { id: 1, name: "Test Facility" } });
    const data = await getFacilityById(1);
    expect(data).toEqual({ id: 1, name: "Test Facility" });
  });

  test("getFacilityById returns null on failure", async () => {
    axios.get.mockRejectedValue(new Error("Fetch failed"));
    const data = await getFacilityById(1);
    expect(data).toBeNull();
  });

  test("FacilityHandler successfully creates a facility", async () => {
    const facilityData = { name: "New Facility" };
    const imageBase64 = "base64string";
    axios.post.mockResolvedValue({ data: { id: 2, ...facilityData, imageURL: imageBase64 } });

    const data = await FacilityHandler(facilityData, imageBase64);
    expect(data).toEqual({ id: 2, ...facilityData, imageURL: imageBase64 });
  });

  test("FacilityHandler throws error on failure", async () => {
    axios.post.mockRejectedValue(new Error("Create failed"));
    
    await expect(FacilityHandler({}, "image")).rejects.toThrow("Create failed");
  });

  test("updateFacility successfully updates a facility", async () => {
    const facilityData = { name: "Updated Facility" };
    const imageBase64 = "newBase64";
    axios.put.mockResolvedValue({ data: { id: 3, ...facilityData, imageURL: imageBase64 } });

    const data = await updateFacility(3, facilityData, imageBase64);
    expect(data).toEqual({ id: 3, ...facilityData, imageURL: imageBase64 });
  });

  test("updateFacility throws error on failure", async () => {
    axios.put.mockRejectedValue(new Error("Update failed"));

    await expect(updateFacility(3, {}, "image")).rejects.toThrow("Update failed");
  });

  test("deleteFacility successfully deletes a facility", async () => {
    axios.delete.mockResolvedValue({ data: { message: "Deleted successfully" } });

    const data = await deleteFacility(4);
    expect(data).toEqual({ message: "Deleted successfully" });
  });

  test("deleteFacility returns null on failure", async () => {
    axios.delete.mockRejectedValue(new Error("Delete failed"));

    const data = await deleteFacility(4);
    expect(data).toBeNull();
  });
});