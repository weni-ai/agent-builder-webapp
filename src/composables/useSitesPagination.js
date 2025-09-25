import nexusaiAPI from '@/api/nexusaiAPI';
import { usePagination } from './usePagination';
import { useIndexingProcessStore } from '@/store/IndexingProcess.js';

export function useSitesPagination({ contentBaseUuid }) {
  const loadSites = async (params) => {
    const { data } =
      await nexusaiAPI.intelligences.contentBases.sites.list(params);

    return {
      data: {
        results: data,
      },
    };
  };

  const pagination = usePagination({
    load: {
      request: loadSites,
      params: {
        contentBaseUuid,
      },
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

  useIndexingProcessStore().useIndexingProcess(
    pagination.data,
    'sites',
    contentBaseUuid,
  );

  return pagination;
}
