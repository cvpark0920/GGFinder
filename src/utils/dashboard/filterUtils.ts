import { Client, Agency, User, YouTubeVideo, SortConfig } from "../../types/dashboard";

/**
 * 클라이언트 목록을 필터링하고 정렬합니다.
 */
export function getFilteredAndSortedClients(
  clients: Client[],
  searchTerm: string,
  filterStatus: string,
  sortConfig: SortConfig | null
): Client[] {
  let result = [...clients];

  // 1. 검색어로 필터링
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.loc.toLowerCase().includes(term)
    );
  }

  // 2. 상태로 필터링
  if (filterStatus && filterStatus !== "all") {
    result = result.filter((c) => c.status === filterStatus);
  }

  // 3. 정렬
  if (sortConfig) {
    result.sort((a, b) => {
      // 선택적 필드 안전하게 처리
      const valA = a[sortConfig.key] ?? "";
      const valB = b[sortConfig.key] ?? "";

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  return result;
}

/**
 * 소속사 목록을 필터링합니다.
 */
export function getFilteredAgencies(
  agencies: Agency[],
  searchTerm: string,
  filterRole: string,
  filterStatus: string
): Agency[] {
  let result = [...agencies];

  // 1. 검색어로 필터링
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    result = result.filter(
      (a) =>
        a.name.toLowerCase().includes(term) ||
        a.contact.toLowerCase().includes(term) ||
        a.address.toLowerCase().includes(term)
    );
  }

  // 2. 역할로 필터링
  if (filterRole && filterRole !== "all") {
    result = result.filter((a) => a.role === filterRole);
  }

  // 3. 상태로 필터링
  if (filterStatus && filterStatus !== "all") {
    result = result.filter((a) => a.status === filterStatus);
  }

  return result;
}

/**
 * 사용자 목록을 필터링합니다.
 */
export function getFilteredUsers(
  users: User[],
  searchTerm: string,
  filterRole: string,
  filterStatus: string
): User[] {
  let result = [...users];

  // 1. 검색어로 필터링
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    result = result.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }

  // 2. 역할로 필터링
  if (filterRole && filterRole !== "all") {
    result = result.filter((u) => u.role === filterRole);
  }

  // 3. 상태로 필터링
  if (filterStatus && filterStatus !== "all") {
    result = result.filter((u) => u.status === filterStatus);
  }

  return result;
}

/**
 * YouTube 동영상 목록을 필터링합니다.
 */
export function getFilteredVideos(
  videos: YouTubeVideo[],
  searchTerm: string,
  filterStatus: string
): YouTubeVideo[] {
  let result = [...videos];

  // 1. 검색어로 필터링
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    result = result.filter(
      (v) =>
        v.title.toLowerCase().includes(term) ||
        v.description.toLowerCase().includes(term)
    );
  }

  // 2. 상태로 필터링
  if (filterStatus && filterStatus !== "all") {
    result = result.filter((v) => v.status === filterStatus);
  }

  return result;
}

