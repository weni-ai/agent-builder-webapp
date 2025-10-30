import i18n from '@/utils/plugins/i18n';

function parseActionDetails(actionDetails) {
  return Object.keys(actionDetails).map((key) => ({
    key,
    newValue: actionDetails[key]?.new,
    oldValue: actionDetails[key]?.old,
  }));
}

function generateCustomizationUpdateText(actionDetails) {
  const moreThanOneChange =
    actionDetails.length > 1 && actionDetails[0] !== 'new';
  const isCustomization = [
    'name',
    'goal',
    'role',
    'personality',
    'instruction',
  ].includes(actionDetails[0]?.key);

  if (moreThanOneChange)
    return i18n.global.t(`router.tunings.history.fields.changes`, {
      value: actionDetails.length,
    });

  if (isCustomization)
    return i18n.global.t(
      `router.tunings.history.fields.update-${actionDetails[0]?.key}`,
      {
        value: actionDetails[0]?.newValue,
      },
    );

  return i18n.global.t(`router.tunings.history.fields.changes`);
}

function handleGroupText(actionDetails) {
  const translationName = (name) =>
    `router.tunings.history.fields.update-${name}`;
  const condition = ['name', 'goal', 'role', 'personality', 'instruction'];

  if (
    actionDetails.length > 1 &&
    !['new', 'old'].includes(actionDetails.map((e) => e.key))
  )
    return actionDetails.map((e) => {
      if (condition.includes(e.key))
        return i18n.global.t(translationName(e.key), {
          value: e.newValue,
        });

      return '';
    });

  return [];
}

function handleChangeName(row) {
  if (!row || !row.model_group || !row.action_type || !row.action_details) {
    return {
      icon: 'article',
      user: '-',
      text: '-',
    };
  }

  const actionDetails = parseActionDetails(row.action_details);
  const isUpdateContentText = actionDetails.find((e) => e.key === 'text');

  const groupData = {
    Config: {
      U: {
        icon: 'settings',
        user: row.created_by,
        text: i18n.global.t('router.tunings.history.fields.update-model'),
      },
    },
    Content: {
      D: {
        icon: 'article',
        user: row.created_by,
        text: i18n.global.t('router.tunings.history.fields.remove-content', {
          value: row.action_details.new,
        }),
      },
      U: {
        icon: 'article',
        user: row.created_by,
        text: i18n.global.t('router.tunings.history.fields.update-content', {
          value: isUpdateContentText
            ? row.action_details.text.new
            : row.action_details.new,
        }),
      },
      C: {
        icon: 'article',
        user: row.created_by,
        text: i18n.global.t('router.tunings.history.fields.add-content', {
          value: row.action_details.new,
        }),
      },
    },
    Customization: {
      C: {
        icon: 'person',
        user: row.created_by,
        text: i18n.global.t('router.tunings.history.fields.add-instruction', {
          value: row.action_details.new,
        }),
      },
      U: {
        icon: 'person',
        user: row.created_by,
        text: generateCustomizationUpdateText(actionDetails),
        groupText: handleGroupText(actionDetails),
      },
      D: {
        icon: 'person',
        user: row.created_by,
        text: i18n.global.t(
          'router.tunings.history.fields.remove-instruction',
          {
            value: row.action_details.old,
          },
        ),
      },
    },
  };

  return groupData[row.model_group]?.[row.action_type];
}

export { handleChangeName };
