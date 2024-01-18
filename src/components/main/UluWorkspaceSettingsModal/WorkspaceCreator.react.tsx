/* eslint-disable react/jsx-no-bind */
import type { ChangeEvent } from 'react';
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { UploadManager } from '@bytescale/sdk';
import type { FC } from '../../../lib/teact/teact';
import { getGlobal } from '../../../global';

import { DEFAULT_WORKSPACE, JUNE_TRACK_EVENTS } from '../../../config';

import { useJune } from '../../../hooks/useJune.react';
import { useWorkspaces } from '../../../hooks/useWorkspaces.react';

import FolderSelector from './WorkspaceSettingsFoldersList.react';

type OwnProps = {
  workspaceId?: string;
  onUpdate?: () => void;
  onCreate?: () => void;
  onDelete?: () => void;
};

const WorkspaceCreator: FC<OwnProps> = ({
  workspaceId, onUpdate, onCreate, onDelete,
}) => {
  const global = getGlobal();
  const chatFoldersById = global.chatFolders.byId;
  const orderedFolderIds = global.chatFolders.orderedIds;
  const folders = orderedFolderIds ? orderedFolderIds.map((id) => chatFoldersById[id]).filter(Boolean) : [];

  const [isInitialized, setIsInitialized] = useState(false); // Новое состояние для отслеживания инициализации
  const [workspaceName, setWorkspaceName] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string | undefined>('');
  // eslint-disable-next-line no-null/no-null
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const { track } = useJune();

  const uploadManager = new UploadManager({
    apiKey: 'public_kW15bndTdL4cidRTCc1sS8rNYQsu',
  });
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [selectedFolderIds, setSelectedFolderIds] = useState<number[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const {
    getWorkspaceById, savedWorkspaces, setSavedWorkspaces, setCurrentWorkspaceId,
  } = useWorkspaces();

  const resetState = useCallback(() => {
    setWorkspaceName('');
    setLogoUrl('');
    setSelectedFolderIds([]);
    setSelectedFile(undefined);
    setIsCreating(false);
    setHasChanges(false);
  }, []);

  useEffect(() => {
    if (workspaceId && !isInitialized) {
      const currentWorkspace = getWorkspaceById(workspaceId);
      if (currentWorkspace) {
        setWorkspaceName(currentWorkspace.name);
        setLogoUrl(currentWorkspace.logoUrl);
        setSelectedFolderIds(currentWorkspace.folders?.map(Number) || []);
      }
      setIsInitialized(true);
    }
  }, [workspaceId, isInitialized, resetState, getWorkspaceById]);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const tempUrl = URL.createObjectURL(file);
    setLogoUrl(tempUrl);
    setHasChanges(true); // Устанавливаем временный URL для предпросмотра
  };

  const handleSaveWorkspace = async () => {
    setIsCreating(true);
    try {
      const newWorkspaceId = workspaceId || Date.now().toString();
      let finalLogoUrl = logoUrl;
      if (selectedFile) {
        const newFileName = `${workspaceName}_${newWorkspaceId}.${selectedFile.type.split('/')[1]}`;
        const fileWithNewName = new File([selectedFile], newFileName, { type: selectedFile.type });
        const { fileUrl } = await uploadManager.upload({ data: fileWithNewName });

        finalLogoUrl = `${fileUrl.replace('/raw/', '/image/')}?w=128&h=128`;
        setLogoUrl(finalLogoUrl); // Обновляем URL после загрузки на сервер
        if (logoUrl) {
          URL.revokeObjectURL(logoUrl);
        }
        setHasChanges(false);
      }

      const newWorkspaceData = {
        id: newWorkspaceId,
        name: workspaceName,
        logoUrl: finalLogoUrl,
        folders: selectedFolderIds,
      };

      if (workspaceId) {
        // Обновляем существующий воркспейс
        const updatedWorkspaces = savedWorkspaces.map((ws) => (ws.id === workspaceId ? newWorkspaceData : ws));
        setSavedWorkspaces(updatedWorkspaces);
        onUpdate?.();
      } else {
        // Создаем новый воркспейс
        setSavedWorkspaces([...savedWorkspaces, newWorkspaceData]);
        setCurrentWorkspaceId(newWorkspaceData.id);
        onCreate?.();
        track?.(JUNE_TRACK_EVENTS.CREATE_WORKSPACE);
      }
    } catch (error) {
      //
    } finally {
      setIsCreating(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWorkspaceName(e.target.value);
    setHasChanges(true);
  };

  const handleSelectedFoldersChange = (selectedIds: number[]) => {
    setSelectedFolderIds(selectedIds);
    setHasChanges(true);
  };

  const handleDeleteWorkspace = () => {
    if (workspaceId === DEFAULT_WORKSPACE.id) {
      return;
    }
    const updatedWorkspaces = savedWorkspaces.filter((ws) => ws.id !== workspaceId);
    setSavedWorkspaces(updatedWorkspaces);
    setCurrentWorkspaceId(DEFAULT_WORKSPACE.id);
    onDelete?.();
  };

  const isSaveButtonActive = workspaceName && selectedFolderIds.length > 0 && hasChanges;

  return (
    <div className="workspaceCreator">
      <div className="workspaceInput">
        {/* Скрытый input для загрузки файлов */}
        <input
          className="fileInput"
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
        {/* Кнопка для активации input */}
        {logoUrl ? (
          <div className="uploadedImageContainer">
            <img src={logoUrl} alt="Uploaded Logo" />
          </div>
        ) : (
          <div className="uploadButton" onClick={triggerFileSelect}>
            <div className="icon-wrapper">
              <i className="icon icon-add" />
            </div>
          </div>
        )}
        <div className="inputText">
          <input
            className="inputText"
            type="text"
            value={workspaceName}
            onChange={handleInputChange}
            placeholder="Workspace name"
          />
        </div>
        <div className="characterCount">
          {`${workspaceName.length}/40`}
        </div>
      </div>
      <div className="desc">
        <div>The recommended logo size is 256x256px.</div>
      </div>
      <div className="header">
        <div>Folders</div>
      </div>
      <FolderSelector
        folders={folders}
        selectedFolderIds={selectedFolderIds}
        onSelectedFoldersChange={handleSelectedFoldersChange}
      />
      <button
        className={`saveButton ${isSaveButtonActive ? 'active' : ''}`}
        onClick={handleSaveWorkspace}
        disabled={!workspaceName || selectedFolderIds.length === 0}
      >
        <span className={`saveButtonText ${isSaveButtonActive ? 'active' : ''}`}>
          {isCreating ? 'Saving...' : (workspaceId ? 'Update workspace' : 'Create workspace')}
        </span>
      </button>
      {workspaceId && (
        <button
          className="deleteButton"
          onClick={handleDeleteWorkspace}
        >
          <span className="deleteButtonText">
            Delete workspace
          </span>
        </button>
      )}
    </div>
  );
};

export default WorkspaceCreator;
