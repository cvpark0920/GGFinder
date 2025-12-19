import { useState, useCallback, useEffect } from "react";
import { Match, Client } from "../../types/dashboard";
import { fetchMatches, createMatch, updateMatch, deleteMatch } from "../../utils/api";
import { toast } from "sonner";

/**
 * 매칭 상태 및 CRUD 작업을 관리하는 커스텀 훅
 */
export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(false);

  // 매칭 목록 로드
  const loadMatches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMatches();
      setMatches(data.matches);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const handleCreateMatch = useCallback(
    async (
      matchingClient: Client,
      selectedPartner: Client,
      matchInfo: {
        startDate: string;
        stage: string;
        nextStep: string;
        memo: string;
      },
      updateClientStatus: (id: number, status: string, type: "groom" | "bride") => void
    ) => {
      try {
        const groomId = matchingClient.type === "groom" ? matchingClient.id : selectedPartner.id;
        const brideId = matchingClient.type === "bride" ? matchingClient.id : selectedPartner.id;

        const response = await createMatch({
          groomId,
          brideId,
          stage: matchInfo.stage,
          nextStep: matchInfo.nextStep,
          startDate: matchInfo.startDate,
          memo: matchInfo.memo,
          progress: 10,
        });

        const newMatch = response.match;
        setMatches(prev => [newMatch, ...prev]);

        // 상태를 '매칭 중'으로 업데이트
        if (matchingClient.type === "groom") {
          updateClientStatus(matchingClient.id, "매칭 중", "groom");
          updateClientStatus(selectedPartner.id, "매칭 중", "bride");
        } else {
          updateClientStatus(matchingClient.id, "매칭 중", "bride");
          updateClientStatus(selectedPartner.id, "매칭 중", "groom");
        }

        return newMatch;
      } catch (error) {
        console.error('Failed to create match:', error);
        throw error;
      }
    },
    []
  );

  const handleUpdateMatch = useCallback(
    async (matchId: number, updates: Partial<Match>) => {
      try {
        const response = await updateMatch(matchId, {
          status: updates.status,
          stage: updates.stage,
          progress: updates.progress,
          nextStep: updates.nextStep,
          memo: updates.memo,
        });

        setMatches(prev =>
          prev.map((m) => (m.id === matchId ? response.match : m))
        );

        return response.match;
      } catch (error) {
        console.error('Failed to update match:', error);
        throw error;
      }
    },
    []
  );

  const handleDeleteMatch = useCallback(
    async (matchId: number) => {
      try {
        await deleteMatch(matchId);
        setMatches(prev => prev.filter(m => m.id !== matchId));
        toast.success('매칭이 삭제되었습니다.');
      } catch (error) {
        console.error('Failed to delete match:', error);
        throw error;
      }
    },
    []
  );

  const handleOpenStageManager = useCallback((match: Match) => {
    setSelectedMatch(match);
  }, []);

  return {
    matches,
    setMatches,
    selectedMatch,
    setSelectedMatch,
    loading,
    loadMatches,
    handleCreateMatch,
    handleUpdateMatch,
    handleDeleteMatch,
    handleOpenStageManager,
  };
}
