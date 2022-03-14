import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import config from '../../../server/config.js';
import { handler } from '../../../server/routes.js';
import TestUtil from '../_util/testUtil.js';
import { Controller } from '../../../server/controller.js';
const {
  pages,
  location,
  constants: {
    CONTENT_TYPE
  }
} = config;
describe('#Routes', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  });

  test('GET / - should redirect to home page', async () => {
    const params = TestUtil.defaultHandleParams();
    params.request.method = "GET";
    params.request.url = "/";
    await handler(...params.values());
    expect(params.response.writeHead).toBeCalledWith(
      302,
      {
        "Location": location.home
      });
    expect(params.response.end).toHaveBeenCalled();
  });

  test(`GET /home - should response with ${pages.homeHTML} file stream`, async () => {
    const params = TestUtil.defaultHandleParams();
    params.request.method = "GET";
    params.request.url = "/home";

    const mockFileStream = TestUtil.generateReadableStream(['data']);

    jest.spyOn(
      Controller.prototype,
      Controller.prototype.getFileStream.name
    ).mockResolvedValue({
      stream: mockFileStream
    });

    jest.spyOn(
      mockFileStream,
      "pipe",
    ).mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toBeCalledWith(pages.homeHTML);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
  })

  test(`GET /controller - should response ${pages.controllerHTML} file stream`, async () => {
    const params = TestUtil.defaultHandleParams();
    params.request.method = "GET";
    params.request.url = "/controller";

    const mockFileStream = TestUtil.generateReadableStream(['data']);

    jest.spyOn(
      Controller.prototype,
      Controller.prototype.getFileStream.name
    ).mockResolvedValue({
      stream: mockFileStream
    });

    jest.spyOn(
      mockFileStream,
      "pipe",
    ).mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toBeCalledWith(pages.controllerHTML);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
  });

  test(`GET /index.html - should response file stream`, async () => {
    const fileName = "/index.html";
    const params = TestUtil.defaultHandleParams();
    params.request.method = "GET";
    params.request.url = fileName;
    const expectedType = ".html";
    const mockFileStream = TestUtil.generateReadableStream(['data']);

    jest.spyOn(
      Controller.prototype,
      Controller.prototype.getFileStream.name
    ).mockResolvedValue({
      stream: mockFileStream,
      type: expectedType
    });

    jest.spyOn(
      mockFileStream,
      "pipe",
    ).mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toBeCalledWith(fileName);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    expect(params.response.writeHead).toHaveBeenCalledWith(200, {
      'Content-type': CONTENT_TYPE[expectedType]
    });
  });

  test(`GET /file.ext - should response file stream`, async () => {
    const fileName = "/file.ext";
    const params = TestUtil.defaultHandleParams();
    params.request.method = "GET";
    params.request.url = fileName;
    const expectedType = ".ext";
    const mockFileStream = TestUtil.generateReadableStream(['data']);

    jest.spyOn(
      Controller.prototype,
      Controller.prototype.getFileStream.name
    ).mockResolvedValue({
      stream: mockFileStream,
      type: expectedType
    });

    jest.spyOn(
      mockFileStream,
      "pipe",
    ).mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toBeCalledWith(fileName);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    expect(params.response.writeHead).not.toHaveBeenCalledWith();
  });

  test(`POST /unknown - given an inexistent route it should response with 404`, async () => {
    const fileName = "/unknown";
    const params = TestUtil.defaultHandleParams();
    params.request.method = "POST";
    params.request.url = fileName;

    await handler(...params.values());

    expect(params.response.writeHead).toHaveBeenCalledWith(404);
    expect(params.response.end).toHaveBeenCalled();
  })

  describe('exceptions', () => {
    test('given inexistent file it should response with 404', async () => {
      const fileName = "/index.blade.php";
      const params = TestUtil.defaultHandleParams();
      params.request.method = "GET";
      params.request.url = fileName;
      jest.spyOn(
        Controller.prototype,
        Controller.prototype.getFileStream.name
      ).mockRejectedValue(new Error('Error: ENOENT: no such file or directs '))

      await handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(404);
      expect(params.response.end).toHaveBeenCalled();
    });

    test('given an error it should response with 500',async () => {
      const fileName = "/index.blade.php";
      const params = TestUtil.defaultHandleParams();
      params.request.method = "GET";
      params.request.url = fileName;
      jest.spyOn(
        Controller.prototype,
        Controller.prototype.getFileStream.name
      ).mockRejectedValue(new Error('Error'))

      await handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(500);
      expect(params.response.end).toHaveBeenCalled();
    })
  });
})