import nexusaiAPI from '@/api/nexusaiAPI';
import { usePagination } from './usePagination';
import { useIndexingProcessStore } from '@/store/IndexingProcess.js';

export function useSitesPagination() {
  const loadSites = async (params) => {
    const { data } = await nexusaiAPI.knowledge.sites.list(params);

    return {
      data: {
        results: data,
      },
    };
  };

  const pagination = usePagination({
    load: {
      request: loadSites,
    },
    transform: (site) => ({
      ...site,
      extension_file: 'site',
      created_file_name: site.link,
      status:
        {
          Processing: 'processing',
          success: 'uploaded',
        }[site.status] || site.status,
    }),
  });

  useIndexingProcessStore().useIndexingProcess(pagination.data, 'sites');

  return pagination;
}
