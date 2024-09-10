import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { k8sDeleteResource } from '../../../k8s/k8s-fetch';
import { ApplicationModel } from '../../../models';
import { DeleteResourceModal } from '../DeleteResourceModal';

jest.mock('../../../k8s/k8s-fetch', () => {
  const actual = jest.requireActual('@openshift/dynamic-plugin-sdk-utils');
  return {
    ...actual,
    k8sDeleteResource: jest.fn(),
  };
});

const k8sDeleteMock = k8sDeleteResource as jest.Mock;

describe('DeleteResourceModal', () => {
  afterEach(jest.clearAllMocks);

  it('should be disabled when resource name is not entered', () => {
    const obj = { apiVersion: 'v1', kind: 'Application', metadata: { name: 'test' } };
    const onClose = jest.fn();
    render(<DeleteResourceModal obj={obj} model={ApplicationModel} onClose={onClose} />);
    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(screen.getByText('Delete')).toBeDisabled();
  });

  it('should be disabled when incorrect resource name is entered', () => {
    const obj = { apiVersion: 'v1', kind: 'Application', metadata: { name: 'test' } };
    const onClose = jest.fn();
    render(<DeleteResourceModal obj={obj} model={ApplicationModel} onClose={onClose} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test123' } });
    expect(screen.getByText('Delete')).toBeDisabled();
  });

  it('should be enabled when resource name is entered', () => {
    const obj = { apiVersion: 'v1', kind: 'Application', metadata: { name: 'test' } };
    const onClose = jest.fn();
    render(<DeleteResourceModal obj={obj} model={ApplicationModel} onClose={onClose} />);
    expect(screen.queryAllByRole('textbox')).toHaveLength(1);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(screen.getByText('Delete')).toBeEnabled();
  });

  it('should hide textbox when isEntryNotRequired is set to true', () => {
    const obj = { apiVersion: 'v1', kind: 'Application', metadata: { name: 'test' } };
    const onClose = jest.fn();
    k8sDeleteMock.mockResolvedValue({});
    render(
      <DeleteResourceModal
        obj={obj}
        model={ApplicationModel}
        onClose={onClose}
        isEntryNotRequired
      />,
    );
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
  });

  it('should delete resource & close modal when submitted', async () => {
    const obj = { apiVersion: 'v1', kind: 'Application', metadata: { name: 'test' } };
    const onClose = jest.fn();
    k8sDeleteMock.mockResolvedValue({});
    render(<DeleteResourceModal obj={obj} model={ApplicationModel} onClose={onClose} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    fireEvent.click(screen.getByText('Delete'));
    await waitFor(() => expect(k8sDeleteMock).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
  });

  it('should use display name instead of resource name when provided', () => {
    const obj = { apiVersion: 'v1', kind: 'Application', metadata: { name: 'test' } };
    const onClose = jest.fn();
    render(
      <DeleteResourceModal
        obj={obj}
        model={ApplicationModel}
        onClose={onClose}
        displayName="My App"
      />,
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(screen.getByText('Delete')).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'My App' } });
    expect(screen.getByText('Delete')).toBeEnabled();
  });

  it('should show error and not close modal if deletion fails', async () => {
    const obj = { apiVersion: 'v1', kind: 'Application', metadata: { name: 'test' } };
    const onClose = jest.fn();
    k8sDeleteMock.mockRejectedValue(new Error('Unable to delete'));
    render(
      <DeleteResourceModal
        obj={obj}
        model={ApplicationModel}
        onClose={onClose}
        displayName="My App"
      />,
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'My App' } });
    fireEvent.click(screen.getByText('Delete'));
    await waitFor(() => expect(screen.getByText('Unable to delete')).toBeVisible());
  });
});
