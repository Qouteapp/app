import { DEFAULT_WORKSPACE } from '../config';
import { useStorage } from './useStorage.react';

export function useWorkspaces() {
  const {
    currentWorkspaceId, setCurrentWorkspaceId, savedWorkspaces, setSavedWorkspaces,
  } = useStorage();

  const savedWorkspacesFiltered = savedWorkspaces.filter((ws) => ws.id !== DEFAULT_WORKSPACE.id);

  const allWorkspaces = [DEFAULT_WORKSPACE, ...savedWorkspacesFiltered];

  const getWorkspaceById = (wsId: string) => allWorkspaces.find((ws) => ws.id === wsId) || DEFAULT_WORKSPACE; // todo;

  const currentWorkspace = getWorkspaceById(currentWorkspaceId);

  return {
    currentWorkspaceId,
    setCurrentWorkspaceId,
    currentWorkspace,
    savedWorkspaces: savedWorkspacesFiltered,
    setSavedWorkspaces,
    allWorkspaces,
    getWorkspaceById,
  };
}
