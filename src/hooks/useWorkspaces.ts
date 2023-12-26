import { getWorkspaceById, prepareWorkspaces } from '../global/ulu/workspaces';
import { useStorage } from './useStorage';

export function useWorkspaces() {
  const {
    currentWorkspaceId, setCurrentWorkspaceId, savedWorkspaces, setSavedWorkspaces,
  } = useStorage();

  const {
    filteredWorkspaces: savedWorkspacesFiltered,
    allWorkspaces,
  } = prepareWorkspaces(savedWorkspaces);

  const getWSById = getWorkspaceById(allWorkspaces);

  const currentWorkspace = getWSById(currentWorkspaceId);

  return {
    currentWorkspaceId,
    setCurrentWorkspaceId,
    currentWorkspace,
    savedWorkspaces: savedWorkspacesFiltered,
    setSavedWorkspaces,
    allWorkspaces,
    getWorkspaceById: getWSById,
  };
}
