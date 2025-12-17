import { useState, useCallback } from "react";
import { Client, Match } from "../../types/dashboard";
import { initialMatchInfo } from "../../constants/dashboard";

/**
 * 매칭 다이얼로그 관련 상태 및 로직을 관리하는 커스텀 훅
 */
export function useMatchDialog(
  grooms: Client[],
  brides: Client[],
  matches: Match[]
) {
  const [matchingClient, setMatchingClient] = useState<Client | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Client | null>(null);
  const [partnerSearchTerm, setPartnerSearchTerm] = useState("");
  const [matchInfo, setMatchInfo] = useState(initialMatchInfo);
  const [isCreateMatchOpen, setIsCreateMatchOpen] = useState(false);

  const handleOpenMatchDialog = useCallback((client: Client) => {
    setMatchingClient(client);
    setSelectedPartner(null);
    setPartnerSearchTerm("");
    setMatchInfo({
      startDate: new Date().toISOString().split("T")[0],
      stage: "서류 확인",
      nextStep: "화상 미팅",
      memo: "",
    });
    setIsCreateMatchOpen(true);
  }, []);

  const getAvailablePartners = useCallback(() => {
    if (!matchingClient) return [];

    const partnerList = matchingClient.type === "groom" ? brides : grooms;
    const matchedIds = matches
      .filter((m) => m.status === "진행 중")
      .map((m) => (matchingClient.type === "groom" ? m.brideId : m.groomId));

    let available = partnerList.filter((p) => !matchedIds.includes(p.id));

    // 검색 필터 적용
    if (partnerSearchTerm) {
      const term = partnerSearchTerm.toLowerCase();
      available = available.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.loc.toLowerCase().includes(term)
      );
    }

    return available;
  }, [matchingClient, grooms, brides, matches, partnerSearchTerm]);

  const resetMatchDialog = useCallback(() => {
    setMatchingClient(null);
    setSelectedPartner(null);
    setPartnerSearchTerm("");
    setMatchInfo(initialMatchInfo);
    setIsCreateMatchOpen(false);
  }, []);

  return {
    matchingClient,
    setMatchingClient,
    selectedPartner,
    setSelectedPartner,
    partnerSearchTerm,
    setPartnerSearchTerm,
    matchInfo,
    setMatchInfo,
    isCreateMatchOpen,
    setIsCreateMatchOpen,
    handleOpenMatchDialog,
    getAvailablePartners,
    resetMatchDialog,
  };
}

