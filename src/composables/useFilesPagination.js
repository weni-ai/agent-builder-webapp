import nexusaiAPI from '@/api/nexusaiAPI';
import { usePagination } from './usePagination';
import { useIndexingProcessStore } from '@/store/IndexingProcess.js';

export function useFilesPagination({ contentBaseUuid }) {
  const pagination = usePagination({
    load: {
      request: nexusaiAPI.intelligences.contentBases.files.list,
      params: {
        contentBaseUuid,
      },
    },
    transform: (file) => ({
      ...file,
      status:
        {
          Processing: 'processing',
          success: 'uploaded',
        }[file.status] || file.status,
    }),
  });

  useIndexingProcessStore().useIndexingProcess(pagination.data, 'files', contentBaseUuid);

  return pagination;
}
