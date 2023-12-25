import type { ChatTimeSnapshot, Workspace } from '../../types';

import { DEFAULT_WORKSPACE, LOCAL_STORAGE_KEYS, WORKSPACE_CHAT_TIME_SNAPSHOT_STALE_MINUTES } from '../../config';
import { LocalStorage } from '../../lib/localStorage';
import { differenceInMinutes } from '../../util/time';
import { actualizeChatTimeSnapshot, buildChatTimeSnapshot } from '../helpers';

const lsWorkspaces = new LocalStorage<Workspace[]>();
const lsCurrentWorkspaceId = new LocalStorage<string>();

function reconstructPersonalWorkspace(savedPersonalWorkspace: Workspace) {
  return {
    ...DEFAULT_WORKSPACE,
    ...savedPersonalWorkspace,
  };
}

export function prepareWorkspaces(workspaces: Workspace[]) {
  const workspacesFiltered = [...workspaces];
  let personalWorkspace: Workspace = { ...DEFAULT_WORKSPACE };

  const savedPersonalWorkspaceIndex = workspacesFiltered.findIndex((ws) => ws.id === DEFAULT_WORKSPACE.id);
  if (savedPersonalWorkspaceIndex !== -1) {
    personalWorkspace = workspacesFiltered.splice(savedPersonalWorkspaceIndex, 1)[0];
  }

  const reconstructedPersonalWorkspace = reconstructPersonalWorkspace(personalWorkspace);
  const allWorkspaces = [reconstructedPersonalWorkspace, ...workspacesFiltered];

  return { allWorkspaces, filteredWorkspaces: workspacesFiltered };
}

export function getWorkspaceById(workspaces: Workspace[]) {
  return (wsId: string) => {
    return workspaces.find((ws: Workspace) => ws.id === wsId) || DEFAULT_WORKSPACE;
  };
}

export function getWorkspaces() {
  const savedWorkspaces = lsWorkspaces.getOrFallback(LOCAL_STORAGE_KEYS.WORKSPACES, [])!;
  const currentWorkspaceId = lsCurrentWorkspaceId.getOrFallback(
    LOCAL_STORAGE_KEYS.CURRENT_WORKSPACE_ID,
    DEFAULT_WORKSPACE.id,
  );

  const getWSById = getWorkspaceById(savedWorkspaces);

  const currentWorkspace = getWSById(currentWorkspaceId!);

  const { allWorkspaces, filteredWorkspaces } = prepareWorkspaces(savedWorkspaces);

  return {
    currentWorkspaceId,
    currentWorkspace,
    savedWorkspaces: filteredWorkspaces,
    allWorkspaces,
  };
}

function saveWorkspace(workspace: Workspace) {
  const { savedWorkspaces } = getWorkspaces();
  const workspaceIndex = savedWorkspaces.findIndex((ws) => ws.id === workspace.id);
  const newSavedWorkspaces = [...savedWorkspaces];
  if (workspaceIndex === -1) {
    newSavedWorkspaces.push(workspace);
  } else {
    newSavedWorkspaces[workspaceIndex] = workspace;
  }

  lsWorkspaces.set(LOCAL_STORAGE_KEYS.WORKSPACES, newSavedWorkspaces);
}

export function isWorkspaceChatTimeSnapshotStale(chatTimeSnapshot: ChatTimeSnapshot) {
  const diff = differenceInMinutes(chatTimeSnapshot.dateUpdated || chatTimeSnapshot.dateAdded);
  return diff > WORKSPACE_CHAT_TIME_SNAPSHOT_STALE_MINUTES;
}

export function addChatToCurrentWorkspaceTemp(chatId: string) {
  const { currentWorkspace } = getWorkspaces();
  const { chatSnapshotsTemp = [] } = currentWorkspace;
  const index = chatSnapshotsTemp.findIndex((chatSnapshot) => chatSnapshot.id === chatId);
  const newChatSnapshot = index === -1
    ? buildChatTimeSnapshot(chatId)
    : actualizeChatTimeSnapshot(chatSnapshotsTemp[index]);

  const newChatSnapshotsTemp = index === -1
    ? [...chatSnapshotsTemp, newChatSnapshot]
    : [...chatSnapshotsTemp.slice(0, index), newChatSnapshot, ...chatSnapshotsTemp.slice(index + 1)];

  const newCurrentWorkspace: Workspace = { ...currentWorkspace, chatSnapshotsTemp: newChatSnapshotsTemp };
  saveWorkspace(newCurrentWorkspace);
}
