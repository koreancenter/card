import React from 'react';
import { PhotoArchiveModal, PhotoArchiveModalProps } from './PhotoArchiveModal';

export const PhotoScanModal: React.FC<PhotoArchiveModalProps> = (props) => {
  return <PhotoArchiveModal {...props} />;
};

export default PhotoScanModal;
