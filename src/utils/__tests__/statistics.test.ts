import { describe, expect, it } from "vitest";
import { createStatisticsFromResponse, StatisticsCalculators, formatStatistic } from "../statistics";

describe("statistics", () => {
  describe("createStatisticsFromResponse", () => {
    it("should create statistics from server response", () => {
      const data = [{ id: 1 }, { id: 2 }];
      const serverStats = { total: 100, filtered: 50, active: 25 };

      const stats = createStatisticsFromResponse(data, undefined, serverStats);

      expect(stats.total).toBe(100);
      expect(stats.filtered).toBe(50);
      expect(stats.active).toBe(25);
    });

    it("should fallback to data length when no server stats", () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];

      const stats = createStatisticsFromResponse(data);

      expect(stats.total).toBe(3);
      expect(stats.filtered).toBe(3);
    });
  });

  describe("StatisticsCalculators", () => {
    const testData = [
      { active: true, score: 10 },
      { active: false, score: 20 },
      { active: true, score: 30 },
    ];

    it("should count items matching condition", () => {
      const activeCount = StatisticsCalculators.count(testData, item => item.active);
      expect(activeCount).toBe(2);
    });

    it("should sum numeric values", () => {
      const totalScore = StatisticsCalculators.sum(testData, item => item.score);
      expect(totalScore).toBe(60);
    });

    it("should calculate percentage", () => {
      const percentage = StatisticsCalculators.percentage(25, 100);
      expect(percentage).toBe(25);
    });
  });

  describe("formatStatistic", () => {
    it("should format numbers with locale", () => {
      expect(formatStatistic(1000)).toBe("1,000");
      expect(formatStatistic(1234567)).toBe("1,234,567");
    });
  });
});
