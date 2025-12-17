import { useState, useCallback, useEffect } from "react";
import { Agency } from "../../types/dashboard";
import { toast } from "sonner";
import { initialAgencyForm } from "../../constants/dashboard";
import { fetchAgencies, createAgency, updateAgency, deleteAgency } from "../../utils/api";
import { useAuth } from "../../components/AuthContext";

/**
 * 소속사 상태 및 CRUD 작업을 관리하는 커스텀 훅
 */
export function useAgencies() {
  const { user } = useAuth();
  const isAgencyMember = user?.role === "agency_member";
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [newAgency, setNewAgency] = useState(initialAgencyForm);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAgencies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const agenciesData = await fetchAgencies();
      setAgencies(agenciesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "소속사 목록을 불러오는데 실패했습니다.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Failed to load agencies:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 소속사 목록 로드 (소속사 회원은 제외)
  useEffect(() => {
    if (!isAgencyMember) {
      loadAgencies();
    } else {
      setIsLoading(false);
    }
  }, [isAgencyMember, loadAgencies]);

  const handleAddAgency = useCallback(async () => {
    try {
      const agencyData = {
        name: newAgency.name,
        role: newAgency.role,
        contact: newAgency.contact,
        phone: newAgency.phone,
        address: newAgency.address,
        status: newAgency.status,
        memo: newAgency.memo,
      };

      const newAgencyData = await createAgency(agencyData);
      setAgencies([newAgencyData, ...agencies]);
      setNewAgency(initialAgencyForm);
      toast.success("소속사가 등록되었습니다.");
      return newAgencyData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "소속사 등록에 실패했습니다.";
      toast.error(errorMessage);
      throw err;
    }
  }, [newAgency, agencies]);

  const handleEditAgency = useCallback((agency: Agency) => {
    setEditingAgency(agency);
    setNewAgency({
      name: agency.name,
      role: agency.role,
      contact: agency.contact,
      phone: agency.phone,
      address: agency.address,
      status: agency.status,
      memo: agency.memo || "",
    });
  }, []);

  const handleUpdateAgency = useCallback(async () => {
    if (!editingAgency) return;

    try {
      const agencyData = {
        name: newAgency.name,
        role: newAgency.role,
        contact: newAgency.contact,
        phone: newAgency.phone,
        address: newAgency.address,
        status: newAgency.status,
        memo: newAgency.memo,
      };

      const updatedAgency = await updateAgency(editingAgency.id, agencyData);
      setAgencies(agencies.map((a) => (a.id === editingAgency.id ? updatedAgency : a)));
      setNewAgency(initialAgencyForm);
      setEditingAgency(null);
      toast.success("소속사 정보가 수정되었습니다.");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "소속사 정보 수정에 실패했습니다.";
      toast.error(errorMessage);
      throw err;
    }
  }, [editingAgency, newAgency, agencies]);

  const handleDeleteAgency = useCallback(
    async (id: number) => {
      if (!window.confirm("정말로 이 소속사를 삭제하시겠습니까?")) {
        return;
      }

      try {
        await deleteAgency(id);
        setAgencies(agencies.filter((a) => a.id !== id));
        toast.success("소속사가 삭제되었습니다.");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "소속사 삭제에 실패했습니다.";
        toast.error(errorMessage);
      }
    },
    [agencies]
  );

  const resetNewAgency = useCallback(() => {
    setNewAgency(initialAgencyForm);
  }, []);

  return {
    agencies,
    setAgencies,
    newAgency,
    setNewAgency,
    editingAgency,
    setEditingAgency,
    isLoading,
    error,
    loadAgencies,
    handleAddAgency,
    handleEditAgency,
    handleUpdateAgency,
    handleDeleteAgency,
    resetNewAgency,
  };
}

