/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable react/jsx-no-bind */
import type { ChangeEvent } from 'react';
import { UploadManager } from '@bytescale/sdk';
import type { FC } from '../../../lib/teact/teact';
import React, {
  useCallback, useEffect, useRef, useState,
} from '../../../lib/teact/teact';
import { getGlobal } from '../../../global';

import { DEFAULT_WORKSPACE, JUNE_TRACK_EVENTS } from '../../../config';
import buildClassName from '../../../util/buildClassName';

import { useJune } from '../../../hooks/useJune';
import { useWorkspaces } from '../../../hooks/useWorkspaces';

import FoldersList from './WorkspaceSettingsFoldersList';

import styles from './WorkspaceCreator.module.scss';

type OwnProps = {
  className?: string;
  classNameFolders?: string;
  classNameFolder?: string;
  classNameCreateWorkspaceButton?: string;
  workspaceId?: string;
  createWorkspaceButtonRef?: React.RefObject<HTMLButtonElement>;
  onUpdate?: () => void;
  onCreate?: () => void;
  onDelete?: () => void;
  onChangeName?: (name: string) => void;
  onChangeFolders?: (folders: number[]) => void;
};

const WorkspaceCreator: FC<OwnProps> = ({
  workspaceId, onUpdate, onCreate, onDelete, onChangeName, onChangeFolders,
  className, classNameFolders, classNameFolder, classNameCreateWorkspaceButton,
  createWorkspaceButtonRef,
}) => {
  const global = getGlobal();
  const chatFoldersById = global.chatFolders.byId;
  const orderedFolderIds = global.chatFolders.orderedIds;
  const folders = orderedFolderIds ? orderedFolderIds.map((id) => chatFoldersById[id]).filter(Boolean) : [];

  const [isInitialized, setIsInitialized] = useState(false); // Новое состояние для отслеживания инициализации
  const [workspaceName, _setWorkspaceName] = useState<string>('');
  const setWorkspaceName = useCallback((name: string) => {
    _setWorkspaceName(name);
    onChangeName?.(name);
  }, [onChangeName]);
  const [logoUrl, setLogoUrl] = useState<string | undefined>('');
  // eslint-disable-next-line no-null/no-null
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const { track } = useJune();

  const uploadManager = new UploadManager({
    apiKey: 'public_kW15bndTdL4cidRTCc1sS8rNYQsu',
  });
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [selectedFolderIds, _setSelectedFolderIds] = useState<number[]>([]);
  const setSelectedFolderIds = useCallback((ids: number[]) => {
    _setSelectedFolderIds(ids);
    onChangeFolders?.(ids);
  }, [onChangeFolders]);
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
  }, [setWorkspaceName, setSelectedFolderIds]);

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
  }, [workspaceId, isInitialized, setWorkspaceName, setSelectedFolderIds, resetState, getWorkspaceById]);

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
        track(JUNE_TRACK_EVENTS.CREATE_WORKSPACE);
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
    <div className={buildClassName(styles.workspaceCreator, className)}>
      <div className={styles.workspaceInput}>
        {/* Скрытый input для загрузки файлов */}
        <input
          className={styles.fileInput}
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
        {/* Кнопка для активации input */}
        {logoUrl ? (
          <div className={styles.uploadedImageContainer}>
            <img src={logoUrl} alt="Uploaded Logo" />
          </div>
        ) : (
          <div className={styles.uploadButton} onClick={triggerFileSelect}>
            <div className={styles.iconWrapper}>
              <i className="icon icon-add" />
            </div>
          </div>
        )}
        <div className={styles.inputText}>
          <input
            className={styles.inputText}
            type="text"
            value={workspaceName}
            onChange={handleInputChange}
            placeholder="Workspace name"
          />
        </div>
        <div className={styles.characterCount}>
          {`${workspaceName.length}/40`}
        </div>
      </div>
      <div className={styles.desc}>
        <div>The recommended logo size is 256x256px.</div>
      </div>
      <div className={styles.header}>
        <div>Workspace Folders</div>
      </div>
      <FoldersList
        className={classNameFolders}
        classNameFolder={classNameFolder}
        folders={folders}
        selectedFolderIds={selectedFolderIds}
        onSelectedFoldersChange={handleSelectedFoldersChange}
      />
      <button
        ref={createWorkspaceButtonRef}
        className={buildClassName(
          styles.saveButton,
          isSaveButtonActive && styles.active,
          classNameCreateWorkspaceButton,
        )}
        onClick={handleSaveWorkspace}
        disabled={!workspaceName || selectedFolderIds.length === 0}
      >
        <span className={buildClassName(styles.saveButtonText, isSaveButtonActive && styles.active)}>
          {isCreating ? 'Saving...' : (workspaceId ? 'Update workspace' : 'Create workspace')}
        </span>
      </button>
      {workspaceId && (
        <button
          className={styles.deleteButton}
          onClick={handleDeleteWorkspace}
        >
          <span className={styles.deleteButtonText}>
            Delete workspace
          </span>
        </button>
      )}
    </div>
  );
};

export default WorkspaceCreator;
