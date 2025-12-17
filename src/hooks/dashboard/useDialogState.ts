import { useState, useCallback } from "react";

/**
 * 모든 다이얼로그/시트의 열림 상태를 관리하는 커스텀 훅
 */
export function useDialogState() {
  const [isAddGroomOpen, setIsAddGroomOpen] = useState(false);
  const [isAddBrideOpen, setIsAddBrideOpen] = useState(false);
  const [isAddAgencyOpen, setIsAddAgencyOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [isEditGroomOpen, setIsEditGroomOpen] = useState(false);
  const [isEditBrideOpen, setIsEditBrideOpen] = useState(false);
  const [isEditAgencyOpen, setIsEditAgencyOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStageManagerOpen, setIsStageManagerOpen] = useState(false);

  const closeAllDialogs = useCallback(() => {
    setIsAddGroomOpen(false);
    setIsAddBrideOpen(false);
    setIsAddAgencyOpen(false);
    setIsAddUserOpen(false);
    setIsAddVideoOpen(false);
    setIsEditGroomOpen(false);
    setIsEditBrideOpen(false);
    setIsEditAgencyOpen(false);
    setIsEditUserOpen(false);
    setIsDeleteDialogOpen(false);
    setIsStageManagerOpen(false);
  }, []);

  return {
    isAddGroomOpen,
    setIsAddGroomOpen,
    isAddBrideOpen,
    setIsAddBrideOpen,
    isAddAgencyOpen,
    setIsAddAgencyOpen,
    isAddUserOpen,
    setIsAddUserOpen,
    isAddVideoOpen,
    setIsAddVideoOpen,
    isEditGroomOpen,
    setIsEditGroomOpen,
    isEditBrideOpen,
    setIsEditBrideOpen,
    isEditAgencyOpen,
    setIsEditAgencyOpen,
    isEditUserOpen,
    setIsEditUserOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isStageManagerOpen,
    setIsStageManagerOpen,
    closeAllDialogs,
  };
}

