import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from '@/api/nexusaiRequest';
import nexusaiAPI from '@/api/nexusaiAPI';

vi.mock('@/api/nexusaiRequest', () => ({
  default: {
    $http: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/api/utils/forceHttps', () => ({
  default: vi.fn((url) => `https://${url}`),
}));

describe('nexusaiAPI.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create content base text', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.intelligences.contentBases.texts.create({
      contentBaseUuid: 'contentBase1',
      text: 'Sample Text',
    });

    expect(request.$http.post).toHaveBeenCalledWith(
      'api/contentBase1/content-bases-text/',
      {
        text: 'Sample Text',
      },
      {
        routerName: 'contentBase-text-create',
        hideGenericErrorAlert: false,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should edit content base text', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.put.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.intelligences.contentBases.texts.edit({
      contentBaseUuid: 'contentBase1',
      contentBaseTextUuid: 'text1',
      text: 'Updated Text',
    });

    expect(request.$http.put).toHaveBeenCalledWith(
      'api/contentBase1/content-bases-text/text1/',
      {
        text: 'Updated Text',
      },
      {
        routerName: 'contentBase-text-edit',
        hideGenericErrorAlert: false,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should create content base link', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.intelligences.contentBases.sites.create({
      contentBaseUuid: 'contentBase1',
      link: 'https://example.com',
    });

    expect(request.$http.post).toHaveBeenCalledWith(
      'api/contentBase1/content-bases-link/',
      {
        link: 'https://example.com',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should list content base links', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.intelligences.contentBases.sites.list({
      contentBaseUuid: 'contentBase1',
    });

    expect(request.$http.get).toHaveBeenCalledWith(
      'api/contentBase1/content-bases-link/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should read content base link', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.intelligences.contentBases.sites.read({
      contentBaseUuid: 'contentBase1',
      uuid: 'link1',
    });

    expect(request.$http.get).toHaveBeenCalledWith(
      'api/contentBase1/content-bases-link/link1/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should delete content base link', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.delete.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.intelligences.contentBases.sites.delete({
      contentBaseUuid: 'contentBase1',
      linkUuid: 'link1',
    });

    expect(request.$http.delete).toHaveBeenCalledWith(
      'api/contentBase1/content-bases-link/link1/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should create content base file', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const file = new File(['foo'], 'foo.txt', {
      type: 'text/plain',
    });

    const result = await nexusaiAPI.intelligences.contentBases.files.create({
      contentBaseUuid: 'contentBase1',
      file: file,
      extension_file: 'pdf',
    });

    expect(request.$http.post).toHaveBeenCalledWith(
      'api/contentBase1/content-bases-file/',
      expect.any(FormData),
      {
        onUploadProgress: undefined,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should list content base files', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.intelligences.contentBases.files.list({
      contentBaseUuid: 'contentBase1',
    });

    expect(request.$http.get).toHaveBeenCalledWith(
      'api/contentBase1/content-bases-file/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should read content base file', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.intelligences.contentBases.files.read({
      contentBaseUuid: 'contentBase1',
      uuid: 'file1',
    });

    expect(request.$http.get).toHaveBeenCalledWith(
      'api/contentBase1/content-bases-file/file1/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should delete content base file', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.delete.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.intelligences.contentBases.files.delete({
      contentBaseUuid: 'contentBase1',
      fileUuid: 'file1',
    });

    expect(request.$http.delete).toHaveBeenCalledWith(
      'api/contentBase1/content-bases-file/file1/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should download file', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.intelligences.contentBases.files.download({
      fileUuid: 'file1',
      file_name: 'filename.pdf',
    });

    expect(request.$http.post).toHaveBeenCalledWith('api/v1/download-file', {
      file_name: 'filename.pdf',
      content_base_file: 'file1',
    });
    expect(result).toEqual(mockResponse);
  });

  it('should preview document', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.intelligences.contentBases.files.preview({
      projectUuid: 'project1',
      contentBaseUuid: 'contentBase1',
      fileUuid: 'file1',
      page: 1,
    });

    expect(request.$http.post).toHaveBeenCalledWith(
      'api/project1/document-preview/',
      {
        content_base_uuid: 'contentBase1',
        content_base_file_uuid: 'file1',
        page_number: 1,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should edit tunings', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.patch.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.router.tunings.edit({
      projectUuid: 'project1',
      values: { model: 'newModel', otherSetting: 'value' },
    });

    expect(request.$http.patch).toHaveBeenCalledWith(
      'api/project1/llm/',
      {
        model: 'newModel',
        setup: { otherSetting: 'value' },
      },
      {
        routerName: 'brain-tunings-edit',
        hideGenericErrorAlert: true,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should read profile settings', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.router.profile.read({
      projectUuid: 'project1',
    });

    expect(request.$http.get).toHaveBeenCalledWith(
      'api/project1/customization/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should edit profile settings', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.put.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.router.profile.edit({
      projectUuid: 'project1',
      data: { setting: 'value' },
    });

    expect(request.$http.put).toHaveBeenCalledWith(
      'api/project1/customization/',
      { setting: 'value' },
      {
        routerName: 'brain-customization-edit',
        hideGenericErrorAlert: true,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should delete profile setting', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.delete.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.router.profile.delete({
      projectUuid: 'project1',
      id: 'setting1',
    });

    expect(request.$http.delete).toHaveBeenCalledWith(
      `api/project1/customization/?id=setting1`,
    );
    expect(result).toEqual(mockResponse);
  });

  it('should create preview', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.router.preview.create({
      projectUuid: 'project1',
      text: 'Sample text',
      contact_urn: 'contact1',
      language: 'en-US',
    });

    expect(request.$http.post).toHaveBeenCalledWith('api/project1/preview/', {
      text: 'Sample text',
      contact_urn: 'contact1',
      language: 'en-US',
    });
    expect(result).toEqual(mockResponse);
  });

  it('should get multi-agents configuration', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.router.tunings.multiAgents.read({
      projectUuid: 'project1',
    });

    expect(request.$http.get).toHaveBeenCalledWith(
      'api/project/project1/multi-agents',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should edit multi-agents configuration', async () => {
    const mockResponse = { data: { multi_agents: true } };
    request.$http.patch.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.router.tunings.multiAgents.edit({
      projectUuid: 'project1',
      multi_agents: true,
    });

    expect(request.$http.patch).toHaveBeenCalledWith(
      'api/project/project1/multi-agents',
      { multi_agents: true },
    );
    expect(result).toEqual(mockResponse);
  });
});
