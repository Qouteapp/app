import React from 'react';

import buildClassName from '../../../util/buildClassName';

import styles from './WorkspaceSettingsFoldersList.module.scss';

interface Folder {
  id: number;
  title: string;
}

interface FoldersListProps {
  className?: string;
  folders: Folder[];
  onSelectedFoldersChange: (selectedIds: number[]) => void; // Добавьте эту строку
  selectedFolderIds: number[];
}

const FoldersList: React.FC<FoldersListProps> = ({
  className, folders, onSelectedFoldersChange, selectedFolderIds,
}) => {
  const toggleFolder = (id: number) => {
    const newSelected = new Set(selectedFolderIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }

    onSelectedFoldersChange(Array.from(newSelected));
    return newSelected;
  };

  const classNameWrapper = buildClassName(styles.wrapper, className);
  const classNameFolderIcon = buildClassName('icon icon-folder', styles.folderIcon);

  return (
    <div className={classNameWrapper}>
      <div className={buildClassName(styles.container, 'custom-scroll')}>
        {folders.map((folder) => (
          <div key={folder.id} className={styles.folderItem} onClick={() => toggleFolder(folder.id)}>
            <div className={styles.iconWrapper}>
              <i className={classNameFolderIcon} />
            </div>
            <span className={styles.folderTitle}>{folder.title}</span>
            <div className={buildClassName(styles.checkmark, selectedFolderIds.includes(folder.id) && styles.selected)}>
              <i className="icon icon-check" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoldersList;
