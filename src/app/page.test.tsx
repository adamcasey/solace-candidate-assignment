import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import Home from "./page";

describe("Home Page", () => {
  let fetchMock: Mock;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the page with header and search elements", () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({ data: [] }),
    });

    render(<Home />);

    expect(screen.getByText("Solace Advocates")).toBeInTheDocument();
    expect(screen.getByText("Find your advocate")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search by name, specialty, or location...")
    ).toBeInTheDocument();
  });

  it("fetches and displays advocates on initial load", async () => {
    const mockAdvocates = [
      {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        city: "New York",
        degree: "MD",
        specialties: ["Anxiety", "Depression"],
        yearsOfExperience: 10,
        phoneNumber: "555-1234",
      },
      {
        id: 2,
        firstName: "Jane",
        lastName: "Smith",
        city: "Los Angeles",
        degree: "PhD",
        specialties: ["ADHD"],
        yearsOfExperience: 5,
        phoneNumber: "555-5678",
      },
    ];

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockAdvocates }),
    });

    render(<Home />);

    await waitFor(
      () => {
        expect(screen.getByText("John Doe, MD")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    expect(screen.getByText("Jane Smith, PhD")).toBeInTheDocument();
    expect(screen.getByText("2 advocates available")).toBeInTheDocument();
  });

  it("displays empty state when no advocates are found", async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({ data: [] }),
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("No advocates found")).toBeInTheDocument();
      expect(
        screen.getByText("Try adjusting your search or filters")
      ).toBeInTheDocument();
    });

    expect(screen.getByText("0 advocates available")).toBeInTheDocument();
  });

  it("performs search with debouncing", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: 1,
              firstName: "John",
              lastName: "Doe",
              city: "New York",
              degree: "MD",
              specialties: ["Anxiety"],
              yearsOfExperience: 10,
              phoneNumber: "555-1234",
            },
          ],
        }),
      });

    render(<Home />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const searchInput = screen.getByPlaceholderText(
      "Search by name, specialty, or location..."
    );

    fireEvent.change(searchInput, { target: { value: "John" } });

    await waitFor(
      () => {
        expect(fetchMock).toHaveBeenCalledWith("/api/advocates?q=John");
      },
      { timeout: 600 }
    );
  });

  it("displays clear button when search term is entered", async () => {
    fetchMock.mockResolvedValue({
      json: async () => ({ data: [] }),
    });

    render(<Home />);

    const searchInput = screen.getByPlaceholderText(
      "Search by name, specialty, or location..."
    );

    expect(screen.queryByText("Clear")).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "test" } });

    await waitFor(() => {
      expect(screen.getByText("Clear")).toBeInTheDocument();
    });
  });

  it("clears search when clear button is clicked", async () => {
    fetchMock.mockResolvedValue({
      json: async () => ({ data: [] }),
    });

    render(<Home />);

    const searchInput = screen.getByPlaceholderText(
      "Search by name, specialty, or location..."
    ) as HTMLInputElement;

    fireEvent.change(searchInput, { target: { value: "test" } });

    await waitFor(() => {
      expect(screen.getByText("Clear")).toBeInTheDocument();
    });

    const clearButton = screen.getByText("Clear");
    fireEvent.click(clearButton);

    expect(searchInput.value).toBe("");
    await waitFor(() => {
      expect(screen.queryByText("Clear")).not.toBeInTheDocument();
    });
  });

  it("filters by specialty when category button is clicked", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: 1,
              firstName: "Sarah",
              lastName: "Jones",
              city: "Boston",
              degree: "PhD",
              specialties: ["Anxiety"],
              yearsOfExperience: 8,
              phoneNumber: "555-9999",
            },
          ],
        }),
      });

    render(<Home />);

    // Initial fetch
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const anxietyButton = screen.getByText("Anxiety");
    fireEvent.click(anxietyButton);

    // User activated fetch
    await waitFor(
      () => {
        expect(fetchMock).toHaveBeenCalledTimes(2);
      },
      { timeout: 600 }
    );

    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/advocates?q=Anxiety"
    );

    await waitFor(() => {
      expect(screen.getByText("Sarah Jones, PhD")).toBeInTheDocument();
    });

    expect(screen.getByText(/1 advocate available/)).toBeInTheDocument();
  });

  it("clears specialty selection when typing in search", async () => {
    fetchMock.mockResolvedValue({
      json: async () => ({ data: [] }),
    });

    render(<Home />);

    const anxietyButton = screen.getByText("Anxiety");
    fireEvent.click(anxietyButton);

    await waitFor(() => {
      expect(screen.getByText("Clear")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      "Search by name, specialty, or location..."
    );

    fireEvent.change(searchInput, { target: { value: "test" } });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        "/api/advocates?q=test"
      );
    });
  });

  it("handles API errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    fetchMock.mockRejectedValueOnce(
      new Error("Network error")
    );

    render(<Home />);

    await waitFor(
      () => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error fetching advocates:",
          expect.any(Error)
        );
      },
      { timeout: 600 }
    );

    expect(screen.getByText("No advocates found")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("displays correct advocate count singular form", async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        data: [
          {
            id: 1,
            firstName: "John",
            lastName: "Doe",
            city: "New York",
            degree: "MD",
            specialties: ["Anxiety"],
            yearsOfExperience: 10,
            phoneNumber: "555-1234",
          },
        ],
      }),
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("1 advocate available")).toBeInTheDocument();
    });
  });

  it("renders all specialty categories", () => {
    fetchMock.mockResolvedValue({
      json: async () => ({ data: [] }),
    });

    render(<Home />);

    const expectedCategories = [
      "Anxiety",
      "Depression",
      "ADHD",
      "Eating disorders",
      "Chronic pain",
      "Women's issues",
      "Pediatrics",
      "Substance",
      "Sleep",
      "Coaching",
    ];

    expectedCategories.forEach((category) => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });
});
