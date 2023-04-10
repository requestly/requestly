import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getAuthInitialization } from '../store/selectors';
import removePreloader from 'actions/UI/removePreloader';

const PreLoadRemover = () => {
  const hasAuthInitialized = useSelector(getAuthInitialization);

  useEffect(() => {
    if (hasAuthInitialized) {
      removePreloader();
    }
  }, [hasAuthInitialized]);
  return null;
};

export default PreLoadRemover;
