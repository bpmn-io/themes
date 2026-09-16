import BpmnModeler from 'bpmn-js/lib/Modeler';
import TestContainer from 'mocha-test-container-support';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule,
  ZeebeTooltipProvider
} from 'bpmn-js-properties-panel';

import {
  CloudElementTemplatesPropertiesProviderModule
} from 'bpmn-js-element-templates';

import {
  CreateAppendAnythingModule,
  CreateAppendElementTemplatesModule
} from 'bpmn-js-create-append-anything';

import CreateAppendGroupsModule from 'camunda-bpmn-js/lib/base/features/create-append-groups';
import CreateAppendTabsModule from 'camunda-bpmn-js/lib/base/features/create-append-tabs';
import ElementDescriptionsModule from 'camunda-bpmn-js/lib/base/features/element-descriptions';
import CamundaDetailsPopupMenuModule from 'camunda-bpmn-js/lib/camunda-cloud/features/popup-menu';
import { BPMN_TAB } from 'camunda-bpmn-js/lib/base/features/create-append-tabs/tabs';

import ElementTemplateChooserModule from '@bpmn-io/element-template-chooser';
import ExampleDataProviderModule from '@camunda/example-data-properties-provider';
import { ZeebeVariableResolverModule } from '@bpmn-io/variable-resolver';

import ZeebeBehaviorModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';
import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe.json';

import { Form } from '@bpmn-io/form-js-viewer';
import { FormEditor } from '@bpmn-io/form-js-editor';
import { Playground } from '@bpmn-io/form-js-playground';

import ThemeControlsModule from './ThemeControlsProvider.js';

import camundaDesignSystemCss from '@camunda/design-system/styles.css';
import diagramJsCss from 'diagram-js/assets/diagram-js.css';
import bpmnJsCss from 'bpmn-js/dist/assets/bpmn-js.css';
import bpmnFontCss from 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import propertiesPanelCss from '@bpmn-io/properties-panel/dist/assets/properties-panel.css';
import elementTemplateChooserCss from '@bpmn-io/element-template-chooser/dist/element-template-chooser.css';
import elementTemplatesCss from 'bpmn-js-element-templates/dist/assets/element-templates.css';
import popupMenuCss from 'camunda-bpmn-js/styles/popup-menu.css';
import formViewerCss from '@bpmn-io/form-js/dist/assets/form-js.css';
import formEditorCss from '@bpmn-io/form-js/dist/assets/form-js-editor.css';
import formPlaygroundCss from '@bpmn-io/form-js/dist/assets/form-js-playground.css';

import baseThemeCss from '@bpmn-io/theme/assets/theme.css';
import tokensCss from '@bpmn-io/c4-theme/assets/tokens.css';
import propertiesPanelThemeCss from '@bpmn-io/c4-theme/assets/properties-panel.css';
import diagramThemeCss from '@bpmn-io/c4-theme/assets/diagram.css';
import formThemeCss from '@bpmn-io/c4-theme/assets/form-js.css';
import playgroundCss from './playground.css';

import defaultDiagram from './fixtures/playground.bpmn';
import manyInputsDiagram from './fixtures/many-inputs.bpmn';
import defaultForm from './fixtures/form.json';

let stylesInserted = false;
const THEMES = [ 'bpmn-io', 'c4' ];
let activeTheme = getThemeFromUrl();
let darkMode = getDarkFromUrl();

const templates = [
  {
    $schema: 'https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json',
    name: 'Example worker',
    id: 'io.bpmn-io.c4-theme.example-worker',
    version: 1,
    appliesTo: [
      'bpmn:ServiceTask'
    ],
    elementType: {
      value: 'bpmn:ServiceTask'
    },
    groups: [],
    properties: [
      {
        type: 'Hidden',
        value: 'example',
        binding: {
          type: 'zeebe:taskDefinition:type'
        }
      }
    ]
  }
];

