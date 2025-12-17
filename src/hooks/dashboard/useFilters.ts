import { useState, useCallback } from "react";
import { SortConfig, SortDirection } from "../../types/dashboard";

/**
 * 필터링 및 정렬 상태를 관리하는 커스텀 훅
 */
export function useFilters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAgencyRole, setFilterAgencyRole] = useState("all");
  const [filterUserRole, setFilterUserRole] = useState("all");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const handleSort = useCallback((key: keyof import("../../types/dashboard").Client) => {
    let direction: SortDirection = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const handleSortChange = useCallback((value: string) => {
    const [key, direction] = value.split("-");
    setSortConfig({
      key: key as keyof import("../../types/dashboard").Client,
      direction: direction as SortDirection,
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilterStatus("all");
    setFilterUserRole("all");
    setSearchTerm("");
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterAgencyRole,
    setFilterAgencyRole,
    filterUserRole,
    setFilterUserRole,
    sortConfig,
    setSortConfig,
    handleSort,
    handleSortChange,
    resetFilters,
  };
}

