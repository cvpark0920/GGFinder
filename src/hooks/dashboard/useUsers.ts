import { useState, useCallback, useEffect } from "react";
import { User, UserStatus } from "../../types/dashboard";
import { toast } from "sonner";
import { fetchUsers, createUser, updateUser, deleteUser } from "../../utils/api";
import { useAuth } from "../../components/AuthContext";

/**
 * 사용자 상태 및 CRUD 작업을 관리하는 커스텀 훅
 */
export function useUsers() {
  const { user } = useAuth();
  const isAgencyMember = user?.role === "agency_member";
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const usersData = await fetchUsers();
      setUsers(usersData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "사용자 목록을 불러오는데 실패했습니다.";
      setError(errorMessage);
      console.error("Failed to load users:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 사용자 목록 로드 (소속사 회원은 제외)
  useEffect(() => {
    if (!isAgencyMember) {
      loadUsers();
    } else {
      setIsLoading(false);
    }
  }, [isAgencyMember, loadUsers]);

  const handleAddUser = useCallback(async (userData: Partial<User>) => {
    try {
      const newUser = await createUser(userData);
      setUsers([newUser, ...users]);
      toast.success(`${newUser.name} 사용자가 추가되었습니다.`);
      return newUser;
    } catch (err) {
      throw err;
    }
  }, [users]);

  const handleUpdateUserStatus = useCallback(
    async (userId: number, newStatus: UserStatus) => {
      try {
        const user = users.find((u) => u.id === userId);
        if (!user) {
          return;
        }

        const updatedUser = await updateUser(userId, { status: newStatus });
        setUsers(users.map((u) => (u.id === userId ? updatedUser : u)));
        toast.success("사용자 상태가 변경되었습니다.");
      } catch (err) {
        console.error("Failed to update user status:", err);
      }
    },
    [users]
  );

  const handleDeleteUser = useCallback(
    async (userId: number) => {
      if (!window.confirm("정말로 이 사용자를 삭제하시겠습니까?")) {
        return;
      }

      try {
        await deleteUser(userId);
        setUsers(users.filter((u) => u.id !== userId));
        toast.success("사용자가 삭제되었습니다.");
      } catch (err) {
        console.error("Failed to delete user:", err);
      }
    },
    [users]
  );

  const handleOpenEditUser = useCallback((user: User) => {
    setEditingUser(user);
  }, []);

  const handleUpdateUserSubmit = useCallback(
    async (userData: Partial<User>) => {
      if (!editingUser) return;

      try {
        const updatedUser = await updateUser(editingUser.id, userData);
        setUsers(users.map((u) => (u.id === editingUser.id ? updatedUser : u)));
        setEditingUser(null);
        toast.success("사용자 정보가 수정되었습니다.");
      } catch (err) {
        throw err;
      }
    },
    [editingUser, users]
  );

  return {
    users,
    setUsers,
    editingUser,
    setEditingUser,
    isLoading,
    error,
    loadUsers,
    handleAddUser,
    handleUpdateUserStatus,
    handleDeleteUser,
    handleOpenEditUser,
    handleUpdateUserSubmit,
  };
}

