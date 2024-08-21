import { defaultsDeep, isPlainObject } from 'lodash-es';
import { K8sStatus } from '../types/k8s';
import { HttpError, K8sStatusError, TimeoutError } from './error';

type ResponseJsonError = {
  message: string;
  error: string;
  details?: { causes: { message?: string; field?: string }[] };
};

const validateStatus = async (response: Response) => {
  if (response.ok) {
    return response;
  }

  if (response.status === 401) {
    throw new HttpError('Invalid token', response.status, response);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || contentType.indexOf('json') === -1) {
    throw new HttpError(response.statusText, response.status, response);
  }

  if (response.status === 403) {
    return response.json().then((json: ResponseJsonError) => {
      throw new HttpError(
        json.message || 'Access denied due to cluster policy.',
        response.status,
        response,
        json,
      );
    });
  }

  return response.json().then((json: ResponseJsonError) => {
    const cause = json.details?.causes?.[0];
    let reason;
    if (cause) {
      reason = `Error "${cause.message}" for field "${cause.field}".`;
    }
    if (!reason) {
      reason = json.message;
    }
    if (!reason) {
      reason = json.error;
    }
    if (!reason) {
      reason = response.statusText;
    }

    throw new HttpError(reason, response.status, response, json);
  });
};

export const applyDefaults = <TObject>(obj: TObject, defaults: unknown): TObject =>
  defaultsDeep({}, obj, defaults);

const basicFetch = async (url: string, requestInit: RequestInit = {}): Promise<Response> => {
  return validateStatus(
    await fetch(url, applyDefaults<RequestInit>(requestInit, { method: 'GET' })),
  );
};

export type FetchOptionArgs = [
  requestInit?: RequestInit,
  timeout?: number,
  isK8sApiRequest?: boolean,
];

type ResourceReadArgs = [url: string, ...args: FetchOptionArgs];

const defaultTimeout = 60_000;

export const commonFetch = async (
  ...[url, requestInit = {}, timeout = defaultTimeout]: ResourceReadArgs
): Promise<Response> => {
  const fetchPromise = basicFetch(url, applyDefaults(requestInit, { method: 'GET' }));

  if (timeout <= 0) {
    return fetchPromise;
  }

  const timeoutPromise = new Promise<Response>((_, reject) => {
    setTimeout(() => reject(new TimeoutError(url, timeout)), timeout);
  });

  return Promise.race([fetchPromise, timeoutPromise]);
};

export const commonFetchText = async (
  ...[url, requestInit = {}, timeout = defaultTimeout]: ResourceReadArgs
): Promise<string> => {
  const response = await commonFetch(
    url,
    applyDefaults(requestInit, { headers: { Accept: 'text/plain' } }),
    timeout,
  );

  const responseText = await response.text();

  return responseText ?? '';
};

export const isK8sStatus = (data: unknown): data is K8sStatus =>
  isPlainObject(data) && (data as K8sStatus).kind === 'Status';

export const commonFetchJSON = async <TResult>(
  ...[url, requestInit = {}, timeout = defaultTimeout, isK8sAPIRequest = false]: ResourceReadArgs
): Promise<TResult> => {
  const response = await commonFetch(
    `/api/k8s${url}`,
    applyDefaults(requestInit, { headers: { Accept: 'application/json' } }),
    timeout,
  );
  const responseText = await response.text();
  const data = JSON.parse(responseText) as TResult;

  if (isK8sAPIRequest && isK8sStatus(data) && data.status !== 'Success') {
    throw new K8sStatusError(data);
  }

  return data;
};