export function isPlaygroundEnabled(name) {
  const singleStart = window.__env__ && window.__env__.SINGLE_START;

  return !singleStart || singleStart === 'all' || singleStart === name;
}

export function isStartOnly(name) {
  const singleStart = window.__env__ && window.__env__.SINGLE_START;

  return singleStart === name;
}

export function shouldKeepPlayground() {
  return Boolean(window.__env__ && window.__env__.SINGLE_START);
}

function isCaptureGrid() {
  return (window.__env__ && window.__env__.SINGLE_START) === 'all';
}

export async function createBpmnPlayground(context, name, options = {}) {
  insertStyles();

  const {
    diagram = defaultDiagram,
    exampleData = false,
    selectedElementId = 'ServiceTask_1',
    themeControls = false
  } = options;

  const root = document.createElement('div');
  root.className = 'playground';
  root.dataset.playground = name;
  root.innerHTML = `
    <div class="playground-main">
      <div class="playground-canvas"></div>
      <div class="playground-properties"></div>
    </div>
  `;

  TestContainer.get(context).appendChild(root);
  applyTheme();

  const canvasContainer = root.querySelector('.playground-canvas');
  const propertiesContainer = root.querySelector('.playground-properties');

  const modeler = new BpmnModeler({
    container: canvasContainer,
    debounceInput: false,
    propertiesPanel: {
      parent: propertiesContainer,

      // the capture grid mounts every scenario on one page, so a body-level
      // popup could not be told apart from another scenario's
      ...(isCaptureGrid() ? { feelPopupContainer: root } : {}),
      tooltip: ZeebeTooltipProvider
    },
    popupMenu: {
      defaultTab: BPMN_TAB
    },
    moddleExtensions: {
      zeebe: ZeebeModdle
    },
    additionalModules: [
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      ZeebePropertiesProviderModule,
      CloudElementTemplatesPropertiesProviderModule,
      ElementTemplateChooserModule,
      ZeebeBehaviorModule,
      CreateAppendAnythingModule,
      CreateAppendElementTemplatesModule,
      CamundaDetailsPopupMenuModule,
      ElementDescriptionsModule,
      CreateAppendGroupsModule,
      CreateAppendTabsModule,
      ...(exampleData ? [
        ZeebeVariableResolverModule,
        ExampleDataProviderModule
      ] : []),
      ...(themeControls ? [ ThemeControlsModule ] : [])
    ]
  });

  await modeler.importXML(diagram);

  const canvas = modeler.get('canvas');
  const eventBus = modeler.get('eventBus');
  const elementRegistry = modeler.get('elementRegistry');
  const selection = modeler.get('selection');
  const task = elementRegistry.get(selectedElementId);
  modeler.get('elementTemplatesLoader').setTemplates(templates);
  selection.select(task);
  canvas.zoom('fit-viewport');

  const setup = {
    search: (query = 'Review') => {
      const searchPad = modeler.get('searchPad');

      if (!searchPad.isOpen()) {
        searchPad.open();
      }

      // the search pad renders results synchronously on keyup — drive it the
      // same way a user would so the styled results list is captured
      const input = canvasContainer.querySelector('.djs-search-input input');

      input.value = query;
      input.dispatchEvent(new KeyboardEvent('keyup', { key: 'w', bubbles: true }));

      return searchPad;
    },
    replace: () => modeler.get('popupMenu').open(task, 'bpmn-replace', {
      x: 180,
      y: 160
    }, {
      title: 'Change element',
      width: 'var(--bpmn-replace-popup-width, 300px)',
      search: true
    }),
    create: () => modeler.get('popupMenu').open(canvas.getRootElement(), 'bpmn-create', {
      x: 180,
      y: 160
    }, {
      title: 'Create element',
      width: 'var(--bpmn-create-popup-width, 300px)',
      search: true
    }),
    append: () => modeler.get('popupMenu').open(task, 'bpmn-append', {
      x: 180,
      y: 160
    }, {
      title: 'Append element',
      width: 'var(--bpmn-append-popup-width, 300px)',
      search: true
    }),
    'text-popup': () => eventBus.fire('propertiesPanel.openPopup', {
      entryId: 'ServiceTask_1-name',
      element: task,
      label: 'Name',
      title: 'Bpmn:ServiceTask / Name',
      type: 'text',
      value: 'Example worker',
      onInput: () => {},
      sourceElement: root.querySelector('input')
    }),
    'feel-popup': () => eventBus.fire('propertiesPanel.openPopup', {
      entryId: 'ServiceTask_1-priority',
      element: task,
      label: 'Priority',
      title: 'Bpmn:ServiceTask / Priority',
      type: 'feel',
      value: '1',
      variables: [],
      onInput: () => {},
      sourceElement: root.querySelector('input')
    }),
    chooser: () => modeler.get('elementTemplateChooser').open(task),
    drilldown: () => {
      const button = canvasContainer.querySelector('.bjs-drilldown');

      button.click();

      return button;
    },
    'select-element': () => {
      selection.select([]);
      selection.select(task);

      return task;
    },
    'focus-theme-input': () => {
      const input = root.querySelector('[data-entry-id="theme-focus"] input');

      input.focus();

      return input;
    },
    'invalidate-theme-input': () => {
      const input = root.querySelector('[data-entry-id="theme-error"] input');

      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    },
    'open-theme-actions': () => root.querySelector('[data-entry-id="theme-actions"] button').click(),
    'apply-template': () => {
      const elementTemplates = modeler.get('elementTemplates');
      const template = elementTemplates.getLatest(templates[0].id)[0];
      const updatedTask = elementTemplates.applyTemplate(task, template);

      selection.select([]);
      selection.select(updatedTask);

      return updatedTask;
    },
    'show-task-definition-tooltip': () => {
      const tooltipWrapper = root.querySelector(
        '[data-group-id="group-taskDefinition"] .bio-properties-panel-tooltip-wrapper'
      );

      tooltipWrapper.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    },
    'open-example-data': () => {
      const group = root.querySelector('[data-group-id="group-additionalDataGroup"]');
      const header = group.querySelector('.bio-properties-panel-group-header');

      if (![ ...header.classList ].includes('open')) {
        header.click();
      }
    },
    'activate-job-type-feel': () => {
      const entry = root.querySelector('[data-entry-id="taskDefinitionType"]');

      entry.querySelector('.bio-properties-panel-feel-icon').click();

      return entry;
    },
    'collapse-input-mapping': () => {
      const group = root.querySelector('[data-group-id="group-inputs"]');
      const header = group.querySelector('.bio-properties-panel-group-header');

      if ([ ...header.classList ].includes('open')) {
        header.click();
      }

      return group;
    },
    'open-group': (id) => {
      const group = root.querySelector(`[data-group-id="group-${id}"]`);
      const header = group.querySelector('.bio-properties-panel-group-header');

      if (![ ...header.classList ].includes('open')) {
        header.click();
      }

      return group;
    },
    'toggle-collapsible': (entryId) => {
      const entry = root.querySelector(`[data-entry-id="${entryId}"]`);
      const header = entry.querySelector('.bio-properties-panel-collapsible-entry-header');

      header.click();

      return entry;
    },
    'toggle-list-entry': (entryId) => {
      const entry = root.querySelector(`[data-entry-id="${entryId}"]`);
      const header = entry.querySelector('.bio-properties-panel-list-entry-header');

      header.click();

      return entry;
    },
    settle: async () => {
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
  };

  const playground = {
    element: task,
    root,
    modeler,
    setup,
    destroy() {
      modeler.destroy();
      root.remove();
    }
  };

  // In retained mode (SINGLE_START / capture) the capture hook runs after every
  // scenario has mounted. The search pad closes on any outside click, which
  // later scenarios trigger, so expose the playground for re-hydration there.
  if (shouldKeepPlayground()) {
    const registry = window.__playgrounds__ || (window.__playgrounds__ = {});

    registry[name] = playground;
  }

  return playground;
}

/**
 * Mount a form-js scenario — the viewer (`@bpmn-io/form-js-viewer` `Form`) or the
 * editor (`@bpmn-io/form-js-editor` `FormEditor`) — into a themed playground root,
 * mirroring `createBpmnPlayground` so the global switcher and capture hook treat
 * form scenarios like any other.
 *
 * @param {object} context mocha context
 * @param {string} name scenario name, used as the capture key
 * @param {object} [options]
 * @param {object} [options.schema] form schema to import (defaults to the fixture)
 * @param {'viewer'|'editor'} [options.variant] which surface to mount
 * @param {string} [options.selectedFieldId] editor: field to select on mount
 */
export async function createFormPlayground(context, name, options = {}) {
  insertStyles();

  const {
    schema = defaultForm,
    variant = 'viewer',
    selectedFieldId = null
  } = options;

  const root = document.createElement('div');
  root.className = 'playground playground--form';
  root.dataset.playground = name;
  root.dataset.formVariant = variant;
  root.innerHTML = `
    <div class="playground-main playground-main--form">
      <div class="playground-form playground-form--${variant}"></div>
    </div>
  `;

  TestContainer.get(context).appendChild(root);
  applyTheme(root);

  const formContainer = root.querySelector('.playground-form');

  const form = variant === 'editor'
    ? new FormEditor({ container: formContainer })
    : new Form({ container: formContainer });

  if (variant === 'editor') {
    await form.importSchema(schema);
  } else {
    await form.importSchema(schema, {});
  }

  const selectField = (id) => {
    if (variant !== 'editor') {
      return null;
    }

    const field = form.get('formFieldRegistry').get(id);

    form.get('selection').set(field);

    return field;
  };

  if (selectedFieldId) {
    selectField(selectedFieldId);
  }

  const setup = {
    'select-field': selectField,
    'open-palette-group': (title) => {
      const group = [ ...root.querySelectorAll('.fjs-palette-group') ].find(
        (el) => el.querySelector('.fjs-palette-group-title')?.textContent.trim() === title
      );

      if (group && [ ...group.classList ].includes('closed')) {
        group.querySelector('.fjs-palette-group-header').click();
      }

      return group;
    },
    settle: async () => {
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
  };

  const playground = {
    root,
    form,
    setup,
    destroy() {
      form.destroy();
      root.remove();
    }
  };

  if (shouldKeepPlayground()) {
    const registry = window.__playgrounds__ || (window.__playgrounds__ = {});

    registry[name] = playground;
  }

  return playground;
}

export async function createFormPlaygroundApp(context, name, options = {}) {
  insertStyles();

  const {
    schema = defaultForm,
    data = {}
  } = options;

  const root = document.createElement('div');
  root.className = 'playground playground--form-app';
  root.dataset.playground = name;

  TestContainer.get(context).appendChild(root);
  applyTheme(root);

  const app = new Playground({
    container: root,
    schema,
    data
  });

  await new Promise(resolve => app.on('formPlayground.init', resolve));

  const setup = {
    settle: async () => {
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
  };

  const playground = {
    root,
    app,
    setup,
    destroy() {
      app.destroy();
      root.remove();
    }
  };

  if (shouldKeepPlayground()) {
    const registry = window.__playgrounds__ || (window.__playgrounds__ = {});

    registry[name] = playground;
  }

  return playground;
}

export {
  manyInputsDiagram
};

function insertStyles() {
  if (stylesInserted) {
    return;
  }

  stylesInserted = true;

  insertStyle(
    'camunda-design-system.css',
    camundaDesignSystemCss.replaceAll(
      'url(./files/',
      'url("/base/node_modules/@camunda/design-system/dist/files/'
    )
  );
  insertStyle('diagram-js.css', diagramJsCss);
  insertStyle('bpmn-js.css', bpmnJsCss);
  insertStyle('bpmn-font.css', bpmnFontCss);

  // form-js vendors a copy of the properties-panel and CodeMirror base styles as
  // bare (unscoped) rules; load it before the bpmn properties-panel base so the
  // latter wins those shared rules and the bpmn panel renders unchanged.
  insertStyle('form-js.css', formViewerCss);
  insertStyle('form-js-editor.css', formEditorCss);
  insertStyle('form-js-playground.css', formPlaygroundCss);

  insertStyle('properties-panel.css', propertiesPanelCss);

  // the libraries copy the tokens into their own stylesheets once released;
  // until then the installed copies carry none, so the playground supplies them
  insertStyle('bio-theme.css', baseThemeCss);
  insertStyle('element-templates.css', elementTemplatesCss);
  insertStyle('popup-menu.css', popupMenuCss);
  insertStyle('element-template-chooser.css', elementTemplateChooserCss);
  insertStyle('c4-tokens.css', tokensCss);
  insertStyle('c4-properties-panel.css', propertiesPanelThemeCss);
  insertStyle('c4-diagram.css', diagramThemeCss);
  insertStyle('c4-form-js.css', formThemeCss);
  insertStyle('playground.css', playgroundCss);

  insertThemeSwitcher();
}

function insertStyle(id, css) {
  const style = document.createElement('style');

  style.id = id;
  style.textContent = css;

  document.head.appendChild(style);
}

function insertThemeSwitcher() {
  const switcher = document.createElement('div');
  switcher.className = 'theme-switcher';
  switcher.setAttribute('aria-label', 'Reference theme');
  switcher.setAttribute('role', 'group');
  switcher.innerHTML = `
    <span class="theme-switcher__label">Theme</span>
    <button type="button" data-theme="bpmn-io">bpmn-io</button>
    <button type="button" data-theme="c4">C4</button>
    <button type="button" data-mode="dark">Dark</button>
  `;

  switcher.addEventListener('click', event => {
    const button = event.target.closest('button[data-theme], button[data-mode]');

    if (!button) {
      return;
    }

    if (button.dataset.mode === 'dark') {
      setDarkMode(!darkMode);
    } else {
      setTheme(button.dataset.theme);
    }
  });

  window.addEventListener('popstate', () => {
    darkMode = getDarkFromUrl();
    setTheme(getThemeFromUrl(), false);
  });

  document.body.appendChild(switcher);
  updateThemeSwitcher(switcher);
}

function setTheme(theme, persist = true) {
  if (!THEMES.includes(theme)) {
    return;
  }

  activeTheme = theme;

  applyTheme();
  updateThemeSwitcher(document.querySelector('.theme-switcher'));

  if (persist) {
    persistThemeInUrl();
  }
}

function setDarkMode(dark, persist = true) {
  darkMode = dark;

  applyTheme();
  updateThemeSwitcher(document.querySelector('.theme-switcher'));

  if (persist) {
    persistThemeInUrl();
  }
}

// the theme is scoped to the design system's own `c4-ui`, which a consumer
// applies at the app root — that is also what puts portaled UI (the FEEL popup,
// tooltips) in scope
function applyTheme() {
  document.documentElement.classList.toggle('c4-ui', activeTheme !== 'bpmn-io');

  // dark mode follows the design system's own class, so it only resolves under C4
  document.documentElement.classList.toggle('dark', darkMode);
}

function updateThemeSwitcher(switcher) {
  switcher.querySelectorAll('button[data-theme]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.theme === activeTheme));
  });

  switcher.querySelector('button[data-mode="dark"]')
    .setAttribute('aria-pressed', String(darkMode));
}

function getDarkFromUrl() {
  return new URLSearchParams(window.location.search).get('dark') === 'true';
}

function getThemeFromUrl() {
  const theme = new URLSearchParams(window.location.search).get('theme');

  return THEMES.includes(theme) ? theme : 'c4';
}

function persistThemeInUrl() {
  const url = new URL(window.location.href);

  url.searchParams.set('theme', activeTheme);
  url.searchParams.set('dark', String(darkMode));
  window.history.pushState(null, '', url);
}
