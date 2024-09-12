import { Link, useParams } from 'react-router-dom';
import { Badge, BreadcrumbItem } from '@patternfly/react-core';
import styles from '@patternfly/react-styles/css/components/Breadcrumb/breadcrumb';
import { ApplicationSwitcher } from '../components/Applications/switcher/ApplicationSwitcher';
import { useWorkspaceInfo } from '../components/Workspace/workspace-context';
import { WorkspaceSwitcher } from '../components/Workspace/WorkspaceSwitcher';
import { RouterParams } from '../routes/utils';

export const useWorkspaceBreadcrumbs = () => {
  const { workspace } = useWorkspaceInfo();

  return [
    <Badge key="badge" isRead>
      WS
    </Badge>,
    <span key="badge-divider" className={styles.breadcrumbItemDivider} />,
    <BreadcrumbItem key="workspace-link" to="#" component="div">
      <Link className="pf-v5-c-breadcrumb__link" to={`/workspaces/${workspace}/applications`}>
        {workspace}
      </Link>
    </BreadcrumbItem>,
    <WorkspaceSwitcher key="workspace" />,
  ];
};

export const useApplicationBreadcrumbs = (appDisplayName = null, withLink = true) => {
  const params = useParams<RouterParams>();
  const applicationName = params.applicationName || appDisplayName;

  const { workspace } = useWorkspaceInfo();
  const workspaceBreadcrumbs = useWorkspaceBreadcrumbs();

  return [
    ...workspaceBreadcrumbs,
    <span key="workspace-divider" className={styles.breadcrumbItemDivider}>
      |
    </span>,
    <BreadcrumbItem key="app-link" component="div">
      {applicationName ? (
        <Link
          data-test="applications-breadcrumb-link"
          className="pf-v5-c-breadcrumb__link"
          to={`/workspaces/${workspace}/applications`}
        >
          Applications
        </Link>
      ) : (
        <span>Applications</span>
      )}
    </BreadcrumbItem>,
    ...(applicationName
      ? [
          {
            path: withLink ? `/workspaces/${workspace}/applications/${applicationName}` : '',
            name: appDisplayName || applicationName,
          },
          <ApplicationSwitcher key="app" selectedApplication={applicationName} />,
        ]
      : []),
  ];
};
