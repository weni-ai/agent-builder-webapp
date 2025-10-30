import nexusaiAPI from '@/api/nexusaiAPI';
import { usePagination } from './usePagination';
import { useIndexingProcessStore } from '@/store/IndexingProcess.js';

export function useFilesPagination() {
  const pagination = usePagination({
    load: {
      request: nexusaiAPI.knowledge.files.list,
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

  useIndexingProcessStore().useIndexingProcess(pagination.data, 'files');

  return pagination;
}
