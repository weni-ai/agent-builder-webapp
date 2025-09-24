// Based on https://github.com/weni-ai/floweditor/blob/main/src/components/simulator/Simulator.tsx

import { ref, computed } from 'vue';
import axios from 'axios';
import update from 'immutability-helper';
import { v4 as createUUID } from 'uuid';
import env from '@/utils/env';

export const isMT = (event) => {
  return !!['msg_created', 'ivr_created'].find((type) => type === event.type);
};

export const isMessage = (event) => {
  return !!['msg_created', 'msg_received', 'ivr_created'].find(
    (type) => type === event.type,
  );
};

const MESSAGE_DELAY_MS = 200;

const DrawerType = {
  audio: 'audio',
  images: 'images',
  videos: 'videos',
  location: 'location',
  digit: 'digit',
  digits: 'digits',
  quickReplies: 'quickReplies',
};

export default function useFlowPreview() {
  const preview = ref({
    flowUuid: '',
    contact: {
      fields: {},
      groups: [],
      urns: [],
      uuid: '',
    },
    active: false,
    events: [],
    quickReplies: [],
    context: {},
    sprinting: false,
    session: null,
    drawerOpen: false,
    drawerType: '',
    waitingForHint: false,
  });

  const previewAPI = computed(() => {
    const instance = axios.create({
      baseURL: env('FLOWS_API_BASE_URL'),
    });

    return (body) =>
      instance.post(`api/v2/flows/${preview.value.flowUuid}/simulate`, body, {
        headers: {
          Authorization: localStorage.getItem('authToken'),
        },
      });
  });

  function previewInit({ contentBaseUuid }) {
    const numberBasedOnContentBaseUuid = contentBaseUuid
      .slice(-12)
      .split('')
      .map((char) => char.charCodeAt().toString().slice(-2).padStart(2, '0'))
      .join('');

    const threeRandomDigits = String(Math.floor(Math.random() * 1000)).padStart(
      3,
      '0',
    );

    const urn = `tel:${numberBasedOnContentBaseUuid}${threeRandomDigits}`;

    preview.value.contact = {
      uuid: createUUID(),
      urns: [urn],
      fields: {},
      groups: [],
      created_on: new Date().toISOString(),
    };
  }

  async function previewStart({ languageId, flowUuid, flowName, flowParams }) {
    preview.value.flowUuid = flowUuid;

    const now = new Date().toISOString();

    const contact = preview.value.contact;

    if (languageId) {
      contact.language = languageId;
    }

    preview.value.sprinting = true;
    preview.value.events = [];

    const body = {
      contact: preview.value.contact,
      trigger: {
        type: 'manual',
        environment: {
          date_format: 'DD-MM-YYYY',
          time_format: 'hh:mm',
          timezone: 'America/New_York',
          languages: [],
        },
        contact,
        flow: {
          uuid: flowUuid,
          name: flowName,
        },
        params: flowParams || {},
        triggered_on: now,
      },
    };

    const response = await previewAPI.value(body);

    previewUpdateRunContext({
      ...response.data,
      events: JSON.parse(JSON.stringify(response.data.events)),
    });

    return response;
  }

  function previewUpdateEvents(events, session, recentMessages, callback) {
    if (events && events.length > 0) {
      let quickReplies = null;

      let messageFound = false;
      while (events.length > 0 && !messageFound) {
        const event = events.shift();

        if (isMessage(event)) {
          messageFound = true;

          // if it's a message add it to our recent messages
          let fromUUID = '';
          let toUUID = '';

          // work backwards, since our events are recent
          for (let i = session.runs.length - 1; i >= 0; i--) {
            const path = session.runs[i].path;

            // start at the penultimate node since we have nowhere to render recent messages for the last node
            for (let j = path.length - 1; j >= 0; j--) {
              if (path[j].uuid === event.step_uuid) {
                fromUUID = path[j].exit_uuid;
                toUUID = path.length > j + 1 ? path[j + 1].node_uuid : null;
                break;
              }
            }

            if (fromUUID) {
              const key = `${fromUUID}:${toUUID}`;
              const msg = {
                sent: event.created_on,
                text: event.msg.text,
              };
              if (key in recentMessages) {
                recentMessages[key].unshift(msg);
              } else {
                recentMessages[key] = [msg];
              }
            }
          }

          if (isMT(event)) {
            // save off any quick replies we might have
            if (event.msg.quick_replies) {
              quickReplies = event.msg.quick_replies;
              preview.value.quickReplies = quickReplies;
            }
          }
        }

        preview.value.events.push(event);
      }

      if (events.length === 0) {
        callback();
      } else {
        window.setTimeout(() => {
          previewUpdateEvents(events, session, recentMessages, callback);
        }, MESSAGE_DELAY_MS);
      }
    } else {
      callback();
    }
  }

  function previewHasQuickReplies() {
    return (preview.value.quickReplies || []).length > 0;
  }

  function previewUpdateRunContext(runContext, msg) {
    const wasJustActive =
      preview.value.active ||
      (runContext.events && runContext.events.length > 0);

    preview.value.quickReplies = [];

    if (!runContext.events || (runContext.events.length === 0 && msg)) {
      const runs = runContext.session.runs;
      const run = runs[runs.length - 1];
      const step = run.path[run.path.length - 1];

      runContext.events = [
        {
          msg: {
            uuid: createUUID(),
            urn: preview.value.contact.urns[0],
            text: msg.text,
            attachments: msg.attachments,
          },
          type: 'msg_created',
          created_on: new Date().toISOString(),
          step_uuid: step.uuid,
        },
      ];
    }

    const newlyRecentMessages = {};

    previewUpdateEvents(
      runContext.events,
      runContext.session,
      newlyRecentMessages,
      () => {
        const active = runContext.session.runs.some(
          ({ status }) => status === 'waiting',
        );

        if (!active && wasJustActive) {
          preview.value.events.push({
            type: 'info',
            text: 'Exited flow',
            created_on: new Date(),
          });
        }

        const waitingForHint =
          runContext.session &&
          runContext.session.wait &&
          runContext.session.wait.hint !== undefined;

        let drawerType = null;
        if (waitingForHint) {
          switch (runContext.session.wait.hint.type) {
            case 'audio':
              drawerType = DrawerType.audio;
              break;
            case 'video':
              drawerType = DrawerType.videos;
              break;
            case 'image':
              drawerType = DrawerType.images;
              break;
            case 'location':
              drawerType = DrawerType.location;
              break;
            case 'digits':
              drawerType = DrawerType.digit;
              if (runContext.session.wait.hint.count !== 1) {
                drawerType = DrawerType.digits;
              }
              break;
            default:
              console.log('Unknown hint', runContext.session.wait.hint.type);
          }
        }

        let drawerOpen = waitingForHint;

        // if we have quick replies, open our drawe with attachment options
        if (!drawerType && previewHasQuickReplies()) {
          drawerType = DrawerType.quickReplies;
          drawerOpen = true;
        }

        preview.value.active = active;
        preview.value.context = runContext.context;
        preview.value.sprinting = false;
        preview.value.session = runContext.session;
        preview.value.drawerOpen = drawerOpen;
        preview.value.drawerType = drawerType;
        preview.value.waitingForHint = waitingForHint;

        previewUpdateActivity(newlyRecentMessages);
      },
    );
  }

  function previewUpdateActivity(recentMessages) {
    if (preview.value.session) {
      // if we are resetting, clear our recent messages

      let lastExit = null;
      const paths = {};
      const active = {};
      let activeFlow = '';

      for (const run of preview.value.session.runs) {
        let finalStep = null;

        for (const step of run.path) {
          if (lastExit) {
            const key = lastExit + ':' + step.node_uuid;
            let pathCount = paths[key];
            if (!pathCount) {
              pathCount = 0;
            }
            paths[key] = ++pathCount;
            if (!(key in recentMessages)) {
              recentMessages[key] = [];
            }
          }
          lastExit = step.exit_uuid;
          finalStep = step;
        }

        if (finalStep) {
          let count = active[finalStep.node_uuid];
          if (!count) {
            count = 0;
          }

          if (lastExit) {
            const lastKey = lastExit + ':' + null;
            paths[lastKey] = 1;

            if (!(lastKey in recentMessages)) {
              recentMessages[lastKey] = [];
            }
          }

          if (preview.value.session.status === 'waiting') {
            active[finalStep.node_uuid] = ++count;
          }
          activeFlow = run.flow_uuid;
        }
      }
    }
  }

  async function previewResume(text) {
    if (!text) {
      return;
    }

    preview.value.sprinting = true;

    const now = new Date().toISOString();

    const msg = {
      text,
      uuid: createUUID(),
      urn: preview.value.session.contact?.urns[0],
      attachments: [],
    };

    const body = {
      session: preview.value.session,
      resume: {
        type: 'msg',
        msg,
        resumed_on: now,
        contact: preview.value.session.contact,
      },
    };

    try {
      const response = await previewAPI.value(body);

      await previewUpdateRunContext(
        {
          ...response.data,
          events: JSON.parse(JSON.stringify(response.data.events)),
        },
        msg,
      );

      return response;
    } catch (error) {
      const events = update(preview.value.events, {
        $push: [
          {
            type: 'error',
            text:
              error.response.status > 499
                ? 'Server error, try again later'
                : error.response.data.error,
          },
        ],
      });

      preview.value.events = events;
    }
  }

  return {
    preview,
    previewAPI,
    previewInit,
    previewStart,
    previewUpdateEvents,
    previewHasQuickReplies,
    previewUpdateRunContext,
    previewUpdateActivity,
    previewResume,
    isMT,
    isMessage,
  };
}
