/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Modal, Button, Text, TextVariants, TextContent, Stack, StackItem } from '@patternfly/react-core';
import { useIntl } from 'react-intl';
import sharedMessages from '../messages/shared.messages';
import { ProjectType } from '@app/shared/types/common-types';
import { defaultSettings } from '@app/shared/pagination';
import { useDispatch } from 'react-redux';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { fetchProject, removeProject } from '@app/API/Project';

interface IRemoveProject {
  ids?: Array<string | number>;
  fetchData?: any;
  pagination?: PaginationConfiguration;
  resetSelectedProjects?: any;
}

const RemoveProject: React.ComponentType<IRemoveProject> = ({
  ids = [],
  fetchData = null,
  pagination = defaultSettings,
  resetSelectedProjects = null,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [project, setProject] = useState<ProjectType>();
  const { id } = useParams<{ id: string }>();
  const { push, goBack } = useHistory();

  const removeId = id ? id : !id && ids && ids.length === 1 ? ids[0] : undefined;

  async function removeProjects(ids) {
    return Promise.all(ids.map(async (id) => await removeProject(id)));
  }

  const onSubmit = () => {
    if (!id && !(ids && ids.length > 0)) {
      return;
    }
    (removeId ? removeProject(removeId) : removeProjects(ids))
      .catch((error) => {
        push('/projects');
        dispatch(
          addNotification({
            variant: 'danger',
            title: intl.formatMessage(sharedMessages.projectRemoveTitle),
            dismissable: true,
            description: `${intl.formatMessage(sharedMessages.delete_project_failure)}  ${error}`,
          })
        );
      })
      .then(() => push('/projects'))
      .then(() => {
        if (!id) {
          resetSelectedProjects();
        }
      })
      .then(() => {
        if (fetchData) {
          fetchData(pagination);
        }
      });
  };

  useEffect(() => {
    if (!id && !removeId) {
      return;
    }
    fetchProject(id ? id : removeId).then((data) => setProject(data?.data));
  }, [removeId]);

  return (
    <Modal
      aria-label={intl.formatMessage(sharedMessages.projectRemoveTitle) as string}
      titleIconVariant="warning"
      title={
        removeId
          ? intl.formatMessage(sharedMessages.projectRemoveTitle)
          : intl.formatMessage(sharedMessages.projectsRemoveTitle)
      }
      isOpen
      variant="small"
      onClose={goBack}
      actions={[
        <Button
          key="submit"
          variant="danger"
          type="button"
          id="confirm-delete-project"
          ouiaId="confirm-delete-project"
          onClick={onSubmit}
        >
          {intl.formatMessage(sharedMessages.delete)}
        </Button>,
        <Button key="cancel" ouiaId="cancel" variant="link" type="button" onClick={goBack}>
          {intl.formatMessage(sharedMessages.cancel)}
        </Button>,
      ]}
    >
      <Stack hasGutter>
        <StackItem>
          <TextContent>
            <Text component={TextVariants.p}>
              {removeId
                ? intl.formatMessage(sharedMessages.projectRemoveDescription)
                : intl.formatMessage(sharedMessages.projectsRemoveDescription)}
            </Text>
          </TextContent>
        </StackItem>
        <StackItem>
          <TextContent>
            {removeId ? (
              <Text component={TextVariants.p}>
                <strong> {project?.name} </strong>
              </Text>
            ) : (
              <Text component={TextVariants.p}>
                <strong> {`${ids.length} selected`} </strong>
              </Text>
            )}
          </TextContent>
        </StackItem>
      </Stack>
    </Modal>
  );
};

export { RemoveProject };
