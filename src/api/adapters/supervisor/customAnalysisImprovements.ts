import type {
  CustomAnalysisCreatePayload,
  CustomAnalysisImprovement,
  CustomAnalysisImprovementDetail,
} from '@/store/types/CustomAnalysisImprovements.types';

export interface CustomAnalysisImprovementApi {
  uuid?: string;
  title?: string;
  conversations_count?: number;
}

export interface CustomAnalysisImprovementDetailApi {
  uuid?: string;
  title?: string;
  definition?: string;
  exclusions?: string;
  slug?: string;
}

function parseListItem(
  item: CustomAnalysisImprovementApi = {},
): CustomAnalysisImprovement | null {
  if (!item.uuid || !item.title) {
    return null;
  }

  return {
    uuid: item.uuid,
    title: item.title,
    conversationsCount: Number(item.conversations_count) || 0,
  };
}

function parseDetail(
  apiData: CustomAnalysisImprovementDetailApi = {},
): CustomAnalysisImprovementDetail | null {
  if (!apiData.uuid || !apiData.title) {
    return null;
  }

  return {
    uuid: apiData.uuid,
    title: apiData.title,
    definition: apiData.definition ?? '',
    exclusions: apiData.exclusions ?? '',
    slug: apiData.slug ?? '',
  };
}

export const CustomAnalysisImprovementsAdapter = {
  fromApiList(
    apiData: CustomAnalysisImprovementApi[] = [],
  ): CustomAnalysisImprovement[] {
    return apiData
      .map(parseListItem)
      .filter((item): item is CustomAnalysisImprovement => item !== null);
  },

  fromApiDetail(
    apiData: CustomAnalysisImprovementDetailApi = {},
  ): CustomAnalysisImprovementDetail | null {
    return parseDetail(apiData);
  },

  toApiCreate({ title, definition, exclusions }: CustomAnalysisCreatePayload) {
    return {
      title,
      definition,
      exclusions,
    };
  },
};
