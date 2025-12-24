import { useState, useCallback, useEffect } from "react";
import { Client } from "../../types/dashboard";
import { toast } from "sonner";
import { createClientFromForm, getInitialClientForm } from "../../utils/dashboard/clientUtils";
import { initialClientForm } from "../../constants/dashboard";
import { fetchClients, createClient, updateClient, deleteClient, updateClientStatus } from "../../utils/api";

/**
 * 클라이언트(신랑/신부) 상태 및 CRUD 작업을 관리하는 커스텀 훅
 */
export function useClients(initialGrooms: Client[], initialBrides: Client[]) {
  const [grooms, setGrooms] = useState<Client[]>(initialGrooms);
  const [brides, setBrides] = useState<Client[]>(initialBrides);
  const [newClient, setNewClient] = useState(initialClientForm);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    const loadClients = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [groomsResult, bridesResult] = await Promise.all([
          fetchClients({ type: 'groom' }),
          fetchClients({ type: 'bride' }),
        ]);
        setGrooms(groomsResult.clients);
        setBrides(bridesResult.clients);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "클라이언트 목록을 불러오는데 실패했습니다.";
        setError(errorMessage);
        console.error("Failed to load clients:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, []);

  const handleAddClient = useCallback(
    async (type: "groom" | "bride", selectedPhotos: File[], selectedVideo: File | null, selectedAvatar: File | null = null): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const clientData = createClientFromForm(newClient, type);
        const createdClient = await createClient(clientData, selectedPhotos, selectedVideo, selectedAvatar);

        if (type === "groom") {
          setGrooms([...grooms, createdClient]);
          toast.success(
            `${newClient.name}님(신랑)이 등록되었습니다. 사진 ${selectedPhotos.length}장${selectedVideo ? ", 동영상 1개" : ""} 업로드됨.`
          );
        } else {
          setBrides([...brides, createdClient]);
          toast.success(
            `${newClient.name}님(신부)가 등록되었습니다. 사진 ${selectedPhotos.length}장${selectedVideo ? ", 동영상 1개" : ""} 업로드됨.`
          );
        }

        setNewClient(getInitialClientForm());
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "클라이언트 등록에 실패했습니다.";
        setError(errorMessage);
        console.error("Failed to create client:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [newClient, grooms, brides]
  );

  const handleUpdateClient = useCallback(
    async (
      type: "groom" | "bride",
      selectedPhotos: File[],
      selectedVideo: File | null,
      selectedAvatar: File | null = null
    ) => {
      if (!editingClient) return;

      try {
        setIsLoading(true);
        setError(null);

        const clientData: Partial<Client> = {
          ...editingClient,
        };

        // 신부 프로필의 경우 fatherAge와 motherAge를 명시적으로 포함
        if (type === 'bride') {
          const brideClient = editingClient as any;
          if (brideClient.fatherAge !== undefined && brideClient.fatherAge !== null && brideClient.fatherAge !== '') {
            clientData.fatherAge = typeof brideClient.fatherAge === 'number' ? brideClient.fatherAge : parseInt(String(brideClient.fatherAge));
          }
          if (brideClient.motherAge !== undefined && brideClient.motherAge !== null && brideClient.motherAge !== '') {
            clientData.motherAge = typeof brideClient.motherAge === 'number' ? brideClient.motherAge : parseInt(String(brideClient.motherAge));
          }
        }

        const updatedClient = await updateClient(
          editingClient.id,
          clientData,
          selectedPhotos,
          selectedVideo,
          selectedAvatar
        );

        if (type === "groom") {
          setGrooms(
            grooms.map((g) =>
              g.id === editingClient.id ? updatedClient : g
            )
          );
          toast.success(
            `${editingClient.name}님(신랑) 정보가 수정되었습니다.${selectedPhotos.length > 0 ? ` 사진 ${selectedPhotos.length}장` : ""}${selectedVideo ? ", 동영상 1개" : ""} 업데이트됨.`
          );
        } else {
          setBrides(
            brides.map((b) =>
              b.id === editingClient.id ? updatedClient : b
            )
          );
          toast.success(
            `${editingClient.name}님(신부) 정보가 수정되었습니다.${selectedPhotos.length > 0 ? ` 사진 ${selectedPhotos.length}장` : ""}${selectedVideo ? ", 동영상 1개" : ""} 업데이트됨.`
          );
        }

        setEditingClient(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "클라이언트 수정에 실패했습니다.";
        setError(errorMessage);
        console.error("Failed to update client:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [editingClient, grooms, brides]
  );

  const handleDeleteClient = useCallback(
    async (id: number, type: "groom" | "bride") => {
      try {
        setIsLoading(true);
        setError(null);

        await deleteClient(id);

        if (type === "groom") {
          setGrooms(grooms.filter((g) => g.id !== id));
          toast.success("신랑 프로필이 삭제되었습니다.");
        } else {
          setBrides(brides.filter((b) => b.id !== id));
          toast.success("신부 프로필이 삭제되었습니다.");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "클라이언트 삭제에 실패했습니다.";
        setError(errorMessage);
        console.error("Failed to delete client:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [grooms, brides]
  );

  const handleUpdateStatus = useCallback(
    async (id: number, newStatus: string, type: "groom" | "bride") => {
      try {
        setIsLoading(true);
        setError(null);

        const updatedClient = await updateClientStatus(id, newStatus);

        if (type === "groom") {
          setGrooms(
            grooms.map((g) => (g.id === id ? updatedClient : g))
          );
        } else {
          setBrides(
            brides.map((b) => (b.id === id ? updatedClient : b))
          );
        }
        toast.success("상태가 업데이트되었습니다.");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "상태 업데이트에 실패했습니다.";
        setError(errorMessage);
        console.error("Failed to update status:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [grooms, brides]
  );

  const handleOpenEdit = useCallback((client: Client) => {
    setEditingClient(client);
  }, []);

  const resetNewClient = useCallback(() => {
    setNewClient(getInitialClientForm());
  }, []);

  return {
    grooms,
    setGrooms,
    brides,
    setBrides,
    newClient,
    setNewClient,
    editingClient,
    setEditingClient,
    handleAddClient,
    handleUpdateClient,
    handleDeleteClient,
    handleUpdateStatus,
    handleOpenEdit,
    resetNewClient,
    isLoading,
    error,
  };
}

